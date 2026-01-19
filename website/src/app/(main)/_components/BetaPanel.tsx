import Image from "next/image";
import WaitlistForm from "./WaitlistForm";

export function BetaPanel() {
  return (
    <section id="waitlist" className="h-screen w-full snap-start snap-always p-2 md:p-4">
      <div 
        className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex items-center justify-center"
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/unsplash-gallery.png"
            alt="Unsplash Gallery Stock"
            fill
            className="object-cover scale-110 opacity-60 saturate-150 blur-xs"
          />
          <div className="absolute inset-0 bg-black/20" /> {/* Light overlay instead of dark */}
        </div>

        <div className="relative z-10 max-w-xl mx-auto px-4 w-full">
          {/* Glass Container */}
          <div className="bg-white/50 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] border border-white/40 p-12 md:p-24 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-6xl md:text-8xl font-waitlist mb-6 text-black">
                JOIN OUR WAITLIST
              </h2>
              <p className="text-md md:text-lg font-mono text-black/80 mb-10 max-w-lg leading-relaxed">
                Be first to know when Lookbook launches. 
              </p>
              <div className="w-full max-w-md">
                <WaitlistForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
