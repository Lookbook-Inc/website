import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfileByHandle } from "@/lib/friends";

const appStoreURL =
  "https://apps.apple.com/us/app/lookbook-your-style-anthology/id6762231832";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const profile = await getPublicProfileByHandle(handle);
  if (!profile) return { title: "Profile not found - Lookbook" };
  return {
    title: `${profile.display_name} (@${profile.handle}) - Lookbook`,
    description: `Open @${profile.handle}'s profile in Lookbook.`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicHandleProfile({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getPublicProfileByHandle(handle);
  if (!profile) notFound();

  return (
    <main className="min-h-screen w-full p-2 md:p-4">
      <section className="relative min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-2rem)] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-[#f5f2ee] flex items-center justify-center px-6">
        <Link href="/" aria-label="Lookbook home" className="absolute top-7 left-7 md:top-10 md:left-10">
          <Image src="/LB-logo-dark.svg" alt="Lookbook" width={44} height={44} />
        </Link>

        <div className="w-full max-w-xl text-center bg-white/50 border border-white/60 shadow-2xl rounded-[2.5rem] p-10 md:p-16">
          {profile.avatar_url ? (
            // Signed, short-lived backend projection; no storage path reaches the page.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={`${profile.display_name}'s avatar`}
              className="mx-auto h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="mx-auto h-28 w-28 rounded-full bg-black/10 flex items-center justify-center text-4xl font-display text-black/50">
              {profile.display_name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <p className="mt-8 text-xs font-mono uppercase tracking-[0.3em] text-black/45">Lookbook profile</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-display text-black/80">{profile.display_name}</h1>
          <p className="mt-2 font-mono text-black/55">@{profile.handle}</p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://lookbook.inc/u/${profile.public_code}`}
              className="rounded-full bg-black text-white px-6 py-3 font-mono text-sm hover:bg-black/75 transition-colors"
            >
              Open in Lookbook
            </a>
            <a
              href={appStoreURL}
              className="rounded-full border border-black/20 px-6 py-3 font-mono text-sm hover:bg-white transition-colors"
            >
              Download Lookbook
            </a>
          </div>

          <p className="mt-8 text-xs font-mono leading-relaxed text-black/45">
            Shared posts are visible only inside Lookbook to accepted friends.
          </p>
        </div>
      </section>
    </main>
  );
}
