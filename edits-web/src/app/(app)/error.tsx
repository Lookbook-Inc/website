"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) posthog.capture("sanitized page error");
  }, []);
  return <div className="error-state"><p className="eyebrow">A brief pause</p><h1>We couldn’t load this page.</h1><p>Your wardrobe is safe. Try the request again.</p><button className="button primary" onClick={reset}>Try again</button></div>;
}
