import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Standards - Lookbook",
  description: "How sharing, moderation, reports, and blocking work in Lookbook Friends.",
};

export default function CommunityStandards() {
  return (
    <main className="min-h-screen w-full p-2 md:p-4">
      <section className="relative min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] rounded-[2.5rem] md:rounded-[3.5rem] bg-[#f5f2ee] px-6 py-24 md:py-28">
        <Link href="/" aria-label="Lookbook home" className="absolute top-7 left-7 md:top-10 md:left-10">
          <Image src="/LB-logo-dark.svg" alt="Lookbook" width={44} height={44} />
        </Link>
        <article className="mx-auto max-w-3xl bg-white/50 border border-white/60 shadow-2xl rounded-[2.5rem] p-10 md:p-16">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-500">Effective August 11, 2026</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-display text-black/80">Community Standards</h1>
          <div className="mt-10 space-y-8 font-mono text-sm md:text-base font-thin leading-relaxed text-black/75">
            <section>
              <h2 className="font-display text-2xl text-black/80">Share thoughtfully</h2>
              <p className="mt-2">Friends posts are image-only and visible to you and accepted friends. Share only images you have the right to share. Do not post sexual content, exploitation, harassment, hateful or violent material, impersonation, spam, or content that puts someone at risk.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-black/80">Safety checks</h2>
              <p className="mt-2">Every Friends image is checked before publication. If a check flags an image or is unavailable, the image stays private. Automated checks are imperfect and do not replace member reports or human review.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-black/80">Reports</h2>
              <p className="mt-2">You can report a member from their profile, with the originating post attached when relevant. Reports go to our safety queue and team; our review target is 24 hours. We may remove content or restrict accounts when needed.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-black/80">Blocking</h2>
              <p className="mt-2">Blocking immediately removes the relationship and hides both people from each other&apos;s search, profiles, and feeds. Unblocking does not restore the friendship.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-black/80">Contact</h2>
              <p className="mt-2">For safety questions or urgent concerns, email <a className="underline" href="mailto:hq@lookbook.inc">hq@lookbook.inc</a>. If someone is in immediate danger, contact local emergency services.</p>
            </section>
          </div>
        </article>
      </section>
    </main>
  );
}
