import type { Request, Response } from 'express';
import { authConfig } from '../config/auth';
import { emailConfig } from '../config/email';
import * as passwordResetTokenModel from '../models/password-reset-token.model';
import * as refreshTokenModel from '../models/refresh-token.model';
import * as userModel from '../models/user.model';
import { randomToken, sha256 } from '../services/crypto.service';
import { sendPasswordResetEmail } from '../services/email.service';
import { hashPassword, isBcryptHash, verifyPassword } from '../services/password.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/token.service';

function publicUser(user: {
  id: number;
  name: string;
  email: string;
  isApproved: boolean;
  isAdmin: boolean;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isApproved: user.isApproved,
    isAdmin: user.isAdmin,
  };
}

function refreshTokenExpiryDate(): Date {
  return new Date(Date.now() + authConfig.refreshTokenTtlSeconds * 1000);
}

function passwordResetExpiryDate(): Date {
  return new Date(Date.now() + authConfig.passwordResetTtlSeconds * 1000);
}

// Same response whether or not the account exists, to avoid leaking which emails are registered.
const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

async function issueAuthTokens(user: {
  id: number;
  email: string;
  name: string;
  isApproved: boolean;
  isAdmin: boolean;
}) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    isApproved: user.isApproved,
    isAdmin: user.isAdmin,
  });

  const refreshToken = signRefreshToken(user.id);
  await refreshTokenModel.createRefreshToken({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: refreshTokenExpiryDate(),
  });

  void refreshTokenModel
    .deleteExpiredRefreshTokens()
    .catch((error) => console.error('Refresh token cleanup error:', error));

  return { accessToken, refreshToken };
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const newUser = await userModel.createUser({ name, email, password });

    res.status(201).json({
      message: 'User registered successfully',
      user: publicUser(newUser),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const passwordValid = await verifyPassword(password, user.password);
    if (!passwordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!isBcryptHash(user.password)) {
      const passwordHash = await hashPassword(password);
      await userModel.updateUserPassword(user.id, passwordHash);
    }

    const userPublic = publicUser(user);

    if (!user.isApproved) {
      res.status(200).json({
        message: 'Account pending approval',
        user: userPublic,
      });
      return;
    }

    const { accessToken, refreshToken } = await issueAuthTokens(user);

    res.status(200).json({
      message: 'Login successful',
      user: userPublic,
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const storedToken = await refreshTokenModel.findActiveRefreshTokenByHash(sha256(refreshToken));

    if (!storedToken || storedToken.userId !== payload.sub) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const user = await userModel.findUserById(payload.sub);
    if (!user || !user.isApproved) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      isApproved: user.isApproved,
      isAdmin: user.isAdmin,
    });

    res.status(200).json({
      token: accessToken,
      refreshToken,
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken?: string };

  if (!refreshToken) {
    res.status(200).json({ message: 'Logged out' });
    return;
  }

  try {
    const storedToken = await refreshTokenModel.findActiveRefreshTokenByHash(sha256(refreshToken));
    if (storedToken) {
      await refreshTokenModel.revokeRefreshToken(storedToken.id);
    }
  } catch (error) {
    console.error('Logout token revoke error:', error);
  }

  res.status(200).json({ message: 'Logged out' });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const user = await userModel.findUserByEmail(email);

    if (user) {
      // Invalidate any outstanding reset tokens before issuing a fresh one.
      await passwordResetTokenModel.markAllPasswordResetTokensUsedForUser(user.id);

      const token = randomToken();
      await passwordResetTokenModel.createPasswordResetToken({
        userId: user.id,
        tokenHash: sha256(token),
        expiresAt: passwordResetExpiryDate(),
      });

      const resetUrl = `${emailConfig.clientBaseUrl}/reset-password?token=${token}`;
      const expiryMinutes = Math.round(authConfig.passwordResetTtlSeconds / 60);

      try {
        await sendPasswordResetEmail({
          to: user.email,
          name: user.name,
          resetUrl,
          expiryMinutes,
        });
      } catch (mailError) {
        // Don't surface delivery failures to the caller (avoids enumeration); log for ops.
        console.error('Password reset email error:', mailError);
      }
    }

    void passwordResetTokenModel
      .deleteExpiredPasswordResetTokens()
      .catch((error) => console.error('Password reset token cleanup error:', error));

    res.status(200).json({ message: FORGOT_PASSWORD_GENERIC_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(200).json({ message: FORGOT_PASSWORD_GENERIC_MESSAGE });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, password } = req.body as { token?: string; password?: string };

  if (!token || !password) {
    res.status(400).json({ error: 'Token and password are required' });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  try {
    const stored = await passwordResetTokenModel.findActivePasswordResetTokenByHash(sha256(token));
    if (!stored) {
      res.status(400).json({ error: 'This reset link is invalid or has expired' });
      return;
    }

    const passwordHash = await hashPassword(password);
    await userModel.updateUserPassword(stored.userId, passwordHash);
    await passwordResetTokenModel.markPasswordResetTokenUsed(stored.id);

    // A password change should invalidate all existing sessions.
    await refreshTokenModel.revokeAllRefreshTokensForUser(stored.userId);

    res.status(200).json({ message: 'Password has been reset. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.authUser) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  res.status(200).json({ user: publicUser(req.authUser) });
}
