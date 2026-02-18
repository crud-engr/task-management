/**
 * CSV generation for task exports with proper UTF-8 encoding.
 * Uses UTF-8 BOM so Excel and other tools detect UTF-8 correctly.
 */

import fs from 'fs';
import path from 'path';

const UTF8_BOM = '\uFEFF';

/** Escape a CSV field: wrap in quotes and escape internal double quotes. */
function escapeCsvField(value: string | null | undefined): string {
  const str = value == null ? '' : String(value);
  const needsQuotes = /[",\r\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  user_id: string;
  created_at: Date | string;
  updated_at: Date | string;
}

const CSV_HEADERS: (keyof TaskRow)[] = [
  'id',
  'title',
  'description',
  'status',
  'user_id',
  'created_at',
  'updated_at',
];

/**
 * Build CSV content from task rows (UTF-8, with BOM).
 */
function buildTasksCsv(rows: TaskRow[]): string {
  const lines: string[] = [];
  const headerLine = CSV_HEADERS.map((h) => escapeCsvField(h)).join(',');
  lines.push(headerLine);

  for (const row of rows) {
    const values: string[] = CSV_HEADERS.map((h) => {
      const v = row[h];
      if (h === 'created_at' || h === 'updated_at') {
        return v instanceof Date ? v.toISOString() : String(v ?? '');
      }
      return v == null ? '' : String(v);
    });
    lines.push(values.map(escapeCsvField).join(','));
  }

  return UTF8_BOM + lines.join('\r\n');
}

/**
 * Ensure directory exists and write CSV file with UTF-8 encoding.
 * File is written with BOM so Excel recognizes UTF-8.
 */
export async function writeTasksCsvToFile(
  dir: string,
  filename: string,
  rows: TaskRow[]
): Promise<string> {
  const fullDir = path.resolve(dir);
  await fs.promises.mkdir(fullDir, { recursive: true });
  const filePath = path.join(fullDir, filename);
  const content = buildTasksCsv(rows);
  await fs.promises.writeFile(filePath, content, { encoding: 'utf8' });
  return filePath;
}
