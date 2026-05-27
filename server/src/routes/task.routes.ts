import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate, requireApproved } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireApproved);

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.patch('/:id', taskController.updateTask);

export default router;
