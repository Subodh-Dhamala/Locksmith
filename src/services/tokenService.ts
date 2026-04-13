import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { signAccessToken, signRefreshToken, TokenPayload } from '../lib/jwt';
import AppError from '../lib/AppError';

//hash token
function hashToken(token:string):string{
  return crypto.createHash('sha256').update(token).digest('hex');
}

//issue both tokens
export async function issueTokens(payload:TokenPayload):Promise<{
  accessToken:string;
  refreshToken:string;
}>{
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  //hash before saving to DB
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data :{
      tokenHash,
      userId: payload.userId,
    },
  });

  return {accessToken,refreshToken};
}

//rotate refreshToken
export async function rotateRefreshToken(oldToken: string, payload: TokenPayload): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const oldHash = hashToken(oldToken);

  const existing = await prisma.refreshToken.findUnique({
    where: { tokenHash: oldHash },
  });

  if (!existing) {
    throw new AppError('Invalid refresh token', 401);
  }

  //delete old token
  await prisma.refreshToken.delete({
    where: { tokenHash: oldHash },
  });

  //issue new tokens
  return issueTokens(payload);
}

//delete refresh token on logout
export async function deleteRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  await prisma.refreshToken.deleteMany({
    where: { tokenHash },
  });
}

//delete all refresh tokens for a user 
export async function deleteAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}