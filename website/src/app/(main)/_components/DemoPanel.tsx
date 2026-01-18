import Image from "next/image";
import PhoneMockupGroup from "./PhoneMockupGroup";

interface DemoPanelProps {
  className?: string;
}

export function DemoPanel({ className = "" }: DemoPanelProps) {
  return (
    <section className={`h-screen md:h-full w-full md:w-1/2 snap-start md:snap-none p-2 md:p-0 ${className}`}>
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-background border border-black/5 flex items-center justify-center">
        <Image
          src="/images/paper-texture-2.avif"
          alt="Paper texture background"
          fill
          className="object-cover opacity-50"
          priority
        />
        <div className="relative z-10 w-full flex items-center justify-center">
          <div className="relative h-[500px] lg:h-[600px] w-full flex items-center justify-center">
            <PhoneMockupGroup />
          </div>
        </div>
      </div>
    </section>
  );
}
