/**
 * ============================================================================
 * PLACEHOLDER DATA — nothing in this file is wired to a real source yet.
 * ============================================================================
 *
 * The place list, weather readout and the day/night edit split are all
 * invented in the websitev3 mockup. None of them exist in the Lookbook backend
 * today, so they ship as typed constants. Lines and songs are real: they come
 * from the backend banks (see ./banks.ts).
 *
 * The palette section is the exception and is NOT here: it derives from real
 * `shades[].hex_code` in ./palette.ts.
 */

export type Place = { id: string; name: string; city: string; colors: string[] };

export const PLACES: Place[] = [
  { id: "l1", name: "Four Barrel Coffee", city: "San Francisco", colors: ["#8A6A4C", "#2A1B12"] },
  { id: "l2", name: "Ritual Coffee Roasters", city: "San Francisco", colors: ["#B0553F", "#2C120C"] },
  { id: "l3", name: "Tartine Bakery", city: "San Francisco", colors: ["#C9A06A", "#2E2013"] },
  { id: "l4", name: "Dolores Park", city: "San Francisco", colors: ["#6E9A5A", "#1B2A16"] },
  { id: "l5", name: "Sightglass", city: "San Francisco", colors: ["#6E7A88", "#191E24"] },
  { id: "l6", name: "The Mill", city: "San Francisco", colors: ["#BE8F63", "#2A1C10"] },
  { id: "l7", name: "Zuni Café", city: "San Francisco", colors: ["#A33F3A", "#28100E"] },
  { id: "l8", name: "Ocean Beach", city: "San Francisco", colors: ["#7FA0B8", "#16232E"] },
  { id: "l9", name: "Ferry Building", city: "San Francisco", colors: ["#9A8C6E", "#241F16"] },
];

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
