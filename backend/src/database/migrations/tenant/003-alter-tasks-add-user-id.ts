import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Adds user_id to tasks table when it was created by an older migration (without user_id).
 * New installs get user_id from 002-create-tasks-table; this handles existing tenant schemas.
 */
export const alterTasksAddUserId: MigrationModule = {
  name: '003-alter-tasks-add-user-id',
  async up(ctx) {
    await sequelize.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = current_schema() AND table_name = 'tasks' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE tasks ADD COLUMN user_id UUID REFERENCES users(id);
        END IF;
      END $$`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(
      `ALTER TABLE tasks DROP COLUMN IF EXISTS user_id`,
      { transaction: ctx.transaction }
    );
  },
};
