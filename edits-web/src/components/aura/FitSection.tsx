"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FitPicCard, FitPicDetail, FitPicPage, WardrobeCard } from "@/types/api";
import { PieceArt } from "./PieceArt";
import { SIZE_MAX, SIZE_MIN } from "./Collage";
import { readApi, query } from "./client-api";
import { MAX_PIECES } from "./placeholders";
import type { Placement } from "./types";

type Mode = "combo" | "collection";

const PIECE_W = 104;
const PIECE_H = 124;

export function FitSection({
  items,
  layout,
  onOpenPicker,
  onResize,
  onSetPieces,
  onResetLayout,
  onToast,
}: {
  items: WardrobeCard[];
  layout: Record<string, Placement>;
  onOpenPicker: () => void;
  onResize: (id: string, size: number) => void;
  onSetPieces: (items: WardrobeCard[]) => void;
  onResetLayout: () => void;
  onToast: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("combo");
  const paneRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const tidy = useCallback(() => {
    const pane = paneRef.current;
    if (!pane || !items.length) return;
    const w = pane.clientWidth;
    const h = pane.clientHeight;
    if (!w) return;
    const n = items.length;
    const perRow = Math.min(n, 4);
    const rows = Math.ceil(n / perRow);
    const next: Record<string, { x: number; y: number }> = {};
    items.forEach((item, index) => {
      const row = Math.floor(index / perRow);
      const col = index % perRow;
      const inRow = Math.min(perRow, n - row * perRow);
      next[item.id] = {
        x: ((col + 0.5) / inRow) * w - PIECE_W / 2,
        y: (rows === 1 ? 0.5 : (row + 0.5) / rows) * h - PIECE_H / 2,
      };
    });
    setPositions(next);
  }, [items]);

  // Lay out on mount, whenever the set of pieces changes, and on resize.
  const signature = items.map((item) => item.id).join(",");
  useEffect(() => {
    const frame = requestAnimationFrame(tidy);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, mode]);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(tidy, 180);
    });
    observer.observe(pane);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [tidy]);

  const startDrag = useCallback((event: React.PointerEvent<HTMLDivElement>, id: string) => {
    const pane = paneRef.current;
    if (!pane) return;
    if ((event.target as HTMLElement).closest(".rm")) return;
    event.preventDefault();
    const node = event.currentTarget;
    const rect = pane.getBoundingClientRect();
    const startX = node.offsetLeft;
    const startY = node.offsetTop;
    const offsetX = event.clientX - rect.left - startX;
    const offsetY = event.clientY - rect.top - startY;

    node.classList.add("drag");
    try {
      node.setPointerCapture(event.pointerId);
    } catch {
      // best-effort
    }

    const move = (ev: PointerEvent) => {
      const x = Math.max(-8, Math.min(rect.width - PIECE_W + 8, ev.clientX - rect.left - offsetX));
      const y = Math.max(-8, Math.min(rect.height - PIECE_H + 8, ev.clientY - rect.top - offsetY));
      setPositions((current) => ({ ...current, [id]: { x, y } }));
    };
    const stop = () => {
      node.classList.remove("drag");
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", stop);
      node.removeEventListener("pointercancel", stop);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", stop);
    node.addEventListener("pointercancel", stop);
  }, []);

  return (
    <>
      <div className="modes">
        <button type="button" className={`mode${mode === "combo" ? " on" : ""}`} onClick={() => setMode("combo")}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="3" y="3" width="7.5" height="18" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="8" rx="1.5" /><rect x="13.5" y="13" width="7.5" height="8" rx="1.5" /></svg>
          <strong>Pick the pieces</strong><span>Lay them out yourself</span>
        </button>
        <button type="button" className={`mode${mode === "collection" ? " on" : ""}`} onClick={() => setMode("collection")}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><rect x="2.5" y="6" width="19" height="14" rx="2" /><circle cx="12" cy="13" r="3.4" /><path d="M8.5 6l1.4-2.2h4.2L15.5 6" /></svg>
          <strong>From your Collection</strong><span>A fit pic you already took</span>
        </button>
      </div>

      {mode === "combo" ? (
        <div>
          <div className="pane-mini" ref={paneRef}>
            {!items.length ? <div className="pane-empty">Tap + to add clothing items</div> : null}
            {items.map((item) => {
              const spot = positions[item.id];
              return (
                <div
                  className="piece"
                  key={item.id}
                  style={{ left: spot?.x ?? 0, top: spot?.y ?? 0, visibility: spot ? "visible" : "hidden" }}
                  onPointerDown={(event) => startDrag(event, item.id)}
                >
                  <div className="pcard">
                    <PieceArt item={item} />
                    <div className="lbl">{item.item_type ?? "Piece"}</div>
                  </div>
                  <button
                    className="rm"
                    type="button"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onSetPieces(items.filter((other) => other.id !== item.id))}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="mini-acts">
            <button className="fab" type="button" aria-label="Add clothing items" onClick={onOpenPicker}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            </button>
            <button className="btn btn-ghost" type="button" style={{ padding: "10px 15px", fontSize: "13px" }} onClick={tidy}>
              Tidy layout
            </button>
            <span style={{ fontSize: "12.5px", color: "var(--ink-3)" }}>
              {items.length ? "Drag pieces to arrange" : `Add up to ${MAX_PIECES} pieces`}
            </span>
          </div>
        </div>
      ) : (
        <CollectionGrid onSetPieces={onSetPieces} onToast={onToast} />
      )}

      {items.length ? (
        <div className="sizes">
          <div className="sizes-head">
            <span className="eyebrow">Sizes on the card</span>
            <span>Or drag a piece&rsquo;s corner on the card</span>
          </div>
          <div className="size-grid">
            {items.map((item) => {
              const percent = Math.round((layout[item.id]?.s ?? 1) * 100);
              return (
                <div className="size-row" key={item.id}>
                  <span className="size-thumb"><PieceArt item={item} /></span>
                  <span className="size-name" title={item.name}>{item.name}</span>
                  <input
                    type="range"
                    min={Math.round(SIZE_MIN * 100)}
                    max={Math.round(SIZE_MAX * 100)}
                    step={5}
                    value={percent}
                    aria-label={`Size of ${item.name}`}
                    onChange={(event) => onResize(item.id, Number(event.target.value) / 100)}
                  />
                  <output className="size-val">{percent}%</output>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="chosen">
        <span className="eyebrow" style={{ marginRight: "4px" }}>On the card</span>
        {items.map((item) => (
          <span className="ct" key={item.id} title={item.name}>
            <PieceArt item={item} />
          </span>
        ))}
        <button
          className="btn btn-ghost"
          type="button"
          style={{ padding: "8px 14px", fontSize: "12.5px", marginLeft: "6px" }}
          onClick={onOpenPicker}
        >
          Change pieces
        </button>
        <button className="link-btn" type="button" style={{ marginLeft: "4px" }} onClick={onResetLayout}>
          Reset card layout
        </button>
      </div>
    </>
  );
}

/** Your fit pics. Tapping one pulls its real garments onto the card. */
function CollectionGrid({
  onSetPieces,
  onToast,
}: {
  onSetPieces: (items: WardrobeCard[]) => void;
  onToast: (message: string) => void;
}) {
  const [photos, setPhotos] = useState<FitPicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [pulling, setPulling] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    readApi<FitPicPage>(`/fit-pics${query({ limit: 12 })}`, controller.signal)
      .then((page) => setPhotos(page.items))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "We couldn’t load your fit pics.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  async function pull(photo: FitPicCard) {
    setSelected(photo.id);
    setPulling(photo.id);
    try {
      const detail = await readApi<FitPicDetail>(`/fit-pics/${photo.id}`);
      const garments = (detail.garments ?? []).slice(0, MAX_PIECES);
      if (!garments.length) {
        onToast("No pieces were tagged in that fit pic");
        return;
      }
      onSetPieces(garments);
      onToast(`Pulled ${garments.length} piece${garments.length === 1 ? "" : "s"} from that fit pic`);
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : "We couldn’t read that fit pic.");
    } finally {
      setPulling(null);
    }
  }

  if (loading) return <div className="empty-note">Loading your Collection…</div>;
  if (error) return <div className="empty-note">{error}</div>;
  if (!photos.length) return <div className="empty-note">No fit pics yet. Add some in the Lookbook app.</div>;

  return (
    <div className="pgrid">
      {photos.map((photo) => (
        <button
          type="button"
          className={`pg${selected === photo.id ? " sel" : ""}`}
          key={photo.id}
          onClick={() => pull(photo)}
        >
          {photo.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.image_url} alt={photo.title} loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <div className="lib-media-fallback"><span>LOOKBOOK</span></div>
          )}
          <span className="bdg">{pulling === photo.id ? "…" : `${photo.garment_count} items`}</span>
          <div className="cap">{photo.title}</div>
        </button>
      ))}
    </div>
  );
}
