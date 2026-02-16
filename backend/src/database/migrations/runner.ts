/**
 * Migration runner for schema creation.
 * Tenant migrations run in each specified tenant schema; schemas are created if missing.
 */

import type { Transaction } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { ensureSchema, runInSchema } from '../schema';
import type { MigrationModule } from './types';

const MIGRATIONS_TABLE = 'sequelize_schema_migrations';

async function ensureMigrationsTable(transaction: Transaction): Promise<void> {
  await sequelize.query(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      name VARCHAR(255) NOT NULL PRIMARY KEY,
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )`,
    { transaction }
  );
}

async function getExecutedMigrations(transaction: Transaction): Promise<string[]> {
  const rows = await sequelize.query<{ name: string }>(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY name`,
    { transaction, type: QueryTypes.SELECT }
  );
  return Array.isArray(rows) ? rows.map((r) => r.name) : [];
}

async function recordMigration(
  name: string,
  transaction: Transaction
): Promise<void> {
  await sequelize.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (:name)`,
    { replacements: { name }, transaction }
  );
}

async function removeMigrationRecord(
  name: string,
  transaction: Transaction
): Promise<void> {
  await sequelize.query(
    `DELETE FROM ${MIGRATIONS_TABLE} WHERE name = :name`,
    { replacements: { name }, transaction }
  );
}

/**
 * Runs pending migrations in the given schema.
 * If schema is provided and not 'public', it will be created if it does not exist.
 */
export async function runMigrationsUp(
  migrations: MigrationModule[],
  options: { schema?: string } = {}
): Promise<{ ran: string[] }> {
  const schema = options.schema ?? 'public';
  if (schema !== 'public') {
    await ensureSchema(schema);
  }

  const ran: string[] = [];

  await runInSchema(schema, async (transaction) => {
    await ensureMigrationsTable(transaction);
    const executed = await getExecutedMigrations(transaction);

    for (const migration of migrations) {
      if (executed.includes(migration.name)) continue;
      const ctx = { schema: schema === 'public' ? undefined : schema, transaction };
      await migration.up(ctx);
      await recordMigration(migration.name, transaction);
      ran.push(migration.name);
    }
  });

  return { ran };
}

/**
 * Rolls back the last N migrations in the given schema.
 */
export async function runMigrationsDown(
  migrations: MigrationModule[],
  options: { schema?: string; count?: number } = {}
): Promise<{ rolled: string[] }> {
  const schema = options.schema ?? 'public';
  const count = options.count ?? 1;
  const rolled: string[] = [];

  await runInSchema(schema, async (transaction) => {
    const executed = await getExecutedMigrations(transaction);
    const toRoll = executed.slice(-count).reverse();
    const byName = new Map(migrations.map((m) => [m.name, m]));

    for (const name of toRoll) {
      const migration = byName.get(name);
      if (!migration) continue;
      const ctx = { schema: schema === 'public' ? undefined : schema, transaction };
      await migration.down(ctx);
      await removeMigrationRecord(name, transaction);
      rolled.push(name);
    }
  });

  return { rolled };
}

/**
 * Creates the given tenant schemas (by name) and runs tenant migrations in each.
 */
export async function runTenantMigrations(
  tenantSchemaNames: string[],
  tenantMigrations: MigrationModule[]
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  for (const schemaName of tenantSchemaNames) {
    const { ran } = await runMigrationsUp(tenantMigrations, { schema: schemaName });
    result[schemaName] = ran;
  }
  return result;
}
