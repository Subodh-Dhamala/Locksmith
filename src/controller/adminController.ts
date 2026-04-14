import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';

const ALLOWED_ROLES = ['USER', 'ADMIN', 'MODERATOR'] as const;

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    res.json({ users });
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