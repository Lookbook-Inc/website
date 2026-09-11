"use client";

import { useState } from "react";
import type { WardrobeCard } from "@/types/api";
import { SHAPES, classify } from "./garments";
import { itemColor } from "./palette";

const SILHOUETTE_FALLBACK = "#C9C3BA";

/**
 * A wardrobe piece as it appears on the card, the canvas and in the picker.
 *
 * Real items render their packshot. The hand-drawn silhouette is the fallback
 * for items with no image, or whose signed URL fails to load.
 *
 * Signed private media is rendered with a plain `img` so it never enters Next's
 * shared image-optimization cache — same rule as `Media` in components/ui.tsx.
 */
export function PieceArt({ item }: { item: WardrobeCard }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(item.image_url) && !failed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.image_url as string}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }

  const { shape } = classify(item.item_type);
  const color = itemColor(item) ?? SILHOUETTE_FALLBACK;
  return (
    <svg
      viewBox="0 0 100 120"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: (SHAPES[shape] ?? SHAPES.shirt)(color) }}
    />
  );
}
