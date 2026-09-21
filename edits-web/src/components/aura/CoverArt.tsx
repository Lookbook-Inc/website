"use client";

import { useState } from "react";
import { GradientArt } from "./GradientArt";
import { hash } from "./palette";

/**
 * Song cover art. Shows the signed cover image when there is one and falls
 * back to the gradient painter when it is missing or fails to load.
 *
 * Plain `img` for the same reason as PieceArt: signed private media must stay
 * out of Next's shared image-optimization cache.
 */
export function CoverArt({
  id,
  imageUrl,
  colors,
}: {
  id: string;
  imageUrl?: string | null;
  colors: string[];
}) {
  const [failed, setFailed] = useState<string | null>(null);

  if (imageUrl && failed !== imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(imageUrl)}
      />
    );
  }
  return <GradientArt colors={colors} seed={hash(id)} />;
}
