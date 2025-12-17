'use client'

import { useState, useEffect } from 'react'
import { useTasks } from '@/hooks/useTasks'
import type { Task, TaskInsert } from '@/types/database'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'

interface TaskListProps {
  userIdentifier: string
  refreshKey?: number
}

interface TaskFormData {
  title: string
  description?: string | null
}

export default function TaskList({ userIdentifier, refreshKey }: TaskListProps) {
  const { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks()
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    if (userIdentifier.trim()) {
      fetchTasks(userIdentifier)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdentifier, refreshKey])

  const handleCreateTask = async (taskData: TaskFormData) => {
    await createTask({
      ...taskData,
      user_identifier: userIdentifier,
    })
  }

  const handleUpdateTask = async (id: string, updates: { title?: string; description?: string | null; completed?: boolean }) => {
    await updateTask(id, updates)
    if (editingTask?.id === id) {
      setEditingTask(null)
    }
  }

  const handleToggleTask = async (id: string, completed: boolean) => {
    await updateTask(id, { completed })
  }

  const handleDeleteTask = async (id: string) => {
    await deleteTask(id)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
  }

  const handleEditSubmit = async (taskData: TaskFormData) => {
    if (editingTask) {
      await handleUpdateTask(editingTask.id, {
        title: taskData.title,
        description: taskData.description,
      })
    }
  }

  if (!userIdentifier.trim()) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Please enter a user identifier to view tasks</p>
      </div>
    )
  }

  return (
    <div>
      {editingTask ? (
        <TaskForm
          onSubmit={handleEditSubmit}
          onCancel={handleCancelEdit}
          initialData={editingTask}
          submitLabel="Update Task"
        />
      ) : (
        <TaskForm onSubmit={handleCreateTask} />
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-500">
          <p>Loading tasks...</p>
        </div>
      )}

      {!loading && tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tasks yet. Create your first task above!</p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  )
}

