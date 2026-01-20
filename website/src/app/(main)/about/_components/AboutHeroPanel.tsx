"use client";

import Image from "next/image";
import Link from "next/link";

export function AboutHeroPanel() {
  return (
    <section className="h-screen w-full snap-start snap-always p-2 md:p-4">
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center text-center px-6">
        {/* Static Background */}
        <div className="absolute inset-0 z-0 bg-zinc-100">
          {/* Base Layer: Neutral, Subtle Warm-tinted */}
          <div className="absolute inset-0 opacity-60">
            <Image
              src="/images/team/together.JPEG"
              alt="The Team Background"
              fill
              className="object-cover grayscale-[0.1] brightness-90 sepia-[0.05] contrast-[0.95]"
              priority
              unoptimized
            />
          </div>

          {/* Center Focus Layer: Full Color, Natural */}
          <div 
            className="absolute inset-0"
            style={{
              maskImage: 'radial-gradient(circle at center, black 0%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 90%)',
            }}
          >
            <Image
              src="/images/team/together.JPEG"
              alt="The Team Center"
              fill
              className="object-cover saturate-[1.2] brightness-150"
              priority
              unoptimized
            />
          </div>
          
          {/* Subtle neutral vignette for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/20 via-transparent to-zinc-950/10" />
        </div>

        {/* Navigation Links */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-6 md:top-10 left-6 md:left-10 pointer-events-auto">
            <Link 
              href="/" 
              className="text-zinc-500 hover:text-black font-mono text-xs md:text-sm tracking-[0.2em] uppercase transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
        
        <div className="relative z-10 max-w-4xl w-full px-4">
          <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/40 p-12 md:p-20 shadow-2xl overflow-hidden">
            {/* Subtle inner glow for the glass */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            
            <h1 className="relative text-6xl md:text-[8cqw] font-display text-black/80 mb-6 leading-none">
              ABOUT
            </h1>
            
            <div className="relative space-y-6">
              <p className="text-xl md:text-xl font-mono font-thin text-black max-w-3xl mx-auto leading-relaxed">
                We&apos;re best friends who met in college <a href="https://open.spotify.com/artist/0jXr3CLA2HMJ3E7rVoPqGY?si=uT3OY6ReSnK_yn_Bt6fPGg" target="_blank" rel="noopener noreferrer" className="underline hover:text-black transition-colors">a cappella</a>, trying to solve the fashion problems that we &mdash; and maybe you &mdash; share.
              </p>
              <p className="text-sm font-mono font-thin text-black/60 max-w-2xl mx-auto tracking-wide leading-loose">
                We&apos;re both technical builders, but we come from liberal arts backgrounds. We&apos;re betting that by <strong>putting the human experience first</strong>, we can create something that people fall in love with.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
