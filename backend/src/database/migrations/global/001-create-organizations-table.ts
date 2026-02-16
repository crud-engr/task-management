import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Creates the organizations table in the public schema.
 * Tracks organizations and their dedicated PostgreSQL schema (multi-tenant).
 */
export const createOrganizationsTable: MigrationModule = {
  name: '001-create-organizations-table',
  async up(ctx) {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(255) NOT NULL PRIMARY KEY,
        name VARCHAR(255),
        schema_name VARCHAR(63) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(`DROP TABLE IF EXISTS organizations`, {
      transaction: ctx.transaction,
    });
  },
};
