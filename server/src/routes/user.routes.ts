import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, requireAdmin, requireApproved } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, requireApproved);

router.get('/', userController.getUsers);
router.patch('/:id/approval', requireAdmin, userController.updateApproval);

export default router;
