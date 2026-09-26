import { Resend } from 'resend';
import { emailConfig } from '../config/email';

let cachedClient: Resend | null = null;

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character
  );
}

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
  const safeName = escapeHtml(name || 'there');
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">Reset your password</h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      Hi ${safeName}, we received a request to reset the password for your Yohto Dashboard account.
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

function accountApprovedEmailHtml(name: string, loginUrl: string): string {
  const safeName = escapeHtml(name || 'there');
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">Your account has been approved</h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
      Hi ${safeName}, your Extra Team account has been approved by an administrator.
    </p>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      You can now sign in and view your work schedule.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${loginUrl}" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;">
        Sign in to Extra Team
      </a>
    </p>
    <p style="font-size: 12px; color: #999; margin: 0; word-break: break-all;">
      Trouble with the button? Paste this link into your browser:<br />${loginUrl}
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

export async function sendAccountApprovedEmail(input: {
  to: string;
  name: string;
}): Promise<void> {
  const client = getClient();
  const loginUrl = `${emailConfig.clientBaseUrl}/login`;
  const { error } = await client.emails.send({
    from: emailConfig.from,
    to: input.to,
    subject: 'Your Extra Team account has been approved',
    html: accountApprovedEmailHtml(input.name, loginUrl),
  });

  if (error) {
    throw new Error(`Resend failed to send account approval email: ${error.message}`);
  }
}
