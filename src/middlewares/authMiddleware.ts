import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import AppError from '../lib/AppError';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // IMPORTANT: attach user properly
    (req as any).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch (err) {
    next(err);
  }
}