import Link from "next/link";
import { FitPicGrid, OutfitGrid, PageHeading, SectionHeading } from "@/components/ui";
import { readWeb } from "@/lib/data";
import type { Home } from "@/types/api";

export default async function HomePage() {
  const data = await readWeb<Home>("/web/v1/home");
  const recommendations = data.recommendations.members.flatMap((member) => member.combos).slice(0, 3);
  return (
    <div className="page">
      <PageHeading eyebrow="Your Lookbook" title={data.first_name ? `Good to see you, ${data.first_name}.` : "Good to see you."} copy="A clear view of what you own, what you wore, and the ideas waiting for you." />
      <section className="stat-grid" aria-label="Wardrobe summary">
        <Link href="/wardrobe" className="stat-card"><span>Wardrobe</span><strong>{data.wardrobe_count}</strong><small>owned pieces</small></Link>
        <Link href="/outfits" className="stat-card dark"><span>Outfits</span><strong>{data.outfit_count}</strong><small>saved combinations</small></Link>
        <Link href="/recommendations" className="stat-card editorial"><span>Latest edit</span><strong>{recommendations.length ? "Ready" : "—"}</strong><small>{data.recommendations.generated_at ? "fresh recommendations" : "nothing new yet"}</small></Link>
      </section>
      <section className="content-section">
        <SectionHeading title="Recently worn" href="/fit-pics" />
        {data.recent_fit_pics.length ? <FitPicGrid items={data.recent_fit_pics} compact /> : <p className="inline-empty">Your latest fit pics will appear here.</p>}
      </section>
      <section className="content-section recommendation-preview">
        <SectionHeading title="The latest edit" href="/recommendations" label="See the full edit" />
        {recommendations.length ? <OutfitGrid items={recommendations} /> : <p className="inline-empty">Your next recommendation set hasn’t been generated yet.</p>}
      </section>
    </div>
  );
}
