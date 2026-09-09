import { notFound } from "next/navigation";
import { ApiError, readWeb } from "@/lib/data";
import { BackLink, Media, SectionHeading, WardrobeGrid, formatDate } from "@/components/ui";
import type { FitPicDetail } from "@/types/api";

export default async function FitPicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let photo: FitPicDetail;
  try { photo = await readWeb<FitPicDetail>(`/web/v1/fit-pics/${encodeURIComponent(id)}`); }
  catch (error) { if (error instanceof ApiError && error.status === 404) notFound(); throw error; }
  return <div className="page detail-page"><BackLink href="/fit-pics">Fit pics</BackLink><section className="photo-detail"><Media src={photo.image_url} alt={photo.title} /><div className="detail-copy"><p className="eyebrow">{formatDate(photo.created_at, "long")}</p><h1>{photo.title}</h1>{photo.caption ? <p className="detail-description">{photo.caption}</p> : null}{photo.user_notes ? <blockquote>{photo.user_notes}</blockquote> : null}<p className="quiet">{photo.garment_count} tagged {photo.garment_count === 1 ? "piece" : "pieces"}{photo.favorited ? " · Favorited" : ""}</p></div></section>{photo.garments.length ? <section className="content-section"><SectionHeading title="What you wore" /><WardrobeGrid items={photo.garments} /></section> : null}</div>;
}
