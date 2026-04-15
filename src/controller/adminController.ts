import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';

const ALLOWED_ROLES = ['USER', 'ADMIN', 'MODERATOR'] as const;

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

      prisma.user.count(),
    ]);

    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ message: 'Role updated', user: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    // prevent self delete
    if (req.user?.id === id) {
      throw new AppError("You can't delete yourself", 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};