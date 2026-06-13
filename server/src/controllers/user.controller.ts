import type { Request, Response } from 'express';
import * as userModel from '../models/user.model';

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const approvedQuery = req.query.approved;
    const approvedFilter =
      approvedQuery === 'true' ? true : approvedQuery === 'false' ? false : undefined;

    if (approvedFilter === undefined && !req.authUser?.isAdmin) {
      res.status(403).json({ error: 'Admin access required to list all users' });
      return;
    }

    const users = await userModel.listUsers(approvedFilter);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateApproval(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const { isApproved } = req.body as { isApproved?: unknown };

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  if (typeof isApproved !== 'boolean') {
    res.status(400).json({ error: 'isApproved must be a boolean' });
    return;
  }

  try {
    const exists = await userModel.userExistsById(userId);
    if (!exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = await userModel.updateUserApproval(userId, isApproved);
    res.json({ message: 'User approval updated', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: 'Invalid user id' });
    return;
  }

  if (req.authUser?.id === userId) {
    res.status(400).json({ error: 'You cannot delete your own account' });
    return;
  }

  try {
    const target = await userModel.findUserById(userId);
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (target.isAdmin) {
      res.status(403).json({ error: 'Admin accounts cannot be deleted' });
      return;
    }

    if (target.isApproved) {
      res.status(400).json({ error: 'User must be unapproved before deletion' });
      return;
    }

    await userModel.deleteUser(userId);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
