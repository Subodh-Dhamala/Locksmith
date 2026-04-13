import { Request, Response, NextFunction } from 'express';
import { forgotPassword, resetPassword } from '../services/authService';
import { rotateRefreshToken } from '../services/tokenService';
import { forgotPasswordSchema, resetPasswordSchema } from '../lib/validators';
import { verifyRefreshToken } from '../lib/jwt';
import AppError from '../lib/AppError';

//forgot password
export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    await forgotPassword(result.data.email);

    // never reveal if email exists and always return success
    res.status(200).json({
      message: 'If that email exists you will receive a reset link shortly',
    });
  } catch (error) {
    next(error);
  }
}

//reset pwd
export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.params.token as string;

    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    await resetPassword(token, result.data.password);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
}

//refresh token
export async function refreshTokenController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('No refresh token found', 401);
    }

    //verify the token
    const payload = verifyRefreshToken(refreshToken);

    // Rotate — delete old, issue new
    const tokens = await rotateRefreshToken(refreshToken, {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    //set new refresh token cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ accessToken: tokens.accessToken });
  } catch (error) {
    next(error);
  }
}