import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Creates the users table inside a tenant schema.
 * Run with search_path set to the tenant schema.
 */
export const createUsersTable: MigrationModule = {
  name: '001-create-users-table',
  async up(ctx) {
    await sequelize.query(
      `DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'member');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role user_role NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(`DROP TABLE IF EXISTS users`, {
      transaction: ctx.transaction,
    });
    await sequelize.query(`DROP TYPE IF EXISTS user_role`, {
      transaction: ctx.transaction,
    });
  },
};
