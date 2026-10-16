import "server-only";

import { NextResponse } from "next/server";
import { ApiError, readWebForApi } from "@/lib/data";

const headers = { "Cache-Control": "private, no-store" };

export async function serveRead<T>(path: string) {
  try {
    const data = await readWebForApi<T>(path);
    return NextResponse.json(data, { headers });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof ApiError ? error.message : "Unable to load Lookbook data";
    return NextResponse.json({ error: message }, { status, headers });
  }
}

export function allowedQuery(searchParams: URLSearchParams, names: string[]) {
  const query = new URLSearchParams();
  for (const name of names) {
    const value = searchParams.get(name);
    if (value) query.set(name, value);
  }
  const suffix = query.toString();
  return suffix ? `?${suffix}` : "";
}
