'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Task, TaskInsert, TaskUpdate } from '@/types/database'

interface UseTasksReturn {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: (userIdentifier: string) => Promise<void>
  createTask: (task: TaskInsert) => Promise<Task | null>
  updateTask: (id: string, updates: TaskUpdate) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (userIdentifier: string) => {
    if (!userIdentifier.trim()) {
      setTasks([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_identifier', userIdentifier)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setTasks(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks'
      setError(errorMessage)
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = useCallback(async (task: TaskInsert): Promise<Task | null> => {
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: createError } = await supabase
        .from('tasks')
        .insert([task])
        .select()
        .single()

      if (createError) {
        throw createError
      }

      if (data) {
        setTasks((prev) => [data, ...prev])
        return data
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task'
      setError(errorMessage)
      console.error('Error creating task:', err)
      return null
    }
  }, [])

  const updateTask = useCallback(async (id: string, updates: TaskUpdate): Promise<Task | null> => {
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      if (data) {
        setTasks((prev) => prev.map((task) => (task.id === id ? data : task)))
        return data
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task'
      setError(errorMessage)
      console.error('Error updating task:', err)
      return null
    }
  }, [])

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setError(null)

    try {
      const supabase = getSupabaseClient()
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      setTasks((prev) => prev.filter((task) => task.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task'
      setError(errorMessage)
      console.error('Error deleting task:', err)
      return false
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}

