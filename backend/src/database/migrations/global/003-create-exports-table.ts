import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Creates the exports table in the public schema.
 * Tracks task export jobs, file path, and status.
 */
export const createExportsTable: MigrationModule = {
  name: '003-create-exports-table',
  async up(ctx) {
    await sequelize.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_status_enum') THEN
          CREATE TYPE export_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed');
        END IF;
      END $$`,
      { transaction: ctx.transaction }
    );

    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS exports (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        job_id VARCHAR(255),
        schema_name VARCHAR(63) NOT NULL,
        requested_by_user_id UUID,
        status export_status_enum NOT NULL DEFAULT 'pending',
        file_path TEXT,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(`DROP TABLE IF EXISTS exports`, {
      transaction: ctx.transaction,
    });
    await sequelize.query(`DROP TYPE IF EXISTS export_status_enum`, {
      transaction: ctx.transaction,
    });
  },
};
