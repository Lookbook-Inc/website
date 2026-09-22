import type { WardrobeCard } from "@/types/api";
import type { Place, Song } from "./banks";

export type CardKind = "day" | "night";

/**
 * Where a piece sits on the card relative to its slot: a fractional offset from
 * dragging, a size multiplier from the corner handles or the size sliders, and
 * a layer (1 = back) once the member reorders pieces from the layer menu.
 */
export type Placement = { fx: number; fy: number; s?: number; z?: number };

export type CardState = {
  kind: CardKind;
  title: string;
  temp: string;
  sky: string;
  /** Wardrobe item ids, resolved against the catalogue. */
  pieces: string[];
  line: string;
  palName: string;
  /** Backdrop colour behind the outfit; the other card's peek strip borrows it. */
  blob: string;
  /** Size of that backdrop, scaled about its centre. Tonight's starts larger. */
  blobSize: number;
  /** Null only when the song bank is empty. */
  song: Song | null;
  /** Null only when the place bank is empty. */
  place: Place | null;
  layout: Record<string, Placement>;
  /**
   * A fit pic shown on the card in place of the pieces collage and palette.
   * Null means the card shows the pieces. Choosing pieces again clears it.
   */
  photo: CardPhoto | null;
};

/** `garments` are the fit pic's tagged pieces — the palette reads their colours. */
export type CardPhoto = { id: string; url: string; title: string; garments: WardrobeCard[] };

/** id → item, grown as the picker and Collection pull in more of the wardrobe. */
export type Catalogue = Record<string, WardrobeCard>;

export type Screen = "today" | "library" | "help";
