import { serveRead } from "@/lib/api-route";
import type { FolderList } from "@/types/api";

export async function GET() {
  return serveRead<FolderList>("/web/v1/outfit-folders");
}
