import bcrypt from 'bcrypt';
import { authConfig } from '../config/auth';

const BCRYPT_PREFIX = /^\$2[aby]\$/;

export function isBcryptHash(value: string): boolean {
  return BCRYPT_PREFIX.test(value);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, authConfig.bcryptRounds);
}

export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (isBcryptHash(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
}
