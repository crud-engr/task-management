import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Creates the tenants table in the public schema to track tenant schemas.
 */
export const createTenantsTable: MigrationModule = {
  name: '001-create-tenants-table',
  async up(ctx) {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        schema_name VARCHAR(63) NOT NULL UNIQUE,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(`DROP TABLE IF EXISTS tenants`, {
      transaction: ctx.transaction,
    });
  },
};
