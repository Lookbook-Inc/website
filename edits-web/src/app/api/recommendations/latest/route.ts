import { serveRead } from "@/lib/api-route";
import type { Recommendations } from "@/types/api";

export async function GET() {
  return serveRead<Recommendations>("/web/v1/recommendations/latest");
}
