import type { NextRequest } from "next/server";
import { allowedQuery, serveRead } from "@/lib/api-route";
import type { OutfitPage } from "@/types/api";

export async function GET(request: NextRequest) {
  const query = allowedQuery(request.nextUrl.searchParams, ["cursor", "limit", "folder_id"]);
  return serveRead<OutfitPage>(`/web/v1/outfits${query}`);
}
