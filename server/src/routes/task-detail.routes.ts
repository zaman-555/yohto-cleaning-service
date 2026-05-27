import { Router } from 'express';
import * as taskDetailController from '../controllers/task-detail.controller';
import { authenticate, requireApproved } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireApproved);

router.get('/', taskDetailController.getTaskDetails);
router.post('/upsert', taskDetailController.upsertTaskDetail);

export default router;
