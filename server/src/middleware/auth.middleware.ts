import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/user.model';
import { verifyAccessToken } from '../services/token.service';
import type { AuthUser } from '../types/auth';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  const token = header.slice('Bearer '.length).trim();
  return token.length > 0 ? token : null;
}

async function resolveAuthUser(token: string): Promise<AuthUser | null> {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return null;
  }

  const user = await userModel.findUserById(payload.sub);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isApproved: user.isApproved,
    isAdmin: user.isAdmin,
  };
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req);
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const authUser = await resolveAuthUser(token);
    if (!authUser) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.authUser = authUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export function requireApproved(req: Request, res: Response, next: NextFunction): void {
  if (!req.authUser?.isApproved) {
    res.status(403).json({ error: 'Account pending approval' });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.authUser?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}
