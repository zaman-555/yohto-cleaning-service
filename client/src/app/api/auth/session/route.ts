import { NextResponse } from 'next/server';
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  REFRESH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_COOKIE_NAME,
} from '@/lib/auth/constants';

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { token?: string; refreshToken?: string }
    | null;
  const token = body?.token?.trim();
  const refreshToken = body?.refreshToken?.trim();

  if (!token || !refreshToken) {
    return NextResponse.json({ error: 'Token and refresh token are required' }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions());
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieOptions(),
    maxAge: REFRESH_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    ...cookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    ...cookieOptions(),
    maxAge: 0,
  });
  return response;
}
