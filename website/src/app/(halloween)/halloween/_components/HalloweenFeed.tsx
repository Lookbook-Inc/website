'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { deletePhoto, getLocations, getPhotos } from '@/lib/api/halloween'
import { getDebugPhotos } from '@/lib/halloween/debug'
import { PreparedPhoto } from '@/lib/halloween/image'
import type { Weather } from '@/lib/halloween/weather'
import { loadDeleteTokens, saveDeleteTokens } from '@/lib/halloween/storage'
import {
  HalloweenLocation,
  HalloweenPhoto,
  HalloweenPhotoPage,
  HalloweenUploadResponse,
} from '@/types/halloween-api'
import { AllIcon, CheckIcon, ChevronDownIcon, GlassIcon, PlusIcon } from './icons'
import { Lightbox } from './Lightbox'
import { BoardOpener, revealDuration, revealIndex } from './BoardOpener'
import { OtherSpotsFeed } from './OtherSpotsFeed'
import { PendingCard, PhotoCard, toneOf } from './PhotoCard'
import { PHOTO_ACCEPT, UploadSheet, UploadSheetStart } from './UploadSheet'
import { PostDraft, usePhotoPost } from './usePhotoPost'
import styles from './halloween.module.css'

const ALL = 'all'
/** What the header, board and menu call the feed of every spot. */
const ALL_LABEL = 'San Francisco'
const todayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })
const NEW_PHOTO_POLL_MS = 20_000
/** Only drop new photos straight in when the visitor is looking at the top of the feed. */
const NEAR_TOP_PX = 120
const UNDO_MS = 6_000
const PENDING_ID = 'pending-post'

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
  /** The spot the first page was loaded for (the scanned spot, if it's a known location). */
  initialFilter: string | null
  /** San Francisco's current weather; the header shows the date alone without it. */
  weather: Weather | null
  debugMode?: boolean
}

const colCountFor = (width: number) => (width >= 1080 ? 4 : width >= 760 ? 3 : 2)
const byNewest = (a: HalloweenPhoto, b: HalloweenPhoto) => Date.parse(b.created_at) - Date.parse(a.created_at)

function mergeUnique(first: HalloweenPhoto[], second: HalloweenPhoto[]) {
  const seen = new Set<string>()
  return [...first, ...second].filter((p) => !seen.has(p.id) && !!seen.add(p.id))
}

export function HalloweenFeed({
  initialLocations,
  initialPage,
  scanSpot,
  initialFilter,
  weather,
  debugMode = false,
}: HalloweenFeedProps) {
  const posthog = usePostHog()

  const [locations, setLocations] = useState<HalloweenLocation[]>(initialLocations ?? [])
  const [filter, setFilter] = useState(initialFilter ?? ALL)
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
  /** What the "check your card" screen opens with, while it's open. */
  const [sheet, setSheet] = useState<UploadSheetStart | null>(null)
  /** Just posted: the window for undoing it. */
  const [posted, setPosted] = useState<{ photo: HalloweenPhoto; token: string | null } | null>(null)
  const [showFab, setShowFab] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<HalloweenPhoto | null>(null)
  const [toast, setToast] = useState<{ key: number; node: React.ReactNode } | null>(null)
  /** The departure board, then the page fading in, then the page as normal. */
  const [opening, setOpening] = useState<'board' | 'reveal' | 'done'>('board')

  // Bumped on every list request so a slow response for an old filter can't overwrite a newer one.
  const requestId = useRef(0)
  const photosRef = useRef(photos)
  photosRef.current = photos
  const filterRef = useRef(filter)
  filterRef.current = filter
  const overlayOpenRef = useRef(false)
  overlayOpenRef.current = !!sheet || !!lightboxPhoto

  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const uploadRowRef = useRef<HTMLDivElement>(null)
  const debugUploads = useRef<HalloweenPhoto[]>([])
  const objectUrls = useRef<string[]>([])

  const locationBySlug = useMemo(() => new Map(locations.map((l) => [l.slug, l])), [locations])
  const scannedLocation = scanSpot && locationBySlug.has(scanSpot) ? scanSpot : null
  // Posts go to the spot being viewed; on San Francisco they default to the scanned one.
  const uploadTarget = filter !== ALL && locationBySlug.has(filter) ? filter : scannedLocation

  /* ───────────── Opener ───────────── */
  const initialVenue = initialLocations?.find((l) => l.slug === initialFilter)?.name ?? ALL_LABEL
  const revealPage = useCallback(() => setOpening('reveal'), [])
  const skipOpener = useCallback(() => setOpening('done'), [])
  useEffect(() => {
    if (opening !== 'reveal') return
    const t = setTimeout(() => setOpening('done'), revealDuration(cols))
    return () => clearTimeout(t)
  }, [opening, cols])

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

  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), [])

  const viewTracked = useRef(false)
  useEffect(() => {
    if (debugMode || !posthog || viewTracked.current) return
    viewTracked.current = true
    posthog.capture('halloween_viewed', { scan_spot: scanSpot })
  }, [posthog, scanSpot, debugMode])

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
    if (!sheet && !lightboxPhoto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sheet, lightboxPhoto])

  /* ───────────── Loading ───────────── */
  const loadFirstPage = useCallback(async (location: string) => {
    const req = ++requestId.current
    setStatus('loading')
    setPending(null)
    try {
      const page = debugMode
        ? getDebugPhotos(location === ALL ? null : location, debugUploads.current)
        : await getPhotos({ location: location === ALL ? null : location })
      if (req !== requestId.current) return
      setPhotos(page.photos)
      setNextCursor(page.next_cursor)
      setStatus('idle')
    } catch {
      if (req === requestId.current) setStatus('error')
    }
  }, [debugMode])

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
    if (!initialPage) loadFirstPage(initialFilter ?? ALL)
  }, [initialLocations, initialPage, initialFilter, loadFirstPage])

  // Once the header's upload buttons scroll away, a floating one takes over.
  useEffect(() => {
    const el = uploadRowRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => setShowFab(!entries[0]?.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
    if (debugMode) return
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
  }, [applyPending, debugMode])

  /* ───────────── Filter ───────────── */
  const switchFilter = (slug: string) => {
    setFilter(slug)
    setPhotos([])
    setNextCursor(null)
    loadFirstPage(slug)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseFilter = (slug: string) => {
    setMenuOpen(false)
    filterBtnRef.current?.focus()
    if (slug !== filter) switchFilter(slug)
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
  const onPosted = (photo: HalloweenUploadResponse, { draft }: PostDraft) => {
    const { delete_token, ...saved } = photo
    let token: string | null = delete_token ?? null
    if (debugMode) {
      debugUploads.current.unshift(saved)
      if (saved.image_url.startsWith('blob:')) objectUrls.current.push(saved.image_url)
      token = 'debug'
      setMyTokens((prev) => ({ ...prev, [saved.id]: 'debug' }))
    } else if (token) {
      const tokens = { ...loadDeleteTokens(), [saved.id]: token }
      saveDeleteTokens(tokens)
      setMyTokens(tokens)
    }
    // Keep showing the local copy so the card doesn't blink while the hosted one loads.
    objectUrls.current.push(draft.previewUrl)
    const shown = { ...saved, thumb_url: draft.previewUrl }
    setNewId(saved.id)
    if (filterRef.current === ALL || filterRef.current === saved.location_slug) {
      setPhotos((prev) => mergeUnique([shown], prev))
    }
    setPosted({ photo: shown, token })
  }

  const { post, start: startPost, retry: retryPost, stop: stopPost } = usePhotoPost({
    scanSpot: scannedLocation,
    debugMode,
    onPosted,
  })

  useEffect(() => {
    if (!posted) return
    const t = setTimeout(() => setPosted(null), UNDO_MS)
    return () => clearTimeout(t)
  }, [posted])

  const openSheet = (file: File) => {
    setMenuOpen(false)
    setPosted(null)
    setSheet({ file })
  }

  const onPicked = (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = ''
    if (file) openSheet(file)
  }

  const onPost = (draft: PreparedPhoto, locationSlug: string, displayName: string) => {
    setSheet(null)
    if (filter !== ALL && filter !== locationSlug) switchFilter(locationSlug)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    startPost({ draft, locationSlug, displayName, changedFromScan: !!uploadTarget && uploadTarget !== locationSlug })
  }

  // Back to the card with everything kept.
  const cancelPost = () => {
    const stopped = stopPost()
    if (stopped) setSheet({ draft: stopped.draft, locationSlug: stopped.locationSlug, displayName: stopped.displayName })
  }

  const discardPost = () => {
    const stopped = stopPost()
    if (stopped) URL.revokeObjectURL(stopped.draft.previewUrl)
  }

  const removeMine = async (photo: HalloweenPhoto, token: string, doneMessage: string) => {
    if (debugMode) {
      debugUploads.current = debugUploads.current.filter((item) => item.id !== photo.id)
      setMyTokens((prev) => {
        const next = { ...prev }
        delete next[photo.id]
        return next
      })
      setPhotos((prev) => prev.filter((item) => item.id !== photo.id))
      showToast(doneMessage)
      return true
    }
    setDeletingId(photo.id)
    try {
      await deletePhoto(photo.id, token)
      const rest = Object.fromEntries(Object.entries(loadDeleteTokens()).filter(([id]) => id !== photo.id))
      saveDeleteTokens(rest)
      setMyTokens(rest)
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id))
      posthog?.capture('halloween_photo_deleted', { photo_id: photo.id })
      showToast(doneMessage)
      return true
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Couldn't delete that")
      return false
    } finally {
      setDeletingId(null)
    }
  }

  const onDelete = async (photo: HalloweenPhoto) => {
    const token = myTokens[photo.id]
    if (!token || !window.confirm("Delete your photo from the feed? This can't be undone.")) return false
    return removeMine(photo, token, 'Photo deleted')
  }

  const undoPost = () => {
    if (!posted?.token) return
    removeMine(posted.photo, posted.token, 'Removed from the Lookbook')
    setPosted(null)
  }

  /* ───────────── Render ───────────── */
  // The visitor's own photo holds the first slot while it posts, if it belongs in this feed.
  const pendingDraft = post && (filter === ALL || filter === post.locationSlug) ? post.draft : null
  const pendingSlug = post?.locationSlug
  const pendingName = post?.displayName
  const pendingPhoto = useMemo<HalloweenPhoto | null>(() => pendingDraft && pendingSlug ? {
    id: PENDING_ID,
    image_url: pendingDraft.previewUrl,
    width: pendingDraft.width,
    height: pendingDraft.height,
    location_slug: pendingSlug,
    display_name: pendingName || null,
    created_at: '',
  } : null, [pendingDraft, pendingSlug, pendingName])

  // Shortest-column-first masonry, measured in "width units" (image ratio + card chrome).
  const columns = useMemo(() => {
    const out = Array.from({ length: cols }, () => ({ h: 0, photos: [] as HalloweenPhoto[] }))
    for (const p of pendingPhoto ? [pendingPhoto, ...photos] : photos) {
      const target = out.reduce((a, b) => (b.h < a.h ? b : a))
      target.photos.push(p)
      target.h += (p.height || 1) / (p.width || 1) + 0.2
    }
    return out
  }, [photos, pendingPhoto, cols])

  const activeLocation = filter === ALL ? undefined : locationBySlug.get(filter)
  const venueLabel = activeLocation?.name ?? ALL_LABEL
  const canPost = locations.length > 0 && !post
  const postSpot = post && locationBySlug.get(post.locationSlug)?.name
  const postedSpot = posted && locationBySlug.get(posted.photo.location_slug)?.name

  const firstLoad = !photos.length && status === 'loading'
  const firstLoadFailed = !photos.length && status === 'error'
  const isEmpty = !photos.length && !pendingPhoto && status === 'idle'

  return (
    <div className={`${styles.root} ${opening === 'reveal' ? styles.revealing : ''}`}>
      {opening !== 'done' && (
        <BoardOpener
          venue={initialVenue}
          locations={initialLocations}
          alwaysPlay={debugMode}
          leaving={opening === 'reveal'}
          onReveal={revealPage}
          onSkip={skipOpener}
        />
      )}
      {debugMode && <div className={styles.debugBanner}>Preview mode · sample photos · uploads stay in this tab</div>}
      <header className={styles.top}>
        <div className={styles.filter}>
          <p className={styles.today}>
            <b suppressHydrationWarning>{todayFormat.format(now)}</b>
            {weather && <span>{weather.tempF}° {weather.summary}</span>}
          </p>
          <h1 className={styles.title}>
            <span className={styles.titlePre}>Lookbook at</span>{' '}
            <button
              ref={filterBtnRef}
              className={styles.venueBtn}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              disabled={!locations.length}
            >
              <span>{venueLabel}</span>
              <span className="sr-only">, change spot</span>
              <ChevronDownIcon className={styles.venueChev} />
            </button>
          </h1>
          {menuOpen && (
            <ul ref={menuRef} className={styles.menu} role="listbox" aria-label="Choose a spot" onKeyDown={onMenuKey}>
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
                  {l.slug === scannedLocation && <span className={styles.menuHere}>You’re here</span>}
                  <CheckIcon className={styles.menuCheck} />
                </li>
              ))}
              <li className={styles.menuSep} role="separator" />
              <li
                className={styles.menuItem}
                role="option"
                tabIndex={-1}
                aria-selected={filter === ALL}
                onClick={() => chooseFilter(ALL)}
              >
                <span className={styles.menuDot} style={{ background: '#3a332e' }}><AllIcon /></span>
                <span className={styles.menuName}>{ALL_LABEL}</span>
                <CheckIcon className={styles.menuCheck} />
              </li>
            </ul>
          )}
        </div>

        <div ref={uploadRowRef} className={styles.upRow}>
          <label className={`${styles.addBtn} ${canPost ? '' : styles.isDisabled}`}>
            <input
              className={styles.fileInput}
              type="file"
              accept={PHOTO_ACCEPT}
              disabled={!canPost}
              onChange={(e) => onPicked(e.currentTarget)}
            />
            <PlusIcon />
            <span>Add your look</span>
          </label>
        </div>
      </header>

      <main className={styles.feedWrap}>
        <div className={`${styles.feed} ${ready ? styles.feedReady : ''}`} aria-live="polite" aria-busy={status === 'loading'}>
          {columns.map((col, i) => (
            <div key={i} className={styles.feedCol}>
              {col.photos.map((p, row) => p.id === PENDING_ID && post ? (
                <PendingCard key={p.id} photo={p} phase={post.phase} progress={post.progress} />
              ) : (
                <PhotoCard
                  key={p.id}
                  photo={p}
                  location={locationBySlug.get(p.location_slug)}
                  showSpot={filter === ALL}
                  now={now}
                  isNew={p.id === newId}
                  revealIndex={revealIndex(row, i, cols)}
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

        {filter !== ALL && !nextCursor && status === 'idle' && (
          <OtherSpotsFeed
            key={filter}
            location={filter}
            locations={locationBySlug}
            cols={cols}
            now={now}
            myTokens={myTokens}
            deletingId={deletingId}
            onOpen={setLightboxPhoto}
            onDelete={onDelete}
            debugMode={debugMode}
          />
        )}
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

      <label
        className={`${styles.fab} ${showFab && !sheet && !post && !posted ? styles.fabShow : ''}`}
        aria-hidden={!showFab}
      >
        <input
          className={styles.fileInput}
          type="file"
          accept={PHOTO_ACCEPT}
          disabled={!canPost || !showFab}
          onChange={(e) => onPicked(e.currentTarget)}
        />
        <PlusIcon />
        <span>Add your look</span>
      </label>

      {post && !sheet && (
        <div className={styles.postBar} role="status">
          {post.phase === 'failed' ? (
            <>
              <span className={styles.postBarText}>Nothing was shared. {post.error}</span>
              <button className={styles.postBarQuiet} onClick={discardPost}>Discard</button>
              <button className={styles.postBarBtn} onClick={retryPost}>Try again</button>
            </>
          ) : (
            <>
              <span className={styles.postBarText}>
                {post.phase === 'waiting'
                  ? 'No signal. It will post once you’re back online. Keep this page open.'
                  : `Posting to ${postSpot ?? 'your spot'}. Keep this page open.`}
              </span>
              {/* Once the whole photo is sent the post may already be live, so it's too late to cancel. */}
              {post.phase !== 'finishing' && (
                <button className={styles.postBarQuiet} onClick={cancelPost}>Cancel</button>
              )}
            </>
          )}
        </div>
      )}

      {posted && !post && !sheet && (
        <div className={styles.postBar} role="status">
          <span className={styles.postBarText}>Posted to {postedSpot ?? 'your spot'}.</span>
          {posted.token && <button className={styles.postBarBtn} onClick={undoPost}>Undo</button>}
        </div>
      )}

      {sheet && (
        <UploadSheet
          locations={locations}
          defaultLocation={uploadTarget}
          scannedLocation={scannedLocation}
          start={sheet}
          onClose={() => setSheet(null)}
          onPost={onPost}
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
