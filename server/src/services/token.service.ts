import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth';

const JWT_ALGORITHM: jwt.Algorithm = 'HS256';
const VERIFY_OPTIONS: jwt.VerifyOptions = { algorithms: [JWT_ALGORITHM] };

export type AccessTokenPayload = {
  sub: number;
  email: string;
  name: string;
  isApproved: boolean;
  isAdmin: boolean;
};

export function signAccessToken(user: AccessTokenPayload): string {
  return jwt.sign(
    {
      sub: user.sub,
      email: user.email,
      name: user.name,
      isApproved: user.isApproved,
      isAdmin: user.isAdmin,
    },
    authConfig.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: authConfig.accessTokenExpiresIn as jwt.SignOptions['expiresIn'],
    }
  );
}

type RefreshTokenPayload = {
  sub: number;
  type: 'refresh';
};

export function signRefreshToken(userId: number): string {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh',
    },
    authConfig.jwtSecret,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: authConfig.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
    }
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, authConfig.jwtSecret, VERIFY_OPTIONS);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }

  const { sub, email, name, isApproved, isAdmin } = decoded as Record<string, unknown>;

  if (
    typeof sub !== 'number' ||
    typeof email !== 'string' ||
    typeof name !== 'string' ||
    typeof isApproved !== 'boolean' ||
    typeof isAdmin !== 'boolean'
  ) {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }

  return { sub, email, name, isApproved, isAdmin };
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, authConfig.jwtSecret, VERIFY_OPTIONS);
  if (typeof decoded !== 'object' || decoded === null) {
    throw new jwt.JsonWebTokenError('Invalid refresh token payload');
  }

  const { sub, type } = decoded as Record<string, unknown>;

  if (typeof sub !== 'number' || type !== 'refresh') {
    throw new jwt.JsonWebTokenError('Invalid refresh token payload');
  }

  return { sub, type: 'refresh' };
}
