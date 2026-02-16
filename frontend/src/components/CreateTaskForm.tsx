import { useState, FormEvent } from 'react'

interface CreateTaskFormProps {
  onSubmit: (title: string) => void
  isSubmitting?: boolean
}

export function CreateTaskForm({ onSubmit, isSubmitting = false }: CreateTaskFormProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || isSubmitting) return
    onSubmit(trimmed)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          className="
            flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3.5
            text-surface-900 placeholder:text-surface-400
            focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
            transition-shadow duration-200
          "
          aria-label="New task title"
        />
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="
            rounded-xl bg-accent px-5 py-3.5 font-semibold text-white
            hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
          "
        >
          {isSubmitting ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  )
}
