import { Request, Response, NextFunction } from 'express';
import {
  register,
  verifyEmail,
  login,
  logout,
  enable2FA,
  verifyTwoFactorLogin,
} from '../services/authService';

import {
  registerSchema,
  loginSchema,
} from '../lib/validators';

import AppError from '../lib/AppError';

// enable 2FA for logged-in user
export async function enable2FAController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user;

    // check auth
    if (!user || !user.id) {
      throw new AppError('Unauthorized', 401);
    }

    const data = await enable2FA(user.id);

    res.json(data);
  } catch (error) {
    next(error);
  }
}

// verify 2FA during login
export async function twoFactorLoginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, token } = req.body;

    // basic validation
    if (!userId || !token) {
      throw new AppError('Missing 2FA credentials', 400);
    }

    const tokens = await verifyTwoFactorLogin(userId, token);

    // set refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

// register new user
export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = registerSchema.safeParse(req.body);

    // validation failed
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    await register(result.data);

    res.status(201).json({
      message:
        'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
}

// verify email using token
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.params.token as string;

    // token required
    if (!token) {
      throw new AppError('Token is required', 400);
    }

    await verifyEmail(token);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

// login user
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);

    // validation failed
    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    const {
      accessToken,
      refreshToken,
      requiresTwoFactor,
    } = await login(result.data);

    // handle 2FA case
    if (requiresTwoFactor) {
      res.status(200).json({ requiresTwoFactor: true });
      return;
    }

    // set refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
}

// logout user
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // no token found
    if (!refreshToken) {
      throw new AppError('No refresh token found', 400);
    }

    await logout(refreshToken);

    // clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}