import { serveRead } from "@/lib/api-route";
import type { SongListResponse } from "@/types/api";

export async function GET() {
  return serveRead<SongListResponse>("/web/v1/banks/songs");
}
