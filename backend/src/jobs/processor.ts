/**
 * Job processor configuration.
 * Registers handlers for each job type.
 */

import type { Job } from 'bull';
import { appQueue } from './queue';
import type { JobDataMap, JobType } from './types';
import { JOB_STATUS } from './types';
import { updateJobStatus } from '../models';

/** Map of job type to processor function */
const processors: Partial<Record<JobType, (job: Job) => Promise<void>>> = {};

/** Process a single job with status tracking */
async function handleJob(job: Job): Promise<void> {
  const jobType = job.name as JobType;
  const processorFn = processors[jobType];

  try {
    await updateJobStatus(String(job.id), JOB_STATUS.ACTIVE);
    if (processorFn) {
      await processorFn(job as Job<JobDataMap[JobType]>);
      await updateJobStatus(String(job.id), JOB_STATUS.COMPLETED, undefined, job.returnvalue);
    } else {
      console.warn(`[Processor] No handler for job type: ${jobType}`);
      await updateJobStatus(String(job.id), JOB_STATUS.COMPLETED);
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    await updateJobStatus(String(job.id), JOB_STATUS.FAILED, error.message);
    throw err;
  }
}

/**
 * Register the job processor on the app queue.
 */
export function setupJobProcessor(): void {
  appQueue.process(handleJob);

  appQueue.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err?.message);
  });

  appQueue.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });
}
