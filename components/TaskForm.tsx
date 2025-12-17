'use client'

import { useState, useEffect } from 'react'
import type { Task } from '@/types/database'

interface TaskFormData {
  title: string
  description?: string | null
}

interface TaskFormProps {
  onSubmit: (task: TaskFormData) => Promise<void>
  onCancel?: () => void
  initialData?: Task | null
  submitLabel?: string
}

export default function TaskForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  submitLabel = 'Add Task' 
}: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setDescription(initialData.description || '')
    } else {
      setTitle('')
      setDescription('')
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
      })
      if (!initialData) {
        setTitle('')
        setDescription('')
      }
    } catch (error) {
      console.error('Error submitting task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

