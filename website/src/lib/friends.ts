export type PublicFriendProfile = {
  public_code: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
};

const backendURL = (
  process.env.LOOKBOOK_BACKEND_URL ?? "https://api-k8s.mavenstudios.org"
).replace(/\/$/, "");

async function fetchProfile(path: string): Promise<PublicFriendProfile | null> {
  const response = await fetch(`${backendURL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Profile lookup failed (${response.status})`);

  const profile = (await response.json()) as PublicFriendProfile;
  return {
    public_code: profile.public_code,
    handle: profile.handle,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
  };
}

export function getPublicProfileByCode(code: string) {
  return fetchProfile(`/public/profiles/code/${encodeURIComponent(code)}`);
}

export function getPublicProfileByHandle(handle: string) {
  return fetchProfile(`/public/profiles/handle/${encodeURIComponent(handle)}`);
}
