export const AUTH_COOKIE_NAME = 'yohto_auth_token';
export const REFRESH_COOKIE_NAME = 'yohto_refresh_token';

/** Access token lifetime in cookie storage (JWT expiry is authoritative). */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 15 * 60;
export const REFRESH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export const AUTH_USER_STORAGE_KEY = 'yohto_user';
