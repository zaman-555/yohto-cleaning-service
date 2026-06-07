import type { Request, Response } from 'express';

export const AUTH_COOKIE_NAME = 'yohto_auth_token';
export const REFRESH_COOKIE_NAME = 'yohto_refresh_token';

/** Access token lifetime in cookie storage (JWT expiry is authoritative). */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function isSecureRequest(req: Request): boolean {
  if (req.secure) {
    return true;
  }

  const forwardedProto = req.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim() === 'https';
  }

  return process.env.NODE_ENV === 'production';
}

function cookieOptions(req: Request, maxAge: number) {
  return {
    httpOnly: true,
    secure: isSecureRequest(req),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAge * 1000,
  };
}

export function setAuthCookies(
  res: Response,
  req: Request,
  token: string,
  refreshToken: string
): void {
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions(req, AUTH_COOKIE_MAX_AGE_SECONDS));
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(req, REFRESH_COOKIE_MAX_AGE_SECONDS));
}

export function clearAuthCookies(res: Response, req: Request): void {
  res.clearCookie(AUTH_COOKIE_NAME, cookieOptions(req, 0));
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(req, 0));
}
