import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../config/database';
import type { MigrationModule } from '../types';

/**
 * Alters organizations.id from VARCHAR(255) to UUID.
 * Existing string ids (e.g. 'org-test') get a new random UUID.
 * Run after 001-create-organizations-table.
 */
export const alterOrganizationsIdToUuid: MigrationModule = {
  name: '004-alter-organizations-id-to-uuid',
  async up(ctx) {
    const [row] = await sequelize.query<{ data_type: string }>(
      `SELECT data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'organizations' AND column_name = 'id'`,
      { transaction: ctx.transaction, type: QueryTypes.SELECT }
    );
    if (row?.data_type === 'uuid') {
      return; // already migrated
    }

    await sequelize.query(
      `ALTER TABLE organizations ADD COLUMN id_new UUID DEFAULT gen_random_uuid()`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `UPDATE organizations SET id_new = CASE
        WHEN id::text ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
        THEN id::uuid
        ELSE gen_random_uuid()
       END`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_pkey`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations DROP COLUMN id`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations RENAME COLUMN id_new TO id`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations ALTER COLUMN id SET DEFAULT gen_random_uuid()`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations ADD PRIMARY KEY (id)`,
      { transaction: ctx.transaction }
    );
  },
  async down(ctx) {
    await sequelize.query(
      `ALTER TABLE organizations ADD COLUMN id_old VARCHAR(255)`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `UPDATE organizations SET id_old = id::text`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations DROP CONSTRAINT organizations_pkey`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations DROP COLUMN id`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations RENAME COLUMN id_old TO id`,
      { transaction: ctx.transaction }
    );
    await sequelize.query(
      `ALTER TABLE organizations ADD PRIMARY KEY (id)`,
      { transaction: ctx.transaction }
    );
  },
};
