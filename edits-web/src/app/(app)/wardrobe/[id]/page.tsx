import { notFound } from "next/navigation";
import { ApiError, readWeb } from "@/lib/data";
import { BackLink, EmptyState, FitPicGrid, Media, SectionHeading } from "@/components/ui";
import type { FitPicCard, CursorPage, WardrobeDetail } from "@/types/api";

export default async function WardrobeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: WardrobeDetail;
  try { item = await readWeb<WardrobeDetail>(`/web/v1/wardrobe/${encodeURIComponent(id)}`); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const fitPics = await readWeb<CursorPage<FitPicCard>>(`/web/v1/wardrobe/${encodeURIComponent(id)}/fit-pics?limit=12`);
  return (
    <div className="page detail-page">
      <BackLink href="/wardrobe">Wardrobe</BackLink>
      <section className="detail-hero">
        <Media src={item.image_url} alt={item.name} ratio="square" />
        <div className="detail-copy"><p className="eyebrow">{item.item_type ?? "Wardrobe item"}</p><h1>{item.name}</h1>{item.brand ? <p className="detail-brand">{item.brand}</p> : null}{item.caption ? <p className="detail-description">{item.caption}</p> : null}
          <dl className="detail-list">{item.material ? <><dt>Material</dt><dd>{item.material}</dd></> : null}{item.details ? <><dt>Details</dt><dd>{item.details}</dd></> : null}<dt>Seen in</dt><dd>{item.fit_pic_count} fit pics</dd></dl>
          {item.shades.length ? <div className="swatches" aria-label="Item colors">{item.shades.map((shade, index) => <span key={index}><i style={{ backgroundColor: shade.hex_code ?? "#ddd" }} />{shade.name ?? shade.color_group ?? "Color"}</span>)}</div> : null}
        </div>
      </section>
      <section className="content-section"><SectionHeading title="Worn with this piece" />{fitPics.items.length ? <FitPicGrid items={fitPics.items} /> : <EmptyState title="No fit pics yet" copy="Fit pics tagged with this piece will appear here." />}</section>
    </div>
  );
}
