import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support - Lookbook",
  description: "Need help with Lookbook? Get in touch with our team.",
  openGraph: {
    title: "Support - Lookbook",
    description: "Need help with Lookbook? Get in touch with our team.",
    images: [
      {
        url: "/images/unfurl-card.jpg",
        width: 1200,
        height: 630,
        alt: "Lookbook - Your Style Anthology",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Support - Lookbook",
    description: "Need help with Lookbook? Get in touch with our team.",
    images: ["/images/unfurl-card.jpg"],
  },
};

export default function Support() {
  return (
    <main className="min-h-screen w-full p-2 md:p-4">
      <section className="relative min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center text-center px-6 bg-zinc-100">
        <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-6 md:top-10 left-6 md:left-10 pointer-events-auto">
            <Link href="/" aria-label="Lookbook home" className="inline-block">
              <Image
                src="/LB-logo-dark.svg"
                alt="Lookbook"
                width={44}
                height={44}
              />
            </Link>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl w-full px-4">
          <div className="bg-white/40 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/40 p-12 md:p-20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            <h1 className="relative text-4xl md:text-5xl font-display text-black/80 mb-8 leading-tight">
              Need help with Lookbook?
            </h1>

            <p className="relative text-base md:text-lg font-mono font-thin text-black max-w-xl mx-auto leading-relaxed">
              Contact us at{" "}
              <a
                href="mailto:hq@lookbook.inc"
                className="underline hover:text-black/60 transition-colors"
              >
                hq@lookbook.inc
              </a>
              .
            </p>

            <p className="relative mt-4 text-base md:text-lg font-mono font-thin text-black max-w-xl mx-auto leading-relaxed text-center">
              We typically respond within 48 hours.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
