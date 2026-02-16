import { useState, useEffect, useCallback } from 'react'
import { CreateTaskForm } from '@/components/CreateTaskForm'
import { TaskList } from '@/components/TaskList'
import type { Task } from '@/types/task.types'
import { fetchTasks, createTask, updateTask } from '@/api/tasks'

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await fetchTasks()
      setTasks(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleCreateTask = async (title: string) => {
    setIsSubmitting(true)
    try {
      const newTask = await createTask({ title })
      setTasks((prev) => [newTask, ...prev])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, completed: boolean) => {
    try {
      const updated = await updateTask(id, { completed })
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      )
    } catch {
      // Revert on error 
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
            Tasks
          </h1>
          <p className="mt-1 text-surface-500 text-sm">
            Task management system
          </p>
        </header>

        <div className="space-y-6">
          <CreateTaskForm
            onSubmit={handleCreateTask}
            isSubmitting={isSubmitting}
          />
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default App
