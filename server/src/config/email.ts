const DEFAULT_FROM = 'Yohto Dashboard <onboarding@resend.dev>';

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

export const emailConfig = {
  get resendApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  },
  get from(): string {
    return process.env.EMAIL_FROM ?? DEFAULT_FROM;
  },
  /** Public base URL of the Next.js client, used to build links inside emails. */
  get clientBaseUrl(): string {
    const raw = process.env.CLIENT_BASE_URL ?? process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
    return stripTrailingSlash(raw);
  },
} as const;
