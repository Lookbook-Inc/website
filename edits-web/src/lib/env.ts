export function isFixtureMode() {
  return process.env.EDITS_DATA_MODE === "fixture" && process.env.VERCEL_ENV !== "production";
}

export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing production Lookbook Supabase configuration");
  }
  return { url, key };
}

export function backendUrl() {
  const value = process.env.LOOKBOOK_BACKEND_URL;
  if (!value) throw new Error("Missing server-only LOOKBOOK_BACKEND_URL");
  return value.replace(/\/$/, "");
}

export function isAllowedUser(userId: string) {
  if (process.env.EDITS_ENFORCE_ALLOWLIST !== "true") return true;
  const allowed = new Set(
    (process.env.EDITS_ALLOWED_USER_IDS ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
  return allowed.has(userId);
}
