/**
 * Loads tenant (Organization) by tenant-id and attaches tenant + schema name to request.
 * Enables schema switching for downstream code via req.schemaName and runInSchema().
 * Requires extractTenantId (and optionally requireTenantId) to have run first.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';
import { Organization } from '../models/Organization';

export async function loadTenant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const tenantId = authReq.tenantId;

  if (!tenantId) {
    const body: ApiResponse = {
      success: false,
      error: 'Missing x-tenant-id header',
    };
    res.status(400).json(body);
    return;
  }

  try {
    const org = await Organization.findByPk(tenantId);
    if (!org) {
      const body: ApiResponse = {
        success: false,
        error: 'Tenant not found',
      };
      res.status(404).json(body);
      return;
    }

    authReq.tenant = org;
    authReq.schemaName = org.schema_name;
    next();
  } catch (err) {
    next(err);
  }
}
