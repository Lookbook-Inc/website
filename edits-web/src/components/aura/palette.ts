/**
 * Palette naming, ported from the websitev3 mockup.
 *
 * The mockup ran this over invented flat colours. It works unchanged on real
 * data because `WardrobeCard.shades[].hex_code` is exactly the same input: the
 * five swatches and the name candidates come off the member's own garments.
 */

import type { Shade, WardrobeCard } from "@/types/api";

/**
 * Palette names, by colour family. Each piece's main shade is sorted into one of
 * these families; the outfit's families (and its overall mood, below) decide
 * which names are suggested. Every name here is also offered in the Palette
 * tab's "All names", so the member can pick any of them.
 */
export const COLOR_FAMILIES = [
  { id: "red", label: "Red", names: ["CRIMSON", "CHERRY", "SCARLET", "EMBER", "POPPY"] },
  { id: "burgundy", label: "Burgundy", names: ["BURGUNDY", "OXBLOOD", "MERLOT", "BORDEAUX"] },
  { id: "pink", label: "Pink", names: ["BLUSH", "ROSE", "PEONY", "BUBBLEGUM", "FLAMINGO"] },
  { id: "plum", label: "Plum", names: ["PLUM", "BERRY", "MULBERRY", "ORCHARD", "BRUISE"] },
  { id: "purple", label: "Purple", names: ["LAVENDER", "ORCHID", "AMETHYST", "DUSK", "VIOLET HOUR"] },
  { id: "navy", label: "Navy", names: ["NAVY", "INDIGO", "ADMIRAL", "NIGHTFALL"] },
  { id: "denim", label: "Denim", names: ["DENIM", "CHAMBRAY", "WASHED INDIGO", "WORKWEAR"] },
  { id: "blue", label: "Blue", names: ["OCEANIC", "CORNFLOWER", "CERULEAN", "SKYLINE", "PORCELAIN"] },
  { id: "teal", label: "Teal", names: ["SEAGLASS", "LAGOON", "JADE", "TIDAL", "MENTHOL"] },
  { id: "green", label: "Green", names: ["FIELD", "VERDANT", "FERN", "EMERALD", "JUNIPER"] },
  { id: "olive", label: "Olive", names: ["OLIVE", "SAGE", "MOSS", "LICHEN", "FATIGUES"] },
  { id: "yellow", label: "Yellow", names: ["BUTTER", "CITRINE", "DAYLIGHT", "LEMONADE", "MARIGOLD"] },
  { id: "gold", label: "Gold", names: ["GOLDLEAF", "MUSTARD", "AMBER", "HONEYED", "SAFFRON"] },
  { id: "orange", label: "Orange", names: ["TANGERINE", "APRICOT", "SUNBURN", "PAPAYA", "CLEMENTINE"] },
  { id: "rust", label: "Rust", names: ["TERRACOTTA", "RUST", "CINNAMON", "PAPRIKA", "CLAY"] },
  { id: "brown", label: "Brown", names: ["COCOA", "ESPRESSO", "CHESTNUT", "MOCHA", "TOFFEE"] },
  { id: "beige", label: "Beige", names: ["CAMEL", "SAND", "OATMEAL", "LINEN", "BISCUIT"] },
  { id: "white", label: "White", names: ["PAPER", "BONE", "IVORY", "CREAM", "CHALK"] },
  { id: "grey", label: "Grey", names: ["GRAPHITE", "SLATE", "STONE", "ASH", "PEWTER"] },
  { id: "black", label: "Black", names: ["NOIR", "ONYX", "INK", "MIDNIGHT", "JET"] },
] as const;

export type FamilyId = (typeof COLOR_FAMILIES)[number]["id"];

/** Names for the outfit as a whole, suggested ahead of any single colour's. */
export const MOODS = [
  { id: "monochrome", label: "Monochrome", names: ["MONOCHROME", "TUXEDO", "NEWSPRINT", "SALT & PEPPER"] },
  { id: "earth", label: "Earth tones", names: ["EARTHBOUND", "HARVEST", "DESERT", "SAFARI"] },
  { id: "pastel", label: "Pastels", names: ["PASTEL", "SORBET", "CANDY FLOSS", "SPRINGTIME"] },
  { id: "jewel", label: "Jewel tones", names: ["JEWEL BOX", "VELVET", "OPULENT", "STAINED GLASS"] },
  { id: "bright", label: "Brights", names: ["ELECTRIC", "NEON", "CANDY", "SIGNAL"] },
  { id: "muted", label: "Muted", names: ["DUSTY", "FADED", "HUSHED", "WASHED"] },
] as const;

type MoodId = (typeof MOODS)[number]["id"];

const NEUTRAL: ReadonlySet<FamilyId> = new Set(["black", "white", "grey", "beige"]);
const EARTHY: ReadonlySet<FamilyId> = new Set(["brown", "beige", "rust", "olive", "gold"]);

/** How many names the Palette tab suggests for an outfit. */
const MAX_SUGGESTED = 9;

export const NEUTRAL_SWATCH = "#DDD8D0";

const HEX = /^#[0-9a-f]{6}$/i;

function normalizeHex(value: string | null | undefined) {
  if (!value) return null;
  const hex = value.trim();
  if (HEX.test(hex)) return hex.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex.toUpperCase()}`;
  return null;
}

export function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

/** The most important shade with a usable hex code, or null. */
export function itemColor(item: Pick<WardrobeCard, "shades">): string | null {
  const shades: Shade[] = item.shades ?? [];
  const usable = shades
    .map((shade) => ({ shade, hex: normalizeHex(shade.hex_code) }))
    .filter((entry): entry is { shade: Shade; hex: string } => entry.hex !== null);
  if (!usable.length) return null;
  const ranked = [...usable].sort(
    (a, b) => (b.shade.importance ?? 0) - (a.shade.importance ?? 0),
  );
  return ranked[0].hex;
}

/** Five swatches for the card, padded with a neutral when there are fewer pieces. */
export function swatchColors(items: WardrobeCard[]) {
  const colors = items.map(itemColor).filter((hex): hex is string => hex !== null);
  while (colors.length < 5) colors.push(NEUTRAL_SWATCH);
  return colors.slice(0, 5);
}

/** Sort one colour into a colour family. */
export function colorFamily(hex: string): FamilyId {
  const { h, s, l } = hexToHsl(hex);
  if (l < 13) return "black";
  // Barely any colour: black, white or grey by lightness.
  if (s < 10 || (s < 18 && (l < 25 || l > 80))) return l > 82 ? "white" : l < 28 ? "black" : "grey";
  if (l > 90) return "white";

  if (h < 15 || h >= 345) {
    if (l > 70) return "pink";
    return l < 32 ? "burgundy" : "red";
  }
  // The warm band holds the browns, tans and creams as well as orange and gold.
  if (h < 50) {
    if (l < 36) return "brown";
    if (s < 40 && l >= 60) return l > 82 ? "white" : "beige";
    if (s < 55 && l < 60) return h < 32 ? "rust" : "brown";
    if (h < 38) return l < 55 ? "rust" : "orange";
    return l < 60 ? "gold" : "yellow";
  }
  if (h < 65) return s < 40 && l < 55 ? "olive" : l < 45 ? "gold" : "yellow";
  if (h < 160) return s < 30 || (h < 90 && l < 40) ? "olive" : "green";
  if (h < 195) return "teal";
  if (h < 250) {
    if (s < 22) return "grey";
    if (l < 30) return "navy";
    return s < 45 && l < 65 ? "denim" : "blue";
  }
  if (h < 290) return "purple";
  if (h < 320) return l > 72 ? "pink" : "plum";
  return l < 35 ? "plum" : "pink";
}

function familyNames(id: FamilyId): readonly string[] {
  return COLOR_FAMILIES.find((family) => family.id === id)?.names ?? [];
}

function moodNames(id: MoodId): readonly string[] {
  return MOODS.find((mood) => mood.id === id)?.names ?? [];
}

/**
 * The outfit's overall character, if it has a clear one. Checked in order, so
 * a black-and-white fit reads as monochrome before it reads as muted.
 */
function moodOf(colors: { hex: string; family: FamilyId }[]): MoodId | null {
  const hsls = colors.map((c) => ({ ...hexToHsl(c.hex), family: c.family }));
  const chromatic = hsls.filter((c) => !NEUTRAL.has(c.family));
  const lightNeutral = (c: { family: FamilyId }) => c.family === "white" || c.family === "beige";

  if (!chromatic.length) {
    const dark = hsls.some((c) => c.family === "black");
    return dark && hsls.some(lightNeutral) ? "monochrome" : null;
  }
  if (hsls.filter((c) => EARTHY.has(c.family)).length >= Math.max(2, hsls.length * 0.6)) return "earth";
  const pastel = chromatic.filter((c) => c.l >= 70 && c.s >= 25);
  if (pastel.length >= 2 && pastel.length >= chromatic.length * 0.6) return "pastel";
  if (chromatic.filter((c) => c.s >= 75 && c.l >= 40 && c.l <= 65).length >= 2) return "bright";
  if (chromatic.filter((c) => c.s >= 45 && c.l >= 20 && c.l <= 45).length >= 2) return "jewel";
  if (chromatic.length >= 2 && chromatic.every((c) => c.s < 35)) return "muted";
  return null;
}

/**
 * Palette names for an outfit, best match first — the first becomes the card's
 * default. The mood leads, then the families by weight: colourful families
 * outrank neutrals, and a family seen on more pieces outranks a one-off.
 */
export function paletteNamesFor(items: WardrobeCard[]): string[] {
  const colors = items
    .map(itemColor)
    .filter((hex): hex is string => hex !== null)
    .map((hex) => ({ hex, family: colorFamily(hex) }));
  if (!colors.length) return [...familyNames("white"), ...familyNames("grey")].slice(0, MAX_SUGGESTED);

  const weights = new Map<FamilyId, number>();
  for (const { hex, family } of colors) {
    const { s } = hexToHsl(hex);
    const weight = NEUTRAL.has(family) ? 1 : 2 + s / 50;
    weights.set(family, (weights.get(family) ?? 0) + weight);
  }
  const families = [...weights.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);

  const mood = moodOf(colors);
  // First pass: two mood names, three for the lead family and two for each other
  // family, so a mixed outfit offers something for each of its colours. Second
  // pass tops up with the rest, in the same order.
  const lead = (index: number) => (index === 0 ? 3 : 2);
  const picks: string[] = mood ? moodNames(mood).slice(0, 2) : [];
  families.forEach((id, index) => picks.push(...familyNames(id).slice(0, lead(index))));
  if (mood) picks.push(...moodNames(mood).slice(2));
  families.forEach((id, index) => picks.push(...familyNames(id).slice(lead(index))));

  return [...new Set(picks)].slice(0, MAX_SUGGESTED);
}

/** Stable 32-bit hash — seeds the gradient art so a song always paints the same. */
export function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
