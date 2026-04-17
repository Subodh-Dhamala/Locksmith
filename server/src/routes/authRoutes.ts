import {Router} from 'express';
import{
  registerController,
  verifyEmailController,
  loginController,
  logoutController,
} from '../controller/authController';

import { strictLimiter, looseLimiter } from '../middlewares/rateLimiter';

import passport from 'passport';
import { issueTokens } from '../services/tokenService';
import { refreshTokenController } from '../controller/passwordController';

import { twoFactorLoginController } from '../controller/authController';
import { enable2FAController } from '../controller/authController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', looseLimiter, registerController);
router.get('/verify-email/:token', looseLimiter, verifyEmailController);
router.post('/login', strictLimiter, loginController);
router.post('/logout', looseLimiter, logoutController);

router.post('/refresh', looseLimiter, refreshTokenController);

//redirect to google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

//callback 
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user as any;

    const tokens = await issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // set refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // send only access token
    res.json({
      accessToken: tokens.accessToken,
    });
  }
);


//github redirection
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

//callback
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  async (req, res) => {
    const user = req.user as any;

    const tokens = await issueTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: tokens.accessToken,
    });
  }
);

router.post('/2fa/enable', authMiddleware, enable2FAController);
router.post('/2fa/login', twoFactorLoginController);


export default router;
