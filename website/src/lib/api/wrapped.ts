/**
 * Wrapped Backend API Wrapper
 *
 * All functions in this file interact with the wrapped backend (FastAPI)
 * Endpoints are prefixed with /wrapped
 *
 * Authentication: All requests include Authorization header with Supabase JWT token
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_WRAPPED_BACKEND_URL // || 'http://localhost:8002'

/**
 * Helper to get auth token from Supabase session
 * This should be called before making any API request
 */
export async function getAuthToken(supabase: any): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

/**
 * Upload a single photo to wrapped backend
 *
 * @param originalFile - Original photo file
 * @param croppedFile - Optional cropped version of the photo
 * @param authToken - Supabase JWT token
 * @param batchId - UUID for batch tracking (optional)
 * @param totalPhotosInBatch - Total photos in batch (optional)
 */
export async function uploadPhoto(
  originalFile: File,
  croppedFile: File | null,
  authToken: string,
  batchId?: string,
  totalPhotosInBatch?: number
): Promise<any> {
  const formData = new FormData()
  formData.append('original_file', originalFile)
  if (croppedFile) {
    formData.append('cropped_file', croppedFile)
  }

  // Build URL with query parameters for batch tracking
  let url = `${API_BASE_URL}/wrapped/upload-photo`
  const params = new URLSearchParams()
  if (batchId) params.append('batch_id', batchId)
  if (totalPhotosInBatch) params.append('total_photos_in_batch', totalPhotosInBatch.toString())
  if (params.toString()) url += `?${params.toString()}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
    throw new Error(error.detail || 'Failed to upload photo')
  }

  return response.json()
}

/**
 * Get all uploaded photos for the authenticated user
 *
 * @param authToken - Supabase JWT token
 */
export async function getUserPhotos(authToken: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/wrapped/photos`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch photos' }))
    throw new Error(error.detail || 'Failed to fetch photos')
  }

  return response.json()
}

/**
 * Get all extracted clothing items for the authenticated user
 *
 * @param authToken - Supabase JWT token
 */
export async function getClothingItems(authToken: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/wrapped/clothing-items`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch clothing items' }))
    throw new Error(error.detail || 'Failed to fetch clothing items')
  }

  return response.json()
}

/**
 * Get wrapped insights for the authenticated user
 *
 * @param authToken - Supabase JWT token
 */
export async function getWrappedInsights(authToken: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/wrapped/insights`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch insights' }))
    throw new Error(error.detail || 'Failed to fetch insights')
  }

  return response.json()
}

/**
 * Get wrapped insights by shareable code (public access, no auth required)
 * This is used when users share their results via the unique URL.
 *
 * @param shareCode - 6-character share code (e.g., "VTKZEY")
 */
export async function getInsightsByShareCode(shareCode: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/wrapped/insights/code/${shareCode.toUpperCase()}`, {
    method: 'GET',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch insights' }))
    throw new Error(error.detail || 'Failed to fetch insights')
  }

  return response.json()
}

/**
 * Health check for wrapped backend
 */
export async function healthCheck(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/wrapped/health`, {
    method: 'GET',
  })

  if (!response.ok) {
    throw new Error('Health check failed')
  }

  return response.json()
}
