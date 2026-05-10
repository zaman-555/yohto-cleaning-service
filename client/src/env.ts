import { z } from "zod";

/**
 * Reads `process.env` (Next.js loads `.env`, `.env.local`, etc.).
 * Local dev: copy `.env.local.example` → `.env.local`.
 * Raw shape below; resolution rules live in this file.
 */
const rawEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  API_BASE_URL: z.string().url().optional(),
});

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function parseRawEnv() {
  const result = rawEnvSchema.safeParse({
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    API_BASE_URL: process.env.API_BASE_URL,
  });
  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(flat)}`);
  }
  return result.data;
}

const isProd = process.env.NODE_ENV === "production";
const DEV_DEFAULT_API_BASE = "http://localhost:5000";

let cachedRaw: ReturnType<typeof parseRawEnv> | null = null;

function getRawEnv() {
  if (!cachedRaw) {
    cachedRaw = parseRawEnv();
  }
  return cachedRaw;
}

/**
 * Base URL for browser-side fetches (login, register, etc.).
 * Must be public; use NEXT_PUBLIC_API_BASE_URL in production.
 */
function resolvePublicApiBaseUrl(): string {
  const raw = getRawEnv();
  if (raw.NEXT_PUBLIC_API_BASE_URL) {
    return stripTrailingSlash(raw.NEXT_PUBLIC_API_BASE_URL);
  }
  if (!isProd) {
    return DEV_DEFAULT_API_BASE;
  }
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL must be set in production (browser API requests)."
  );
}

/**
 * Base URL for Server Components, Route Handlers, and Server Actions.
 * Prefer API_BASE_URL in production when the API is only reachable on a private network (e.g. Docker).
 */
function resolveServerApiBaseUrl(): string {
  const raw = getRawEnv();
  if (raw.API_BASE_URL) {
    return stripTrailingSlash(raw.API_BASE_URL);
  }
  if (raw.NEXT_PUBLIC_API_BASE_URL) {
    return stripTrailingSlash(raw.NEXT_PUBLIC_API_BASE_URL);
  }
  if (!isProd) {
    return DEV_DEFAULT_API_BASE;
  }
  throw new Error(
    "Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL for server-side API access in production."
  );
}

export const env = {
  get publicApiBaseUrl(): string {
    return resolvePublicApiBaseUrl();
  },
  get serverApiBaseUrl(): string {
    return resolveServerApiBaseUrl();
  },
} as const;

/** Use from Client Components (code that runs in the browser). */
export function publicApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${env.publicApiBaseUrl}${normalized}`;
}

/** Use from Server Components, Server Actions, and Route Handlers. */
export function serverApiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${env.serverApiBaseUrl}${normalized}`;
}
