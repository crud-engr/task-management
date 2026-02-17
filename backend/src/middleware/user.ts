/**
 * Loads user in the tenant schema and attaches to request.
 * Uses runInSchema so User is queried in the tenant's schema.
 * Requires loadTenant (and optionally extractUserId + requireUserId) to have run first.
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';
import { User } from '../models/User';
import { runInSchema } from '../database/schema';

export async function loadUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.userId;
  const schemaName = authReq.schemaName;

  if (!userId) {
    const body: ApiResponse = {
      success: false,
      error: 'Missing x-user-id header',
    };
    res.status(400).json(body);
    return;
  }

  if (!schemaName) {
    const body: ApiResponse = {
      success: false,
      error: 'Tenant context required',
    };
    res.status(400).json(body);
    return;
  }

  try {
    const user = await runInSchema(schemaName, async (transaction) => {
      return User.findOne({
        where: { id: userId },
        transaction,
      });
    });

    if (!user) {
      const body: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(body);
      return;
    }

    authReq.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
