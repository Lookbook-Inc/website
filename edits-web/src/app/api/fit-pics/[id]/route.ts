import { serveRead } from "@/lib/api-route";
import type { FitPicDetail } from "@/types/api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return serveRead<FitPicDetail>(`/web/v1/fit-pics/${encodeURIComponent(id)}`);
}
