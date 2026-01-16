import { HeroPanel } from "./_components/HeroPanel";
import { PitchPanel } from "./_components/PitchPanel";
import { DemoPanel } from "./_components/DemoPanel";
import { BetaPanel } from "./_components/BetaPanel";
import { SocialPanel } from "./_components/SocialPanel";

export default function Home() {
  return (
    <main className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      <HeroPanel />
      <PitchPanel />
      <DemoPanel />
      <BetaPanel />
      <SocialPanel />
    </main>
  );
}
