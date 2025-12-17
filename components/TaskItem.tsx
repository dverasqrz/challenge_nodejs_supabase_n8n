'use client'

import { useState } from 'react'
import type { Task } from '@/types/database'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (id: string) => Promise<void>
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      await onToggle(task.id, !task.completed)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }
    setIsDeleting(true)
    try {
      await onDelete(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className={`p-4 bg-white rounded-lg shadow-sm border ${
      task.completed ? 'border-gray-200 bg-gray-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggle}
          disabled={isToggling}
          className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50"
        />
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-medium ${
            task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}>
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-400">
            Created: {new Date(task.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(task)}
            disabled={isDeleting || isToggling}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || isToggling}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

