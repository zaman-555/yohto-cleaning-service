import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const router = Router();

router.get('/', userController.getUsers);
router.patch('/:id/approval', userController.updateApproval);

export default router;
