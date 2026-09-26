import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, requireAdmin, requireApproved } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireApproved);

router.get('/', userController.getUsers);
router.get(
  '/me/dashboard-staff-order',
  requireAdmin,
  userController.getDashboardStaffOrder
);
router.put(
  '/me/dashboard-staff-order',
  requireAdmin,
  userController.updateDashboardStaffOrder
);
router.patch('/:id/approval', requireAdmin, userController.updateApproval);
router.delete('/:id', requireAdmin, userController.deleteUser);

export default router;
