import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_identifier, title, description, completed } = body

    // Validate input
    if (!user_identifier || typeof user_identifier !== 'string') {
      return NextResponse.json(
        { error: 'User identifier is required' },
        { status: 400 }
      )
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    // Create Supabase client
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

    // Insert task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_identifier,
        title: title.trim(),
        description: description || null,
        completed: completed || false,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, task: data }, { status: 201 })
  } catch (error) {
    console.error('Task creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

