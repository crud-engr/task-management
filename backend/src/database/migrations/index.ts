export { runMigrationsDown, runMigrationsUp, runTenantMigrations } from './runner';
export type { MigrationContext, MigrationModule } from './types';

import { runMigrationsUp } from './runner';
import { createTenantsTable } from './global/001-create-tenants-table';
import { createTasksTable } from './tenant/001-create-tasks-table';

/** Global migrations (public schema) */
export const globalMigrations = [createTenantsTable];

/** Tenant migrations (run per tenant schema) */
export const tenantMigrations = [createTasksTable];

/**
 * Run all global migrations, then create and migrate the given tenant schemas.
 * Intended for app startup.
 */
export async function migrateAll(tenantSchemaNames: string[] = []): Promise<{
  global: string[];
  tenants: Record<string, string[]>;
}> {
  const { ran: global } = await runMigrationsUp(globalMigrations, { schema: 'public' });
  const tenants: Record<string, string[]> = {};
  for (const schema of tenantSchemaNames) {
    const { ran } = await runMigrationsUp(tenantMigrations, { schema });
    tenants[schema] = ran;
  }
  return { global, tenants };
}
