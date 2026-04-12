import jwt, {SignOptions, JwtPayload} from 'jsonwebtoken';

export interface TokenPayload{
  userId: string;
  email: string;
  role: string;
}

const accessSecret = process.env.JWT_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error('Missing JWT_SECRET or JWT_REFRESH_SECRET in .env');
}

//telling ts that they are definitely strings after the check above
const ACCESS_SECRET = accessSecret as string;
const REFRESH_SECRET = refreshSecret as string;

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

function signToken(
  payload: TokenPayload,
  secret: string,
  expiresIn: string):string{

  const options:SignOptions = {
    expiresIn : expiresIn as SignOptions['expiresIn'],
  };
  
  return jwt.sign(payload,secret,options);
}

export function signAccessToken(payload: TokenPayload): string {
  return signToken(payload, ACCESS_SECRET, ACCESS_EXPIRES_IN);
}

export function signRefreshToken(payload: TokenPayload): string{
  return signToken(payload,REFRESH_SECRET,REFRESH_EXPIRES_IN); 
}

export function verifyAccessToken(token:string):TokenPayload & JwtPayload{
  try{
    return jwt.verify(token,ACCESS_SECRET) as unknown as TokenPayload & JwtPayload;
  }
  catch{
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload & JwtPayload{
  try{
    return jwt.verify(token,REFRESH_SECRET) as unknown as TokenPayload & JwtPayload;
  }

  catch{
    throw new Error('Invalid or expired refresh token');
  }
}