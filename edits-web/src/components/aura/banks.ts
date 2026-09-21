/**
 * ============================================================================
 * LINE + SONG BANKS
 * ============================================================================
 *
 * Both banks come from the Lookbook backend (`banks_edits_lines` and
 * `banks_songs`, served by `GET /web/v1/banks/*`). They are loaded once on the
 * server in `app/(app)/page.tsx` and passed down, so the editor only ever offers
 * what is in the banks. Nothing is hard-coded here.
 */

import type { BankSong, EditLine } from "@/types/api";
import { hash } from "./palette";

export type Line = EditLine;
export type Song = BankSong;

/**
 * Gradient pairs for a song whose cover is missing or fails to load. The pair
 * is picked from the song id, so a song always falls back to the same art.
 */
const COVER_FALLBACKS = [
  ["#E8552F", "#2A1008"],
  ["#5C8FD6", "#131B33"],
  ["#8E6FB8", "#1B1230"],
  ["#D95F84", "#2A0F1C"],
  ["#3E8C7E", "#0D1F1C"],
  ["#C8A25E", "#241A0C"],
];

export function songColors(song: Song) {
  return COVER_FALLBACKS[hash(song.id) % COVER_FALLBACKS.length];
}

/** A random entry, or `fallback` when the bank came back empty. */
export function pickRandom<T>(list: T[], fallback: T): T {
  return list.length ? list[Math.floor(Math.random() * list.length)] : fallback;
}
