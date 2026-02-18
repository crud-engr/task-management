import { useState, useEffect, useCallback } from 'react'
import { CreateTaskForm } from '@/components/CreateTaskForm'
import { TaskList } from '@/components/TaskList'
import { AdminExportSection } from '@/components/AdminExportSection'
import { DevLogin } from '@/components/DevLogin'
import { LoginPage } from '@/components/LoginPage'
import { LoadingScreen } from '@/components/LoadingScreen'
import { AuthProvider, useAuth } from '@/contexts'
import type { Task } from '@/types/task.types'
import { fetchTasks, createTask, updateTask } from '@/api/tasks'

function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()

  const loadTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchTasks()
      setTasks(data)
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleCreateTask = async (title: string) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const newTask = await createTask({ title })
      setTasks((prev) => [newTask, ...prev])
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (id: string, completed: boolean) => {
    setError(null)
    try {
      const updated = await updateTask(id, { completed })
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      )
    } catch (err) {
      setError((err as { message?: string })?.message ?? 'Failed to update task')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-lg">
        <DevLogin />
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-surface-900 tracking-tight">
            Tasks
          </h1>
          <p className="mt-1 text-surface-500 text-sm">
            Task management system
          </p>
        </header>

        <div className="space-y-6">
          {isAdmin && (
            <AdminExportSection />
          )}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
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

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }
  if (!user) {
    return <LoginPage />
  }
  return <TaskManagement />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
