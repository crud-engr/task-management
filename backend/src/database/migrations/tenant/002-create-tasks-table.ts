import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Creates the tasks table inside a tenant schema.
 * Run with search_path set to the tenant schema.
 * Depends on users table (user_id FK).
 */
export const createTasksTable: MigrationModule = {
  name: '002-create-tasks-table',
  async up(ctx) {
    await sequelize.query(
      `DO $$ BEGIN
        CREATE TYPE task_status AS ENUM ('pending', 'completed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'pending',
        user_id UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(`DROP TABLE IF EXISTS tasks`, {
      transaction: ctx.transaction,
    });
    await sequelize.query(`DROP TYPE IF EXISTS task_status`, {
      transaction: ctx.transaction,
    });
  },
};
