/**
 * ============================================================================
 * PLACEHOLDER DATA — nothing in this file is wired to a real source yet.
 * ============================================================================
 *
 * Weather and the day/night edit split are invented in the websitev3 mockup.
 * They have no backend source yet, so they ship as typed constants. Lines,
 * songs, and places come from the backend banks (see ./banks.ts).
 *
 * The palette section is the exception and is NOT here: it derives from real
 * `shades[].hex_code` in ./palette.ts.
 */

/**
 * Starting weather. The iOS app reads WeatherKit on-device; the web has no
 * source, so these are the defaults the member edits in section 6.
 */
export const WEATHER = {
  day: { temp: "66°F", sky: "SUNNY" },
  night: { temp: "58°F", sky: "CLEAR" },
} as const;

export const CONDITIONS = [
  "SUNNY", "CLEAR", "PARTLY CLOUDY", "CLOUDY", "OVERCAST", "RAIN",
  "DRIZZLE", "STORMY", "SNOW", "FOGGY", "WINDY", "HAZY", "CRISP", "HUMID",
];

/**
 * Backdrop shades for the blob behind the outfit. The peek strip borrows the
 * other card's — which is what gives the day and night cards their paired look.
 */
export const BLOB_COLORS = [
  { name: "Lilac", hex: "#D9BAE1" },
  { name: "Periwinkle", hex: "#A5AFD3" },
  { name: "Rose", hex: "#EEB6BE" },
  { name: "Peach", hex: "#F2C3A7" },
  { name: "Butter", hex: "#EFDCA0" },
  { name: "Sage", hex: "#BBD0B4" },
  { name: "Mint", hex: "#AEDACB" },
  { name: "Sky", hex: "#AECFE6" },
  { name: "Clay", hex: "#DCA891" },
  { name: "Stone", hex: "#D8D2C7" },
];

/** Backdrop size: the Day tab slider's range and each card's starting size. */
export const BLOB_SIZE = { min: 0.6, max: 1.4, day: 1, night: 1.2 } as const;

export const MAX_PIECES = 6;
