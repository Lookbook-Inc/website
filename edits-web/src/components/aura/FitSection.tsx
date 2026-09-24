"use client";

import { useEffect, useState } from "react";
import type { FitPicCard, FitPicDetail, FitPicPage, WardrobeCard } from "@/types/api";
import { readApi, query } from "./client-api";
import { MAX_PIECES } from "./placeholders";
import type { CardPhoto } from "./types";
import { WardrobePicker } from "./WardrobePicker";

type Mode = "combo" | "collection";

export function FitSection({
  items,
  itemTypes,
  initialWardrobe,
  initialWardrobeFetchedAt,
  onSetPieces,
  photo,
  onSetPhoto,
  onResetLayout,
  onToast,
}: {
  items: WardrobeCard[];
  itemTypes: string[];
  initialWardrobe: WardrobeCard[];
  initialWardrobeFetchedAt: number;
  onSetPieces: (items: WardrobeCard[]) => void;
  photo: CardPhoto | null;
  onSetPhoto: (photo: CardPhoto | null) => void;
  onResetLayout: () => void;
  onToast: (message: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("combo");

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
        <WardrobePicker
          items={items}
          itemTypes={itemTypes}
          initialWardrobe={initialWardrobe}
          initialWardrobeFetchedAt={initialWardrobeFetchedAt}
          onSetPieces={onSetPieces}
          onToast={onToast}
        />
      ) : (
        <CollectionGrid
          photoId={photo?.id ?? null}
          onSetPieces={onSetPieces}
          onSetPhoto={onSetPhoto}
          onToast={onToast}
        />
      )}

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
