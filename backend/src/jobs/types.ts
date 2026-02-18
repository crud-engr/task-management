/**
 * Bull job type definitions.
 */

/** Registered job type names */
export type JobType = string;

/** Job data payload by job type */
export interface JobDataMap {
  'tasks-export': {
    exportId: string;
    schemaName: string;
  };
  'cleanup-export-file': {
    filePath: string;
  };
  [key: string]: Record<string, unknown>;
}

/** Generic job data for unknown types */
export type JobData = JobDataMap[JobType];

/** Bull job status values */
export type BullJobStatus =
  | 'waiting'
  | 'active'
  | 'completed'
  | 'failed'
  | 'delayed'
  | 'paused'
  | 'stuck';

export const JOB_STATUS: Record<Uppercase<BullJobStatus>, BullJobStatus> = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  DELAYED: 'delayed',
  PAUSED: 'paused',
  STUCK: 'stuck',
} as const;
