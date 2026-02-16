import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types'

const dummyTasks: Task[] = [
  {
    id: '1',
    title: 'Review pull request',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Update documentation',
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Plan sprint retrospective',
    completed: false,
    createdAt: new Date().toISOString(),
  },
]

let tasks = [...dummyTasks]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Fetch all tasks (dummy implementation)
 */
export async function fetchTasks(): Promise<Task[]> {
  await delay(300)
  return [...tasks]
}

/**
 * Create a new task (dummy implementation)
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  await delay(200)
  const newTask: Task = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  }
  tasks = [newTask, ...tasks]
  return newTask
}

/**
 * Update a task (e.g. toggle completed) (dummy implementation)
 */
export async function updateTask(
  id: string,
  payload: UpdateTaskPayload
): Promise<Task> {
  await delay(150)
  const index = tasks.findIndex((t) => t.id === id)
  if (index === -1) throw new Error('Task not found')
  tasks[index] = { ...tasks[index], ...payload }
  return tasks[index]
}

/**
 * Delete a task (dummy implementation)
 */
export async function deleteTask(id: string): Promise<void> {
  await delay(150)
  tasks = tasks.filter((t) => t.id !== id)
}
