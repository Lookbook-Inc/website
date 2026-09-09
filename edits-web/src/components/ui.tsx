import Link from "next/link";
import { Arrow } from "@/components/icons";
import type { FitPicCard, OutfitCard, WardrobeCard } from "@/types/api";

export function formatDate(value: string | null | undefined, style: "short" | "long" = "short") {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", style === "long"
    ? { month: "long", day: "numeric", year: "numeric" }
    : { month: "short", day: "numeric" },
  ).format(new Date(value));
}

export function PageHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return (
    <header className="page-heading">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy ? <p className="page-copy">{copy}</p> : null}</div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}

export function SectionHeading({ title, href, label = "View all" }: { title: string; href?: string; label?: string }) {
  return <div className="section-heading"><h2>{title}</h2>{href ? <Link href={href}>{label} <Arrow /></Link> : null}</div>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="back-link" href={href}><Arrow direction="left" /> {children}</Link>;
}

export function EmptyState({ title, copy }: { title: string; copy: string }) {
  return <div className="empty-state"><span aria-hidden="true">◇</span><h2>{title}</h2><p>{copy}</p></div>;
}

export function NextPage({ href }: { href?: string }) {
  if (!href) return null;
  return <div className="pagination"><Link className="button secondary" href={href}>Next page <span aria-hidden="true">→</span></Link></div>;
}

export function Media({ src, alt, ratio = "portrait" }: { src: string | null | undefined; alt: string; ratio?: "portrait" | "square" | "landscape" }) {
  return (
    <div className={`media ${ratio}`}>
      {/* Private signed URLs must bypass Next's shared image-optimization cache. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" /> : <div className="media-fallback" role="img" aria-label={`${alt} image unavailable`}><span>LOOKBOOK</span></div>}
    </div>
  );
}

export function WardrobeGrid({ items }: { items: WardrobeCard[] }) {
  return <div className="card-grid wardrobe-grid">{items.map((item) => (
    <Link className="item-card" href={`/wardrobe/${item.id}`} key={item.id}>
      <Media src={item.image_url} alt={item.name} />
      <div className="card-meta"><div><h3>{item.name}</h3><p>{[item.brand, item.item_type].filter(Boolean).join(" · ") || "Wardrobe item"}</p></div><span className="count-pill">{item.fit_pic_count} fits</span></div>
    </Link>
  ))}</div>;
}

export function FitPicGrid({ items, compact = false }: { items: FitPicCard[]; compact?: boolean }) {
  return <div className={`card-grid fit-grid ${compact ? "compact" : ""}`}>{items.map((item) => (
    <Link className="item-card" href={`/fit-pics/${item.id}`} key={item.id}>
      <Media src={item.image_url} alt={item.title} />
      <div className="card-meta"><div><h3>{item.title}</h3><p>{formatDate(item.created_at)} · {item.garment_count} pieces</p></div></div>
    </Link>
  ))}</div>;
}

export function OutfitGrid({ items }: { items: OutfitCard[] }) {
  return <div className="card-grid outfit-grid">{items.map((item) => (
    <Link className="item-card" href={`/outfits/${item.id}`} key={item.id}>
      <Media src={item.cover_url} alt={item.name} ratio="square" />
      <div className="card-meta"><div><h3>{item.name}</h3><p>{item.source === "RECOMMENDATIONS" ? "Saved recommendation" : formatDate(item.created_at)}</p></div></div>
    </Link>
  ))}</div>;
}
