import { Router } from 'express';
import * as taskDetailController from '../controllers/task-detail.controller';

const router = Router();

router.get('/', taskDetailController.getTaskDetails);
router.post('/upsert', taskDetailController.upsertTaskDetail);

export default router;
