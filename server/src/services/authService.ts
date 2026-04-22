import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';
import logger from '../lib/logger';
import { sendVerificationEmail } from '../lib/mailer';
import { issueTokens, deleteRefreshToken } from './tokenService';
import { RegisterInput, LoginInput } from '../lib/validators';
import { sendPasswordResetEmail } from '../lib/mailer';

import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// enable 2FA
export async function enable2FA(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // user must exist
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // generate secret
  const secret = speakeasy.generateSecret({
    name: `Auth Backend (${user.email})`,
  });

  // save secret (disabled for now)
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false, // stays false until verified
    },
  });

  // generate QR
  const qr = await qrcode.toDataURL(secret.otpauth_url!);

  return {
    qr,
    secret: secret.base32,
  };
}

//verify 2FA setup (activation step)
export async function verifyTwoFactorSetup(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.twoFactorSecret) {
    throw new AppError('2FA not initialized', 400);
  }

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!valid) {
    throw new AppError('Invalid 2FA code', 401);
  }

  //enable 2FA
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });

  return { message: '2FA enabled successfully' };
}

// register user
export async function register(input: RegisterInput): Promise<void> {
  const { name, email, password } = input;

  // check existing email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // create verify token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // create user + token
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: 'USER' },
    });

    await tx.verifyToken.create({
      data: { token, userId: user.id, expiresAt },
    });
  });

  // send email
  await sendVerificationEmail(email, token);

  logger.info({ email }, 'User registered');
}

// verify email
export async function verifyEmail(token: string): Promise<void> {
  const verifyToken = await prisma.verifyToken.findUnique({
    where: { token },
  });

  // invalid token
  if (!verifyToken) {
    throw new AppError('Invalid verification token', 400);
  }

  // expired token
  if (verifyToken.expiresAt < new Date()) {
    throw new AppError('Verification token expired', 400);
  }

  // verify user + delete token
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: verifyToken.userId },
      data: { isVerified: true },
    });

    await tx.verifyToken.delete({
      where: { token },
    });
  });

  logger.info({ userId: verifyToken.userId }, 'Email verified');
}

// verify 2FA login
export async function verifyTwoFactorLogin(
  userId: string,
  token: string
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  // check 2FA setup
  if (!user || !user.twoFactorSecret) {
    throw new AppError('2FA not enabled', 400);
  }

  // verify code
  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (!valid) {
    throw new AppError('Invalid 2FA code', 401);
  }

  // issue tokens
  return issueTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}

// login user
export async function login(input: LoginInput): Promise<{
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
  userId?: string;
}> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });

  // invalid credentials
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401);
  }

  // check lock
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError('Account locked. Try again later', 423);
  }

  // check password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    const attempts = user.failedLoginAttempts + 1;
    const isLocked = attempts >= 5;

    // update attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: isLocked
          ? new Date(Date.now() + 30 * 60 * 1000)
          : null,
      },
    });

    logger.warn({ email }, 'Failed login attempt');
    throw new AppError('Invalid credentials', 401);
  }

  // must verify email
  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  // reset attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // check 2FA
  if (user.twoFactorEnabled) {
    return {
      accessToken: '',
      refreshToken: '',
      requiresTwoFactor: true,
      userId: user.id,
    };
  }

  // issue tokens
  const tokens = await issueTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info({ email }, 'User logged in');

  return {
    ...tokens,
    requiresTwoFactor: false,
  };
}

// logout user
export async function logout(refreshToken: string): Promise<void> {
  await deleteRefreshToken(refreshToken);
  logger.info('User logged out');
}

// forgot password
export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });

  // don't reveal if user exists
  if (!user) {
    logger.info({ email }, 'Password reset requested for non-existent email');
    return;
  }

  // remove old tokens
  await prisma.resetToken.deleteMany({ where: { userId: user.id } });

  // create reset token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.resetToken.create({
    data: { token, userId: user.id, expiresAt },
  });

  // send email
  await sendPasswordResetEmail(email, token);

  logger.info({ email }, 'Password reset email sent');
}

// reset password
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  const resetToken = await prisma.resetToken.findUnique({
    where: { token },
  });

  // invalid or used
  if (!resetToken || resetToken.used) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // expired
  if (resetToken.expiresAt < new Date()) {
    throw new AppError('Reset token expired', 400);
  }

  // hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);

  // update password + mark token used
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await tx.resetToken.update({
      where: { token },
      data: { used: true },
    });
  });

  logger.info({ userId: resetToken.userId }, 'Password reset successful');
}