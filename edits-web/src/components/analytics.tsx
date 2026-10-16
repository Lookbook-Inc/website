"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function cleanPath(path: string) {
  return path.replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ":id");
}

export function Analytics({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
      capture_pageview: false,
      capture_pageleave: false,
      autocapture: false,
      disable_session_recording: true,
      person_profiles: "identified_only",
    });
  }, []);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const section = cleanPath(pathname);
    posthog.capture("section viewed", { section });
    if (pathname === "/") posthog.capture("dashboard loaded");
    if (section.includes(":id")) posthog.capture("detail opened", { section: section.split("/")[1] });
    const url = new URL(window.location.href);
    if (url.searchParams.get("signed_in") === "1") {
      posthog.capture("login succeeded");
      url.searchParams.delete("signed_in");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [pathname]);
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return <>{children}</>;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
