'use client'

import { useEffect } from 'react'
import { HalloweenPhoto } from '@/types/halloween-api'
import { CloseIcon } from './icons'
import styles from './halloween.module.css'

interface LightboxProps {
  photo: HalloweenPhoto
  spotName: string
  onClose: () => void
}

export function Lightbox({ photo, spotName, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const name = photo.display_name || 'Someone'
  // A partial or old response keeps the existing photo view.
  const edit = photo.focus_edit
  const hasEdit = !!edit?.line?.trim() && !!edit.palette?.name?.trim()
    && Array.isArray(edit.palette.colors) && edit.palette.colors.length === 4
    && edit.palette.colors.every((color) => /^#[0-9a-f]{6}$/i.test(color))
  const date = new Date(photo.created_at)
  const localDate = Number.isNaN(date.getTime()) ? null
    : date.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
  // Temporary Halloween weekend forecast, tied to the photo's venue-local date.
  const showWeather = localDate !== null && localDate >= '2026-10-30' && localDate <= '2026-11-01'

  return (
    <div
      className={`${styles.lightbox}${hasEdit ? ` ${styles.lightboxEdit}` : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo by ${name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className={styles.lightboxClose} aria-label="Close" onClick={onClose} autoFocus>
        <CloseIcon />
      </button>
      {hasEdit && edit ? (
        <section className={styles.focusEdit}>
          <h2 className={styles.focusTitle}>{name} at {spotName}.</h2>
          <figure className={styles.focusCard}>
            <div className={styles.focusMeta}>
              {!Number.isNaN(date.getTime()) && (
                <time dateTime={photo.created_at}>
                  {date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/Los_Angeles' })}
                  <br />
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Los_Angeles' })}
                </time>
              )}
              <span>Your edit.</span>
              {showWeather && <span className={styles.focusWeather}>56°F<br />Cloudy</span>}
            </div>
            <p className={styles.focusLine}>{edit.line}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.focusImage}
              src={photo.image_url}
              alt={`Photo by ${name} at ${spotName}`}
              width={photo.width}
              height={photo.height}
            />
            <figcaption className={styles.focusPalette}>
              <p>“{edit.palette.name}”</p>
              <ul aria-label={`${edit.palette.name} color palette`}>
                {edit.palette.colors.map((color, index) => (
                  <li key={`${index}-${color}`} style={{ backgroundColor: color }} aria-label={color} />
                ))}
              </ul>
            </figcaption>
          </figure>
        </section>
      ) : (
        <figure className={styles.lightboxFig}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.image_url} alt={`Photo by ${name} at ${spotName}`} width={photo.width} height={photo.height} />
          <figcaption>
            <b>{name}</b> &nbsp;at {spotName}
          </figcaption>
        </figure>
      )}
    </div>
  )
}
