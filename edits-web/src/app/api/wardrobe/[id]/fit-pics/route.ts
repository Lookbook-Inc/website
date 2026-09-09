import type { NextRequest } from "next/server";
import { allowedQuery, serveRead } from "@/lib/api-route";
import type { CursorPage, FitPicCard } from "@/types/api";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const query = allowedQuery(request.nextUrl.searchParams, ["cursor", "limit"]);
  return serveRead<CursorPage<FitPicCard>>(`/web/v1/wardrobe/${encodeURIComponent(id)}/fit-pics${query}`);
}
