import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';

import {
  Profile as GitHubProfile,
  Strategy as GitHubStrategy,
} from 'passport-github2';

import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from 'passport-google-oauth20';

import { VerifyCallback } from 'passport-oauth2';

import prisma from './prisma';
import logger from './logger';
import { TokenPayload } from './jwt';

// jwt strategy
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is missing');
}

const jwtOptions: StrategyOptionsWithoutRequest = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
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
      logger.error({ error }, 'JWT strategy error');
      return done(error, false);
    }
  })
);

// google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GoogleProfile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) return done(new Error('No email from Google'), false);

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        let user;

        if (!existingUser) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              isVerified: true,
              authProviders: {
                create: {
                  provider: 'google',
                  providerId: profile.id,
                },
              },
            },
          });
        } else {
          await prisma.authProvider.create({
            data: {
              provider: 'google',
              providerId: profile.id,
              userId: existingUser.id,
            },
          });

          user = existingUser;
        }

        return done(null, user);
      } catch (error) {
        logger.error({ error }, 'Google strategy error');
        return done(error as Error, false);
      }
    }
  )
);

// github strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: GitHubProfile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) return done(new Error('No email from GitHub'), false);

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        let user;

        if (!existingUser) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName ?? profile.username,
              isVerified: true,
              authProviders: {
                create: {
                  provider: 'github',
                  providerId: profile.id.toString(),
                },
              },
            },
          });
        } else {
          await prisma.authProvider.create({
            data: {
              provider: 'github',
              providerId: profile.id.toString(),
              userId: existingUser.id,
            },
          });

          user = existingUser;
        }

        return done(null, user);
      } catch (error) {
        logger.error({ error }, 'GitHub strategy error');
        return done(error as Error, false);
      }
    }
  )
);

export default passport;