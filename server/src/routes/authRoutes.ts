import { Router } from 'express';
import {
  registerController,
  verifyEmailController,
  loginController,
  logoutController,
  twoFactorLoginController,
  enable2FAController,
  verify2FASetupController,
} from '../controller/authController';

import { strictLimiter, looseLimiter } from '../middlewares/rateLimiter';
import passport from 'passport';
import { issueTokens } from '../services/tokenService';
import { refreshTokenController } from '../controller/passwordController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

//auth routes
router.post('/register', looseLimiter, registerController);
router.get('/verify-email/:token', looseLimiter, verifyEmailController);
router.post('/login', strictLimiter, loginController);
router.post('/logout', looseLimiter, logoutController);
router.post('/refresh', looseLimiter, refreshTokenController);

//google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as any;

      const tokens = await issueTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
    } catch (err) {
      next(err);
    }
  }
);

//github
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false }),
  async (req, res, next) => {
    try {
      const user = req.user as any;

      const tokens = await issueTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
    } catch (err) {
      next(err);
    }
  }
);

//2fa routes
router.post('/2fa/enable', authMiddleware, enable2FAController);

//verify 2FA setup
router.post('/2fa/verify-setup', authMiddleware, verify2FASetupController);

router.post('/2fa/login', twoFactorLoginController);

export default router;