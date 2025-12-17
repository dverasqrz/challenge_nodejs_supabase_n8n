import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Browser client for client-side operations
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Lazy initialization for use in client components
export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient()
  }
  return supabaseInstance
}

// For backward compatibility, but will throw if env vars are missing
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null as any

