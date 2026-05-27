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
  const { isApproved } = req.body as { isApproved?: boolean };

  try {
    const user = await userModel.updateUserApproval(Number(id), isApproved as boolean);
    res.json({ message: 'User approval updated', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
