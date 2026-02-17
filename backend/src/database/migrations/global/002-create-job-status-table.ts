import { sequelize } from '../../../config/database';
import { JOB_STATUS } from '../../../jobs/types';
import type { MigrationModule } from '../types';

const statusEnumValues = Object.values(JOB_STATUS)
  .map((v) => `'${v}'`)
  .join(', ');

/**
 * Creates the job_status table in the public schema.
 * Tracks Bull job lifecycle and status.
 */
export const createJobStatusTable: MigrationModule = {
  name: '002-create-job-status-table',
  async up(ctx) {
    await sequelize.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status_enum') THEN
          CREATE TYPE job_status_enum AS ENUM (${statusEnumValues});
        END IF;
      END $$`,
      { transaction: ctx.transaction }
    );

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS job_status (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        job_id VARCHAR(255) NOT NULL UNIQUE,
        job_name VARCHAR(255) NOT NULL,
        job_type VARCHAR(255) NOT NULL,
        status job_status_enum NOT NULL DEFAULT '${JOB_STATUS.WAITING}',
        data JSONB,
        result JSONB,
        error TEXT,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        finished_at TIMESTAMP WITH TIME ZONE
      )`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(`DROP TABLE IF EXISTS job_status`, {
      transaction: ctx.transaction,
    });
    await sequelize.query(`DROP TYPE IF EXISTS job_status_enum`, {
      transaction: ctx.transaction,
    });
  },
};
