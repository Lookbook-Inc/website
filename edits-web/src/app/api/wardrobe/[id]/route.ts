import { serveRead } from "@/lib/api-route";
import type { WardrobeDetail } from "@/types/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return serveRead<WardrobeDetail>(`/web/v1/wardrobe/${encodeURIComponent(id)}`);
}
