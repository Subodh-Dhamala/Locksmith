import { Router } from 'express';
import {
  forgotPasswordController,
  resetPasswordController,
  refreshTokenController,
} from '../controller/passwordController';

const router = Router();

router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password/:token', resetPasswordController);
router.post('/refresh', refreshTokenController);

export default router;