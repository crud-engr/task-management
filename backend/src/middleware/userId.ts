/**
 * Extracts user-id from x-user-id header and attaches to request.
 * Does not validate or load the user; use loadUser middleware for that.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';

const HEADER = 'x-user-id';

export function extractUserId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const value = req.header(HEADER);
  (req as AuthenticatedRequest).userId =
    typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
  next();
}

/**
 * Requires x-user-id to be present. Call after extractUserId.
 * Sends 400 with ApiResponse if missing.
 */
export function requireUserId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = (req as AuthenticatedRequest).userId;
  if (!userId) {
    const body: ApiResponse = {
      success: false,
      error: 'Missing x-user-id header',
    };
    res.status(400).json(body);
    return;
  }
  next();
}
