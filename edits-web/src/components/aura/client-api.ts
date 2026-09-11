"use client";

/**
 * Browser-side reads. Every one of these goes through this app's own `/api/*`
 * GET route handlers, which forward the viewer's token to FastAPI server-side.
 * The browser never talks to Supabase or FastAPI for wardrobe data directly.
 */

export class ClientApiError extends Error {}

export async function readApi<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ClientApiError(body?.error ?? "We couldn’t load that from Lookbook.");
  }
  return response.json() as Promise<T>;
}

export function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const suffix = search.toString();
  return suffix ? `?${suffix}` : "";
}
