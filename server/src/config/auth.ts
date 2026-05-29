const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.JWT_REFRESH_TTL_SECONDS ?? `${30 * 24 * 60 * 60}`);
const PASSWORD_RESET_TTL_SECONDS = Number(process.env.PASSWORD_RESET_TTL_SECONDS ?? `${30 * 60}`);

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be set in the environment and be at least 32 characters long.'
    );
  }
  return secret;
}

export const authConfig = {
  get jwtSecret(): string {
    return requireJwtSecret();
  },
  accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
  refreshTokenTtlSeconds: Number.isFinite(REFRESH_TOKEN_TTL_SECONDS)
    ? REFRESH_TOKEN_TTL_SECONDS
    : 30 * 24 * 60 * 60,
  passwordResetTtlSeconds: Number.isFinite(PASSWORD_RESET_TTL_SECONDS)
    ? PASSWORD_RESET_TTL_SECONDS
    : 30 * 60,
  bcryptRounds: 12,
} as const;
