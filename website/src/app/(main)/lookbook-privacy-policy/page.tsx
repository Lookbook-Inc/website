import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - Lookbook",
  description: "How Lookbook collects, uses, and protects your information.",
  openGraph: {
    title: "Privacy Policy - Lookbook",
    description: "How Lookbook collects, uses, and protects your information.",
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
    title: "Privacy Policy - Lookbook",
    description: "How Lookbook collects, uses, and protects your information.",
    images: ["/images/unfurl-card.jpg"],
  },
};

export default function LookbookPrivacyPolicy() {
  return (
    <main className="min-h-screen w-full p-2 md:p-4">
      <section className="relative min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col items-center px-6 py-24 md:py-28 bg-[#f5f2ee]">
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

        <div className="relative z-10 max-w-3xl w-full px-4">
          <div className="relative bg-white/40 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/40 p-10 md:p-16 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

            <div className="relative">
              <div className="text-xs md:text-sm font-mono text-zinc-500 uppercase tracking-[0.3em] mb-4">
                Effective April 30, 2026
              </div>
              <h1 className="text-4xl md:text-5xl font-display text-black/80 mb-10 leading-tight">
                Privacy Policy
              </h1>

              <div className="font-mono font-thin text-black/80 text-sm md:text-base leading-relaxed space-y-10">
                <p>
                  This Privacy Policy explains how Lookbook collects, uses, and
                  protects your information when you use our mobile app.
                </p>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Information We Collect
                  </h2>
                  <p>We may collect:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong className="font-medium">Account Information</strong>{" "}
                      (such as your email address, first name, and zip code)
                    </li>
                    <li>
                      <strong className="font-medium">User Content</strong>{" "}
                      (such as photos you upload and outfits you save)
                    </li>
                    <li>
                      <strong className="font-medium">Device Token</strong>{" "}
                      (used to deliver push notifications, if you enable them)
                    </li>
                    <li>
                      <strong className="font-medium">Usage Data</strong>{" "}
                      (such as in-app actions and screens viewed, used for our
                      own product analytics)
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    How We Use Information
                  </h2>
                  <p>We use this information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and operate the app</li>
                    <li>Process your inputs and generate AI-powered responses</li>
                    <li>Store and manage your content</li>
                    <li>
                      Generate weather-aware clothing recommendations based on
                      your zip code
                    </li>
                    <li>Send push notifications (if you enable them)</li>
                    <li>Improve app functionality</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Third-Party Services
                  </h2>
                  <p>We use third-party services to run the app:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong className="font-medium">Supabase</strong>{" "}
                      (authentication, database, and storage)
                    </li>
                    <li>
                      <strong className="font-medium">OpenAI API</strong> (AI
                      processing)
                    </li>
                    <li>
                      <strong className="font-medium">Google Gemini API</strong>{" "}
                      (AI processing)
                    </li>
                    <li>
                      <strong className="font-medium">PostHog</strong> (product
                      analytics &mdash; used only for our own analytics; not
                      shared or sold)
                    </li>
                    <li>
                      <strong className="font-medium">WeatherAPI</strong>{" "}
                      (provides local weather data based on your zip code, used
                      to generate weather-aware clothing recommendations)
                    </li>
                  </ul>
                  <p>
                    These services may process your data only as needed to
                    provide the app&apos;s functionality.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Data Sharing
                  </h2>
                  <p>
                    We do not sell your personal information. We only share data
                    with service providers as necessary to operate the app.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Data Retention
                  </h2>
                  <p>
                    We keep your data only for as long as needed to provide the
                    app. You can request deletion of your account and data at
                    any time by contacting us.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Security
                  </h2>
                  <p>We take reasonable measures to protect your information.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Children&apos;s Privacy
                  </h2>
                  <p>
                    Lookbook is not intended for children under 13 (or the
                    equivalent minimum age in your jurisdiction).
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Changes
                  </h2>
                  <p>We may update this policy from time to time.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Contact
                  </h2>
                  <p>
                    For questions, contact us at{" "}
                    <a
                      href="mailto:hq@lookbook.inc"
                      className="underline hover:text-black/60 transition-colors"
                    >
                      hq@lookbook.inc
                    </a>
                    .
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
