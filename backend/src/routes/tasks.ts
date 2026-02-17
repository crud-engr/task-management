import { Router } from 'express';
import { requireTenant, requireTenantAndUser } from '../middleware';
import { listTasks, createTask, completeTask } from '../controllers/tasksController';

const router = Router();

router.get('/', requireTenant, listTasks);
router.post('/', requireTenantAndUser, createTask);
router.patch('/:id', requireTenant, completeTask);

export default router;
