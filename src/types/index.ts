import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

// // Extend Express Request globally
// declare global {
//   namespace Express {
//     interface Request {
//       user?: AuthUser;
//     }
//   }
// }

// JWT payload type
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Safer typed request (optional use in controllers)
export interface AuthRequest extends Request {
  user: AuthUser;
}