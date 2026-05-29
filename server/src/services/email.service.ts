import { Resend } from 'resend';
import { emailConfig } from '../config/email';

let cachedClient: Resend | null = null;

function getClient(): Resend {
  const apiKey = emailConfig.resendApiKey;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured; cannot send email.');
  }
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

function resetEmailHtml(name: string, resetUrl: string, expiryMinutes: number): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">Reset your password</h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      Hi ${name || 'there'}, we received a request to reset the password for your Yohto Dashboard account.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${resetUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
        Reset password
      </a>
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #555; margin: 0 0 8px;">
      This link expires in ${expiryMinutes} minutes and can only be used once.
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #555; margin: 0 0 16px;">
      If you didn't request this, you can safely ignore this email — your password will not change.
    </p>
    <p style="font-size: 12px; color: #999; margin: 0; word-break: break-all;">
      Trouble with the button? Paste this link into your browser:<br />${resetUrl}
    </p>
  </div>`;
}

export async function sendPasswordResetEmail(input: {
  to: string;
  name: string;
  resetUrl: string;
  expiryMinutes: number;
}): Promise<void> {
  const client = getClient();
  const { error } = await client.emails.send({
    from: emailConfig.from,
    to: input.to,
    subject: 'Reset your Yohto Dashboard password',
    html: resetEmailHtml(input.name, input.resetUrl, input.expiryMinutes),
  });

  if (error) {
    throw new Error(`Resend failed to send password reset email: ${error.message}`);
  }
}
