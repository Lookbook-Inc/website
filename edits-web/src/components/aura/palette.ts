/**
 * Palette naming, ported from the websitev3 mockup.
 *
 * The mockup ran this over invented flat colours. It works unchanged on real
 * data because `WardrobeCard.shades[].hex_code` is exactly the same input: the
 * five swatches and the name candidates come off the member's own garments.
 */

import type { Shade, WardrobeCard } from "@/types/api";

const PAL_NAMES: { h: [number, number]; n: string[] }[] = [
  { h: [0, 22], n: ["EMBER", "POPPY", "SUNBURN"] },
  { h: [23, 46], n: ["GOLDLEAF", "AMBER", "HONEYED"] },
  { h: [47, 72], n: ["BUTTER", "CITRINE", "DAYLIGHT"] },
  { h: [73, 155], n: ["FIELD", "MOSS", "VERDANT"] },
  { h: [156, 200], n: ["SEAGLASS", "TIDAL", "MENTHOL"] },
  { h: [201, 255], n: ["OCEANIC", "INDIGO", "PORCELAIN"] },
  { h: [256, 295], n: ["DUSK", "ORCHID", "VIOLET HOUR"] },
  { h: [296, 340], n: ["ORCHARD", "PLUM", "BRUISE"] },
  { h: [341, 360], n: ["POPPY", "CRIMSON", "SIGNAL"] },
];

const NEUTRAL_DARK = ["MIDNIGHT", "GRAPHITE", "NOIR"];
const NEUTRAL_LIGHT = ["PAPER", "BONE", "IVORY"];

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

export function paletteNamesFor(items: WardrobeCard[]) {
  const hsls = items
    .map(itemColor)
    .filter((hex): hex is string => hex !== null)
    .map(hexToHsl);
  if (!hsls.length) return NEUTRAL_LIGHT;

  const chroma = hsls.filter((c) => c.s > 16 && c.l > 8 && c.l < 93);
  if (!chroma.length) {
    const avg = hsls.reduce((total, c) => total + c.l, 0) / hsls.length;
    return avg < 46 ? NEUTRAL_DARK : NEUTRAL_LIGHT;
  }

  const weight = (c: { s: number; l: number }) => c.s * 0.7 + (50 - Math.abs(50 - c.l)) * 0.3;
  const dominant = [...chroma].sort((a, b) => weight(b) - weight(a))[0];
  return (PAL_NAMES.find((p) => dominant.h >= p.h[0] && dominant.h <= p.h[1]) ?? PAL_NAMES[5]).n;
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
