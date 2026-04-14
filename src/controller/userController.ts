import { Request, Response, NextFunction } from 'express';
import { getUserById, updateProfile, changePassword } from '../services/userService';
import { changePasswordSchema } from '../lib/validators';
import { AuthRequest } from '../types/index';
import AppError from '../lib/AppError';


export async function getMeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await getUserById((req as unknown as AuthRequest).user.id);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateMeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email } = req.body;
    const userId = (req as unknown as AuthRequest).user.id;

    if (!name && !email) {
      throw new AppError('Nothing to update', 400);
    }

    const updated = await updateProfile(userId, { name, email });

    res.status(200).json({ user: updated });
  } catch (error) {
    next(error);
  }
}

export async function changePasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = changePasswordSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ errors: result.error.flatten().fieldErrors });
      return;
    }

    const userId = (req as unknown as AuthRequest).user.id;

    await changePassword(
      userId,
      result.data.oldPassword,
      result.data.newPassword
    );

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}