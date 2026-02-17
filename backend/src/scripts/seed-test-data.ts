/**
 * Seeds one organization and one user for testing.
 *
 * Usage: npx ts-node src/scripts/seed-test-data.ts
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { QueryTypes } from 'sequelize';

const backendRoot = path.resolve(__dirname, '../..');
const envPath = path.join(backendRoot, '.env');
const altEnvPath = path.join(process.cwd(), 'backend', '.env');
dotenv.config({ path: fs.existsSync(envPath) ? envPath : altEnvPath });

import { sequelize } from '../config/database';
import { Organization } from '../models/Organization';
import { ensureSchema, runInSchema } from '../database/schema';
import { runMigrationsUp, tenantMigrations } from '../database/migrations';

const TENANT_ID = 'org-test';
const SCHEMA_NAME = 'org_test';

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK\n');

    // Ensure tenant schema exists and has users table
    await ensureSchema(SCHEMA_NAME);
    await runMigrationsUp(tenantMigrations, { schema: SCHEMA_NAME });

    // Create or get organization
    const [org] = await Organization.findOrCreate({
      where: { id: TENANT_ID },
      defaults: { id: TENANT_ID, name: 'Test Org', schema_name: SCHEMA_NAME },
    });
    console.log('Tenant:', org.id, '-', org.name);

    // Create or get a test user in the tenant schema and return its id
    const userId = await runInSchema(SCHEMA_NAME, async (transaction) => {
      const existing = await sequelize.query<{ id: string }>(
        `SELECT id FROM users WHERE email = 'test@example.com' LIMIT 1`,
        { transaction, type: QueryTypes.SELECT }
      );
      if (existing?.[0]?.id) return existing[0].id;
      const rows = await sequelize.query<{ id: string }>(
        `INSERT INTO users (name, email, role)
         VALUES ('Test User', 'test@example.com', 'member')
         RETURNING id`,
        { transaction, type: QueryTypes.SELECT }
      );
      return rows?.[0]?.id ?? null;
    });

    if (!userId) {
      console.error('Could not create or find test user');
      process.exit(1);
    }

    console.log('\n--- Use these in Postman (Headers) ---');
    console.log('x-tenant-id:', TENANT_ID);
    console.log('x-user-id:', userId);
    console.log('--------------------------------------\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
