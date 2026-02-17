import { Router } from 'express';
import healthRouter from './health';
import tasksRouter from './tasks';

const router = Router();

router.use('/health', healthRouter);
router.use('/tasks', tasksRouter);

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Task Management API',
    version: '1.0.0',
    docs: '/health',
  });
});

export default router;
