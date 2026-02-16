import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Creates the tasks table inside a tenant schema.
 * Run with search_path set to the tenant schema, so no schema prefix needed.
 */
export const createTasksTable: MigrationModule = {
  name: '001-create-tasks-table',
  async up(ctx) {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
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
  },
};
