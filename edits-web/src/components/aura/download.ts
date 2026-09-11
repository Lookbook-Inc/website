"use client";

import { domToBlob } from "modern-screenshot";

function fileName() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `aura-card-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.png`;
}

/**
 * Render the card to a PNG and hand it to the browser.
 *
 * Packshots are cross-origin signed URLs, so modern-screenshot has to inline
 * them before it can rasterise. It fetches each one and falls back to a
 * placeholder if a request is blocked, which is why a failure here degrades to
 * "screenshot this view" rather than throwing at the user.
 */
export async function downloadCard(node: HTMLElement) {
  const blob = await domToBlob(node, {
    scale: 3,
    quality: 1,
    backgroundColor: null,
    fetch: { requestInit: { mode: "cors", credentials: "omit" } },
  });
  if (!blob) throw new Error("The card could not be rendered.");

  const name = fileName();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return name;
}
