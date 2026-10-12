/**
 * Halloween backend types
 *
 * Mirrors the Wrapped FastAPI backend's /halloween endpoints.
 */

export interface HalloweenLocation {
  slug: string
  name: string
  tone?: string | null
  sort_order: number
}

export interface HalloweenPhoto {
  id: string
  image_url: string
  /** Smaller rendition for the feed, if the backend makes one. */
  thumb_url?: string | null
  width: number
  height: number
  location_slug: string
  display_name: string | null
  caption: string | null
  swatches: string[]
  created_at: string
}

export interface HalloweenPhotoPage {
  photos: HalloweenPhoto[]
  next_cursor: string | null
}

/** Only the poster gets the delete token back, once, on upload (if the backend supports self-delete). */
export interface HalloweenUploadResponse extends HalloweenPhoto {
  delete_token?: string | null
}

export interface HalloweenUploadInput {
  photo: Blob
  locationSlug: string
  scanSpot: string | null
  displayName: string
  caption: string
  swatches: string[]
}
