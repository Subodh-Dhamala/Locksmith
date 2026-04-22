import { Router } from 'express';
import {
  getMeController,
  updateMeController,
  changePasswordController,
} from '../controller/userController';

import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/me', authMiddleware, getMeController);
router.put('/me', authMiddleware, updateMeController);
router.put('/me/password', authMiddleware, changePasswordController);

export default router;