import { EmptyState, NextPage, PageHeading, WardrobeGrid } from "@/components/ui";
import { readWeb } from "@/lib/data";
import type { WardrobePage } from "@/types/api";

type Params = { cursor?: string; query?: string; item_type?: string };

function pathFor(params: Params) {
  const query = new URLSearchParams();
  if (params.cursor) query.set("cursor", params.cursor);
  if (params.query) query.set("query", params.query);
  if (params.item_type) query.set("item_type", params.item_type);
  return `/web/v1/wardrobe${query.size ? `?${query}` : ""}`;
}

export default async function WardrobePageView({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const data = await readWeb<WardrobePage>(pathFor(params));
  const nextQuery = new URLSearchParams();
  if (data.next_cursor) nextQuery.set("cursor", data.next_cursor);
  if (params.query) nextQuery.set("query", params.query);
  if (params.item_type) nextQuery.set("item_type", params.item_type);

  return (
    <div className="page">
      <PageHeading eyebrow="The collection" title="Wardrobe" copy="Every piece you own, newest additions first." />
      <form className="filter-bar" method="get" role="search">
        <label className="search-field"><span className="sr-only">Search by name or brand</span><input name="query" defaultValue={params.query} placeholder="Search name or brand" /><span aria-hidden="true">⌕</span></label>
        <label><span className="sr-only">Filter by garment type</span><select name="item_type" defaultValue={params.item_type ?? ""}><option value="">All garment types</option>{data.available_item_types.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
        <button className="button secondary">Apply</button>
      </form>
      {data.items.length ? <WardrobeGrid items={data.items} /> : <EmptyState title="No pieces found" copy="Try a different search or garment type." />}
      <NextPage href={data.next_cursor ? `/wardrobe?${nextQuery}` : undefined} />
    </div>
  );
}
