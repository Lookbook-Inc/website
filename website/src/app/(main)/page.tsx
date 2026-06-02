import { HeroPanel } from "./_components/HeroPanel";
import { EditorialPanel } from "./_components/EditorialPanel";
import { DemoPanel } from "./_components/DemoPanel";
import { DownloadPanelNoir } from "./_components/DownloadPanelNoir";
import { SocialPanel } from "./_components/SocialPanel";

export default function Home() {
  return (
    <main className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      <HeroPanel />

      <div className="flex flex-col md:flex-row md:h-screen md:snap-start md:snap-always p-0 md:p-4 gap-0 md:gap-4">
        <EditorialPanel />
        <DemoPanel />
      </div>

      <DownloadPanelNoir />
      <SocialPanel />
    </main>
  );
}
