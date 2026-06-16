import { Router } from 'express';
import * as healthController from '../controllers/health.controller';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import taskRoutes from './task.routes';
import taskDetailRoutes from './task-detail.routes';

const router = Router();

router.get('/health', healthController.health);
router.use(authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/task-details', taskDetailRoutes);

export default router;
