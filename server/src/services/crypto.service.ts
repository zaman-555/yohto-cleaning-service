import { createHash, randomBytes } from 'crypto';

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Cryptographically strong, URL-safe random token (hex). */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}
