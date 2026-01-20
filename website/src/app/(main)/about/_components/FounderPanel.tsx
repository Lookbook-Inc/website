"use client";

import Image from "next/image";
import { ReactNode } from "react";

interface FounderPanelProps {
  name: string;
  role?: string;
  education: string;
  bio: ReactNode[];
  portrait: string;
  socials: {
    linkedin?: string;
    github?: string;
  };
  reverse?: boolean;
}

export function FounderPanel({ name, role, education, bio, portrait, socials, reverse }: FounderPanelProps) {
  return (
    <section className="h-screen md:h-full w-full md:w-1/2 snap-start snap-always md:snap-none p-2 md:p-0">
      <div className={`group relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-black flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
        {/* Image Container */}
        <div className="relative flex-1 min-w-0 overflow-hidden transition-all duration-2000 ease-in-out bg-black">
          {portrait ? (
            <Image
              src={portrait}
              alt={name}
              fill
              className="object-cover saturate-[0.25] group-hover:saturate-100 transition-all duration-700"
            />
          ) : (
            <div className="w-full h-full bg-zinc-900" />
          )}
          {/* Mobile Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:hidden" />
          {/* Desktop Gradient */}
          <div className="absolute inset-0 hidden md:block bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />
          
          {/* Name & Role - Always visible */}
          <div className={`absolute bottom-8 left-8 md:bottom-12 z-20 ${reverse ? 'md:left-12 md:text-left' : 'md:right-12 md:text-right'}`}>
            <div className="space-y-1">
              {role && (
                <span className="text-[10px] md:text-xs font-mono text-zinc-100/50 uppercase tracking-[0.2em]">
                  {role}
                </span>
              )}
              <h2 className="text-3xl md:text-5xl font-display text-zinc-100 uppercase leading-none">
                {name}
              </h2>
              <span className="text-[10px] md:text-xs font-mono text-zinc-100/30 uppercase tracking-widest">
                {education}
              </span>
            </div>
          </div>
        </div>
        
        {/* Info Container */}
        <div className="grid grid-rows-[1fr] md:grid-rows-none md:grid-cols-[0fr] md:group-hover:grid-cols-[1fr] transition-all duration-1000 ease-in-out bg-zinc-900 z-10">
          <div className="overflow-hidden">
            <div className={`w-full md:w-[22rem] p-8 md:p-12 h-full flex flex-col justify-end ${reverse ? 'md:items-start md:text-left' : 'md:items-end md:text-right'}`}>
              <div className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 md:delay-300">
                <div className="space-y-6 max-w-md text-[10px] md:text-xs text-zinc-400 leading-relaxed pb-8 md:pb-0">
                  {bio}
                </div>

                <div className={`flex gap-4 mt-8 ${reverse ? 'justify-start' : 'md:justify-end'}`}>
                  {socials.linkedin && (
                    <a 
                      href={socials.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-widest">LinkedIn</span>
                    </a>
                  )}
                  {socials.github && (
                    <a 
                      href={socials.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-100 transition-colors"
                    >
                      <span className="text-[10px] font-mono uppercase tracking-widest">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
