import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';

import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controller/adminController';

const router = Router();

//protect all admin routes
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;