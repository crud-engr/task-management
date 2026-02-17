
import type { Request, Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';
import type { UserInstance } from '../models/User';
import { sequelize } from '../config/database';
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
    const row = await runInSchema(schemaName, async (transaction) => {
      const rows = await sequelize.query<UserInstance>(
        'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = :id LIMIT 1',
        {
          replacements: { id: userId },
          transaction,
          type: QueryTypes.SELECT,
        }
      );
      return rows[0] ?? null;
    });

    if (!row) {
      const body: ApiResponse = {
        success: false,
        error: 'User not found',
      };
      res.status(404).json(body);
      return;
    }

    authReq.user = row as UserInstance;
    next();
  } catch (err) {
    next(err);
  }
}
