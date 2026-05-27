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

export async function establishServerSession(token: string, refreshToken: string): Promise<boolean> {
  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, refreshToken }),
  });
  return response.ok;
}

export async function clearServerSession(): Promise<void> {
  await fetch('/api/auth/session', { method: 'DELETE' });
}
