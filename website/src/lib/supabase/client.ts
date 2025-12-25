import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for browser-side operations (client components)
 *
 * This client:
 * - Connects to the WRAPPED Supabase project (separate from production)
 * - Handles authentication (email OTP login)
 * - Automatically manages session cookies
 * - Used in client components ('use client')
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_WRAPPED_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_WRAPPED_SUPABASE_URL and NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY to .env.local'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
