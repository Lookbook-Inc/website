import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for the main Lookbook project.
 *
 * Used for non-auth operations (e.g., waitlist signups) that don't
 * require cookie-based session management.
 */
export function createWaitlistClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_WAITLIST_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_WAITLIST_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_WAITLIST_SUPABASE_URL and NEXT_PUBLIC_WAITLIST_SUPABASE_ANON_KEY to .env.local'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
