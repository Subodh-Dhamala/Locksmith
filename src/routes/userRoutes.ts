import { Router } from 'express';
import {
  getMeController,
  updateMeController,
  changePasswordController,
} from '../controller/userController';
const router = Router();

router.get('/me', getMeController);
router.put('/me', updateMeController);
router.put('/me/password', changePasswordController);

export default router;