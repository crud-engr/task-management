/**
 * Helper to add jobs to the queue with status tracking.
 */

import type { JobOptions } from 'bull';
import { appQueue } from './queue';
import { createJobStatus } from '../models/JobStatus';
import type { JobDataMap, JobType } from './types';

const QUEUE_NAME = 'app-queue';

/**
 * Add a job to the queue and create a JobStatus record.
 */
export async function addJob<T extends JobType>(
  jobType: T,
  data: JobDataMap[T],
  opts?: JobOptions
) {
  const job = await appQueue.add(jobType, data as JobDataMap[JobType], opts);
  await createJobStatus(
    String(job.id),
    QUEUE_NAME,
    jobType,
    data as unknown as Record<string, unknown>,
    job.opts.attempts ?? 0
  );
  return job;
}
