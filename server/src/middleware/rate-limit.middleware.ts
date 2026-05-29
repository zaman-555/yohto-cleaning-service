import rateLimit from 'express-rate-limit';

const RATE_LIMIT_MESSAGE = {
  error: 'Too many requests. Please wait a moment and try again.',
};

/**
 * General limiter for authentication endpoints (login, register).
 * Protects against credential stuffing / brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});

/**
 * Stricter limiter for password reset requests, which trigger emails.
 * Prevents email-bombing and reset-token enumeration.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: RATE_LIMIT_MESSAGE,
});
