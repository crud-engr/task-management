import { api } from './client'
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types'

const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
} as const

interface TaskRow {
  id: string
  title: string
  description: string | null
  status: string
  user_id: string
  created_at: string
  updated_at: string
}

function mapTaskRowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.status === TASK_STATUS.COMPLETED,
    createdAt: row.created_at,
  }
}

/**
 * Fetch all tasks from the API.
 */
export async function fetchTasks(): Promise<Task[]> {
  const response = await api.get<unknown>('/tasks')
  const body = response.data as { success?: boolean; data?: TaskRow[] }
  if (!body.success || !Array.isArray(body.data)) {
    throw new Error('Invalid tasks response')
  }
  return body.data.map(mapTaskRowToTask)
}

/**
 * Create a new task (requires tenant + user).
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post<unknown, { title: string }>('/tasks', {
    title: payload.title.trim(),
  })
  const body = response.data as { success?: boolean; data?: TaskRow }
  if (!body.success || !body.data) {
    throw new Error('Failed to create task')
  }
  return mapTaskRowToTask(body.data)
}

/**
 * Update a task (e.g. toggle completed).
 */
export async function updateTask(
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  const status =
    payload.completed === true
      ? TASK_STATUS.COMPLETED
      : payload.completed === false
        ? TASK_STATUS.PENDING
        : undefined
  if (status === undefined) {
    throw new Error('Update must include completed')
  }
  const response = await api.patch<unknown, { status: string }>(`/tasks/${id}`, {
    status,
  })
  const body = response.data as { success?: boolean; data?: TaskRow }
  if (!body.success || !body.data) {
    throw new Error('Failed to update task')
  }
  return mapTaskRowToTask(body.data)
}
