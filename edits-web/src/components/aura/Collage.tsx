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

/** Bounds on a piece's size multiplier, and the size a piece starts at. */
const SIZE_MIN = 0.5;
const SIZE_MAX = 1.8;
export const SIZE_DEFAULT = 1.2;
const clampSize = (value: number) => Math.max(SIZE_MIN, Math.min(SIZE_MAX, value));

/**
 * Anything that exists only to edit the card — the selection box, its handles
 * and the layer menu. download.ts skips these, so they never reach the PNG.
 */
export const EDIT_UI_CLASS = "edit-ui";

type LayerMove = "front" | "forward" | "backward" | "back";

const LAYER_ACTIONS: { move: LayerMove; label: string }[] = [
  { move: "front", label: "Bring to front" },
  { move: "forward", label: "Bring forward" },
  { move: "backward", label: "Send backward" },
  { move: "back", label: "Send to back" },
];

const CORNERS = ["nw", "ne", "sw", "se"] as const;

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
  blobSeed = "",
  blobSize = 1,
  onLayoutChange,
  interactive = false,
}: {
  items: WardrobeCard[];
  layout: Record<string, Placement>;
  blob?: string;
  /** Seeds the backdrop's shape, so it stays put while pieces come and go. */
  blobSeed?: string;
  /** Scale of the backdrop blob about its centre (Day tab slider). */
  blobSize?: number;
  onLayoutChange?: (id: string, changes: Partial<Placement>) => void;
  interactive?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const blobShape = useMemo(() => blobPath(blobSeed), [blobSeed]);

  /** Pieces back to front: a stored layer wins, otherwise the slot's default. */
  const stack = useMemo(() => {
    const placed = place(items).map((entry, index) => ({
      ...entry,
      index,
      z: layout[entry.item.id]?.z ?? SLOT_Z[entry.slot],
    }));
    return [...placed].sort((a, b) => a.z - b.z || a.index - b.index);
  }, [items, layout]);

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

  // A click anywhere that isn't a piece or the menu, or Escape, deselects.
  useEffect(() => {
    if (!selected && !menuFor) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".collage .pc, .collage .layer-menu")) return;
      setSelected(null);
      setMenuFor(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (menuFor) setMenuFor(null);
      else setSelected(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [selected, menuFor]);

  // Drop the selection if its piece leaves the card.
  const liveSelected = selected && items.some((item) => item.id === selected) ? selected : null;
  const liveMenu = menuFor && items.some((item) => item.id === menuFor) ? menuFor : null;

  /** Reorder the stack, then renumber every piece 1..n so layers stay compact. */
  const restack = useCallback(
    (id: string, move: LayerMove) => {
      if (!onLayoutChange) return;
      const order = stack.map((entry) => entry.item.id);
      const from = order.indexOf(id);
      if (from < 0) return;
      order.splice(from, 1);
      const to =
        move === "front" ? order.length
        : move === "back" ? 0
        : move === "forward" ? Math.min(order.length, from + 1)
        : Math.max(0, from - 1);
      order.splice(to, 0, id);
      order.forEach((pieceId, index) => {
        if (layout[pieceId]?.z !== index + 1) onLayoutChange(pieceId, { z: index + 1 });
      });
    },
    [onLayoutChange, stack, layout],
  );

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, id: string) => {
      if (!interactive || !onLayoutChange || !box.width) return;
      // Only the primary button moves a piece; a right-click opens the menu.
      if (event.button !== 0) return;
      event.preventDefault();
      setSelected(id);
      if (menuFor !== id) setMenuFor(null);
      const node = event.currentTarget;
      const start = layout[id] ?? { fx: 0, fy: 0 };
      const originX = event.clientX;
      const originY = event.clientY;
      const clamp = (v: number) => Math.max(-DRAG_LIMIT, Math.min(DRAG_LIMIT, v));
      let moved = false;

      try {
        node.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is best-effort; dragging still works without it.
      }

      const move = (ev: PointerEvent) => {
        // A few pixels of slack, so a click (or double-click) doesn't nudge the piece.
        if (!moved && Math.hypot(ev.clientX - originX, ev.clientY - originY) < 3) return;
        if (!moved) {
          moved = true;
          node.classList.add("dragging");
          setMenuFor(null);
        }
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
    [interactive, onLayoutChange, layout, box.width, box.height, menuFor],
  );

  /**
   * Resize about the piece's centre from any corner: the new size is the
   * starting size scaled by how much further from (or closer to) the centre
   * the pointer has moved.
   */
  const startResize = useCallback(
    (event: React.PointerEvent<HTMLSpanElement>, id: string) => {
      if (!interactive || !onLayoutChange) return;
      const handle = event.currentTarget;
      const piece = handle.closest<HTMLElement>(".pc");
      if (!piece) return;
      event.preventDefault();
      // Keep the piece's own pointerdown from starting a move.
      event.stopPropagation();
      setMenuFor(null);

      const rect = piece.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const from = Math.max(8, Math.hypot(event.clientX - cx, event.clientY - cy));
      const start = layout[id]?.s ?? SIZE_DEFAULT;

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

  function openMenu(event: React.MouseEvent, id: string) {
    if (!interactive) return;
    event.preventDefault();
    setSelected(id);
    setMenuFor(id);
  }

  const menuEntry = liveMenu ? stack.find((entry) => entry.item.id === liveMenu) : null;
  const menuPosition = (() => {
    if (!menuEntry || !box.width) return null;
    const spot = SLOTS[menuEntry.slot];
    const placement = layout[menuEntry.item.id];
    const pct = (value: string) => parseFloat(value) / 100;
    // Centre of the piece, clamped so the menu stays on the card.
    const x = (pct(spot.left) + pct(spot.width) / 2 + (placement?.fx ?? 0)) * box.width;
    const y = (pct(spot.top) + pct(spot.height) / 2 + (placement?.fy ?? 0)) * box.height;
    return {
      left: Math.max(4, Math.min(box.width - 140, x - 68)),
      top: Math.max(0, Math.min(box.height - 128, y - 20)),
    };
  })();

  const position = (id: string) => stack.findIndex((entry) => entry.item.id === id);

  return (
    <div className={`collage${interactive ? " interactive" : ""}`} ref={hostRef}>
      <svg
        className="blob"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={blobSize !== 1 ? { transform: `scale(${blobSize})` } : undefined}
      >
        <path d={blobShape} style={blob ? { fill: blob } : undefined} />
      </svg>
      {stack.map(({ item, slot }, layer) => {
        const spot = SLOTS[slot];
        const placement = layout[item.id];
        const size = placement?.s ?? SIZE_DEFAULT;
        const isSelected = interactive && liveSelected === item.id;
        const transforms: string[] = [];
        if (placement && box.width) {
          transforms.push(`translate(${placement.fx * box.width}px, ${placement.fy * box.height}px)`);
        }
        if (size !== 1) transforms.push(`scale(${size})`);
        return (
          <div
            key={item.id}
            className={`pc${isSelected ? " selected" : ""}`}
            data-piece={item.id}
            style={{
              ...spot,
              zIndex: layer + 1,
              transform: transforms.join(" ") || undefined,
              ["--s" as string]: size,
            }}
            onPointerDown={interactive ? (event) => startDrag(event, item.id) : undefined}
            onDoubleClick={interactive ? (event) => openMenu(event, item.id) : undefined}
            onContextMenu={interactive ? (event) => openMenu(event, item.id) : undefined}
          >
            <PieceArt item={item} />
            {isSelected ? (
              <span className={`sel-box ${EDIT_UI_CLASS}`} aria-hidden="true">
                {CORNERS.map((corner) => (
                  <span
                    key={corner}
                    className={`rz rz-${corner}`}
                    onPointerDown={(event) => startResize(event, item.id)}
                  />
                ))}
              </span>
            ) : null}
          </div>
        );
      })}

      {menuEntry && menuPosition ? (
        <div
          className={`layer-menu ${EDIT_UI_CLASS}`}
          role="menu"
          aria-label={`Layer ${menuEntry.item.name}`}
          style={menuPosition}
        >
          {LAYER_ACTIONS.map(({ move, label }) => {
            const at = position(menuEntry.item.id);
            const disabled =
              (move === "front" || move === "forward") ? at === stack.length - 1 : at === 0;
            return (
              <button
                key={move}
                type="button"
                role="menuitem"
                disabled={disabled}
                onClick={() => {
                  restack(menuEntry.item.id, move);
                  setMenuFor(null);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
