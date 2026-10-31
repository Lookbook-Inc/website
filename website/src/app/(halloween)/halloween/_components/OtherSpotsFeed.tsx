'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getPhotos } from '@/lib/api/halloween'
import { getDebugPhotos } from '@/lib/halloween/debug'
import type { HalloweenLocation, HalloweenPhoto } from '@/types/halloween-api'
import { PhotoCard } from './PhotoCard'
import styles from './halloween.module.css'

interface OtherSpotsFeedProps {
  location: string
  locations: Map<string, HalloweenLocation>
  cols: number
  now: number
  myTokens: Record<string, string>
  deletingId: string | null
  onOpen: (photo: HalloweenPhoto) => void
  onDelete: (photo: HalloweenPhoto) => Promise<boolean>
  debugMode: boolean
}

/** Mounted only after the selected spot's last page; keyed by spot so switching starts fresh. */
export function OtherSpotsFeed({
  location, locations, cols, now, myTokens, deletingId, onOpen, onDelete, debugMode,
}: OtherSpotsFeedProps) {
  const [photos, setPhotos] = useState<HalloweenPhoto[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('loading')
  const request = useRef({ id: 0, loading: false }).current
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (request.loading || (loaded && !nextCursor)) return
    request.loading = true
    const req = ++request.id
    setStatus('loading')
    try {
      const page = debugMode ? getDebugPhotos() : await getPhotos({ cursor: nextCursor })
      if (req !== request.id) return
      setPhotos((previous) => {
        const known = new Set(previous.map((photo) => photo.id))
        return [...previous, ...page.photos.filter((photo) =>
          photo.location_slug !== location && !known.has(photo.id) && !!known.add(photo.id)
        )]
      })
      setNextCursor(page.next_cursor)
      setLoaded(true)
      setStatus('idle')
    } catch {
      if (req === request.id) setStatus('error')
    } finally {
      if (req === request.id) request.loading = false
    }
  }, [debugMode, loaded, location, nextCursor, request])

  const loadMoreRef = useRef(loadMore)
  loadMoreRef.current = loadMore
  useEffect(() => {
    loadMoreRef.current()
    return () => {
      request.id++
      request.loading = false
    }
  }, [request])

  // Even a page containing only this spot must advance to the next global cursor.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || status !== 'idle' || !nextCursor) return
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMoreRef.current(),
      { rootMargin: '800px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [nextCursor, status, photos.length])

  const columns = useMemo(() => {
    const out = Array.from({ length: cols }, () => ({ h: 0, photos: [] as HalloweenPhoto[] }))
    for (const photo of photos) {
      const target = out.reduce((a, b) => (b.h < a.h ? b : a))
      target.photos.push(photo)
      target.h += (photo.height || 1) / (photo.width || 1) + 0.2
    }
    return out
  }, [photos, cols])

  if (loaded && !photos.length && !nextCursor && status === 'idle') return null

  return (
    <section aria-label="From other spots" aria-busy={status === 'loading'}>
      {photos.length > 0 && (
        <>
          <h2 className={styles.otherSpotsTitle}>From other spots</h2>
          <div className={`${styles.feed} ${styles.feedReady}`} aria-live="polite">
            {columns.map((column, i) => (
              <div key={i} className={styles.feedCol}>
                {column.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    location={locations.get(photo.location_slug)}
                    showSpot
                    now={now}
                    isNew={false}
                    revealIndex={0}
                    canDelete={!!myTokens[photo.id]}
                    deleting={deletingId === photo.id}
                    onOpen={onOpen}
                    onDelete={async (photo) => {
                      if (await onDelete(photo)) setPhotos((previous) => previous.filter((p) => p.id !== photo.id))
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      {(!loaded || nextCursor || status === 'error') && (
        <div ref={sentinelRef} className={styles.more}>
          {status === 'loading' && <span className={styles.spinner} role="status" aria-label="Loading photos from other spots" />}
          {status === 'error' && (
            <div>
              <p className={styles.moreError}>Couldn&apos;t load photos from other spots.</p>
              <button className={styles.moreBtn} onClick={loadMore}>Try again</button>
            </div>
          )}
          {status === 'idle' && nextCursor && (
            <button className={styles.moreBtn} onClick={loadMore}>Load more</button>
          )}
        </div>
      )}
    </section>
  )
}
