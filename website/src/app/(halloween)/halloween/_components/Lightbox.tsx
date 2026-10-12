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

  return (
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo by ${name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button className={styles.lightboxClose} aria-label="Close" onClick={onClose} autoFocus>
        <CloseIcon />
      </button>
      <figure className={styles.lightboxFig}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.image_url} alt={`Photo by ${name} at ${spotName}`} width={photo.width} height={photo.height} />
        <figcaption>
          <b>{name}</b> &nbsp;at {spotName}
          {photo.caption && <> — <i>{photo.caption}</i></>}
        </figcaption>
      </figure>
    </div>
  )
}
