import Image from "next/image";

export function SocialPanel() {
  return (
    <section className="h-screen w-full snap-start p-2 md:p-4 overflow-hidden">
      <div 
        className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] flex flex-col items-center justify-center py-12 md:py-20 bg-[#0A0A0A] text-white overflow-hidden"
      >
        <div className="max-w-8xl w-full mx-auto text-center px-4 ">
          <h2 className="text-5xl md:text-7xl font-mono font-bold tracking-widest uppercase mb-10 text-zinc-200/80">
            Follow Our <br /> Journey
          </h2>
        </div>

        {/* Infinite Marquee Image Cards */}
        <div className="relative w-full overflow-hidden group/marquee">
          {/* Edge Fades - Responsive widths and strengths */}
          <div className="absolute left-0 top-0 bottom-0 w-32 md:w-[40%] bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A] md:via-[#0A0A0A]/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 md:w-[40%] bg-gradient-to-l from-[#0A0A0A] via-[#0A0A0A] md:via-[#0A0A0A]/90 to-transparent z-10 pointer-events-none" />
          
          {/* Bottom Fade */}
          <div className="absolute left-0 right-0 bottom-0 h-16 md:h-48 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-10 pointer-events-none" />
          
          <div className="flex gap-4 md:gap-6 animate-marquee w-fit">
            {[...Array(2)].map((_, setIdx) => (
              <div key={setIdx} className="flex gap-4 md:gap-6">
                {[
                  { src: "/images/post-previews/max-and-avery.jpg", alt: "Max and Avery" },
                  { src: "/images/post-previews/pen-flipping.jpg", alt: "Pen flipping" },
                  { src: "/images/post-previews/running-app.jpg", alt: "Running app" },
                  { src: "/images/post-previews/sf-fits.jpg", alt: "SF fits" },
                  { src: "/images/post-previews/silver-lining.jpg", alt: "Silver lining" },
                  { src: "/images/post-previews/the-interval.jpg", alt: "The interval" },
                ].map((img, i) => (
                  <div 
                    key={`${setIdx}-${i}`} 
                    className="group relative w-[240px] md:w-[350px] aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-zinc-900 border border-zinc-800/50 flex-shrink-0"
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Social Bar - Split Pills */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 px-4 pb-4 md:pb-8">
          <a
            href="https://tiktok.com/@max.shoots.avery"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[280px] md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
            </svg>
            <span className="text-xs font-mono tracking-[0.2em] font-bold uppercase whitespace-nowrap">Our TikTok</span>
          </a>

          <div className="hidden md:block w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-900 flex-shrink-0">
            <Image 
              src="/images/post-previews/max-and-avery.jpg" 
              alt="Avatar" 
              width={80} 
              height={80} 
              className="object-cover"
            />
          </div>

          <a
            href="https://instagram.com/max.shoots.avery"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[280px] md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/10 backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <circle cx="12" cy="12" r="3"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
            </svg>
            <span className="text-xs font-mono tracking-[0.2em] font-bold uppercase whitespace-nowrap">Our Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
}
