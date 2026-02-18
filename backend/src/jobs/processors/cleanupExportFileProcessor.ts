/**
 * Processor for cleanup-export-file job: delete an export CSV after a delay.
 * Only removes files under the configured export storage path.
 */

import path from 'path';
import fs from 'fs';
import type { Job } from 'bull';
import { appConfig } from '../../config/env';
import type { JobDataMap } from '../types';

/** Ensure target path is inside the export storage directory to avoid path traversal */
function isPathUnderExportDir(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  const exportDir = path.resolve(appConfig.exportStoragePath);
  const relative = path.relative(exportDir, resolved);
  return relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export async function processCleanupExportFile(
  job: Job<JobDataMap['cleanup-export-file']>
): Promise<void> {
  const { filePath } = job.data;

  if (!filePath || typeof filePath !== 'string') {
    return;
  }

  if (!isPathUnderExportDir(filePath)) {
    console.warn(`[CleanupExport] Rejected path outside export dir: ${filePath}`);
    return;
  }

  const resolved = path.resolve(filePath);
  try {
    await fs.promises.unlink(resolved);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`[CleanupExport] Failed to remove ${resolved}:`, (err as Error).message);
    }
  }
}
