import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';

/**
 * Requires the current user to have role 'admin'.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    const body: ApiResponse = {
      success: false,
      error: 'User context required',
    };
    res.status(401).json(body);
    return;
  }
  if (req.user.role !== 'admin') {
    const body: ApiResponse = {
      success: false,
      error: 'Admin role required',
    };
    res.status(403).json(body);
    return;
  }
  next();
}
