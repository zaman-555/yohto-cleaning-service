import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import * as monthVisibilityController from '../controllers/schedule-month-visibility.controller';
import { authenticate, requireAdmin, requireApproved } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireApproved);

router.get('/month-visibility', monthVisibilityController.getMonthVisibility);
router.patch(
  '/month-visibility',
  requireAdmin,
  monthVisibilityController.updateMonthVisibility,
);
router.get('/leave-days', requireAdmin, taskController.getLeaveDays);
router.get('/year', requireAdmin, taskController.getTasksForYear);
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);

export default router;
