"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WardrobeCard } from "@/types/api";
import { PieceArt } from "./PieceArt";
import { blobPath } from "./blob";
import { type Slot, classify } from "./garments";
import type { Placement } from "./types";

const SLOTS: Record<Slot, { left: string; top: string; width: string; height: string }> = {
  outer: { left: "1%", top: "6%", width: "44%", height: "82%" },
  top: { left: "29%", top: "16%", width: "40%", height: "62%" },
  bottom: { left: "58%", top: "24%", width: "36%", height: "72%" },
  shoes: { left: "3%", top: "57%", width: "37%", height: "41%" },
  hat: { left: "37%", top: "-1%", width: "27%", height: "27%" },
  acc: { left: "49%", top: "9%", width: "25%", height: "46%" },
  acc2: { left: "63%", top: "58%", width: "27%", height: "40%" },
};

const SLOT_Z: Record<Slot, number> = {
  outer: 1, shoes: 2, bottom: 3, top: 4, acc: 5, acc2: 5, hat: 6,
};

const DRAG_LIMIT = 0.42;

/** Bounds on a piece's size multiplier, shared with the sliders in The fit. */
export const SIZE_MIN = 0.5;
export const SIZE_MAX = 1.8;
const clampSize = (value: number) => Math.max(SIZE_MIN, Math.min(SIZE_MAX, value));

/** Assign each piece a slot, spilling collisions into the two accessory slots. */
function place(items: WardrobeCard[]) {
  const used = new Set<Slot>();
  const placed: { item: WardrobeCard; slot: Slot }[] = [];
  for (const item of items) {
    let slot: Slot | null = classify(item.item_type).slot;
    if (used.has(slot)) slot = !used.has("acc") ? "acc" : !used.has("acc2") ? "acc2" : null;
    if (!slot) continue;
    used.add(slot);
    placed.push({ item, slot });
  }
  return placed;
}

export function Collage({
  items,
  layout,
  blob,
  onLayoutChange,
  interactive = false,
}: {
  items: WardrobeCard[];
  layout: Record<string, Placement>;
  blob?: string;
  onLayoutChange?: (id: string, changes: Partial<Placement>) => void;
  interactive?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // Seeded from the pieces, so the backdrop re-forms whenever the fit changes.
  const signature = items.map((item) => item.id).join(",");
  const blobShape = useMemo(() => blobPath(signature), [signature]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ width, height });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, id: string) => {
      if (!interactive || !onLayoutChange || !box.width) return;
      event.preventDefault();
      const node = event.currentTarget;
      const start = layout[id] ?? { fx: 0, fy: 0 };
      const originX = event.clientX;
      const originY = event.clientY;
      const clamp = (v: number) => Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, v));

      node.classList.add("dragging");
      try {
        node.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best-effort; dragging still works without it.
      }

      const move = (ev: PointerEvent) => {
        onLayoutChange(id, {
          fx: clamp(start.fx + (ev.clientX - originX) / box.width),
          fy: clamp(start.fy + (ev.clientY - originY) / box.height),
        });
      };
      const stop = () => {
        node.classList.remove("dragging");
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerup", stop);
        node.removeEventListener("pointercancel", stop);
      };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerup", stop);
      node.addEventListener("pointercancel", stop);
    },
    [interactive, onLayoutChange, layout, box.width, box.height],
  );

  /**
   * Resize about the piece's centre: the new size is the starting size scaled by
   * how much further from (or closer to) the centre the pointer has moved.
   */
  const startResize = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>, id: string) => {
      if (!interactive || !onLayoutChange) return;
      const handle = event.currentTarget;
      const piece = handle.parentElement;
      if (!piece) return;
      event.preventDefault();
      // Keep the piece's own pointerdown from starting a move.
      event.stopPropagation();

      const rect = piece.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const from = Math.max(8, Math.hypot(event.clientX - cx, event.clientY - cy));
      const start = layout[id]?.s ?? 1;

      piece.classList.add("dragging");
      try {
        handle.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best-effort; resizing still works without it.
      }

      const move = (ev: PointerEvent) => {
        const distance = Math.hypot(ev.clientX - cx, ev.clientY - cy);
        onLayoutChange(id, { s: clampSize((start * distance) / from) });
      };
      const stop = () => {
        piece.classList.remove("dragging");
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", stop);
        handle.removeEventListener("pointercancel", stop);
      };
      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", stop);
      handle.addEventListener("pointercancel", stop);
    },
    [interactive, onLayoutChange, layout],
  );

  return (
    <div className={`collage${interactive ? " interactive" : ""}`} ref={hostRef}>
      <svg className="blob" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d={blobShape} style={blob ? { fill: blob } : undefined} />
      </svg>
      {place(items).map(({ item, slot }) => {
        const spot = SLOTS[slot];
        const placement = layout[item.id];
        const size = placement?.s ?? 1;
        const transforms: string[] = [];
        if (placement && box.width) {
          transforms.push(`translate(${placement.fx * box.width}px, ${placement.fy * box.height}px)`);
        }
        if (size !== 1) transforms.push(`scale(${size})`);
        return (
          <div
            key={item.id}
            className="pc"
            style={{ ...spot, zIndex: SLOT_Z[slot], transform: transforms.join(" ") || undefined }}
            onPointerDown={interactive ? (event) => startDrag(event, item.id) : undefined}
          >
            <PieceArt item={item} />
            {interactive ? (
              <span
                className="rz"
                aria-hidden="true"
                // Counter-scaled so the handle stays the same size as the piece grows.
                style={size !== 1 ? { transform: `scale(${1 / size})` } : undefined}
                onPointerDown={(event) => startResize(event, item.id)}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
