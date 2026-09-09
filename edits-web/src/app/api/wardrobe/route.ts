import type { NextRequest } from "next/server";
import { allowedQuery, serveRead } from "@/lib/api-route";
import type { WardrobePage } from "@/types/api";

export async function GET(request: NextRequest) {
  const query = allowedQuery(request.nextUrl.searchParams, ["cursor", "limit", "query", "item_type"]);
  return serveRead<WardrobePage>(`/web/v1/wardrobe${query}`);
}
