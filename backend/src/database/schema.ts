/**
 * Schema-based multitenancy: helpers for dynamic schema switching and schema creation.
 * Each tenant uses a dedicated PostgreSQL schema (e.g. tenant_<id>) within the same database.
 */

import type { Transaction } from 'sequelize';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';

/** Validates and normalizes a schema name (alphanumeric + underscore) to avoid SQL injection */
const SCHEMA_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function validateSchemaName(schema: string): boolean {
  return SCHEMA_NAME_REGEX.test(schema) && schema.length <= 63;
}

/**
 * Returns query options to run Sequelize queries in a specific schema.
 */
export function getSchemaOptions(schema: string): { schema: string } {
  if (!validateSchemaName(schema)) {
    throw new Error(`Invalid schema name: ${schema}`);
  }
  return { schema };
}

/**
 * Runs the given callback inside a transaction with search_path set to the specified schema.
 * All queries inside the callback use the provided transaction so they use the same connection.
 */
export async function runInSchema<T>(
  schema: string,
  callback: (transaction: Transaction) => Promise<T>
): Promise<T> {
  if (!validateSchemaName(schema)) {
    throw new Error(`Invalid schema name: ${schema}`);
  }
  return sequelize.transaction(async (transaction) => {
    await sequelize.query(`SET LOCAL search_path TO "${schema.replace(/"/g, '""')}"`, {
      transaction,
    });
    return callback(transaction);
  });
}

/**
 * Creates a PostgreSQL schema if it does not exist.
 * Safe to call repeatedly (IF NOT EXISTS).
 */
export async function createSchema(schema: string): Promise<void> {
  if (!validateSchemaName(schema)) {
    throw new Error(`Invalid schema name: ${schema}`);
  }
  const quoted = quoteIdentifier(schema);
  await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${quoted}`);
}

/**
 * Drops a PostgreSQL schema
 * Optionally use CASCADE to drop objects in the schema.
 */
export async function dropSchema(schema: string, cascade = false): Promise<void> {
  if (!validateSchemaName(schema)) {
    throw new Error(`Invalid schema name: ${schema}`);
  }
  const quoted = quoteIdentifier(schema);
  const cascadeClause = cascade ? ' CASCADE' : '';
  await sequelize.query(`DROP SCHEMA IF EXISTS ${quoted}${cascadeClause}`);
}

/**
 * Returns true if the schema exists in the database.
 */
export async function schemaExists(schema: string): Promise<boolean> {
  if (!validateSchemaName(schema)) {
    return false;
  }
  const rows = await sequelize.query<{ exists: boolean }>(
    `SELECT EXISTS(
      SELECT 1 FROM information_schema.schemata WHERE schema_name = :schema
    ) AS "exists"`,
    { replacements: { schema }, type: QueryTypes.SELECT }
  );
  return rows?.[0]?.exists ?? false;
}

/**
 * Ensures the schema exists; creates it if not. Returns whether it was created.
 */
export async function ensureSchema(schema: string): Promise<boolean> {
  const exists = await schemaExists(schema);
  if (!exists) {
    await createSchema(schema);
    return true;
  }
  return false;
}

function quoteIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
