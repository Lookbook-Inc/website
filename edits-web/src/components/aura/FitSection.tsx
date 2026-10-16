"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FitPicCard, FitPicDetail, FitPicPage, WardrobeCard } from "@/types/api";
import { PieceArt } from "./PieceArt";
import { SIZE_MAX, SIZE_MIN } from "./Collage";
import { readApi, query } from "./client-api";
import { MAX_PIECES } from "./placeholders";
import type { CardPhoto, Placement } from "./types";

type Mode = "combo" | "collection";

const PIECE_W = 104;
const PIECE_H = 124;

export function FitSection({
  items,
  layout,
  onOpenPicker,
  onResize,
  onSetPieces,
  photo,
  onSetPhoto,
  onResetLayout,
  onToast,
}: {
  items: WardrobeCard[];
  layout: Record<string, Placement>;
  onOpenPicker: () => void;
  onResize: (id: string, size: number) => void;
  onSetPieces: (items: WardrobeCard[]) => void;
  photo: CardPhoto | null;
  onSetPhoto: (photo: CardPhoto | null) => void;
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
      <div className="seg seg-wide" role="group" aria-label="How to add the outfit">
        <button type="button" className={mode === "combo" ? "on" : ""} aria-pressed={mode === "combo"} onClick={() => setMode("combo")}>
          Pick pieces
        </button>
        <button type="button" className={mode === "collection" ? "on" : ""} aria-pressed={mode === "collection"} onClick={() => setMode("collection")}>
          Use a fit pic
        </button>
      </div>

      {photo ? (
        <div className="photo-note">
          <span>Your fit pic is on the card.</span>
          <button className="link-btn" type="button" onClick={() => onSetPhoto(null)}>
            Switch back to pieces
          </button>
        </div>
      ) : null}

      {mode === "combo" ? (
        <div>
          <div className="pane-mini" ref={paneRef}>
            {!items.length ? <div className="pane-empty">No pieces yet</div> : null}
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
            <button className="btn btn-brass" type="button" aria-label="Add clothing items" onClick={onOpenPicker}>
              Add or change pieces
            </button>
            <button className="btn btn-ghost" type="button" onClick={tidy}>
              Tidy
            </button>
            <span className="hint-inline">
              {items.length ? `${items.length} of ${MAX_PIECES} pieces` : `Add up to ${MAX_PIECES} pieces`}
            </span>
          </div>
        </div>
      ) : (
        <CollectionGrid
          photoId={photo?.id ?? null}
          onSetPieces={onSetPieces}
          onSetPhoto={onSetPhoto}
          onToast={onToast}
        />
      )}

      {items.length && !photo ? (
        <div className="sizes">
          <div className="sizes-head">
            <span className="field-label">Size on the card</span>
            <span>You can also drag pieces on the card itself.</span>
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

      {photo ? null : (
        <div className="chosen">
          <button className="link-btn" type="button" onClick={onResetLayout}>
            Reset card layout
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Your fit pics. Hovering (or tapping, on touch) one offers two things: pull its
 * tagged garments onto the card as pieces, or put the photo itself on the card.
 */
function CollectionGrid({
  photoId,
  onSetPieces,
  onSetPhoto,
  onToast,
}: {
  photoId: string | null;
  onSetPieces: (items: WardrobeCard[]) => void;
  onSetPhoto: (photo: CardPhoto) => void;
  onToast: (message: string) => void;
}) {
  const [photos, setPhotos] = useState<FitPicCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(photoId);
  const [open, setOpen] = useState<string | null>(null);
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
    setOpen(null);
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

  async function putPicture(photo: FitPicCard) {
    const url = photo.image_url;
    if (!url) {
      onToast("That fit pic has no image to use");
      return;
    }
    setSelected(photo.id);
    setOpen(null);
    setPulling(photo.id);
    // The tagged garments drive the palette. If they can't be read, the photo
    // still goes on the card and the palette keeps the pieces' colours.
    let garments: WardrobeCard[] = [];
    try {
      garments = (await readApi<FitPicDetail>(`/fit-pics/${photo.id}`)).garments ?? [];
    } catch {
      // fall through with no garments
    } finally {
      setPulling(null);
    }
    onSetPhoto({ id: photo.id, url, title: photo.title, garments });
    onToast("Fit pic is on the card");
  }

  if (loading) return <div className="empty-note">Loading your Collection…</div>;
  if (error) return <div className="empty-note">{error}</div>;
  if (!photos.length) return <div className="empty-note">No fit pics yet. Add some in the Lookbook app.</div>;

  return (
    <div className="pgrid">
      {photos.map((photo) => (
        <div
          className={`pg${selected === photo.id ? " sel" : ""}${open === photo.id ? " open" : ""}`}
          key={photo.id}
          onClick={() => setOpen(photo.id)}
        >
          {photo.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo.image_url} alt={photo.title} loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <div className="lib-media-fallback"><span>LOOKBOOK</span></div>
          )}
          <span className="bdg">{pulling === photo.id ? "…" : `${photo.garment_count} items`}</span>
          <div className="cap">{photo.title}</div>
          <div className="pg-ov">
            <button
              type="button"
              aria-label={`Use pieces from ${photo.title}`}
              onClick={(event) => { event.stopPropagation(); pull(photo); }}
            >
              Use pieces from picture
            </button>
            <button
              type="button"
              aria-label={`Use ${photo.title} on the card`}
              onClick={(event) => { event.stopPropagation(); putPicture(photo); }}
            >
              Use this picture
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
