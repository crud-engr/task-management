import { useState, useCallback, useRef, useEffect } from 'react'
import {
  triggerTasksExport,
  getExportStatus,
  downloadExportFile,
} from '@/api/exports'
import type { ExportStatusData } from '@/types/export.types'

const POLL_INTERVAL_MS = 2000

export function AdminExportSection() {
  const [currentExport, setCurrentExport] = useState<ExportStatusData | null>(
    null
  )
  const [isTriggering, setIsTriggering] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const pollStatus = useCallback(async (exportId: string) => {
    try {
      const data = await getExportStatus(exportId)
      setCurrentExport(data)
      setError(null)
      if (data.status === 'pending' || data.status === 'processing') {
        pollTimerRef.current = setTimeout(
          () => pollStatus(exportId),
          POLL_INTERVAL_MS
        )
      } else {
        stopPolling()
      }
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Failed to get export status')
      stopPolling()
    }
  }, [stopPolling])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const handleTriggerExport = async () => {
    setIsTriggering(true)
    setError(null)
    setCurrentExport(null)
    try {
      const { id, status } = await triggerTasksExport()
      setCurrentExport({ id, status })
      if (status === 'pending' || status === 'processing') {
        pollTimerRef.current = setTimeout(
          () => pollStatus(id),
          POLL_INTERVAL_MS
        )
      }
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Failed to start export'
      setError(message)
    } finally {
      setIsTriggering(false)
    }
  }

  const handleDownload = async () => {
    if (!currentExport?.id || currentExport.status !== 'completed') return
    setIsDownloading(true)
    setError(null)
    try {
      await downloadExportFile(currentExport.id)
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Failed to download file')
    } finally {
      setIsDownloading(false)
    }
  }

  const statusLabel =
    currentExport?.status === 'pending'
      ? 'Queued…'
      : currentExport?.status === 'processing'
        ? 'Exporting…'
        : currentExport?.status === 'completed'
          ? 'Ready'
          : currentExport?.status === 'failed'
            ? 'Failed'
            : null

  return (
    <section
      className="rounded-xl border border-surface-200 bg-white px-4 py-3 shadow-card"
      aria-labelledby="admin-export-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2
            id="admin-export-heading"
            className="text-sm font-medium text-surface-700 shrink-0"
          >
            Export tasks
          </h2>
          {currentExport && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-surface-600">
              {(currentExport.status === 'pending' ||
                currentExport.status === 'processing') && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
                    aria-hidden
                  />
                  {statusLabel}
                </span>
              )}
              {currentExport.status === 'completed' && (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="text-accent hover:text-accent-hover font-medium underline underline-offset-1 focus:outline-none focus:ring-2 focus:ring-accent rounded disabled:opacity-50"
                >
                  {isDownloading ? 'Downloading…' : 'Download'}
                </button>
              )}
              {currentExport.status === 'failed' && currentExport.error && (
                <span className="text-red-600">{currentExport.error}</span>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleTriggerExport}
          disabled={isTriggering}
          className="
            shrink-0 rounded-xl bg-accent px-4 py-2.5 font-semibold text-white text-sm
            hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200
          "
        >
          {isTriggering ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {error && (
        <p className="w-full text-xs text-red-600 mt-2" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
