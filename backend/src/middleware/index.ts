/**
 * Tenant and user middleware.
 */

import type { RequestHandler } from 'express';
import { extractTenantId, requireTenantId } from './tenantId';
import { extractUserId, requireUserId } from './userId';
import { loadTenant } from './tenant';
import { loadUser } from './user';

export { extractTenantId, requireTenantId } from './tenantId';
export { extractUserId, requireUserId } from './userId';
export { loadTenant } from './tenant';
export { loadUser } from './user';

export const requireTenant: RequestHandler[] = [
  extractTenantId,
  loadTenant,
];

/**
 * Requires tenant and user: both headers present, org exists, user exists in tenant schema.
 */
export const requireTenantAndUser: RequestHandler[] = [
  extractTenantId,
  extractUserId,
  loadTenant,
  loadUser,
];
