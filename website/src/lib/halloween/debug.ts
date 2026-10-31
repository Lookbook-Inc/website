import { HalloweenApiError } from '@/lib/api/halloween'
import type { PreparedPhoto } from '@/lib/halloween/image'
import type { HalloweenLocation, HalloweenPhoto, HalloweenPhotoPage, HalloweenUploadResponse } from '@/types/halloween-api'

// Existing public site imagery, used only for the Halloween preview.
export const debugLocations: HalloweenLocation[] = [
  { slug: 'westwood', name: 'Westwood', sort_order: 1, tone: '#9b5d45' },
  { slug: 'butter', name: 'Butter', sort_order: 2, tone: '#a37c3f' },
  { slug: 'jaxson', name: 'Jaxson', sort_order: 3, tone: '#5f688d' },
]

const samples = [
  { image: '/images/grey-girl.jpg', width: 2048, height: 3072, location: 'westwood', name: 'Alex' },
  { image: '/images/post-previews/sf-fits.jpg', width: 388, height: 457, location: 'butter', name: 'Jordan' },
  { image: '/images/team/together.JPEG', width: 4000, height: 3000, location: 'jaxson', name: 'Sam' },
  { image: '/images/team/avery/avery-1.JPG', width: 1800, height: 1200, location: 'westwood', name: 'Avery' },
  { image: '/images/post-previews/max-and-avery.jpg', width: 388, height: 457, location: 'butter', name: 'Taylor' },
  { image: '/images/team/max/max-1.jpeg', width: 1086, height: 724, location: 'jaxson', name: 'Max' },
  { image: '/images/unfurl-card.jpg', width: 1088, height: 982, location: 'westwood', name: 'Riley' },
] as const

export function getDebugPhotos(location?: string | null, uploads: HalloweenPhoto[] = []): HalloweenPhotoPage {
  const now = Date.now()
  const photos: HalloweenPhoto[] = samples.map((sample, index) => ({
    id: `debug-${index + 1}`,
    image_url: sample.image,
    width: sample.width,
    height: sample.height,
    location_slug: sample.location,
    display_name: sample.name,
    created_at: new Date(now - (index * 17 + 3) * 60_000).toISOString(),
  }))

  return {
    photos: [...uploads, ...photos].filter((photo) => !location || photo.location_slug === location),
    next_cursor: null,
  }
}

/**
 * Stands in for the upload in preview mode, staying in this tab.
 * Add `&upload=signal` or `&upload=fail` to the URL to make the first try drop out.
 */
export function debugUpload(
  post: { draft: PreparedPhoto; locationSlug: string; displayName: string },
  onProgress: (fraction: number) => void,
  signal: AbortSignal,
  attempt: number
): Promise<HalloweenUploadResponse> {
  const mode = new URLSearchParams(window.location.search).get('upload')
  const dropsOut = attempt === 0 && (mode === 'signal' || mode === 'fail')

  return new Promise((resolve, reject) => {
    let fraction = 0
    const tick = setInterval(() => {
      fraction = Math.min(dropsOut ? 0.64 : 1, fraction + 0.03)
      onProgress(fraction)
      if (dropsOut && fraction >= 0.64) {
        clearInterval(tick)
        reject(mode === 'signal'
          ? new HalloweenApiError('No connection — try again.', 0)
          : new HalloweenApiError('Something went wrong on our end — try again.', 500))
      } else if (fraction >= 1) {
        clearInterval(tick)
        setTimeout(() => {
          resolve({
            id: `debug-upload-${crypto.randomUUID()}`,
            image_url: URL.createObjectURL(post.draft.blob),
            width: post.draft.width,
            height: post.draft.height,
            location_slug: post.locationSlug,
            display_name: post.displayName || null,
            created_at: new Date().toISOString(),
          })
        }, 500)
      }
    }, 70)
    signal.addEventListener('abort', () => clearInterval(tick), { once: true })
  })
}
