/**
 * Bull queue setup
 */
import Queue from 'bull';
import { redisConfig } from '../config';

export const createQueue = (name: string, defaultJobOptions?: Queue.JobOptions): Queue.Queue =>
  new Queue(name, {
    redis: {
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db ?? 0,
    },
    defaultJobOptions: {
      removeOnComplete: 100,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
      ...defaultJobOptions,
    },
  });
