
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface ExportStatusData {
  id: string
  status: ExportStatus
  fileUrl?: string
  error?: string | null
  created_at?: string
  updated_at?: string
}

export interface TriggerExportResponse {
  id: string
  status: ExportStatus
  message?: string
}
