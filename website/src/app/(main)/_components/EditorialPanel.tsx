import Image from "next/image";
import EditorialPoster from "./EditorialPoster";

interface EditorialPanelProps {
  className?: string;
}

export function EditorialPanel({ className = "" }: EditorialPanelProps) {
  return (
    <section className={`h-screen md:h-full w-full md:w-1/2 snap-start md:snap-none p-2 md:p-0 ${className}`}>
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-black border border-black/5 flex items-center justify-center">
        <Image
          src="/images/dark-paper-texture.avif"
          alt="Paper texture background"
          fill
          className="object-cover brightness-200"
          priority
        />
        <div className="relative z-10 w-full px-10 flex flex-col items-center">
          <div className="w-full max-w-md space-y-8">
            <EditorialPoster />

            <div className="w-full font-mono text-sm md:text-base text-white space-y-4 px-6">
              <p className="font-bold uppercase tracking-wider">It&apos;s simple.</p>
              <div className="space-y-2">
                <p>We help you track what you&apos;ve been wearing — your clothes, your aesthetics — from your fit pics. No extra steps.</p>
                <p>Your style starts from what you already have.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
