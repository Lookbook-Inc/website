"use server";

import { redirect } from "next/navigation";
import { isFixtureMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; success?: string };

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function withLoginSignal(path: string) {
  return `${path}${path.includes("?") ? "&" : "?"}signed_in=1`;
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  if (isFixtureMode()) redirect("/");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Those credentials didn’t work. Check them and try again." };
  redirect(withLoginSignal(safeNext(formData.get("next"))));
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };
  if (isFixtureMode()) return { success: "In production, a secure reset link will be sent to this address." };

  const supabase = await createClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://edits.lookbook.inc").replace(/\/$/, "");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
  });
  if (error) return { error: "We couldn’t send a reset link. Please try again." };
  return { success: "If that email belongs to a Lookbook account, a reset link is on its way." };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Use at least 8 characters." };
  if (isFixtureMode()) return { success: "Password updated in the production-connected app." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "This reset link may have expired. Request a new one." };
  redirect("/?message=Password+updated");
}

export async function logout() {
  if (!isFixtureMode()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/login");
}
