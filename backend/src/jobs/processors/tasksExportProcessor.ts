/**
 * Processor for tasks-export job: fetch tasks in tenant schema, generate UTF-8 CSV, store file.
 */

import type { Job } from 'bull';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import { appConfig } from '../../config/env';
import { runInSchema } from '../../database/schema';
import { Export, EXPORT_STATUS } from '../../models/Export';
import { writeTasksCsvToFile, type TaskRow } from '../../services/csvExport';
import { addJob } from '../addJob';
import type { JobDataMap } from '../types';

const EXPORT_FILE_TTL_MS = 60 * 1000; // 1 minute

export async function processTasksExport(
  job: Job<JobDataMap['tasks-export']>
): Promise<void> {
  const { exportId, schemaName } = job.data;

  const exportRecord = await Export.findByPk(exportId);
  if (!exportRecord) {
    throw new Error(`Export not found: ${exportId}`);
  }

  await exportRecord.update({ status: EXPORT_STATUS.PROCESSING });

  try {
    const tasks = await runInSchema(schemaName, async (transaction) => {
      return sequelize.query<TaskRow>(
        `SELECT id, title, description, status, user_id, created_at, updated_at
         FROM tasks
         ORDER BY created_at ASC`,
        { transaction, type: QueryTypes.SELECT }
      );
    });

    const filename = `export-${exportId}.csv`;
    const filePath = await writeTasksCsvToFile(
      appConfig.exportStoragePath,
      filename,
      tasks
    );

    await exportRecord.update({
      status: EXPORT_STATUS.COMPLETED,
      file_path: filePath,
      error: null,
    });

    await addJob('cleanup-export-file', { filePath }, { delay: EXPORT_FILE_TTL_MS });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    await exportRecord.update({
      status: EXPORT_STATUS.FAILED,
      error: errorMessage,
    });
    throw err;
  }
}
