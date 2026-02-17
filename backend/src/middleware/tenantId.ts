/**
 * Extracts tenant-id from x-tenant-id header and attaches to request.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';

const HEADER = 'x-tenant-id';

export function extractTenantId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const value = req.header(HEADER);
  (req as AuthenticatedRequest).tenantId =
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
  next();
}

/**
 * Requires x-tenant-id to be present. Call after extractTenantId.
 * Sends 400 with ApiResponse if missing.
 */
export function requireTenantId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tenantId = (req as AuthenticatedRequest).tenantId;
  if (!tenantId) {
    const body: ApiResponse = {
      success: false,
      error: 'Missing x-tenant-id header',
    };
    res.status(400).json(body);
    return;
  }
  next();
}
