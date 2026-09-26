import type { Request, Response } from 'express';
import * as userModel from '../models/user.model';
import { sendAccountApprovedEmail } from '../services/email.service';

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

export async function getDashboardStaffOrder(req: Request, res: Response): Promise<void> {
  const adminUserId = req.authUser?.id;
  if (!adminUserId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const staffUserIds = await userModel.getDashboardStaffOrder(adminUserId);
    if (!staffUserIds) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ staffUserIds });
  } catch (error) {
    console.error('Error fetching dashboard staff order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateDashboardStaffOrder(req: Request, res: Response): Promise<void> {
  const adminUserId = req.authUser?.id;
  if (!adminUserId) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const { staffUserIds } = req.body as { staffUserIds?: unknown };
  if (
    !Array.isArray(staffUserIds) ||
    staffUserIds.length > 100 ||
    !staffUserIds.every((id) => Number.isInteger(id) && Number(id) > 0)
  ) {
    res.status(400).json({
      error: 'staffUserIds must be an array of at most 100 positive integer IDs',
    });
    return;
  }

  const normalizedIds = staffUserIds.map(Number);
  if (new Set(normalizedIds).size !== normalizedIds.length) {
    res.status(400).json({ error: 'staffUserIds must not contain duplicate IDs' });
    return;
  }

  try {
    const validIds = await userModel.listValidDashboardStaffIds(normalizedIds);
    if (validIds.length !== normalizedIds.length) {
      res.status(400).json({ error: 'Order contains an invalid or unavailable staff member' });
      return;
    }

    await userModel.setDashboardStaffOrder(adminUserId, normalizedIds);
    const mergedIds = await userModel.getDashboardStaffOrder(adminUserId);
    res.json({ staffUserIds: mergedIds ?? normalizedIds });
  } catch (error) {
    console.error('Error updating dashboard staff order:', error);
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
    const target = await userModel.findUserById(userId);
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = await userModel.updateUserApproval(userId, isApproved);
    let notificationEmailSent = false;
    if (isApproved && !target.isApproved) {
      try {
        await sendAccountApprovedEmail({
          to: target.email,
          name: target.name,
        });
        notificationEmailSent = true;
      } catch (emailError) {
        console.error('Account approval email error:', emailError);
      }
    }

    res.json({ message: 'User approval updated', user, notificationEmailSent });
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
