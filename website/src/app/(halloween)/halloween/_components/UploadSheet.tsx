'use client'

import { useEffect, useRef, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { HalloweenApiError, uploadPhoto } from '@/lib/api/halloween'
import { PreparedPhoto, preparePhoto } from '@/lib/halloween/image'
import { loadName, saveName } from '@/lib/halloween/storage'
import { HalloweenLocation, HalloweenUploadResponse } from '@/types/halloween-api'
import { ArrowRightIcon, CameraIcon, GlassIcon, LibraryIcon } from './icons'
import { toneOf } from './PhotoCard'
import styles from './halloween.module.css'

type Step = 'choose' | 'preparing' | 'details'

interface UploadSheetProps {
  locations: HalloweenLocation[]
  /** Location matching the scanned QR code, if any. */
  defaultLocation: string | null
  scanSpot: string | null
  /** A photo already picked outside the sheet; skips the take-or-upload step. */
  initialFile?: File | null
  onClose: () => void
  onUploaded: (photo: HalloweenUploadResponse) => void
  onToast: (message: React.ReactNode) => void
  debugMode?: boolean
}

export function UploadSheet({
  locations,
  defaultLocation,
  scanSpot,
  initialFile = null,
  onClose,
  onUploaded,
  onToast,
  debugMode = false,
}: UploadSheetProps) {
  const posthog = usePostHog()
  const [step, setStep] = useState<Step>(initialFile ? 'preparing' : 'choose')
  const [closing, setClosing] = useState(false)
  const [draft, setDraft] = useState<PreparedPhoto | null>(null)
  const [location, setLocation] = useState<string | null>(defaultLocation)
  const [name, setName] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const sheetRef = useRef<HTMLElement>(null)

  const uploading = progress !== null
  const chosen = locations.find((l) => l.slug === location)

  // Prefill the name people used last time.
  useEffect(() => setName(loadName()), [])

  // Free the preview's memory when it's replaced or the sheet goes away.
  useEffect(() => {
    if (!draft) return
    return () => URL.revokeObjectURL(draft.previewUrl)
  }, [draft])

  const dismiss = () => {
    setClosing(true)
    setTimeout(onClose, 260)
  }

  const close = () => {
    if (uploading || closing) return
    dismiss()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    sheetRef.current?.scrollTo({ top: 0 })
  }, [step])

  const prepare = async (file: File) => {
    setStep('preparing')
    setError(null)
    try {
      setDraft(await preparePhoto(file))
      setStep('details')
    } catch {
      setStep('choose')
      onToast("Couldn't read that photo — try another.")
    }
  }

  const onFile = (input: HTMLInputElement) => {
    const file = input.files?.[0]
    input.value = ''
    if (file) prepare(file)
  }

  // Runs once per picked file, even when development mode mounts effects twice.
  const preparedInitial = useRef<File | null>(null)
  useEffect(() => {
    if (!initialFile || preparedInitial.current === initialFile) return
    preparedInitial.current = initialFile
    prepare(initialFile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFile])

  const post = async () => {
    if (!draft || !chosen || uploading) return
    setError(null)
    setProgress(0)
    saveName(name.trim())

    const analytics = {
      location_slug: chosen.slug,
      scan_spot: scanSpot,
      changed_from_scan: !!defaultLocation && defaultLocation !== chosen.slug,
    }
    if (!debugMode) posthog?.capture('halloween_upload_started', analytics)

    try {
      const photo = debugMode ? await new Promise<HalloweenUploadResponse>((resolve) => {
        setTimeout(() => resolve({
          id: `debug-upload-${crypto.randomUUID()}`,
          image_url: URL.createObjectURL(draft.blob),
          width: draft.width,
          height: draft.height,
          location_slug: chosen.slug,
          display_name: name.trim() || null,
          created_at: new Date().toISOString(),
        }), 350)
      }) : await uploadPhoto(
        {
          photo: draft.blob,
          locationSlug: chosen.slug,
          scanSpot,
          displayName: name.trim(),
        },
        setProgress
      )
      if (!debugMode) posthog?.capture('halloween_uploaded', { ...analytics, photo_id: photo.id })
      onUploaded(photo)
      onToast(<>Posted to <em>{chosen.name}</em></>)
      setProgress(null)
      dismiss()
    } catch (err) {
      const status = err instanceof HalloweenApiError ? err.status : -1
      if (!debugMode) posthog?.capture('halloween_upload_failed', { ...analytics, status })
      // Keep the draft so they can just tap Post again.
      setError(err instanceof Error ? err.message : 'Upload failed — try again.')
      setProgress(null)
    }
  }

  let postLabel = 'Choose a spot to post'
  if (progress !== null) postLabel = progress < 1 ? `Uploading ${Math.round(progress * 100)}%` : 'Finishing up'
  else if (error && chosen) postLabel = 'Try again'
  else if (chosen) postLabel = `Post to ${chosen.name}`

  return (
    <>
      <div className={styles.scrim} onClick={close} />
      <section
        ref={sheetRef}
        className={`${styles.sheet} ${closing ? styles.sheetClosing : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="halloweenSheetTitle"
      >
        <div className={styles.sheetGrab} aria-hidden="true" />

        {step === 'choose' && (
          <div className={styles.step}>
            <h2 className={styles.sheetTitle} id="halloweenSheetTitle">Add to the feed</h2>
            <p className={styles.sheetSub}>Snap one now, or pick one you already took.</p>

            <div className={styles.choices}>
              <label className={styles.choice}>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => onFile(e.currentTarget)}
                />
                <span className={styles.choiceIcon}><CameraIcon strokeWidth={1.6} /></span>
                <span className={styles.choiceText}>
                  <span className={styles.choiceLabel}>Take a photo</span>
                  <span className={styles.choiceHint}>Opens your camera</span>
                </span>
                <ArrowRightIcon className={styles.choiceArrow} />
              </label>

              <label className={styles.choice}>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={(e) => onFile(e.currentTarget)}
                />
                <span className={styles.choiceIcon}><LibraryIcon /></span>
                <span className={styles.choiceText}>
                  <span className={styles.choiceLabel}>Upload from library</span>
                  <span className={styles.choiceHint}>Choose from your camera roll</span>
                </span>
                <ArrowRightIcon className={styles.choiceArrow} />
              </label>
            </div>

            <button className={styles.linkBtn} onClick={close}>Not now</button>
          </div>
        )}

        {step === 'preparing' && (
          <div className={styles.preparing} role="status">
            <span className={styles.spinner} />
            Getting your photo ready…
          </div>
        )}

        {step === 'details' && draft && (
          <div className={styles.step}>
            <h2 className="sr-only" id="halloweenSheetTitle">Post your photo</h2>
            <div className={styles.preview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.previewUrl} alt="Your photo" />
              <button className={styles.previewRetake} onClick={() => setStep('choose')} disabled={uploading}>
                Retake
              </button>
            </div>

            <h3 className={styles.fieldTitle}>Where are you tonight?</h3>
            <div className={styles.spots} role="radiogroup" aria-label="Choose your spot">
              {locations.map((l) => (
                <button
                  key={l.slug}
                  type="button"
                  className={styles.spotOpt}
                  role="radio"
                  aria-checked={location === l.slug}
                  onClick={() => setLocation(l.slug)}
                  disabled={uploading}
                >
                  <span className={styles.menuDot} style={{ background: toneOf(l) }}><GlassIcon /></span>
                  <span className={styles.spotOptName}>{l.name}</span>
                </button>
              ))}
            </div>

            <div className={styles.fields}>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Your name</span>
                <input
                  type="text"
                  maxLength={24}
                  placeholder="Optional"
                  autoComplete="given-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={uploading}
                />
              </label>
            </div>

            <p className={styles.publicNote}>Your photo and name, if provided, will be visible to everyone on this page.</p>

            {error && <p className={styles.uploadError} role="alert">{error}</p>}

            <button
              className={`${styles.primary} ${uploading ? styles.primaryLoading : ''}`}
              onClick={post}
              disabled={!chosen || uploading}
            >
              {progress !== null && <span className={styles.primaryProgress} style={{ width: `${progress * 100}%` }} />}
              <span className={styles.primaryLabel} aria-live="polite">{postLabel}</span>
            </button>
          </div>
        )}
      </section>
    </>
  )
}
