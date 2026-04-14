import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import prisma from '../lib/prisma';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'MODERATOR'));

router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
      },
    });

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

export default router;