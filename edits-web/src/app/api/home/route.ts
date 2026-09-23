import { serveRead } from "@/lib/api-route";
import type { Home } from "@/types/api";

export async function GET() {
  return serveRead<Home>("/web/v1/home");
}
