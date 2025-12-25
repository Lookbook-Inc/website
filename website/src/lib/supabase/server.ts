import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for server-side operations (server components, API routes)
 *
 * This client:
 * - Connects to the WRAPPED Supabase project
 * - Reads/writes session cookies for authentication
 * - Used in server components, route handlers, and server actions
 * - Properly handles Next.js 15 async cookies API
 */
export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_WRAPPED_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please add NEXT_PUBLIC_WRAPPED_SUPABASE_URL and NEXT_PUBLIC_WRAPPED_SUPABASE_ANON_KEY to .env.local'
    )
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  })
}
