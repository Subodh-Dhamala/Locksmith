import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { isBlacklisted } from '../lib/blacklist';
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

    //check blacklist before verifying
    if (isBlacklisted(token)) {
      throw new AppError('Token blacklisted', 401);
    }

    const payload = verifyAccessToken(token);

    // attach user to request
    (req as any).user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (err) {
    next(err);
  }
}