import {Router} from 'express';
import{
  registerController,
  verifyEmailController,
  loginController,
  logoutController,
} from '../controller/authController';

import { strictLimiter, looseLimiter } from '../middlewares/rateLimiter';

const router = Router();

router.post('/register', looseLimiter, registerController);
router.get('/verify-email/:token', looseLimiter, verifyEmailController);
router.post('/login', strictLimiter, loginController);
router.post('/logout', looseLimiter, logoutController);

export default router;