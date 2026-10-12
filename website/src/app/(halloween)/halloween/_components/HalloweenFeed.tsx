'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { deletePhoto, getLocations, getPhotos } from '@/lib/api/halloween'
import { loadDeleteTokens, saveDeleteTokens } from '@/lib/halloween/storage'
import {
  HalloweenLocation,
  HalloweenPhoto,
  HalloweenPhotoPage,
  HalloweenUploadResponse,
} from '@/types/halloween-api'
import { AllIcon, CameraIcon, CheckIcon, ChevronDownIcon, FilterIcon, GlassIcon } from './icons'
import { Lightbox } from './Lightbox'
import { PhotoCard, toneOf } from './PhotoCard'
import { UploadSheet } from './UploadSheet'
import styles from './halloween.module.css'

const ALL = 'all'
const NEW_PHOTO_POLL_MS = 20_000
/** Only drop new photos straight in when the visitor is looking at the top of the feed. */
const NEAR_TOP_PX = 120

type LoadStatus = 'idle' | 'loading' | 'error'

interface PendingNew {
  photos: HalloweenPhoto[]
  /** The whole first page was new, so there may be a gap: replace the feed instead of prepending. */
  page: HalloweenPhotoPage | null
}

interface HalloweenFeedProps {
  initialLocations: HalloweenLocation[] | null
  initialPage: HalloweenPhotoPage | null
  scanSpot: string | null
}

const colCountFor = (width: number) => (width >= 1080 ? 4 : width >= 760 ? 3 : 2)
const byNewest = (a: HalloweenPhoto, b: HalloweenPhoto) => Date.parse(b.created_at) - Date.parse(a.created_at)

function mergeUnique(first: HalloweenPhoto[], second: HalloweenPhoto[]) {
  const seen = new Set<string>()
  return [...first, ...second].filter((p) => !seen.has(p.id) && !!seen.add(p.id))
}

export function HalloweenFeed({ initialLocations, initialPage, scanSpot }: HalloweenFeedProps) {
  const posthog = usePostHog()

  const [locations, setLocations] = useState<HalloweenLocation[]>(initialLocations ?? [])
  const [filter, setFilter] = useState(ALL)
  const [photos, setPhotos] = useState<HalloweenPhoto[]>(initialPage?.photos ?? [])
  const [nextCursor, setNextCursor] = useState<string | null>(initialPage?.next_cursor ?? null)
  const [status, setStatus] = useState<LoadStatus>(initialPage ? 'idle' : 'loading')
  const [pending, setPending] = useState<PendingNew | null>(null)

  const [myTokens, setMyTokens] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newId, setNewId] = useState<string | null>(null)

  const [cols, setCols] = useState(2)
  const [now, setNow] = useState(() => Date.now())
  const [ready, setReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<HalloweenPhoto | null>(null)
  const [toast, setToast] = useState<{ key: number; node: React.ReactNode } | null>(null)

  // Bumped on every list request so a slow response for an old filter can't overwrite a newer one.
  const requestId = useRef(0)
  const photosRef = useRef(photos)
  photosRef.current = photos
  const filterRef = useRef(filter)
  filterRef.current = filter
  const overlayOpenRef = useRef(false)
  overlayOpenRef.current = sheetOpen || !!lightboxPhoto

  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const locationBySlug = useMemo(() => new Map(locations.map((l) => [l.slug, l])), [locations])
  const scannedLocation = scanSpot && locationBySlug.has(scanSpot) ? scanSpot : null

  /* ───────────── Toast ───────────── */
  const showToast = useCallback((node: React.ReactNode) => setToast({ key: Date.now(), node }), [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  /* ───────────── Mount ───────────── */
  useEffect(() => {
    setMyTokens(loadDeleteTokens())
    setNow(Date.now())
    const t = setTimeout(() => setReady(true), 700)
    return () => clearTimeout(t)
  }, [])

  const viewTracked = useRef(false)
  useEffect(() => {
    if (!posthog || viewTracked.current) return
    viewTracked.current = true
    posthog.capture('halloween_viewed', { scan_spot: scanSpot })
  }, [posthog, scanSpot])

  // Keep "3m ago" honest without refetching.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  // Masonry column count follows the viewport.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const update = () => setCols(colCountFor(window.innerWidth))
    const onResize = () => {
      clearTimeout(t)
      t = setTimeout(update, 120)
    }
    update()
    window.addEventListener('resize', onResize)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  // No scrolling the feed behind an open sheet or lightbox.
  useEffect(() => {
    if (!sheetOpen && !lightboxPhoto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheetOpen, lightboxPhoto])

  /* ───────────── Loading ───────────── */
  const loadFirstPage = useCallback(async (location: string) => {
    const req = ++requestId.current
    setStatus('loading')
    setPending(null)
    try {
      const page = await getPhotos({ location: location === ALL ? null : location })
      if (req !== requestId.current) return
      setPhotos(page.photos)
      setNextCursor(page.next_cursor)
      setStatus('idle')
    } catch {
      if (req === requestId.current) setStatus('error')
    }
  }, [])

  const loadMore = async () => {
    if (!nextCursor || status === 'loading') return
    const req = ++requestId.current
    const location = filter
    setStatus('loading')
    try {
      const page = await getPhotos({ location: location === ALL ? null : location, cursor: nextCursor })
      if (req !== requestId.current) return
      setPhotos((prev) => mergeUnique(prev, page.photos))
      setNextCursor(page.next_cursor)
      setStatus('idle')
    } catch {
      if (req === requestId.current) setStatus('error')
    }
  }

  const retry = () => (photos.length ? loadMore() : loadFirstPage(filter))

  // The server render may not have reached the backend; try again from the browser.
  useEffect(() => {
    if (!initialLocations) getLocations().then(setLocations).catch(() => {})
    if (!initialPage) loadFirstPage(ALL)
  }, [initialLocations, initialPage, loadFirstPage])

  // Infinite scroll. Re-observing after each page means a tall screen keeps
  // loading until the sentinel is pushed out of view.
  const loadMoreRef = useRef(loadMore)
  loadMoreRef.current = loadMore
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !nextCursor || status !== 'idle') return
    const observer = new IntersectionObserver(
      (entries) => entries[0]?.isIntersecting && loadMoreRef.current(),
      { rootMargin: '800px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [nextCursor, status, photos.length])

  /* ───────────── New photos from other people ───────────── */
  const applyPending = useCallback((next: PendingNew) => {
    if (next.page) {
      setPhotos(next.page.photos)
      setNextCursor(next.page.next_cursor)
    } else {
      setPhotos((prev) => mergeUnique(next.photos, prev))
    }
    setPending(null)
  }, [])

  useEffect(() => {
    const check = async () => {
      if (document.hidden) return
      const location = filterRef.current
      let page: HalloweenPhotoPage
      try {
        page = await getPhotos({ location: location === ALL ? null : location })
      } catch {
        return
      }
      if (filterRef.current !== location) return

      const current = photosRef.current
      const known = new Set(current.map((p) => p.id))
      const newest = current.length ? Date.parse(current[0].created_at) : 0
      const fresh = page.photos.filter((p) => !known.has(p.id) && Date.parse(p.created_at) > newest).sort(byNewest)
      if (!fresh.length) return

      const next: PendingNew = {
        photos: fresh,
        page: fresh.length === page.photos.length && page.next_cursor ? page : null,
      }
      if (window.scrollY < NEAR_TOP_PX && !overlayOpenRef.current) applyPending(next)
      else setPending(next)
    }

    const t = setInterval(check, NEW_PHOTO_POLL_MS)
    const onVisible = () => !document.hidden && check()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [applyPending])

  /* ───────────── Filter ───────────── */
  const chooseFilter = (slug: string) => {
    setMenuOpen(false)
    filterBtnRef.current?.focus()
    if (slug === filter) return
    setFilter(slug)
    setPhotos([])
    setNextCursor(null)
    loadFirstPage(slug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!menuOpen) return
    const menu = menuRef.current
    ;(menu?.querySelector<HTMLElement>('[aria-selected="true"]') ?? menu?.querySelector<HTMLElement>('li[role="option"]'))?.focus()

    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`.${styles.filter}`)) setMenuOpen(false)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [menuOpen])

  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = [...(menuRef.current?.querySelectorAll<HTMLElement>('li[role="option"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(i + 1) % items.length]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(i - 1 + items.length) % items.length]?.focus()
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      ;(document.activeElement as HTMLElement | null)?.click()
    } else if (e.key === 'Escape') {
      setMenuOpen(false)
      filterBtnRef.current?.focus()
    }
  }

  /* ───────────── Upload / delete ───────────── */
  const onUploaded = ({ delete_token, ...photo }: HalloweenUploadResponse) => {
    if (delete_token) {
      const tokens = { ...loadDeleteTokens(), [photo.id]: delete_token }
      saveDeleteTokens(tokens)
      setMyTokens(tokens)
    }
    setNewId(photo.id)

    if (filter === ALL || filter === photo.location_slug) {
      setPhotos((prev) => mergeUnique([photo], prev))
    } else {
      setFilter(ALL)
      setPhotos([photo])
      setNextCursor(null)
      loadFirstPage(ALL)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onDelete = async (photo: HalloweenPhoto) => {
    const token = myTokens[photo.id]
    if (!token || !window.confirm("Delete your photo from the feed? This can't be undone.")) return
    setDeletingId(photo.id)
    try {
      await deletePhoto(photo.id, token)
      const rest = Object.fromEntries(Object.entries(loadDeleteTokens()).filter(([id]) => id !== photo.id))
      saveDeleteTokens(rest)
      setMyTokens(rest)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      posthog?.capture('halloween_photo_deleted', { photo_id: photo.id })
      showToast('Photo deleted')
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't delete that")
    } finally {
      setDeletingId(null)
    }
  }

  /* ───────────── Render ───────────── */
  // Shortest-column-first masonry, measured in "width units" (image ratio + card chrome).
  const columns = useMemo(() => {
    const out = Array.from({ length: cols }, () => ({ h: 0, photos: [] as HalloweenPhoto[] }))
    for (const p of photos) {
      const target = out.reduce((a, b) => (b.h < a.h ? b : a))
      target.photos.push(p)
      target.h += (p.height || 1) / (p.width || 1) + 0.55 + (p.caption ? 0.12 : 0)
    }
    return out
  }, [photos, cols])

  const activeLocation = filter === ALL ? undefined : locationBySlug.get(filter)
  const filterLabel = activeLocation?.name ?? 'All spots'
  const meta = activeLocation
    ? `Photos at ${activeLocation.name}`
    : locations.length
      ? `${locations.length} spot${locations.length === 1 ? '' : 's'}`
      : ' '

  const firstLoad = !photos.length && status === 'loading'
  const firstLoadFailed = !photos.length && status === 'error'
  const isEmpty = !photos.length && status === 'idle'

  return (
    <div className={styles.root}>
      <header className={styles.top}>
        <div>
          <h1 className={styles.topTitle}>Tonight</h1>
          <p className={styles.topMeta}>{meta}</p>
        </div>

        <div className={styles.filter}>
          <button
            ref={filterBtnRef}
            className={`${styles.pill} ${styles.pillDark}`}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            disabled={!locations.length}
          >
            <FilterIcon className={styles.pillIcon} />
            <span>{filterLabel}</span>
            <ChevronDownIcon className={styles.pillChev} />
          </button>
          {menuOpen && (
            <ul ref={menuRef} className={styles.menu} role="listbox" aria-label="Filter by spot" onKeyDown={onMenuKey}>
              <li
                className={styles.menuItem}
                role="option"
                tabIndex={-1}
                aria-selected={filter === ALL}
                onClick={() => chooseFilter(ALL)}
              >
                <span className={styles.menuDot} style={{ background: '#1e1e1e' }}><AllIcon /></span>
                <span className={styles.menuName}>See all spots</span>
                <CheckIcon className={styles.menuCheck} />
              </li>
              <li className={styles.menuSep} role="separator" />
              {locations.map((l) => (
                <li
                  key={l.slug}
                  className={styles.menuItem}
                  role="option"
                  tabIndex={-1}
                  aria-selected={filter === l.slug}
                  onClick={() => chooseFilter(l.slug)}
                >
                  <span className={styles.menuDot} style={{ background: toneOf(l) }}><GlassIcon /></span>
                  <span className={styles.menuName}>{l.name}</span>
                  <CheckIcon className={styles.menuCheck} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <main className={styles.sheetBg}>
        <div className={`${styles.feed} ${ready ? styles.feedReady : ''}`} aria-live="polite" aria-busy={status === 'loading'}>
          {columns.map((col, i) => (
            <div key={i} className={styles.feedCol}>
              {col.photos.map((p) => (
                <PhotoCard
                  key={p.id}
                  photo={p}
                  location={locationBySlug.get(p.location_slug)}
                  now={now}
                  isNew={p.id === newId}
                  canDelete={!!myTokens[p.id]}
                  deleting={deletingId === p.id}
                  onOpen={setLightboxPhoto}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ))}
        </div>

        {isEmpty && (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>
              {activeLocation ? <>Nothing from <em>{activeLocation.name}</em> yet.</> : <>No photos <em>yet</em>.</>}
            </p>
            <p className={styles.emptySub}>Be the first to post tonight.</p>
          </div>
        )}

        {firstLoadFailed ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Couldn&apos;t load photos.</p>
            <button className={styles.moreBtn} onClick={retry}>Try again</button>
          </div>
        ) : (
          (firstLoad || nextCursor || (status === 'error' && photos.length > 0)) && (
            <div ref={sentinelRef} className={styles.more}>
              {status === 'loading' && <span className={styles.spinner} role="status" aria-label="Loading photos" />}
              {status === 'error' && (
                <div>
                  <p className={styles.moreError}>Couldn&apos;t load more photos.</p>
                  <button className={styles.moreBtn} onClick={retry}>Try again</button>
                </div>
              )}
              {status === 'idle' && nextCursor && (
                <button className={styles.moreBtn} onClick={loadMore}>Load more</button>
              )}
            </div>
          )
        )}

        <div className={styles.homeIndicator} aria-hidden="true" />
      </main>

      {pending && (
        <button
          className={styles.newPill}
          onClick={() => {
            applyPending(pending)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          {pending.photos.length === 1 ? '1 new photo' : `${pending.photos.length}${pending.page ? '+' : ''} new photos`} ↑
        </button>
      )}

      <button
        className={styles.fab}
        onClick={() => {
          setMenuOpen(false)
          setSheetOpen(true)
        }}
        disabled={!locations.length}
      >
        <CameraIcon />
        <span>Add your photo</span>
      </button>

      {sheetOpen && (
        <UploadSheet
          locations={locations}
          defaultLocation={scannedLocation}
          scanSpot={scanSpot}
          onClose={() => setSheetOpen(false)}
          onUploaded={onUploaded}
          onToast={showToast}
        />
      )}

      {lightboxPhoto && (
        <Lightbox
          photo={lightboxPhoto}
          spotName={locationBySlug.get(lightboxPhoto.location_slug)?.name ?? 'somewhere'}
          onClose={() => setLightboxPhoto(null)}
        />
      )}

      {toast && (
        <div key={toast.key} className={styles.toast} role="status">
          <span className={styles.chipIcon}><GlassIcon /></span>
          <span>{toast.node}</span>
        </div>
      )}
    </div>
  )
}
