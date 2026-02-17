import type { Model, Optional } from 'sequelize';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import type { BullJobStatus } from '../jobs/types';
import { JOB_STATUS } from '../jobs/types';

export interface JobStatusAttributes {
  id: string;
  job_id: string;
  job_name: string;
  job_type: string;
  status: BullJobStatus;
  data: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error: string | null;
  attempts: number;
  created_at?: Date;
  updated_at?: Date;
  finished_at?: Date | null;
}

export type JobStatusCreationAttributes = Optional<
  JobStatusAttributes,
  'id' | 'data' | 'result' | 'error' | 'attempts' | 'created_at' | 'updated_at' | 'finished_at'
>;

export interface JobStatusInstance
  extends Model<JobStatusAttributes, JobStatusCreationAttributes>,
    JobStatusAttributes {}

const JobStatus = sequelize.define<JobStatusInstance>(
  'JobStatus',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    job_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    job_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        JOB_STATUS.WAITING,
        JOB_STATUS.ACTIVE,
        JOB_STATUS.COMPLETED,
        JOB_STATUS.FAILED,
        JOB_STATUS.DELAYED,
        JOB_STATUS.PAUSED,
        JOB_STATUS.STUCK
      ),
      allowNull: false,
      defaultValue: JOB_STATUS.WAITING,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    result: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    finished_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'job_status',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    schema: 'public',
  }
);

/**
 * Create or update job status record.
 * Call when a job is added to the queue.
 */
export async function createJobStatus(
  jobId: string,
  jobName: string,
  jobType: string,
  data: Record<string, unknown> | null,
  attempts: number = 0
): Promise<JobStatusInstance> {
  const [record] = await JobStatus.findOrCreate({
    where: { job_id: jobId },
    defaults: {
      job_id: jobId,
      job_name: jobName,
      job_type: jobType,
      status: JOB_STATUS.WAITING,
      data,
      attempts,
    },
  });
  return record;
}

/**
 * Update job status (active, completed, failed).
 */
export async function updateJobStatus(
  jobId: string,
  status: BullJobStatus,
  error?: string,
  result?: unknown
): Promise<void> {
  const updateFields: Partial<JobStatusAttributes> = {
    status,
    updated_at: new Date(),
  };
  if (error !== undefined) updateFields.error = error;
  if (result !== undefined) {
    updateFields.result = typeof result === 'object' ? (result as Record<string, unknown>) : { value: result };
  }
  if (status === JOB_STATUS.COMPLETED || status === JOB_STATUS.FAILED) {
    updateFields.finished_at = new Date();
  }

  await JobStatus.update(updateFields, {
    where: { job_id: jobId },
  });
}

export { JobStatus };
