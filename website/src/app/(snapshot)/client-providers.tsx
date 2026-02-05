'use client'

import { Suspense } from "react"
import { PHProvider } from "@/providers/posthog-provider"
import { PostHogPageView } from "@/providers/posthog-pageview"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
