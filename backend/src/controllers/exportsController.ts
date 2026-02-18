import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { Export, EXPORT_STATUS } from '../models/Export';
import { addJob } from '../jobs/addJob';
import type { AuthenticatedRequest } from '../interfaces';
import type { ApiResponse } from '../interfaces';

const EXPORT_ERRORS = {
  INVALID_EXPORT_ID: 'Invalid export id',
  EXPORT_NOT_FOUND: 'Export not found',
  EXPORT_FILE_NOT_READY: 'Export file not ready',
  EXPORT_FILE_NOT_FOUND: 'Export file not found',
} as const;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function triggerTasksExport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const schemaName = req.schemaName!;

  try {
    const exportRecord = await Export.create({
      schema_name: schemaName,
      requested_by_user_id: req.user?.id ?? null,
      status: EXPORT_STATUS.PENDING,
    });

    const job = await addJob('tasks-export', {
      exportId: exportRecord.id,
      schemaName,
    });

    await exportRecord.update({ job_id: String(job.id) });

    res.status(202).json({
      success: true,
      data: {
        id: exportRecord.id,
        status: EXPORT_STATUS.PENDING,
        message: 'Export job queued',
      },
    } as ApiResponse);
  } catch (err) {
    next(err);
  }
}

export async function getExportStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = req.params.id;
  const schemaName = req.schemaName!;

  if (!isValidUuid(id)) {
    res.status(400).json({
      success: false,
      error: EXPORT_ERRORS.INVALID_EXPORT_ID,
    } as ApiResponse);
    return;
  }

  try {
    const exportRecord = await Export.findByPk(id);
    if (!exportRecord) {
      res.status(404).json({
        success: false,
        error: EXPORT_ERRORS.EXPORT_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    if (exportRecord.schema_name !== schemaName) {
      res.status(404).json({
        success: false,
        error: EXPORT_ERRORS.EXPORT_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    const data: {
      id: string;
      status: string;
      fileUrl?: string;
      error?: string | null;
      created_at?: Date;
      updated_at?: Date;
    } = {
      id: exportRecord.id,
      status: exportRecord.status,
      created_at: exportRecord.created_at,
      updated_at: exportRecord.updated_at,
    };

    if (exportRecord.status === EXPORT_STATUS.COMPLETED && exportRecord.file_path) {
      data.fileUrl = `/api/exports/${exportRecord.id}/file`;
    }
    if (exportRecord.error) {
      data.error = exportRecord.error;
    }

    res.json({ success: true, data } as ApiResponse);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /exports/:id/file - Download the export CSV file.
 */
export async function downloadExportFile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const id = req.params.id;
  const schemaName = req.schemaName!;

  if (!isValidUuid(id)) {
    res.status(400).json({
      success: false,
      error: EXPORT_ERRORS.INVALID_EXPORT_ID,
    } as ApiResponse);
    return;
  }

  try {
    const exportRecord = await Export.findByPk(id);
    if (!exportRecord) {
      res.status(404).json({
        success: false,
        error: EXPORT_ERRORS.EXPORT_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    if (exportRecord.schema_name !== schemaName) {
      res.status(404).json({
        success: false,
        error: EXPORT_ERRORS.EXPORT_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    if (exportRecord.status !== EXPORT_STATUS.COMPLETED || !exportRecord.file_path) {
      res.status(404).json({
        success: false,
        error: EXPORT_ERRORS.EXPORT_FILE_NOT_READY,
      } as ApiResponse);
      return;
    }

    const filePath = path.resolve(exportRecord.file_path);
    const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      res.status(404).json({
        success: false,
        error: EXPORT_ERRORS.EXPORT_FILE_NOT_FOUND,
      } as ApiResponse);
      return;
    }

    const filename = `tasks-export-${id}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}
