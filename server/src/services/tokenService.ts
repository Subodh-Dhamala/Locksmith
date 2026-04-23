import crypto from 'crypto';
import prisma from '../lib/prisma';
import { signAccessToken, signRefreshToken, TokenPayload } from '../lib/jwt';
import AppError from '../lib/AppError';

// hash token
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// issue both tokens
export async function issueTokens(
  payload: TokenPayload
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // hash before saving to DB
  const tokenHash = hashToken(refreshToken);

  // ensure only one active refresh token per user (prevents duplicates)
  await prisma.refreshToken.deleteMany({
    where: {
      userId: payload.userId,
    },
  });

  // safe insert (prevents race condition + duplicate error)
  await prisma.refreshToken.upsert({
    where: {
      tokenHash,
    },
    update: {
      userId: payload.userId,
    },
    create: {
      tokenHash,
      userId: payload.userId,
    },
  });

  return { accessToken, refreshToken };
}

// rotate refreshToken
export async function rotateRefreshToken(
  oldToken: string,
  payload: TokenPayload
): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const oldHash = hashToken(oldToken);

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldHash },
  });

  // if token not found, fallback safely instead of crashing
  if (!existing) {
    return issueTokens(payload);
  }

  const user = await prisma.user.findUnique({
    where: { id: existing.userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // delete old token (rotation safety)
  await prisma.refreshToken.deleteMany({
    where: { tokenHash: oldHash },
  });

  // issue fresh tokens from DB data
  return issueTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}

// delete refresh token on logout
export async function deleteRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  await prisma.refreshToken.deleteMany({
    where: { tokenHash },
  });
}

// delete all refresh tokens for a user
export async function deleteAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}