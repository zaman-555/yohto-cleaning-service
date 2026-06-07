type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
};

/** Use HTTPS (or proxy hint), not NODE_ENV alone — local `next start` is often HTTP. */
export function isSecureCookieContext(request: Request): boolean {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    return forwardedProto.split(',')[0]?.trim() === 'https';
  }

  return new URL(request.url).protocol === 'https:';
}

export function authCookieOptions(request: Request, maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isSecureCookieContext(request),
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}
