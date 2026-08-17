import { notFound, redirect } from "next/navigation";
import { getPublicProfileByCode } from "@/lib/friends";

export const dynamic = "force-dynamic";

export default async function PublicCodeProfile({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  const { publicCode } = await params;
  const profile = await getPublicProfileByCode(publicCode);
  if (!profile) notFound();

  // A temporary redirect intentionally re-resolves the immutable code on every
  // visit so a handle edit never strands a cached link on the old handle.
  redirect(`/user/${encodeURIComponent(profile.handle)}`);
}
