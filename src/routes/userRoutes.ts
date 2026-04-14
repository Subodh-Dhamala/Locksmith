import { Router } from 'express';
import {
  getMeController,
  updateMeController,
  changePasswordController,
} from '../controller/userController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me',authMiddleware, getMeController);
router.put('/me', updateMeController);
router.put('/me/password', changePasswordController);

export default router;