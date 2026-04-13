import { Request, Response, NextFunction } from 'express';
import { register, verifyEmail, login, logout } from '../services/authService';
import { registerSchema, loginSchema } from '../lib/validators';
import AppError from '../lib/AppError';

//register
export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    await register(result.data);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    next(error);
  }
}

//verify email
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token  = req.params.token as string;

    if (!token) {
      throw new AppError('Token is required', 400);
    }

    await verifyEmail(token);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

//login
export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    const { accessToken, refreshToken, requiresTwoFactor } = await login(result.data);

    if (requiresTwoFactor) {
      res.status(200).json({ requiresTwoFactor: true });
      return;
    }

    //set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
}

//logout
export async function logoutController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('No refresh token found', 400);
    }

    await logout(refreshToken);

    //clear the cookie
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