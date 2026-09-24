/**
 * ============================================================================
 * LINE, SONG + PLACE BANKS
 * ============================================================================
 *
 * All three banks come from the Lookbook backend (`banks_edits_lines`,
 * `banks_songs` and `banks_places`, served by `GET /web/v1/banks/*`). They are loaded once on the
 * server in `app/(app)/page.tsx` and passed down, so the editor only ever offers
 * what is in the banks. Nothing is hard-coded here.
 */

import type { BankPlace, BankSong, EditLine } from "@/types/api";
import { hash } from "./palette";

export type Line = EditLine;
export type Song = BankSong;
export type Place = BankPlace;

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

/** Fallback art for a place with no usable photo, picked from its id. */
const PLACE_FALLBACKS = [
  ["#8A6A4C", "#2A1B12"],
  ["#B0553F", "#2C120C"],
  ["#6E9A5A", "#1B2A16"],
  ["#6E7A88", "#191E24"],
  ["#A33F3A", "#28100E"],
  ["#7FA0B8", "#16232E"],
];

export function placeColors(place: Place) {
  return PLACE_FALLBACKS[hash(place.id) % PLACE_FALLBACKS.length];
}

/** The first validated photo with a signed URL; unreviewed photos never go on a card. */
export function placePhotoUrl(place: Place) {
  return place.photos.find((photo) => photo.review_status === "validated" && photo.image_url)?.image_url ?? null;
}

/** A random entry, or `fallback` when the bank came back empty. */
export function pickRandom<T>(list: T[], fallback: T): T {
  return list.length ? list[Math.floor(Math.random() * list.length)] : fallback;
}
