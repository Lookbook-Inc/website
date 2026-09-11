/**
 * ============================================================================
 * PLACEHOLDER DATA — nothing in this file is wired to a real source yet.
 * ============================================================================
 *
 * The line bank, soundtrack list, place list, weather readout and the
 * day/night edit split are all invented in the websitev3 mockup. None of them
 * exist in the Lookbook backend today, so they ship as typed constants and the
 * UI (search, mood filtering, selection) runs over them exactly as it would
 * over real data.
 *
 * Replacing any of these means swapping the constant for a fetch — the
 * components only ever read `Song` / `Place` / `Line`, never these arrays
 * directly.
 *
 * The palette section is the exception and is NOT here: it derives from real
 * `shades[].hex_code` in ./palette.ts.
 */

export type Line = { mood: string; text: string };
export type Song = { id: string; title: string; artist: string; colors: string[] };
export type Place = { id: string; name: string; city: string; colors: string[] };

export const MOODS = ["All", "Corporate", "Chaos", "Soft", "Smug"] as const;

export const LINES: Line[] = [
  { mood: "Corporate", text: "This could've been an email." },
  { mood: "Corporate", text: "Why wasn't this a meeting?" },
  { mood: "Corporate", text: "All this for a 20 minute standup." },
  { mood: "Corporate", text: "Business on top, denial below." },
  { mood: "Corporate", text: "Dressed for the promotion, not the role." },
  { mood: "Corporate", text: "Camera on, ambition off." },
  { mood: "Chaos", text: "Running late, looking early." },
  { mood: "Chaos", text: "Third outfit, first choice." },
  { mood: "Chaos", text: "Left the house. That's the win." },
  { mood: "Chaos", text: "Peaked before noon." },
  { mood: "Chaos", text: "Dressed for a war I'm not fighting." },
  { mood: "Chaos", text: "One coffee away from a personality." },
  { mood: "Soft", text: "Soft launch of a hard week." },
  { mood: "Soft", text: "I dressed for the weather I wanted." },
  { mood: "Soft", text: "Quiet day, loud shoes." },
  { mood: "Soft", text: "Nothing to prove, still proving it." },
  { mood: "Soft", text: "Wearing the calm I don't have." },
  { mood: "Soft", text: "Slow morning, fast exit." },
  { mood: "Smug", text: "Overdressed for a Tuesday." },
  { mood: "Smug", text: "Quietly the best dressed in this room." },
  { mood: "Smug", text: "Nobody asked. Here anyway." },
  { mood: "Smug", text: "The commute is the runway." },
  { mood: "Smug", text: "Not a phase. A filing system." },
  { mood: "Smug", text: "Serotonin, but make it outerwear." },
];

export const SONGS: Song[] = [
  { id: "s1", title: "My Lover Is Sleeping", artist: "Wasia Project", colors: ["#E8552F", "#2A1008"] },
  { id: "s2", title: "Blue", artist: "yung kai", colors: ["#5C8FD6", "#131B33"] },
  { id: "s3", title: "Space Song", artist: "Beach House", colors: ["#8E6FB8", "#1B1230"] },
  { id: "s4", title: "Nights", artist: "Frank Ocean", colors: ["#D8663F", "#20120C"] },
  { id: "s5", title: "Cranes in the Sky", artist: "Solange", colors: ["#D95F84", "#2A0F1C"] },
  { id: "s6", title: "Sunset Lover", artist: "Petit Biscuit", colors: ["#F0A15C", "#2C1608"] },
  { id: "s7", title: "Motion Sickness", artist: "Phoebe Bridgers", colors: ["#7E93A8", "#171C24"] },
  { id: "s8", title: "Weird Fishes", artist: "Radiohead", colors: ["#3E8C7E", "#0D1F1C"] },
  { id: "s9", title: "Cellophane", artist: "FKA twigs", colors: ["#C9C2D8", "#241E30"] },
  { id: "s10", title: "Bags", artist: "Clairo", colors: ["#C8A25E", "#241A0C"] },
  { id: "s11", title: "Feel It All Around", artist: "Washed Out", colors: ["#6A8FB5", "#141E2A"] },
  { id: "s12", title: "The Perfect Pair", artist: "beabadoobee", colors: ["#D07C9B", "#2A1420"] },
];

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
 * Backdrop shades for the blob behind the outfit. The card's action bar picks up
 * the same colour, and the peek strip borrows the other card's — which is what
 * gives the day and night cards their paired look.
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

export const MAX_PIECES = 6;
