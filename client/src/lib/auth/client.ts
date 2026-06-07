import { AUTH_USER_STORAGE_KEY } from './constants';
import type { AuthUser } from './types';

export function saveAuthUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const legacy = localStorage.getItem('user');
  if (legacy && !localStorage.getItem(AUTH_USER_STORAGE_KEY)) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, legacy);
    localStorage.removeItem('user');
  }

  const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthUser(): void {
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

export type EstablishSessionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function establishServerSession(
  token: string,
  refreshToken: string
): Promise<EstablishSessionResult> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({
      token: token.trim(),
      refreshToken: refreshToken.trim(),
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return {
    ok: false,
    error:
      data?.error ??
      `Could not establish a secure session (${response.status}). Please try again.`,
  };
}

export async function clearServerSession(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}
