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
                Effective August 11, 2026
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
                      (such as photos you upload, Friends posts you choose to
                      share, reports you submit, and outfits you save)
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
                  <p>We use your information to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, operate, and maintain Lookbook.</li>
                    <li>Create and manage your account.</li>
                    <li>
                      Store and organize your uploaded photos, clothing items,
                      outfits, and saved content.
                    </li>
                    <li>
                      Analyze your photos and content to identify clothing items,
                      aesthetics, and create outfit recommendations.
                    </li>
                    <li>
                      Create weather-aware outfit recommendations based on your
                      zip code.
                    </li>
                    <li>Send push notifications, if you enable them.</li>
                    <li>
                      Operate Friends connections, sharing, image safety checks,
                      blocking, and member-report review.
                    </li>
                    <li>
                      Understand app usage, diagnose issues, and improve Lookbook.
                    </li>
                    <li>
                      Protect the security and integrity of the app.
                    </li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Third-Party Services
                  </h2>
                  <p>
                    We do not sell your data to any third party. Our
                    third-party providers do not use data from our app to track
                    individual users for analytics or advertising. We use
                    third-party services to provide some app functionalities:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong className="font-medium">Supabase</strong>{" "}
                      (authentication, database, and storage)
                    </li>
                    <li>
                      <strong className="font-medium">OpenAI API</strong>{" "}
                      (Image processing &amp; visual intelligence)
                    </li>
                    <li>
                      <strong className="font-medium">Google Gemini API</strong>{" "}
                      (Image processing &amp; visual intelligence)
                    </li>
                    <li>
                      <strong className="font-medium">PostHog</strong> (product
                      analytics)
                    </li>
                    <li>
                      <strong className="font-medium">WeatherAPI</strong> (local
                      weather data)
                    </li>
                  </ul>
                  <p>
                    These services process data only as needed to provide the
                    app&apos;s functionality.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Friends Sharing and Safety
                  </h2>
                  <p>
                    Friends sharing is optional and off by default during an
                    upload. A Friends post contains only the selected display
                    image, a safe profile summary, and publication metadata.
                    Accepted friends can see currently active historical shares.
                    Public web profiles show only your avatar, display name, and
                    handle; they never show your posts.
                  </p>
                  <p>
                    Images are checked for safety before publication. Flagged
                    images and images whose check is unavailable remain private.
                    Member reports are stored for review and may include the
                    reported profile and originating post. Blocking removes the
                    relationship and hides both members from one another; unblocking
                    does not restore it.
                  </p>
                  <p>
                    Learn more in our{" "}
                    <Link href="/community-standards" className="underline hover:text-black/60 transition-colors">
                      Community Standards
                    </Link>
                    .
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
                    We keep your information for as long as needed to provide
                    Lookbook, maintain your account, comply with legal
                    obligations, resolve disputes, and improve the app. You can
                    request deletion of your account and data via the app, or
                    by contacting us at{" "}
                    <a
                      href="mailto:hq@lookbook.inc"
                      className="underline hover:text-black/60 transition-colors"
                    >
                      hq@lookbook.inc
                    </a>
                    .
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Face Data
                  </h2>
                  <p>
                    If you choose to use the auto photo selection feature,
                    Lookbook may ask you to take a photo of your face for
                    reference. This photo is used only on your device to help
                    find outfit photos in your photo library that are likely to
                    include you.
                  </p>
                  <p>
                    <strong className="font-medium">
                      Your face photo never leaves your phone.
                    </strong>{" "}
                    It is not uploaded, stored on our servers, shared with third
                    parties, or used for advertising or tracking. It is stored
                    locally on your device so you do not need to retake it each
                    time you use auto photo selection. It remains on your
                    device until you delete the app or remove the app&apos;s
                    local data.
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
                  <p>
                    We may update this Privacy Policy from time to time. If we
                    make material changes, we will update the effective date and
                    may provide additional notice in the app or by other
                    reasonable means.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="font-display text-2xl md:text-3xl text-black/80">
                    Contact
                  </h2>
                  <p>
                    For questions or requests, contact us at:
                  </p>
                  <p>
                    <a
                      href="mailto:hq@lookbook.inc"
                      className="underline hover:text-black/60 transition-colors"
                    >
                      hq@lookbook.inc
                    </a>
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
