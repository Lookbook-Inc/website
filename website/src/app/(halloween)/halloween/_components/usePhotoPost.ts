'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { HalloweenApiError, uploadPhoto } from '@/lib/api/halloween'
import { debugUpload } from '@/lib/halloween/debug'
import { PreparedPhoto } from '@/lib/halloween/image'
import { HalloweenUploadResponse } from '@/types/halloween-api'

/** Wait this long between tries while there's no connection; the last value repeats. */
const RETRY_MS = [3_000, 6_000, 12_000, 20_000]

export type PostPhase = 'uploading' | 'finishing' | 'waiting' | 'failed'

export interface PostDraft {
  draft: PreparedPhoto
  locationSlug: string
  displayName: string
  changedFromScan: boolean
}

export interface PendingPost extends PostDraft {
  phase: PostPhase
  /** 0–1 */
  progress: number
  error: string | null
}

interface UsePhotoPostOptions {
  scanSpot: string | null
  debugMode: boolean
  onPosted: (photo: HalloweenUploadResponse, post: PostDraft) => void
}

/**
 * Posts one photo in the background, so the visitor can keep browsing.
 *
 * A dropped connection doesn't end the post: it keeps trying until it works or
 * the visitor cancels. Any other failure stops and waits for them to decide.
 */
export function usePhotoPost({ scanSpot, debugMode, onPosted }: UsePhotoPostOptions) {
  const posthog = usePostHog()
  const [post, setPost] = useState<PendingPost | null>(null)

  const job = useRef<PostDraft | null>(null)
  const controller = useRef<AbortController | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const tries = useRef(0)
  const onPostedRef = useRef(onPosted)
  onPostedRef.current = onPosted

  const capture = useCallback((event: string, current: PostDraft, extra: Record<string, unknown> = {}) => {
    if (debugMode) return
    posthog?.capture(event, {
      location_slug: current.locationSlug,
      scan_spot: scanSpot,
      changed_from_scan: current.changedFromScan,
      ...extra,
    })
  }, [debugMode, posthog, scanSpot])

  const send = useCallback(async (current: PostDraft) => {
    clearTimeout(timer.current)
    const abort = new AbortController()
    controller.current = abort
    setPost({ ...current, phase: 'uploading', progress: 0, error: null })

    const onProgress = (fraction: number) => {
      if (job.current !== current) return
      setPost((p) => p && { ...p, progress: fraction, phase: fraction >= 1 ? 'finishing' : 'uploading' })
    }

    try {
      const photo = debugMode
        ? await debugUpload(current, onProgress, abort.signal, tries.current)
        : await uploadPhoto(
            {
              photo: current.draft.blob,
              locationSlug: current.locationSlug,
              scanSpot,
              displayName: current.displayName,
            },
            onProgress,
            abort.signal
          )
      if (job.current !== current) return
      job.current = null
      setPost(null)
      capture('halloween_uploaded', current, { photo_id: photo.id })
      onPostedRef.current(photo, current)
    } catch (err) {
      if (job.current !== current || abort.signal.aborted) return
      const status = err instanceof HalloweenApiError ? err.status : -1
      if (tries.current === 0) capture('halloween_upload_failed', current, { status })
      tries.current += 1
      if (status === 0) {
        setPost((p) => p && { ...p, phase: 'waiting' })
        const wait = RETRY_MS[Math.min(tries.current - 1, RETRY_MS.length - 1)]
        timer.current = setTimeout(() => send(current), wait)
        return
      }
      const error = err instanceof Error ? err.message : 'Upload failed — try again.'
      setPost((p) => p && { ...p, phase: 'failed', error })
    }
  }, [capture, debugMode, scanSpot])

  const start = useCallback((next: PostDraft) => {
    job.current = next
    tries.current = 0
    capture('halloween_upload_started', next)
    send(next)
  }, [capture, send])

  const retry = useCallback(() => {
    if (job.current) send(job.current)
  }, [send])

  /** Stops the post and hands back what was being sent. */
  const stop = useCallback(() => {
    const current = job.current
    clearTimeout(timer.current)
    job.current = null
    controller.current?.abort()
    setPost(null)
    return current
  }, [])

  // Try again as soon as there's a reason to think it'll work.
  const waiting = post?.phase === 'waiting'
  useEffect(() => {
    if (!waiting) return
    const wake = () => {
      if (!document.hidden && job.current) send(job.current)
    }
    window.addEventListener('online', wake)
    document.addEventListener('visibilitychange', wake)
    return () => {
      window.removeEventListener('online', wake)
      document.removeEventListener('visibilitychange', wake)
    }
  }, [waiting, send])

  useEffect(() => () => {
    clearTimeout(timer.current)
    job.current = null
    controller.current?.abort()
  }, [])

  return { post, start, retry, stop }
}
