import { EmptyState, NextPage, OutfitGrid, PageHeading } from "@/components/ui";
import { readWeb } from "@/lib/data";
import type { FolderList, OutfitPage } from "@/types/api";

type Params = { cursor?: string; folder_id?: string };

export default async function OutfitsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.folder_id) query.set("folder_id", params.folder_id);
  const [data, folders] = await Promise.all([
    readWeb<OutfitPage>(`/web/v1/outfits${query.size ? `?${query}` : ""}`),
    readWeb<FolderList>("/web/v1/outfit-folders"),
  ]);
  const next = new URLSearchParams();
  if (data.next_cursor) next.set("cursor", data.next_cursor);
  if (params.folder_id) next.set("folder_id", params.folder_id);
  return <div className="page"><PageHeading eyebrow="Saved combinations" title="Outfits" copy="Your assembled looks—including recommendations you’ve saved." />
    <form className="filter-bar folder-filter" method="get"><label><span>Folder</span><select name="folder_id" defaultValue={params.folder_id ?? ""}><option value="">All outfits</option>{folders.items.map((folder) => <option key={folder.id} value={folder.id}>{folder.parent_folder_id ? "↳ " : ""}{folder.name} ({folder.combo_count})</option>)}</select></label><button className="button secondary">Apply</button></form>
    {data.items.length ? <OutfitGrid items={data.items} /> : <EmptyState title="No outfits here" copy="Try another folder, or save combinations in the Lookbook app." />}<NextPage href={data.next_cursor ? `/outfits?${next}` : undefined} /></div>;
}
