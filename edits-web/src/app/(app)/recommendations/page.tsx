import { EmptyState, OutfitGrid, PageHeading, formatDate } from "@/components/ui";
import { readWeb } from "@/lib/data";
import type { Recommendations } from "@/types/api";

export default async function RecommendationsPage() {
  const data = await readWeb<Recommendations>("/web/v1/recommendations/latest");
  const count = data.members.reduce((total, member) => total + member.combos.length, 0);
  return <div className="page"><PageHeading eyebrow="A fresh perspective" title="The latest edit" copy={data.generated_at ? `Generated ${formatDate(data.generated_at, "long")}. Browsing here won’t mark it as viewed.` : "When your next set is ready, it will appear here."} />
    {count ? <div className="recommendation-groups">{data.members.map((member, index) => <section className="content-section" key={member.folder_id ?? index}><div className="recommendation-title"><span>{String(index + 1).padStart(2, "0")}</span><h2>{member.folder_name ?? "For you"}</h2></div><OutfitGrid items={member.combos} /></section>)}</div> : <EmptyState title="Nothing new just yet" copy="Your most recent recommendation set will appear here automatically." />}
  </div>;
}
