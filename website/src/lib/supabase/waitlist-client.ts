import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for waitlist/intake operations.
 *
 * Uses the Wrapped project — same as the rest of the site.
 * Plain supabase-js (no SSR cookie management) is intentional:
 * waitlist inserts are anonymous and don't require session handling.
 */
export function createWaitlistClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_WRAPPED_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_WRAPPED_SUPABASE_URL and NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY to .env.local'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
