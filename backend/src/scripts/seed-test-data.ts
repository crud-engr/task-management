/**
 * Seeds one organization (UUID id) and one admin user for testing.
 * Use the printed Tenant ID and User ID in the login UI to sign in and use Export.
 *
 * Usage: npx ts-node src/scripts/seed-test-data.ts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { QueryTypes } from 'sequelize';

const backendRoot = path.resolve(__dirname, '../..');
const envPath = path.join(backendRoot, '.env');
const altEnvPath = path.join(process.cwd(), 'backend', '.env');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : altEnvPath });

import { sequelize } from '../config/database';
import { Organization } from '../models/Organization';
import { ensureSchema, runInSchema } from '../database/schema';
import { runMigrationsUp, tenantMigrations } from '../database/migrations';

const SCHEMA_NAME = 'org_test';

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK\n');

    // Ensure tenant schema exists and has users/tasks tables
    await ensureSchema(SCHEMA_NAME);
    await runMigrationsUp(tenantMigrations, { schema: SCHEMA_NAME });

    // Create or get organization with UUID id
    const orgId = randomUUID();
    const [org] = await Organization.findOrCreate({
      where: { schema_name: SCHEMA_NAME },
      defaults: { id: orgId, name: 'Test Org', schema_name: SCHEMA_NAME },
    });
    const tenantId = org.id;
    console.log('Tenant:', tenantId, '-', org.name);

    // Create or get admin user in the tenant schema
    const userId = await runInSchema(SCHEMA_NAME, async (transaction) => {
      const existing = await sequelize.query<{ id: string }>(
        `SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1`,
        { transaction, type: QueryTypes.SELECT }
      );
      if (existing?.[0]?.id) {
        // Ensure role is admin
        await sequelize.query(
          `UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'`,
          { transaction }
        );
        return existing[0].id;
      }
      const rows = await sequelize.query<{ id: string }>(
        `INSERT INTO users (name, email, role)
         VALUES ('Admin User', 'admin@example.com', 'admin')
         RETURNING id`,
        { transaction, type: QueryTypes.SELECT }
      );
      return rows?.[0]?.id ?? null;
    });

    if (!userId) {
      console.error('Could not create or find admin user');
      process.exit(1);
    }

    console.log('\n--- Use these in the login UI ---');
    console.log('Tenant ID:', tenantId);
    console.log('User ID:  ', userId);
    console.log('-----------------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
