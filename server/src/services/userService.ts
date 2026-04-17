import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';
import logger from '../lib/logger';
import { User } from '@prisma/client';

//get user by id
export async function getUserById(userId: string): Promise<Omit<User, 'passwordHash'>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    omit: { passwordHash: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

//update profile
export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<Omit<User, 'passwordHash'>> {

  //if updating email check it's not taken
  if (data.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing && existing.id !== userId) {
      throw new AppError('Email already in use', 400);
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    omit: { passwordHash: true },
  });

  logger.info({ userId }, 'Profile updated');

  return updated;
}

//change password
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.passwordHash) {
    throw new AppError('User not found', 404);
  }

  // verify old password
  const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError('Old password is incorrect', 401);
  }

  //hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  logger.info({ userId }, 'Password changed');
}