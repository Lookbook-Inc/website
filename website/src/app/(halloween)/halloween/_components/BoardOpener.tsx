'use client'

import { useEffect, useMemo, useRef } from 'react'
import { hasSeenOpener, markOpenerSeen } from '@/lib/halloween/storage'
import { HalloweenLocation } from '@/types/halloween-api'
import styles from './halloween.module.css'

const MIN_TILES = 11
/** Longer names lose the spaces around "&", so FRANKO & FRIENDS fits as FRANKO&FRIENDS. */
const COMPACT_OVER = 14
const NAMES_BEFORE_LANDING = 4
const GLYPHS = 'ABCDEFGHIJKLMNOPRSTUW&9'

const FLIP_MS = 40
const STAGGER_MS = 14
const PAUSE_MS = 150
const HOLD_MS = 800
/** Matches the failsafe delay on .opener: by then the board has already taken itself away. */
const FAILSAFE_MS = 8000

/* Keep these in step with the .revealing rules in halloween.module.css. */
const CARD_START_MS = 800
const CARD_STAGGER_MS = 200
const CARD_FADE_MS = 700
const STAGGERED_ROWS = 3

/** Left then right, row by row; cards past the first few rows fade in with the last of them. */
export const revealIndex = (row: number, col: number, cols: number) => Math.min(row * cols + col, cols * STAGGERED_ROWS - 1)
export const revealDuration = (cols: number) => CARD_START_MS + (cols * STAGGERED_ROWS - 1) * CARD_STAGGER_MS + CARD_FADE_MS

const boardText = (name: string) => {
  const text = name.toUpperCase()
  return text.length > COMPACT_OVER ? text.replace(/ & /g, '&') : text
}
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const pick = (from: string) => from[Math.floor(Math.random() * from.length)]
const flip = (tile: HTMLElement, char: string) => {
  tile.textContent = char
  tile.animate(
    [{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-75deg)', filter: 'brightness(.6)' }, { transform: 'rotateX(0deg)' }],
    { duration: 70, easing: 'ease-out' }
  )
}

interface BoardOpenerProps {
  /** The name the board lands on. */
  venue: string
  /** Locations from the server render; their names flip past before it lands. */
  locations: HalloweenLocation[] | null
  /** Play even if this tab has seen it already (preview mode). */
  alwaysPlay: boolean
  /** The page has started appearing, so the board fades out. */
  leaving: boolean
  onReveal: () => void
  onSkip: () => void
}

/**
 * The departure board shown when the page first loads: venue names flip across it, it lands on
 * "your fits at <venue>", then it hands over to the page. It's in the server render so it
 * covers the page from the first paint.
 */
export function BoardOpener({ venue, locations, alwaysPlay, leaving, onReveal, onSkip }: BoardOpenerProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const preRef = useRef<HTMLSpanElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  // Decided once: Strict Mode runs the effect twice, and the first run marks it as seen.
  const shouldPlay = useRef<boolean | null>(null)

  const { target, others, tiles } = useMemo(() => {
    const target = boardText(venue)
    const others = (locations ?? []).map((l) => boardText(l.name)).filter((name) => name !== target)
    return { target, others, tiles: Math.max(MIN_TILES, target.length, ...others.map((name) => name.length)) }
  }, [venue, locations])

  useEffect(() => {
    if (shouldPlay.current === null) {
      shouldPlay.current = performance.now() < FAILSAFE_MS && (alwaysPlay || !hasSeenOpener())
      if (shouldPlay.current) markOpenerSeen()
    }
    if (!shouldPlay.current) {
      onSkip()
      return
    }

    let cancelled = false
    const cells = [...(boardRef.current?.children ?? [])] as HTMLElement[]
    const fit = (text: string) => {
      const left = Math.floor((tiles - text.length) / 2)
      return (' '.repeat(left) + text).padEnd(tiles)
    }
    const land = (text: string) => {
      const row = fit(text)
      cells.forEach((cell, i) => cell.classList.toggle(styles.openerTileHot, row[i] !== ' '))
    }

    rootRef.current?.classList.add(styles.openerLive)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const run = async () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const row = fit(target)
        cells.forEach((cell, i) => { cell.textContent = row[i].trim() })
        land(target)
        if (preRef.current) preRef.current.style.opacity = '1'
      } else {
        const names = [...others].sort(() => Math.random() - 0.5).slice(0, NAMES_BEFORE_LANDING)
        for (const [n, name] of [...names, target].entries()) {
          const row = fit(name)
          await Promise.all(cells.map(async (cell, i) => {
            await wait(i * STAGGER_MS)
            for (let round = 0; round < 2; round++) {
              if (cancelled) return
              flip(cell, pick(GLYPHS))
              await wait(FLIP_MS)
            }
            if (!cancelled) flip(cell, row[i].trim())
          }))
          if (cancelled) return
          if (n === 0) preRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, fill: 'forwards' })
          if (name === target) land(target)
          else await wait(PAUSE_MS)
        }
      }
      await wait(HOLD_MS)
      if (cancelled) return
      document.body.style.overflow = prevOverflow
      onReveal()
    }
    run()

    return () => {
      cancelled = true
      document.body.style.overflow = prevOverflow
    }
  }, [target, others, tiles, alwaysPlay, onReveal, onSkip])

  return (
    <div
      ref={rootRef}
      className={`${styles.opener} ${leaving ? styles.openerOut : ''}`}
      role="img"
      aria-label={`Your fits at ${venue}`}
    >
      <div className={styles.openerWrap}>
        <span ref={preRef} className={styles.openerPre}>your fits at</span>
        <div ref={boardRef} className={styles.openerBoard} style={{ '--tiles': tiles } as React.CSSProperties}>
          {Array.from({ length: tiles }, (_, i) => <span key={i} className={styles.openerTile} />)}
        </div>
      </div>
    </div>
  )
}
