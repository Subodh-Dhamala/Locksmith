import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import AppError from '../lib/AppError';
import logger from '../lib/logger';
import { sendVerificationEmail } from '../lib/mailer';
import { issueTokens, deleteRefreshToken } from './tokenService';
import { RegisterInput, LoginInput } from '../lib/validators';


//register
export async function register(input: RegisterInput): Promise<void> {
  const { name, email, password } = input;

  //check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  //hash password
  const passwordHash = await bcrypt.hash(password, 12);

  //generate verify token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  //create user + verify token in one transaction , if one fails rollback occurs
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash, role: 'USER' },
    });

    await tx.verifyToken.create({
      data: { token, userId: user.id, expiresAt },
    });
  });

  //send verification email
  await sendVerificationEmail(email, token);

  logger.info({ email }, 'User registered');
}

//verify email
export async function verifyEmail(token: string): Promise<void> {
  const verifyToken = await prisma.verifyToken.findUnique({
    where: { token },
  });

  if (!verifyToken) {
    throw new AppError('Invalid verification token', 400);
  }

  if (verifyToken.expiresAt < new Date()) {
    throw new AppError('Verification token expired', 400);
  }

  //mark user as verified and delete token
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

//login
export async function login(input: LoginInput): Promise<{
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor: boolean;
}> {
  const { email, password } = input;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', 401);
  }

  //check lockout
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError('Account locked. Try again later', 423);
  }

  //check password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    //increment failed attempts
    const attempts = user.failedLoginAttempts + 1;
    const isLocked = attempts >= 5;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: isLocked
          ? new Date(Date.now() + 30 * 60 * 1000) // 30 min
          : null,
      },
    });

    logger.warn({ email }, 'Failed login attempt');
    throw new AppError('Invalid credentials', 401);
  }

  //check email verified
  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in', 403);
  }

  //reset failed attempts on success
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  //check 2FA
  if (user.twoFactorEnabled) {
    logger.info({ email }, 'Login requires 2FA');
    return { accessToken: '', refreshToken: '', requiresTwoFactor: true };
  }

  //issue tokens
  const tokens = await issueTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  logger.info({ email }, 'User logged in');

  return { ...tokens, requiresTwoFactor: false };
}

//logout
export async function logout(refreshToken: string): Promise<void> {
  await deleteRefreshToken(refreshToken);
  logger.info('User logged out');
}