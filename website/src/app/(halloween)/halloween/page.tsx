import { getLocations, getPhotos } from '@/lib/api/halloween'
import { debugLocations, getDebugPhotos } from '@/lib/halloween/debug'
import { normalizeSpot } from '@/lib/halloween/spot'
import { HalloweenFeed } from './_components/HalloweenFeed'

// The gallery changes every few seconds on the night; never serve a cached page.
export const dynamic = 'force-dynamic'

export default async function HalloweenPage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string | string[]; debug?: string | string[] }>
}) {
  const { spot, debug } = await searchParams
  const scanSpot = normalizeSpot(spot)
  const debugMode = debug === '1' && (process.env.NODE_ENV !== 'production' || process.env.HALLOWEEN_DEMO_ENABLED === 'true')

  if (debugMode) {
    const known = debugLocations.some((l) => l.slug === scanSpot) ? scanSpot : null
    return (
      <HalloweenFeed
        scanSpot={scanSpot}
        initialFilter={known}
        initialLocations={debugLocations}
        initialPage={getDebugPhotos(known)}
        debugMode
      />
    )
  }

  // A QR scan opens on that spot's lookbook, rendered on the server so photos show at once.
  // The spot's photos are fetched alongside the locations; if the spot turns out to be
  // unknown, fall back to every spot. If the backend can't be reached, the client retries.
  const [locations, spotPage] = await Promise.allSettled([
    getLocations(),
    getPhotos({ location: scanSpot }),
  ])
  const known =
    locations.status === 'fulfilled' && scanSpot && locations.value.some((l) => l.slug === scanSpot) ? scanSpot : null
  let firstPage = spotPage.status === 'fulfilled' ? spotPage.value : null
  if (scanSpot && !known) firstPage = await getPhotos().catch(() => null)

  return (
    <HalloweenFeed
      scanSpot={scanSpot}
      initialFilter={known}
      initialLocations={locations.status === 'fulfilled' ? locations.value : null}
      initialPage={firstPage}
    />
  )
}
