"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function PrivacyPanel() {
  return (
    <section className="h-screen w-full snap-start snap-always p-2 md:p-4">
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-100 flex flex-col items-center justify-center text-center px-6">
        <Image
          src="/images/dark-paper-texture.avif"
          alt="Paper texture"
          fill
          className="object-cover opacity-5 mix-blend-multiply"
        />
        
        <div className="relative z-10 max-w-4xl space-y-12">
          <div className="space-y-4">
            <div className="text-xs md:text-sm font-mono text-zinc-500 uppercase tracking-[0.3em]">
              Security & Privacy
            </div>
            <h2 className="text-5xl md:text-8xl font-display text-zinc-900 leading-none">
              YOUR DATA IS <br /> YOUR OWN.
            </h2>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-8">
            <p className="text-sm md:text-md font-mono text-zinc-600 leading-relaxed">
              We do not sell your information to anyone. We use your data only to provide the services you interact with (e.g. Lookbook or Wrapped). You can request deletion of your account and data with us at any time. For abuse prevention, our service providers may retain usage logs for no more than 60 days, which is industry standard. We&apos;re working to bring this number down to zero.
            </p>
            
            <p className="text-sm md:text-md font-mono text-zinc-600 leading-relaxed">
              For the above, or if you have any other comments, shoot us an email at <a href="mailto:hq@lookbook.inc" className="text-zinc-900 underline underline-offset-4 hover:text-zinc-600 transition-colors">hq@lookbook.inc</a>. We&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
