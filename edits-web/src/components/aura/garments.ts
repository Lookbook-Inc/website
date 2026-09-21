/**
 * Garment silhouettes and the mapping from real wardrobe data onto the card.
 *
 * The SVG shapes are ported from the websitev3 mockup. They are the *fallback*:
 * a real wardrobe item renders its packshot, and only drops back to a silhouette
 * when it has no image. The shape is chosen from `item_type`, which the upload
 * pipeline writes from the closed `GarmentType` enum
 * (mvp-backend/python-backend/src/models/clothing.py).
 */

export type Slot = "outer" | "top" | "bottom" | "shoes" | "hat" | "acc" | "acc2";

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v + amount));
  const r = clamp((n >> 16) & 255);
  const g = clamp((n >> 8) & 255);
  const b = clamp(n & 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

type ShapeFn = (c: string) => string;

export const SHAPES: Record<string, ShapeFn> = {
  shirt: (c) => `<path d="M31 19 L43 12 L50 23 L57 12 L69 19 L86 31 L77 46 L70 39 L70 104 Q50 111 30 104 L30 39 L23 46 L14 31 Z" fill="${c}"/>
    <path d="M50 23 L50 104" stroke="${shade(c, -30)}" stroke-width="1.4" fill="none"/>
    <circle cx="50" cy="46" r="1.5" fill="${shade(c, -42)}"/><circle cx="50" cy="66" r="1.5" fill="${shade(c, -42)}"/><circle cx="50" cy="86" r="1.5" fill="${shade(c, -42)}"/>`,
  coat: (c) => `<path d="M30 17 L42 11 L50 26 L58 11 L70 17 L85 30 L78 46 L72 40 L72 116 L28 116 L28 40 L22 46 L15 30 Z" fill="${c}"/>
    <path d="M42 11 L50 50 L58 11 L64 15 L52 60 L48 60 L36 15 Z" fill="${shade(c, 14)}"/>
    <path d="M50 60 L50 116" stroke="${shade(c, -24)}" stroke-width="1.3"/>
    <circle cx="46" cy="70" r="1.7" fill="${shade(c, 30)}"/><circle cx="46" cy="86" r="1.7" fill="${shade(c, 30)}"/>`,
  jacket: (c) => `<path d="M32 19 L44 13 L50 25 L56 13 L68 19 L85 32 L77 47 L70 40 L70 104 L30 104 L30 40 L23 47 L15 32 Z" fill="${c}"/>
    <path d="M44 13 L50 46 L56 13" fill="${shade(c, 26)}"/><path d="M50 46 L50 104" stroke="${shade(c, -30)}" stroke-width="1.4"/>`,
  dress: (c) => `<path d="M35 17 L44 11 L50 19 L56 11 L65 17 L69 41 L83 106 Q50 117 17 106 L31 41 Z" fill="${c}"/>
    <path d="M31 41 Q50 49 69 41" stroke="${shade(c, -26)}" stroke-width="1.5" fill="none"/>`,
  gown: (c) => `<path d="M38 16 L50 22 L62 16 L66 40 L88 110 Q50 120 12 110 L34 40 Z" fill="${c}"/>
    <path d="M40 14 L46 20 M60 14 L54 20" stroke="${shade(c, -28)}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  tank: (c) => `<path d="M37 15 L46 21 L54 21 L63 15 L68 31 L66 104 Q50 110 34 104 L32 31 Z" fill="${c}"/>
    <path d="M37 15 Q50 27 63 15" stroke="${shade(c, -24)}" stroke-width="1.4" fill="none"/>`,
  pants: (c) => `<path d="M28 13 L72 13 L75 42 L69 112 L55 112 L50 60 L45 112 L31 112 L25 42 Z" fill="${c}"/>
    <path d="M28 13 L72 13 L73 24 L27 24 Z" fill="${shade(c, -20)}"/><path d="M50 24 L50 60" stroke="${shade(c, -22)}" stroke-width="1.2"/>
    <path d="M33 30 L33 100 M67 30 L67 100" stroke="${shade(c, 16)}" stroke-width="1" opacity=".8"/>`,
  shorts: (c) => `<path d="M28 13 L72 13 L74 34 L70 74 L56 74 L50 44 L44 74 L30 74 L26 34 Z" fill="${c}"/>
    <path d="M28 13 L72 13 L73 24 L27 24 Z" fill="${shade(c, -20)}"/><path d="M50 24 L50 44" stroke="${shade(c, -22)}" stroke-width="1.2"/>`,
  skirt: (c) => `<path d="M31 22 L69 22 L85 102 Q50 114 15 102 Z" fill="${c}"/><rect x="31" y="16" width="38" height="9" rx="2" fill="${shade(c, -22)}"/>
    <path d="M43 26 L38 106 M57 26 L62 106" stroke="${shade(c, -14)}" stroke-width="1.1" fill="none"/>`,
  sneaker: (c) => `<path d="M13 74 Q13 56 20 55 Q30 54 36 63 L54 78 Q70 84 84 85 Q91 87 91 94 L90 101 L18 101 Q12 98 12 90 Z" fill="${c}"/>
    <path d="M18 101 L90 101" stroke="${shade(c, -44)}" stroke-width="5" stroke-linecap="round"/>
    <path d="M24 60 L36 70 M30 57 L42 68" stroke="${shade(c, -24)}" stroke-width="1.6"/>`,
  heel: (c) => `<path d="M22 36 Q24 27 33 32 L66 76 Q76 84 88 86 Q93 88 92 95 L90 100 L62 100 Q44 96 35 84 Z" fill="${c}"/>
    <path d="M28 84 L28 100" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`,
  flat: (c) => `<ellipse cx="52" cy="80" rx="38" ry="19" fill="${c}"/><path d="M32 68 Q52 60 72 70" stroke="${shade(c, 24)}" stroke-width="2" fill="none"/><circle cx="52" cy="66" r="4" fill="${shade(c, 32)}"/>`,
  cap: (c) => `<path d="M22 68 Q22 34 50 34 Q78 34 78 68 Z" fill="${c}"/>
    <path d="M20 68 L80 68 Q96 70 94 77 L24 77 Q18 74 20 68 Z" fill="${shade(c, -16)}"/>
    <circle cx="50" cy="35" r="3" fill="${shade(c, 22)}"/><path d="M50 36 L50 68" stroke="${shade(c, 18)}" stroke-width="1" opacity=".7"/>`,
  chain: (c) => `<path d="M30 26 Q50 100 70 26" fill="none" stroke="${c}" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="1.5 4.5"/>
    <path d="M30 26 Q50 100 70 26" fill="none" stroke="${shade(c, -40)}" stroke-width="1.2" opacity=".5"/>`,
  tote: (c) => `<path d="M24 40 L76 40 L84 104 L16 104 Z" fill="${c}"/><path d="M38 40 Q38 18 50 18 Q62 18 62 40" stroke="${shade(c, -30)}" stroke-width="4" fill="none"/>`,
  bag: (c) => `<rect x="20" y="46" width="60" height="44" rx="7" fill="${c}"/><path d="M20 60 Q50 76 80 60" stroke="${shade(c, -32)}" stroke-width="2" fill="none"/><path d="M32 46 Q50 12 68 46" stroke="${shade(c, -22)}" stroke-width="3" fill="none"/>`,
  glasses: (c) => `<rect x="10" y="48" width="34" height="24" rx="10" fill="${c}"/><rect x="56" y="48" width="34" height="24" rx="10" fill="${c}"/><path d="M44 56 Q50 51 56 56" stroke="${c}" stroke-width="4" fill="none"/>`,
  hoop: (c) => `<circle cx="34" cy="62" r="17" fill="none" stroke="${c}" stroke-width="5"/><circle cx="70" cy="62" r="17" fill="none" stroke="${c}" stroke-width="5"/>`,
  scarf: (c) => `<path d="M16 40 Q34 24 50 40 Q66 56 84 40 L84 62 Q66 78 50 62 Q34 46 16 62 Z" fill="${c}"/>`,
  vest: (c) => `<path d="M34 17 L44 12 L50 27 L56 12 L66 17 L72 34 L72 104 L28 104 L28 34 Z" fill="${c}"/>
    <path d="M44 12 L50 48 L56 12 L62 15 L52 58 L48 58 L38 15 Z" fill="${shade(c, 18)}"/>`,
};

export const garmentSvg = (shapeName: string, color: string) =>
  `<svg viewBox="0 0 100 120" aria-hidden="true">${(SHAPES[shapeName] ?? SHAPES.shirt)(color)}</svg>`;

/**
 * `item_type` → card slot + fallback silhouette.
 *
 * Keys are the `GarmentType` StrEnum values the pipeline stores. Lookup is
 * lowercased and falls back to a substring scan, because `available_item_types`
 * is a plain `sorted(distinct)` over the column and older rows can be untidy.
 */
const TYPE_MAP: Record<string, { slot: Slot; shape: string }> = {
  jacket: { slot: "outer", shape: "jacket" },
  vest: { slot: "outer", shape: "vest" },
  coat: { slot: "outer", shape: "coat" },
  sweater: { slot: "top", shape: "shirt" },
  hoodie: { slot: "top", shape: "shirt" },
  "button-up-shirt": { slot: "top", shape: "shirt" },
  "t-shirt": { slot: "top", shape: "tank" },
  dress: { slot: "top", shape: "dress" },
  pants: { slot: "bottom", shape: "pants" },
  shorts: { slot: "bottom", shape: "shorts" },
  skirt: { slot: "bottom", shape: "skirt" },
  shoes: { slot: "shoes", shape: "sneaker" },
  hat: { slot: "hat", shape: "cap" },
  scarf: { slot: "acc", shape: "scarf" },
  purse: { slot: "acc", shape: "bag" },
};

const FALLBACK = { slot: "top" as Slot, shape: "shirt" };

export function classify(itemType: string | null | undefined) {
  if (!itemType) return FALLBACK;
  const key = itemType.trim().toLowerCase();
  if (TYPE_MAP[key]) return TYPE_MAP[key];

  const loose = key.replace(/[\s_]+/g, "-");
  if (TYPE_MAP[loose]) return TYPE_MAP[loose];

  for (const [name, value] of Object.entries(TYPE_MAP)) {
    if (loose.includes(name) || name.includes(loose)) return value;
  }
  // Broad category words that appear in older / hand-entered rows.
  if (/outerwear|blazer|parka|trench/.test(loose)) return TYPE_MAP.jacket;
  if (/bottom|trouser|jean|denim/.test(loose)) return TYPE_MAP.pants;
  if (/footwear|sneaker|boot|heel|sandal|loafer|flat/.test(loose)) return TYPE_MAP.shoes;
  if (/accessor|bag|tote|jewel|glass/.test(loose)) return TYPE_MAP.purse;
  if (/top|shirt|tee|knit|polo/.test(loose)) return TYPE_MAP.sweater;
  return FALLBACK;
}
