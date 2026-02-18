export { runMigrationsDown, runMigrationsUp, runTenantMigrations } from './runner';
export type { MigrationContext, MigrationModule } from './types';

import { runMigrationsUp } from './runner';
import { createOrganizationsTable } from './global/001-create-organizations-table';
import { createJobStatusTable } from './global/002-create-job-status-table';
import { createExportsTable } from './global/003-create-exports-table';
import { alterOrganizationsIdToUuid } from './global/004-alter-organizations-id-to-uuid';
import { createUsersTable } from './tenant/001-create-users-table';
import { createTasksTable } from './tenant/002-create-tasks-table';
import { alterTasksAddUserId } from './tenant/003-alter-tasks-add-user-id';

/** Global migrations (public schema) */
export const globalMigrations = [
  createOrganizationsTable,
  createJobStatusTable,
  createExportsTable,
  alterOrganizationsIdToUuid,
];

/** Tenant migrations (run per tenant schema; order: users, tasks, then alter) */
export const tenantMigrations = [createUsersTable, createTasksTable, alterTasksAddUserId];

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
