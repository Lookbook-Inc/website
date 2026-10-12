import { getLocations, getPhotos } from '@/lib/api/halloween'
import { normalizeSpot } from '@/lib/halloween/spot'
import { HalloweenFeed } from './_components/HalloweenFeed'

// The gallery changes every few seconds on the night; never serve a cached page.
export const dynamic = 'force-dynamic'

export default async function HalloweenPage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string | string[] }>
}) {
  const { spot } = await searchParams
  const scanSpot = normalizeSpot(spot)

  // Render the first photos on the server so a QR scan opens straight onto the feed.
  // If the backend can't be reached from here, the client retries on its own.
  const [locations, firstPage] = await Promise.allSettled([getLocations(), getPhotos()])

  return (
    <HalloweenFeed
      scanSpot={scanSpot}
      initialLocations={locations.status === 'fulfilled' ? locations.value : null}
      initialPage={firstPage.status === 'fulfilled' ? firstPage.value : null}
    />
  )
}
