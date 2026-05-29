import 'server-only';

import { cookies } from 'next/headers';
import { serverApiUrl } from '@/env';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME } from './constants';
import type { AuthUser } from './types';

type JwtPayload = {
  exp?: number;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return payload.exp <= nowInSeconds;
}

export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  if (token && !isTokenExpired(token)) {
    return { Authorization: `Bearer ${token}` };
  }

  if (!refreshToken) {
    return {};
  }

  try {
    const response = await fetch(serverApiUrl('/api/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {};
    }

    const data = (await response.json().catch(() => null)) as { token?: string } | null;
    if (!data?.token) {
      return {};
    }

    return { Authorization: `Bearer ${data.token}` };
  } catch {
    return {};
  }
}

export async function getServerAuthUser(): Promise<AuthUser | null> {
  const authHeaders = await getServerAuthHeaders();
  if (!authHeaders.Authorization) {
    return null;
  }

  try {
    const response = await fetch(serverApiUrl('/api/auth/me'), {
      headers: authHeaders,
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json().catch(() => null)) as { user?: AuthUser } | null;
    return data?.user ?? null;
  } catch {
    return null;
  }
}
