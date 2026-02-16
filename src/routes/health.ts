import { Router, Request, Response } from 'express';
import { testDatabaseConnection, testRedisConnection } from '../config';
import type { HealthStatus } from '../interfaces';

const router = Router();

router.get('/', async (res: Response): Promise<void> => {
  const [database, redis] = await Promise.all([
    testDatabaseConnection(),
    testRedisConnection(),
  ]);

  const status: HealthStatus = {
    status: database && redis ? 'ok' : database || redis ? 'degraded' : 'error',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database,
      redis,
    },
  };

  const statusCode = status.status === 'ok' ? 200 : status.status === 'degraded' ? 200 : 503;
  res.status(statusCode).json(status);
});

export default router;
