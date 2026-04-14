import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { isBlacklisted } from '../lib/blacklist';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';
import logger from '../lib/logger';
import { AuthUser } from '../types/index';

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];


    if (isBlacklisted(token)) {
      throw new AppError('Token has been revoked', 401);
    }

    const payload = verifyAccessToken(token);

  
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    if (!user.isVerified) {
      throw new AppError('Please verify your email', 403);
    }

    //attach user to request
    req.user = user as unknown as AuthUser;

    logger.debug({ userId: user.id }, 'Auth middleware passed');

    next();
  } catch (error) {
    next(error);
  }
}