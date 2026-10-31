'use client'

import { useEffect, useRef, useState } from 'react'
import { PreparedPhoto, preparePhoto } from '@/lib/halloween/image'
import { loadName, saveName } from '@/lib/halloween/storage'
import { HalloweenLocation } from '@/types/halloween-api'
import { CheckIcon, ChevronDownIcon, GlassIcon, PencilIcon } from './icons'
import { toneOf } from './PhotoCard'
import styles from './halloween.module.css'

/** No `capture`, so the phone offers its own menu of photo library and camera. */
export const PHOTO_ACCEPT = 'image/*,.heic,.heif'

export interface UploadSheetStart {
  /** A photo just picked with an "Add your look" button. */
  file?: File
  /** A post that was canceled, reopened as it was. */
  draft?: PreparedPhoto
  locationSlug?: string
  displayName?: string
}

interface UploadSheetProps {
  locations: HalloweenLocation[]
  /** Location the post goes to unless they change it, if any. */
  defaultLocation: string | null
  /** Location matching the scanned QR code, if any. */
  scannedLocation: string | null
  start: UploadSheetStart
  onClose: () => void
  onPost: (draft: PreparedPhoto, locationSlug: string, displayName: string) => void
  onToast: (message: React.ReactNode) => void
}

/** The "check your card" screen: the photo as it will appear, its name, its venue, and Post. */
export function UploadSheet({ locations, defaultLocation, scannedLocation, start, onClose, onPost, onToast }: UploadSheetProps) {
  const [closing, setClosing] = useState(false)
  const [draft, setDraft] = useState<PreparedPhoto | null>(start.draft ?? null)
  const [preparing, setPreparing] = useState(false)
  const [location, setLocation] = useState<string | null>(start.locationSlug ?? defaultLocation)
  const [name, setName] = useState(start.displayName ?? '')
  const [menuOpen, setMenuOpen] = useState(false)
  const screenRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLDivElement>(null)
  const prepareId = useRef(0)

  const chosen = locations.find((l) => l.slug === location)

  // Prefill the name people used last time.
  useEffect(() => {
    if (start.displayName === undefined) setName(loadName())
  }, [start.displayName])

  // The keyboard shrinks only the visual viewport on iOS. Follow it so Post stays above the keyboard.
  useEffect(() => {
    const viewport = window.visualViewport
    const el = screenRef.current
    if (!viewport || !el) return
    const sync = () => {
      el.style.setProperty('--viewport-h', `${viewport.height}px`)
      el.style.setProperty('--viewport-top', `${viewport.offsetTop}px`)
    }
    sync()
    viewport.addEventListener('resize', sync)
    viewport.addEventListener('scroll', sync)
    return () => {
      viewport.removeEventListener('resize', sync)
      viewport.removeEventListener('scroll', sync)
    }
  }, [])

  const close = () => {
    if (closing) return
    setClosing(true)
    prepareId.current += 1
    setTimeout(() => {
      // Posting keeps the preview; closing without posting is the end of it.
      if (draft) URL.revokeObjectURL(draft.previewUrl)
      onClose()
    }, 260)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (menuOpen) setMenuOpen(false)
      else close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  const prepare = async (file: File) => {
    const id = ++prepareId.current
    setPreparing(true)
    try {
      const prepared = await preparePhoto(file)
      if (id !== prepareId.current) {
        URL.revokeObjectURL(prepared.previewUrl)
        return
      }
      if (draft) URL.revokeObjectURL(draft.previewUrl)
      setDraft(prepared)
    } catch {
      if (id !== prepareId.current) return
      onToast("Couldn't read that photo — try another.")
      if (!draft) onClose()
    } finally {
      if (id === prepareId.current) setPreparing(false)
    }
  }

  // Runs once per picked file, even when development mode mounts effects twice.
  const preparedInitial = useRef<File | null>(null)
  useEffect(() => {
    if (!start.file || preparedInitial.current === start.file) return
    preparedInitial.current = start.file
    prepare(start.file)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.file])

  const post = () => {
    if (!draft || preparing) return
    if (!chosen) {
      setMenuOpen(true)
      return
    }
    const trimmed = name.trim()
    saveName(trimmed)
    onPost(draft, chosen.slug, trimmed)
  }

  const chooseSpot = (slug: string) => {
    setLocation(slug)
    setMenuOpen(false)
  }

  return (
    <>
      <div className={styles.scrim} onClick={close} />
      <section
        ref={screenRef}
        className={`${styles.compose} ${closing ? styles.composeClosing : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Check your card"
        onClick={(e) => {
          if (menuOpen && !navRef.current?.contains(e.target as Node)) setMenuOpen(false)
        }}
      >
        <div ref={navRef} className={styles.composeNav}>
          <button className={styles.composeSide} onClick={close}>Cancel</button>
          <div className={styles.composeTitle}>
            <span className={styles.composePre}>Lookbook at</span>
            <button
              className={styles.composeVenue}
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span>{chosen?.name ?? 'Choose a spot'}</span>
              <span className="sr-only">, change spot</span>
              <ChevronDownIcon className={styles.venueChev} />
            </button>
          </div>
          <label className={`${styles.composeSide} ${styles.composeReplace}`}>
            <input
              className={styles.fileInput}
              type="file"
              accept={PHOTO_ACCEPT}
              aria-label="Replace this photo"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0]
                e.currentTarget.value = ''
                if (file) prepare(file)
              }}
            />
            Replace
          </label>
          {menuOpen && (
            <ul className={`${styles.menu} ${styles.composeMenu}`} role="listbox" aria-label="Choose a spot">
              {locations.map((l) => (
                <li
                  key={l.slug}
                  className={styles.menuItem}
                  role="option"
                  tabIndex={0}
                  aria-selected={location === l.slug}
                  onClick={() => chooseSpot(l.slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      chooseSpot(l.slug)
                    }
                  }}
                >
                  <span className={styles.menuDot} style={{ background: toneOf(l) }}><GlassIcon /></span>
                  <span className={styles.menuName}>{l.name}</span>
                  {l.slug === scannedLocation && <span className={styles.menuHere}>You’re here</span>}
                  <CheckIcon className={styles.menuCheck} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.composeStage}>
          {draft ? (
            <div className={styles.composeCard}>
              <div
                className={styles.composePhoto}
                style={{ aspectRatio: `${draft.width} / ${draft.height}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={draft.previewUrl} alt="Your photo" />
              </div>
              <label className={styles.composeName}>
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Your name, or Anonymous"
                  aria-label="Your name, optional"
                  autoComplete="given-name"
                  enterKeyHint="done"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                  }}
                />
                <PencilIcon />
              </label>
            </div>
          ) : (
            <div className={styles.preparing} role="status">
              <span className={styles.spinner} />
              Getting your photo ready…
            </div>
          )}
        </div>

        <p className={styles.publicLine}><b>Public.</b> Anyone can see your photo and name.</p>

        <button className={styles.primary} onClick={post} disabled={!draft || preparing}>
          {chosen ? `Post to ${chosen.name}` : 'Choose a spot to post'}
        </button>
      </section>
    </>
  )
}
