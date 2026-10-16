import type { NextRequest } from "next/server";
import { allowedQuery, serveRead } from "@/lib/api-route";
import type { CursorPage, FitPicCard } from "@/types/api";

export async function GET(request: NextRequest) {
  const query = allowedQuery(request.nextUrl.searchParams, ["cursor", "limit"]);
  return serveRead<CursorPage<FitPicCard>>(`/web/v1/fit-pics${query}`);
}
