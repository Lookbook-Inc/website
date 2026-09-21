import { serveRead } from "@/lib/api-route";
import type { EditLineListResponse } from "@/types/api";

export async function GET() {
  return serveRead<EditLineListResponse>("/web/v1/banks/edits-lines");
}
