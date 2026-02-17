/**
 * Bull queue setup with Redis connection.
 */

import Queue from 'bull';
import { redisConfig } from '../config/env';
import type { JobData } from './types';

const redisOptions = {
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password || undefined,
  db: redisConfig.db ?? 0,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

/** Default queue options */
const defaultQueueOptions: Queue.QueueOptions = {
  redis: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
};

/** Main application queue */
export const appQueue = new Queue<JobData>('app-queue', defaultQueueOptions);

appQueue.on('error', (err) => {
  console.error('Queue error:', err.message);
});

appQueue.on('ready', () => {
  console.log('Bull queue connected to Redis');
});
