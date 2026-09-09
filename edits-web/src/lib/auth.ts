import "server-only";

import { redirect } from "next/navigation";
import { isAllowedUser, isFixtureMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type Viewer = { id: string; email: string | null; accessToken: string };

export async function getViewer(): Promise<Viewer | null> {
  if (isFixtureMode()) {
    return { id: "fixture-user", email: "preview@lookbook.inc", accessToken: "fixture" };
  }
  const supabase = await createClient();
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user || !session?.access_token) return null;
  return { id: user.id, email: user.email ?? null, accessToken: session.access_token };
}

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?message=Your+session+expired.+Please+sign+in+again.");
  if (!isAllowedUser(viewer.id)) redirect("/access-pending");
  return viewer;
}
