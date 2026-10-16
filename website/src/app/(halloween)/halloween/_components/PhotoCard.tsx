'use client'

import { HalloweenLocation, HalloweenPhoto } from '@/types/halloween-api'
import { GlassIcon, TrashIcon } from './icons'
import styles from './halloween.module.css'

const DEFAULT_TONE = '#3e2a20'
const isHex = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)

export const toneOf = (location: HalloweenLocation | undefined) =>
  isHex(location?.tone) ? location.tone : DEFAULT_TONE

export function timeAgo(createdAt: string, now: number) {
  const m = Math.max(0, Math.round((now - Date.parse(createdAt)) / 60000))
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

interface PhotoCardProps {
  photo: HalloweenPhoto
  location: HalloweenLocation | undefined
  now: number
  isNew: boolean
  canDelete: boolean
  deleting: boolean
  onOpen: (photo: HalloweenPhoto) => void
  onDelete: (photo: HalloweenPhoto) => void
}

export function PhotoCard({ photo, location, now, isNew, canDelete, deleting, onOpen, onDelete }: PhotoCardProps) {
  const name = photo.display_name || 'Someone'
  const spotName = location?.name ?? 'somewhere'

  return (
    <article className={`${styles.card} ${isNew ? styles.cardNew : ''}`}>
      <div className={styles.cardHead}>
        <span className={styles.avatar} style={{ background: toneOf(location) }} />
        <div style={{ minWidth: 0 }}>
          <h2 className={styles.cardName}>{name}</h2>
          <div className={styles.cardTime} suppressHydrationWarning>
            {timeAgo(photo.created_at, now)}
          </div>
        </div>
        {canDelete && (
          <button
            className={styles.cardDelete}
            onClick={() => onDelete(photo)}
            disabled={deleting}
            aria-label="Delete your photo"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <div className={styles.cardAt}>
        <span className={styles.chipIcon} style={{ background: toneOf(location) }}>
          <GlassIcon />
        </span>
        <div className={styles.cardAtText}>
          <div className={styles.cardSpot}>
            at <b>{spotName}</b>
          </div>
        </div>
      </div>

      <button className={styles.cardPhoto} onClick={() => onOpen(photo)} aria-label={`View photo by ${name}`}>
        {/* Backend-hosted thumbnails; next/image would re-optimize already-sized images. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.thumb_url || photo.image_url}
          alt={`Photo by ${name} at ${spotName}`}
          loading="lazy"
          decoding="async"
          width={photo.width}
          height={photo.height}
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        />
      </button>

    </article>
  )
}
