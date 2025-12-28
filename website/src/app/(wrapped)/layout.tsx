'use client'

import { PHProvider } from "@/providers/posthog-provider"
import { PostHogPageView } from "@/providers/posthog-pageview"

export default function WrappedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PHProvider>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
