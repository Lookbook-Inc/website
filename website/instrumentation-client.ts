// instrumentation-client.ts
import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2025-11-30'
});

// every time the app loads (like a refresh) it will send this event to posthog
posthog.capture('my event', { property: 'value' })
