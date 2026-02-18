import { api, apiClient } from './client'
import type { ExportStatusData, TriggerExportResponse } from '@/types/export.types'

const TASKS_EXPORT_PATH = '/tasks/export'
const EXPORTS_PATH = '/exports'

/**
 * Trigger a tasks export (admin only). Returns the new export id and status.
 */
export async function triggerTasksExport(): Promise<TriggerExportResponse> {
  const response = await api.post<{ data: TriggerExportResponse }>(TASKS_EXPORT_PATH)
  const body = response.data as unknown as { success: boolean; data: TriggerExportResponse }
  if (!body.success || !body.data) {
    throw new Error('Failed to start export')
  }
  return body.data
}

/**
 * Fetch current status of an export.
 */
export async function getExportStatus(exportId: string): Promise<ExportStatusData> {
  const response = await api.get<{ data: ExportStatusData }>(`${EXPORTS_PATH}/${exportId}`)
  const body = response.data as unknown as { success: boolean; data: ExportStatusData }
  if (!body.success || !body.data) {
    throw new Error('Failed to get export status')
  }
  return body.data
}

/**
 * Build the full URL for the export file (used for fetch with auth headers).
 */
export function getExportFileUrl(exportId: string): string {
  const base = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'
  const baseUrl = base.replace(/\/$/, '')
  return `${baseUrl}${EXPORTS_PATH}/${exportId}/file`
}

/**
 * Download the export file (uses auth headers via api client).
 */
export async function downloadExportFile(exportId: string): Promise<void> {
  const url = getExportFileUrl(exportId)
  const response = await apiClient.get(url, { responseType: 'blob' })
  const blob = response.data as Blob
  const disposition = response.headers['content-disposition']
  const filenameMatch = disposition?.match(/filename="?([^";]+)"?/)
  const filename = filenameMatch?.[1] ?? `tasks-export-${exportId}.csv`
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(objectUrl)
}
