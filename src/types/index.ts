import { User } from '@prisma/client';

//extend express request
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

//jwt payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}


//strict auth request(use in protected routes)
export interface AuthRequest extends Express.Request {
  user: User;
}