import { EmptyState, FitPicGrid, NextPage, PageHeading } from "@/components/ui";
import { readWeb } from "@/lib/data";
import type { CursorPage, FitPicCard } from "@/types/api";

export default async function FitPicsPage({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  const { cursor } = await searchParams;
  const data = await readWeb<CursorPage<FitPicCard>>(`/web/v1/fit-pics${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
  return <div className="page"><PageHeading eyebrow="The record" title="Fit pics" copy="A visual history of getting dressed." />{data.items.length ? <FitPicGrid items={data.items} /> : <EmptyState title="No fit pics yet" copy="Photos you add in Lookbook will gather here." />}<NextPage href={data.next_cursor ? `/fit-pics?cursor=${encodeURIComponent(data.next_cursor)}` : undefined} /></div>;
}
