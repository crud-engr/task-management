/**
 * Database initialization script.
 * Runs global and tenant migrations. Use when you want to init/update DB without starting the server.
 *
 * Usage: npx ts-node src/scripts/init-db.ts
 *    or: node dist/scripts/init-db.js (after build)
 *
 * Environment:
 *   TENANT_SCHEMAS - comma-separated list of tenant schema names to create and migrate (e.g. org_1,org_2)
 */

import { sequelize } from '../config/database';
import { migrateAll } from '../database/migrations';

function getTenantSchemas(): string[] {
  const raw = process.env.TENANT_SCHEMAS;
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection OK');

    const tenantSchemas = getTenantSchemas();
    const { global: globalRan, tenants: tenantRan } = await migrateAll(tenantSchemas);

    if (globalRan.length) {
      console.log('Global migrations run:', globalRan.join(', '));
    } else {
      console.log('Global migrations: none pending');
    }

    for (const [schema, ran] of Object.entries(tenantRan)) {
      if (ran.length) {
        console.log(`Tenant "${schema}" migrations run:`, ran.join(', '));
      } else {
        console.log(`Tenant "${schema}": none pending`);
      }
    }

    if (tenantSchemas.length === 0) {
      console.log('Tip: set TENANT_SCHEMAS (e.g. org_1,org_2) to create and migrate tenant schemas');
    }

    console.log('Database initialization complete');
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();
