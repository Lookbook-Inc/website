'use client'

import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'

interface UserIdentification {
  userId?: string
  email?: string
  name?: string
  city?: string
}

/**
 * Hook to identify users in PostHog with their profile data
 * Call this after user authentication or when profile data is available
 */
export function usePostHogIdentify({ userId, email, name, city }: UserIdentification) {
  const posthog = usePostHog()

  useEffect(() => {
    if (posthog && userId) {
      // Identify the user with PostHog
      posthog.identify(userId, {
        email: email || undefined,
        name: name || undefined,
        city: city || undefined,
      })
    }
  }, [posthog, userId, email, name, city])
}
