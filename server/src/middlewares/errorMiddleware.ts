import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import AppError from '../lib/AppError';
import logger from '../lib/logger';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
 

  if (err instanceof AppError) {
    logger.warn({ err }, err.message);
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ err }, 'Validation error');
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof TokenExpiredError) {
    logger.warn({ err }, 'Token expired');
    res.status(401).json({
      status: 'error',
      message: 'Token expired',
    });
    return;
  }

  if (err instanceof JsonWebTokenError) {
    logger.warn({ err }, 'Invalid token');
    res.status(401).json({
      status: 'error',
      message: 'Invalid token',
    });
    return;
  }

  //prisma errors
  if (err instanceof Error && err.message.includes('Unique constraint')) {
    logger.warn({ err }, 'Duplicate entry');
    res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
    });
    return;
  }

  //all unknown errors
  logger.error({ err }, 'Unexpected error');
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}