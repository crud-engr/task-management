import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';

/**
 * GET /users/me - Return the current authenticated user (id, name, email, role).
 */
export async function getCurrentUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
}
