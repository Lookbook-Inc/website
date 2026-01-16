import Image from "next/image";

export function HeroPanel() {
  return (
    <section className="h-screen w-full snap-start p-2 md:p-4">
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden grid grid-cols-3">
        {/* Images */}
        <div className="relative">
          <Image src="/images/man-tunnel.avif" alt="Hero image 1" fill className="object-cover" priority />
        </div>
        <div className="relative">
          <Image src="/images/grey-girl.jpg" alt="Hero image 2" fill className="object-cover" priority />
        </div>
        <div className="relative">
          <Image src="/images/green-girl.jpg" alt="Hero image 3" fill className="object-cover" priority />
        </div>

        {/* Central Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center">
            <p className="text-xl md:text-4xl font-waitlist text-white drop-shadow-lg md:mb-4">
              Studio Maven Presents
            </p>
            <h1 className="text-6xl md:text-[12cqw] font-display text-white drop-shadow-2xl mix-blend-exclusion">
              Lookbook
            </h1>
            <p className="text-xl md:text-4xl font-mono font-thin text-white drop-shadow-lg">
              Your Style Anthology
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
