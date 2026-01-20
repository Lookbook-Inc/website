import { Metadata } from "next";
import { AboutHeroPanel } from "./_components/AboutHeroPanel";
import { FounderPanel } from "./_components/FounderPanel";
import { PrivacyPanel } from "./_components/PrivacyPanel";

export const metadata: Metadata = {
  title: "About Us - Lookbook",
  description: "Meet the team behind Lookbook and learn about our mission.",
};

export default function About() {
  return (
    <main className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth">
      <AboutHeroPanel />
      
      <div className="flex flex-col md:flex-row md:h-screen md:snap-start md:snap-always p-0 md:p-4 gap-0 md:gap-4">
        <FounderPanel 
          name="Max Hui"
          education="Harvey Mudd College &apos;23"
          bio={[
            <div key="fluid-bio" className="font-sans md:text-right space-y-3 text-xs md:text-sm">
              <p>My greatest loves in life: acai, music, and cars (or anything that goes vroom, really).</p>
              <p>My background is a bit of a mix, from building ML research pipelines to pitching <a href="https://www.linkedin.com/in/mmax-hui/details/honors/" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-200 transition-colors">concept cars</a> to BMW and <a href="https://uspto.report/patent/app/20200124442" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-200 transition-colors">patenting</a> a future pilot&apos;s cockpit.</p>
              <p>I love putting together playlists that capture a specific vibe—lately, I&apos;ve been into indie- and jazz-pop, and I&apos;m currently obsessed with Wasia Project.</p>
              <p>At Lookbook, I do some design, some experimental R&D, and the outward-facing stuff like networking (ew, I know).</p>
            </div>,
            <div key="aesthetics" className="space-y-1 font-mono pt-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Outfit Aesthetics</span>
              <div className="text-zinc-300 space-y-1">
                <p>#basic-casual</p>
                <p>#preppy</p>
                <p>#vintage</p>
              </div>
            </div>
          ]}
          portrait="/images/team/max/max-1.jpeg"
          socials={{
            linkedin: "https://www.linkedin.com/in/mmax-hui/"
          }}
        />
        <FounderPanel 
          name="Avery Chen"
          education="Pomona College &apos;24"
          reverse
          bio={[
            <div key="fluid-bio" className="font-sans md:text-left space-y-3 text-xs md:text-sm">
              <p>I&apos;m deeply into music production and songwriting, but you&apos;ll also find me playing basketball, studying philosophy, or getting lost in indie games.</p>
              <p>I&apos;ve worked as a full-stack engineer in both big tech and startups, and I also played golf in college, ranking in the top 150 of Divison III nationally.</p>
              <p>At Lookbook, I handle our product design and lead the end-to-end technical implementation, along with steering our strategy and operations.</p>
            </div>,
            <div key="aesthetics" className="space-y-1 font-mono pt-4">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Outfit Aesthetics</span>
              <div className="text-zinc-300 space-y-1">
                <p>#minimalist</p>
                <p>#basic-casual</p>
                <p>#vintage</p>
              </div>
            </div>
          ]}
          portrait="/images/team/avery/avery-1.JPG"
          socials={{
            linkedin: "https://linkedin.com/in/averyychen",
            github: "https://github.com/averyc88"
          }}
        />
      </div>

      <PrivacyPanel />
    </main>
  );
}
