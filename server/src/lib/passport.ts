import passport from "passport";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from "passport-jwt";

import {
  Profile as GitHubProfile,
  Strategy as GitHubStrategy,
} from "passport-github2";

import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";

import { VerifyCallback } from "passport-oauth2";

import prisma from "./prisma";
import logger from "./logger";
import { TokenPayload } from "./jwt";


//jwt 
const jwtOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload: TokenPayload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) return done(null, false);
      return done(null, user);
    } catch (error) {
      logger.error({ error }, "JWT strategy error");
      return done(error, false);
    }
  })
);

//shared oauth handler
async function handleOAuthLogin(
  provider: "google" | "github",
  providerId: string,
  email: string,
  name: string
) {
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return prisma.user.create({
      data: {
        email,
        name,
        isVerified: true,
        authProviders: {
          create: {
            provider,
            providerId,
          },
        },
      },
    });
  }

  const exists = await prisma.authProvider.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
    },
  });

  if (!exists) {
    await prisma.authProvider.create({
      data: {
        provider,
        providerId,
        userId: user.id,
      },
    });
  }

  return user;
}

//google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_: string, __: string, profile: GoogleProfile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), false);

        const user = await handleOAuthLogin(
          "google",
          profile.id,
          email,
          profile.displayName
        );

        return done(null, user);
      } catch (error) {
        logger.error({ error }, "Google strategy error");
        return done(error as Error, false);
      }
    }
  )
);

//github
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    },
    async (_: string, __: string, profile: GitHubProfile, done: VerifyCallback) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from GitHub"), false);

        const user = await handleOAuthLogin(
          "github",
          profile.id.toString(),
          email,
          profile.displayName ?? profile.username ?? "GitHub User"
        );

        return done(null, user);
      } catch (error) {
        logger.error({ error }, "GitHub strategy error");
        return done(error as Error, false);
      }
    }
  )
);

export default passport;