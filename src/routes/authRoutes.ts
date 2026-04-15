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

export default router;
