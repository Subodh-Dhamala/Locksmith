//User type
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isVerified: boolean;
  oauthProvider: string | null;
  oauthId: string | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  passwordHash: string | null;
}

//extend express request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

//JWT payload
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// strict auth request
export interface AuthRequest extends Express.Request {
  user: AuthUser;
}