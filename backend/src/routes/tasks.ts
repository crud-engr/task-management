import { Router } from 'express';
import { requireTenant, requireTenantAndUser } from '../middleware';
import { listTasks, createTask, completeTask } from '../controllers/tasksController';
import { triggerTasksExport } from '../controllers/exportsController';

const router = Router();

router.get('/', requireTenant, listTasks);
router.post('/', requireTenantAndUser, createTask);
router.post('/export', requireTenant, triggerTasksExport);
router.patch('/:id', requireTenant, completeTask);

export default router;
