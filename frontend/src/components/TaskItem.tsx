import type { Task } from '@/types/task.types'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const handleChange = () => {
    onToggle(task.id, !task.completed)
  }

  return (
    <label
      className={`
        flex items-center gap-3 rounded-xl border border-surface-200 bg-white px-4 py-3.5
        transition-all duration-200
        hover:shadow-cardHover hover:border-surface-200/80
        cursor-pointer
        ${task.completed ? 'opacity-75' : ''}
      `}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={handleChange}
        className="h-5 w-5 rounded border-surface-200 text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
        aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'completed'}`}
      />
      <span
        className={`
          flex-1 text-left font-medium text-surface-900
          ${task.completed ? 'line-through text-surface-500' : ''}
        `}
      >
        {task.title}
      </span>
    </label>
  )
}
