import { notFound } from "next/navigation";
import { ApiError, readWeb } from "@/lib/data";
import { BackLink, Media, SectionHeading, formatDate } from "@/components/ui";
import type { OutfitDetail } from "@/types/api";

export default async function OutfitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let outfit: OutfitDetail;
  try { outfit = await readWeb<OutfitDetail>(`/web/v1/outfits/${encodeURIComponent(id)}`); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  const hero = outfit.viton_images[0]?.image_url ?? outfit.cover_url;
  return <div className="page detail-page"><BackLink href="/outfits">Outfits</BackLink><section className="detail-hero outfit-detail"><Media src={hero} alt={outfit.name} ratio="square" /><div className="detail-copy"><p className="eyebrow">{outfit.source === "RECOMMENDATIONS" ? "Saved recommendation" : "Saved outfit"}</p><h1>{outfit.name}</h1>{outfit.description ? <p className="detail-description">{outfit.description}</p> : null}<p className="quiet">Created {formatDate(outfit.created_at, "long")}</p></div></section>
    <section className="content-section"><SectionHeading title="Pieces in this outfit" /><div className="garment-strip">{outfit.items.map((item, index) => <div className="garment-summary" key={item.id ?? item.clothing_item_id ?? index}><Media src={item.image_url} alt={item.name ?? "Wardrobe item"} ratio="square" /><h3>{item.name ?? "Wardrobe item"}</h3><p>{[item.brand, item.item_type].filter(Boolean).join(" · ")}</p></div>)}</div></section>
  </div>;
}
