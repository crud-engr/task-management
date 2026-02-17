import { Response, NextFunction } from 'express';
import { QueryTypes } from 'sequelize';
import { TASK_STATUS } from '../models/types';
import { sequelize } from '../config/database';
import { runInSchema } from '../database/schema';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';

const TASK_ERRORS = {
  TITLE_REQUIRED: 'title is required and must be a non-empty string',
  TITLE_MAX_LENGTH: 'title must be at most 500 characters',
  DESCRIPTION_MUST_BE_STRING: 'description must be a string',
  INVALID_TASK_ID: 'Invalid task id',
  TASK_NOT_FOUND: 'Task not found',
  INVALID_STATUS: 'status must be one of: pending, completed',
} as const;

const ALLOWED_STATUSES: readonly string[] = [TASK_STATUS.PENDING, TASK_STATUS.COMPLETED];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function listTasks(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const schemaName = req.schemaName!;
  try {
    const tasks = await runInSchema(schemaName, async (transaction) => {
      return sequelize.query<TaskRow>(
        `SELECT id, title, description, status, user_id, created_at, updated_at
         FROM tasks
         ORDER BY created_at DESC`,
        { transaction, type: QueryTypes.SELECT }
      );
    });
    res.json({ success: true, data: tasks } as ApiResponse<unknown>);
  } catch (err) {
    next(err);
  }
}

export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const schemaName = req.schemaName!;
  const user = req.user!;

  const rawTitle = req.body?.title;
  const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
  if (!title) {
    res.status(400).json({
      success: false,
      error: TASK_ERRORS.TITLE_REQUIRED,
    } as ApiResponse);
    return;
  }
  if (title.length > 500) {
    res.status(400).json({
      success: false,
      error: TASK_ERRORS.TITLE_MAX_LENGTH,
    } as ApiResponse);
    return;
  }

  let description: string | null = null;
  if (req.body?.description != null) {
    if (typeof req.body.description !== 'string') {
      res.status(400).json({
        success: false,
        error: TASK_ERRORS.DESCRIPTION_MUST_BE_STRING,
      } as ApiResponse);
      return;
    }
    description = req.body.description.trim() || null;
  }

  try {
    const task = await runInSchema(schemaName, async (transaction) => {
      const rows = await sequelize.query<TaskRow>(
        `INSERT INTO tasks (title, description, status, user_id)
         VALUES (:title, :description, :status, :user_id)
         RETURNING id, title, description, status, user_id, created_at, updated_at`,
        {
          replacements: {
            title,
            description,
            status: TASK_STATUS.PENDING,
            user_id: user.id,
          },
          transaction,
          type: QueryTypes.SELECT,
        }
      );
      return rows[0] ?? null;
    });
    if (!task) {
      next(new Error('Task create returned no row'));
      return;
    }
    res.status(201).json({ success: true, data: task } as ApiResponse);
  } catch (err) {
    next(err);
  }
}

export async function completeTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const schemaName = req.schemaName!;
  const id = req.params.id;

  if (!isValidUuid(id)) {
    res.status(400).json({
      success: false,
      error: TASK_ERRORS.INVALID_TASK_ID,
    } as ApiResponse);
    return;
  }

  const rawStatus = req.body?.status;
  const status = typeof rawStatus === 'string' ? rawStatus.trim() : '';
  if (!status || !ALLOWED_STATUSES.includes(status)) {
    res.status(400).json({
      success: false,
      error: TASK_ERRORS.INVALID_STATUS,
    } as ApiResponse);
    return;
  }

  try {
    const result = await runInSchema(schemaName, async (transaction) => {
      const rows = await sequelize.query<TaskRow>(
        `UPDATE tasks SET status = :status, updated_at = NOW() WHERE id = :id RETURNING id, title, description, status, user_id, created_at, updated_at`,
        {
          replacements: { status, id },
          transaction,
          type: QueryTypes.SELECT,
        }
      );
      return rows[0] ?? null;
    });

    if (!result) {
      res.status(404).json({
        success: false,
        error: TASK_ERRORS.TASK_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    res.json({ success: true, data: result } as ApiResponse);
  } catch (err) {
    next(err);
  }
}
