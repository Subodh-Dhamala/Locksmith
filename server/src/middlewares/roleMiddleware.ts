import { Request, Response, NextFunction } from 'express';
import { AuthUser } from '../types/index';
import AppError from '../lib/AppError';

type Role = 'USER' | 'ADMIN' | 'MODERATOR';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user as AuthUser;

    if (!user) {
      throw new AppError('Not authenticated', 401);
    }

    if (!roles.includes(user.role as Role)) {
      throw new AppError('Access denied', 403);
    }

    next();
  };
}