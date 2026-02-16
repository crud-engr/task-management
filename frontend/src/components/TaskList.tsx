import type { Task } from '@/types/task.types'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string, completed: boolean) => void
  isLoading?: boolean
}

export function TaskList({ tasks, onToggle, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl border border-surface-200 bg-white animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-surface-200 bg-surface-50/50 py-12 text-center text-surface-500">
        <p className="font-medium">No tasks yet</p>
        <p className="mt-1 text-sm">Add one above to get started.</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2" role="list">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} onToggle={onToggle} />
        </li>
      ))}
    </ul>
  )
}
