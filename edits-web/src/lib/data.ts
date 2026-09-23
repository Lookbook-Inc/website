import "server-only";

import { redirect } from "next/navigation";
import { backendUrl, isAllowedUser, isFixtureMode } from "@/lib/env";
import { fixtureForPath } from "@/lib/fixtures";
import { getViewer, requireViewer } from "@/lib/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function sanitizedMessage(status: number) {
  if (status === 404) return "That item could not be found.";
  if (status >= 500) return "Lookbook is having trouble loading this right now.";
  return "We couldn’t load this page.";
}

async function request<T>(path: string, accessToken: string): Promise<T> {
  if (isFixtureMode()) return fixtureForPath<T>(path);
  const response = await fetch(`${backendUrl()}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new ApiError(response.status, sanitizedMessage(response.status));
  return response.json() as Promise<T>;
}

export async function readWeb<T>(path: string): Promise<T> {
  const viewer = await requireViewer();
  try {
    return await request<T>(path, viewer.accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?message=Your+session+expired.+Please+sign+in+again.");
    }
    throw error;
  }
}

export async function readWebForApi<T>(path: string): Promise<T> {
  const viewer = await getViewer();
  if (!viewer) throw new ApiError(401, "Authentication required");
  if (!isAllowedUser(viewer.id)) throw new ApiError(403, "Edits access is not enabled for this account");
  return request<T>(path, viewer.accessToken);
}
