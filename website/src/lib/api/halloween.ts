/**
 * Halloween Backend API Wrapper
 *
 * All functions in this file interact with the wrapped backend (FastAPI)
 * Endpoints are prefixed with /halloween
 *
 * Authentication: none — visitors arrive anonymously from QR codes.
 * Deleting a photo uses the one-time token returned when it was uploaded.
 */

import {
  HalloweenLocation,
  HalloweenPhotoPage,
  HalloweenUploadInput,
  HalloweenUploadResponse,
} from '@/types/halloween-api'

const API_BASE_URL = process.env.NEXT_PUBLIC_WRAPPED_BACKEND_URL

export const PAGE_SIZE = 24

export class HalloweenApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/** FastAPI sends `detail` as a string, or as a list of validation errors for 422s. */
function detailFrom(body: unknown): string | null {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg
  return null
}

/** Turn a failed response into a message a visitor can act on. */
function friendlyError(status: number, body: unknown, fallback: string): HalloweenApiError {
  const detail = detailFrom(body)
  if (status === 0) return new HalloweenApiError('No connection — try again.', 0)
  if (status === 413) return new HalloweenApiError('That photo is too large — try another.', status)
  if (status === 429) return new HalloweenApiError('Slow down — try again in a few minutes.', status)
  if (status >= 500) return new HalloweenApiError('Something went wrong on our end — try again.', status)
  return new HalloweenApiError(detail || fallback, status)
}

async function getJson<T>(path: string, fallback: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { cache: 'no-store', ...init })
  } catch {
    throw friendlyError(0, null, fallback)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw friendlyError(response.status, body, fallback)
  }

  return response.json()
}

/**
 * Get the active locations, in display order
 */
export async function getLocations(): Promise<HalloweenLocation[]> {
  return getJson('/halloween/locations', "Couldn't load locations")
}

/**
 * Get one page of the gallery, newest first
 *
 * @param location - Only photos tagged at this location slug (omit for all)
 * @param cursor - `next_cursor` from the previous page (omit for the first page)
 */
export async function getPhotos(
  { location, cursor, limit = PAGE_SIZE }: { location?: string | null; cursor?: string | null; limit?: number } = {}
): Promise<HalloweenPhotoPage> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (location) params.append('location', location)
  if (cursor) params.append('cursor', cursor)

  return getJson(`/halloween/photos?${params.toString()}`, "Couldn't load photos")
}

/**
 * Upload one photo
 *
 * Uses XMLHttpRequest rather than fetch so we can report upload progress.
 *
 * @param input - The prepared JPEG plus its details
 * @param onProgress - Called with 0–1 as the photo uploads
 */
export function uploadPhoto(
  input: HalloweenUploadInput,
  onProgress?: (fraction: number) => void
): Promise<HalloweenUploadResponse> {
  const formData = new FormData()
  formData.append('photo', input.photo, 'photo.jpg')
  formData.append('location_slug', input.locationSlug)
  if (input.scanSpot) formData.append('scan_spot', input.scanSpot)
  if (input.displayName) formData.append('display_name', input.displayName)
  if (input.caption) formData.append('caption', input.caption)
  formData.append('swatches', JSON.stringify(input.swatches))

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE_URL}/halloween/photos`)
    xhr.responseType = 'json'

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
        resolve(xhr.response as HalloweenUploadResponse)
      } else {
        reject(friendlyError(xhr.status, xhr.response, 'Upload failed — try again.'))
      }
    }
    xhr.onerror = () => reject(friendlyError(0, null, 'Upload failed — try again.'))
    xhr.ontimeout = () => reject(friendlyError(0, null, 'Upload failed — try again.'))
    xhr.timeout = 60_000

    xhr.send(formData)
  })
}

/**
 * Delete a photo the visitor posted
 *
 * @param id - Photo id
 * @param deleteToken - Token returned when the photo was uploaded
 */
export async function deletePhoto(id: string, deleteToken: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}/halloween/photos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Delete-Token': deleteToken },
    })
  } catch {
    throw friendlyError(0, null, "Couldn't delete that")
  }

  // Already gone counts as deleted.
  if (!response.ok && response.status !== 404) {
    const body = await response.json().catch(() => null)
    throw friendlyError(response.status, body, "Couldn't delete that")
  }
}
