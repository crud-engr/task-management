/**
 * Task entity
 */
export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

/**
 * Payload for creating a task
 */
export interface CreateTaskPayload {
  title: string
}

/**
 * Payload for updating a task (e.g. toggle completed)
 */
export interface UpdateTaskPayload {
  title?: string
  completed?: boolean
}
