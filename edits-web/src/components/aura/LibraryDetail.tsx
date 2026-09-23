"use client";

import { useEffect, useState } from "react";
import type { FitPicDetail, FitPicPage, OutfitDetail, WardrobeDetail } from "@/types/api";
import { readApi, query } from "./client-api";

export type DetailTarget =
  | { kind: "wardrobe"; id: string }
  | { kind: "fit-pic"; id: string }
  | { kind: "outfit"; id: string };

function formatDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}

function Photo({ src, alt }: { src: string | null | undefined; alt: string }) {
  if (!src) {
    return (
      <div className="panel-media">
        <div className="lib-media-fallback" style={{ aspectRatio: "4 / 5" }} role="img" aria-label={`${alt} image unavailable`}>
          <span>LOOKBOOK</span>
        </div>
      </div>
    );
  }
  return (
    <div className="panel-media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} referrerPolicy="no-referrer" />
    </div>
  );
}

/** Detail for a wardrobe piece, fit pic or outfit — opened in-shell, never a route. */
export function LibraryDetail({
  target,
  onClose,
  onUsePieces,
}: {
  target: DetailTarget | null;
  onClose: () => void;
  onUsePieces?: (ids: string[]) => void;
}) {
  const [data, setData] = useState<WardrobeDetail | FitPicDetail | OutfitDetail | null>(null);
  const [worn, setWorn] = useState<FitPicPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    const controller = new AbortController();

    const run = async () => {
      setData(null);
      setWorn(null);
      setError(null);

      const path =
        target.kind === "wardrobe" ? `/wardrobe/${target.id}`
        : target.kind === "fit-pic" ? `/fit-pics/${target.id}`
        : `/outfits/${target.id}`;

      if (target.kind === "wardrobe") {
        // The relationship strip is supplementary — a failure just hides it.
        readApi<FitPicPage>(`/wardrobe/${target.id}/fit-pics${query({ limit: 6 })}`, controller.signal)
          .then(setWorn)
          .catch(() => undefined);
      }

      try {
        setData(await readApi<WardrobeDetail | FitPicDetail | OutfitDetail>(path, controller.signal));
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "We couldn’t load that.");
      }
    };

    void run();
    return () => controller.abort();
  }, [target]);

  const open = Boolean(target);

  return (
    <>
      <div className={`panel-bg${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`panel${open ? " open" : ""}`} aria-hidden={!open} aria-label="Details">
        <div className="panel-top">
          <span className="eyebrow">
            {target?.kind === "wardrobe" ? "Wardrobe piece" : target?.kind === "fit-pic" ? "Fit pic" : "Outfit"}
          </span>
          <button className="fv-close" type="button" style={{ position: "static" }} onClick={onClose} aria-label="Close details">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <div className="panel-body">
          {error ? <p className="empty-note">{error}</p> : null}
          {!error && !data ? <p className="lib-loading">Loading…</p> : null}

          {data && target?.kind === "wardrobe" ? <WardrobeBody item={data as WardrobeDetail} worn={worn} /> : null}
          {data && target?.kind === "fit-pic" ? (
            <FitPicBody item={data as FitPicDetail} onUsePieces={onUsePieces} onClose={onClose} />
          ) : null}
          {data && target?.kind === "outfit" ? <OutfitBody item={data as OutfitDetail} /> : null}
        </div>
      </aside>
    </>
  );
}

function WardrobeBody({ item, worn }: { item: WardrobeDetail; worn: FitPicPage | null }) {
  return (
    <>
      <Photo src={item.image_url} alt={item.name} />
      <p className="panel-brand" style={{ marginTop: "18px" }}>{item.brand ?? "No brand"}</p>
      <h2>{item.name}</h2>
      {item.caption ? <p className="panel-desc">{item.caption}</p> : null}

      <dl className="panel-list">
        <dt>Type</dt><dd>{item.item_type ?? "—"}</dd>
        <dt>Material</dt><dd>{item.material ?? "—"}</dd>
        <dt>Added</dt><dd>{formatDate(item.created_at)}</dd>
        <dt>Fit pics</dt><dd>{item.fit_pic_count}</dd>
      </dl>

      {item.details ? <p className="panel-desc">{item.details}</p> : null}

      {item.shades?.length ? (
        <div className="panel-shades">
          {item.shades.map((shade, index) => (
            <span key={`${shade.hex_code}-${index}`}>
              <i style={{ background: shade.hex_code ?? "transparent" }} />
              {shade.name ?? shade.color_group ?? "Shade"}
            </span>
          ))}
        </div>
      ) : null}

      {worn?.items.length ? (
        <>
          <p className="panel-sub">Worn with this piece</p>
          <div className="panel-strip">
            {worn.items.map((pic) => (
              <div key={pic.id}>
                <div className="lib-media">
                  {pic.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pic.image_url} alt={pic.title} loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="lib-media-fallback"><span>LOOKBOOK</span></div>
                  )}
                </div>
                <div className="lib-meta"><div><p>{pic.title}</p></div></div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function FitPicBody({
  item,
  onUsePieces,
  onClose,
}: {
  item: FitPicDetail;
  onUsePieces?: (ids: string[]) => void;
  onClose: () => void;
}) {
  const garmentIds = (item.garments ?? []).map((garment) => garment.id);
  return (
    <>
      <Photo src={item.image_url} alt={item.title} />
      <h2>{item.title}</h2>
      <p className="panel-brand">{formatDate(item.created_at)} · {item.garment_count} pieces</p>
      {item.caption ? <p className="panel-desc">{item.caption}</p> : null}

      {onUsePieces && garmentIds.length ? (
        <button
          className="btn btn-brass"
          type="button"
          style={{ marginTop: "10px" }}
          onClick={() => {
            onUsePieces(garmentIds);
            onClose();
          }}
        >
          Put these pieces on the card
        </button>
      ) : null}

      <dl className="panel-list">
        <dt>Last worn</dt><dd>{item.last_worn ? formatDate(item.last_worn) : "—"}</dd>
        <dt>Favourite</dt><dd>{item.favorited ? "Yes" : "No"}</dd>
      </dl>

      {item.user_notes ? <p className="panel-desc">{item.user_notes}</p> : null}

      {item.garments?.length ? (
        <>
          <p className="panel-sub">Pieces in this fit</p>
          <div className="panel-strip">
            {item.garments.map((garment) => (
              <div key={garment.id}>
                <div className="lib-media">
                  {garment.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={garment.image_url} alt={garment.name} loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="lib-media-fallback"><span>LOOKBOOK</span></div>
                  )}
                </div>
                <div className="lib-meta"><div><p>{garment.name}</p></div></div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function OutfitBody({ item }: { item: OutfitDetail }) {
  return (
    <>
      <Photo src={item.cover_url} alt={item.name} />
      <h2>{item.name}</h2>
      <p className="panel-brand">
        {item.source === "RECOMMENDATIONS" ? "Saved recommendation" : formatDate(item.created_at)}
      </p>
      {item.description ? <p className="panel-desc">{item.description}</p> : null}

      {item.items?.length ? (
        <>
          <p className="panel-sub">Pieces</p>
          <div className="panel-strip">
            {item.items.map((piece, index) => (
              <div key={piece.clothing_item_id ?? piece.id ?? index}>
                <div className="lib-media">
                  {piece.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={piece.image_url} alt={piece.name ?? "Piece"} loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="lib-media-fallback"><span>LOOKBOOK</span></div>
                  )}
                </div>
                <div className="lib-meta"><div><p>{piece.name ?? piece.item_type ?? "Piece"}</p></div></div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
