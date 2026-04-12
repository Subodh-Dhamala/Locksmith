import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptionsWithoutRequest,
} from 'passport-jwt';

import { Profile as GitHubProfile } from 'passport-github2';
import { VerifyCallback } from 'passport-oauth2';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

import prisma from './prisma';
import logger from './logger';
import { TokenPayload } from './jwt';


//jwt strategy
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

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      logger.error({ error }, 'JWT strategy error');
      return done(error, false);
    }
  })
);


//google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'), false);
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.oauthProvider !== 'google') {
          return done(
            new Error('Email already registered with a different provider'),
            false
          );
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            oauthProvider: 'google',
            oauthId: profile.id,
          },
          create: {
            email,
            name: profile.displayName,
            oauthProvider: 'google',
            oauthId: profile.id,
            isVerified: true,
          },
        });

        return done(null, user);
      } catch (error) {
        logger.error({ error }, 'Google strategy error');
        return done(error, false);
      }
    }
  )
);


//github strategy
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

        if (!email) {
          return done(new Error('No email found in GitHub profile'));
        }

        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser && existingUser.oauthProvider !== 'github') {
          return done(
            new Error('Email already registered with a different provider')
          );
        }

        const user = await prisma.user.upsert({
          where: { email },
          update: {
            oauthProvider: 'github',
            oauthId: profile.id.toString(),
          },
          create: {
            email,
            name: profile.displayName ?? profile.username,
            oauthProvider: 'github',
            oauthId: profile.id.toString(),
            isVerified: true,
          },
        });

        return done(null, user);
      } catch (error) {
        logger.error({ error }, 'GitHub strategy error');
        return done(error as Error);
      }
    }
  )
);

export default passport;