import type { WardrobeCard } from "@/types/api";
import type { Place, Song } from "./placeholders";

export type CardKind = "day" | "night";

/**
 * Where a piece sits on the card relative to its slot: a fractional offset from
 * dragging, and a size multiplier from the corner handle or the size sliders.
 */
export type Placement = { fx: number; fy: number; s?: number };

export type CardState = {
  kind: CardKind;
  title: string;
  temp: string;
  sky: string;
  /** Wardrobe item ids, resolved against the catalogue. */
  pieces: string[];
  line: string;
  palName: string;
  /** Backdrop colour behind the outfit, also used for the action bar. */
  blob: string;
  song: Song;
  place: Place;
  layout: Record<string, Placement>;
};

/** id → item, grown as the picker and Collection pull in more of the wardrobe. */
export type Catalogue = Record<string, WardrobeCard>;

export type Screen = "today" | "library" | "help";
