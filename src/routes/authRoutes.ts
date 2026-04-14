import {Router} from 'express';
import{
  registerController,
  verifyEmailController,
  loginController,
  logoutController,
} from '../controller/authController';

const router = Router();

router.post('/register',registerController);
router.get('/verify-email/:token', verifyEmailController);
router.post('/login',loginController);
router.post('/logout',logoutController);

export default router;