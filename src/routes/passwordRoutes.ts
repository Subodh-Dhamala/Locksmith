import { Router } from 'express';
import {
  forgotPasswordController,
  resetPasswordController,
  refreshTokenController,
} from '../controller/passwordController';

import {strictLimiter,looseLimiter} from '../middlewares/rateLimiter';

const router = Router();

router.post('/forgot-password', strictLimiter, forgotPasswordController);
router.post('/reset-password/:token', looseLimiter, resetPasswordController);

export default router;