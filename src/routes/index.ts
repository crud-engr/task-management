import { Router } from 'express';
import healthRouter from './health';

const router = Router();

router.use('/health', healthRouter);

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Task Management API',
    version: '1.0.0',
    docs: '/health',
  });
});

export default router;
