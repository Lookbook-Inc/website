"use client";

import type { WardrobeCard } from "@/types/api";
import { placeColors, placeImageUrl, songColors } from "./banks";
import { Collage } from "./Collage";
import { CoverArt } from "./CoverArt";
import { swatchColors } from "./palette";
import type { CardKind, CardState, Placement } from "./types";

const strip = (value: string) => value.replace(/^["“]|["”]$/g, "");

/** "A, B & C feat. D" → one name per line. Keeps "Tyler, The Creator" whole. */
const splitArtists = (value: string) =>
  value
    .split(/\s*(?:,(?!\s*The\s)|&|\bfeat\.?|\bft\.?|\bfeaturing\b)\s*/i)
    .map((name) => name.trim())
    .filter(Boolean);

/**
 * The iOS status bar around the Dynamic Island: the time centred in the left
 * ear, and cellular, Wi-Fi and battery centred in the right — as on an iPhone
 * 15/16 Pro. Glyphs are drawn to the SF Symbols proportions.
 */
function StatusBar() {
  return (
    <div className="statusbar">
      <span className="sb-time">9:41</span>
      <span className="island" aria-hidden="true">
        <i className="lens" />
      </span>
      <span className="sb-icons" aria-hidden="true">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.9" />
          <rect x="4.8" y="5.2" width="3.2" height="6.8" rx="0.9" />
          <rect x="9.6" y="2.7" width="3.2" height="9.3" rx="0.9" />
          <rect x="14.4" y="0" width="3.2" height="12" rx="0.9" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 2.3c2.3 0 4.4.9 6 2.4.2.2.5.2.7 0l1-1c.2-.2.2-.5 0-.7A11 11 0 0 0 8 0 11 11 0 0 0 .3 3c-.2.2-.2.5 0 .7l1 1c.2.2.5.2.7 0A8.6 8.6 0 0 1 8 2.3z" />
          <path d="M8 6c1.3 0 2.5.5 3.4 1.3.2.2.5.2.7 0l1-1c.2-.2.2-.5 0-.7A7.4 7.4 0 0 0 8 3.7c-1.9 0-3.7.7-5.1 1.9-.2.2-.2.5 0 .7l1 1c.2.2.5.2.7 0C5.5 6.5 6.7 6 8 6z" />
          <path d="M10.3 9.3c.2-.2.2-.5 0-.7A3.4 3.4 0 0 0 8 7.7c-.9 0-1.7.3-2.3.9-.2.2-.2.5 0 .7l1.9 1.9c.2.2.5.2.7 0z" />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3.4" stroke="currentColor" strokeOpacity="0.4" />
          <rect x="2" y="2" width="19" height="8" rx="2.1" fill="currentColor" />
          <path d="M24 4v4c.8-.3 1.3-1.1 1.3-2S24.8 4.3 24 4z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

export function CardPreview({
  card,
  items,
  paletteItems,
  ownerLabel,
  weekday,
  monthDay,
  otherKind,
  otherTitle,
  otherLine,
  otherBlob,
  onLayoutChange,
  onPeek,
  cardRef,
}: {
  card: CardState;
  items: WardrobeCard[];
  /** What the palette reads — the fit pic's garments when one is on the card. */
  paletteItems: WardrobeCard[];
  ownerLabel: string;
  weekday: string;
  monthDay: string;
  otherKind: CardKind;
  otherTitle: string;
  otherLine: string;
  otherBlob: string;
  onLayoutChange?: (id: string, changes: Partial<Placement>) => void;
  onPeek?: () => void;
  cardRef?: React.Ref<HTMLDivElement>;
}) {
  const swatches = swatchColors(paletteItems);
  const peekNight = otherKind === "night";

  return (
    <div className={`phone${card.kind === "night" ? " night" : ""}`} ref={cardRef}>
      <i className="hw hw-action" aria-hidden="true" />
      <i className="hw hw-vol-up" aria-hidden="true" />
      <i className="hw hw-vol-down" aria-hidden="true" />
      <i className="hw hw-power" aria-hidden="true" />
      <div className="phone-screen">
        <StatusBar />

        <div className="lb-head">
          <span className="lb-word">Lookbook</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
            <circle cx="12" cy="8" r="3.6" />
            <path d="M5 20.5a7 7 0 0 1 14 0" strokeLinecap="round" />
          </svg>
        </div>

        <div className="card-body">
          <div className="sheetcard">
            <div className="meta">
              <div>
                <div suppressHydrationWarning>{weekday}</div>
                <div suppressHydrationWarning>{monthDay}</div>
              </div>
              <div className="c">{ownerLabel}</div>
              <div className="r">
                <div>{card.temp}</div>
                <div>{card.sky}</div>
              </div>
            </div>

            <p className="quote">{strip(card.line)}</p>

            {card.photo ? (
              <div className="fitphoto">
                {/* Signed private media: plain img, eager so the PNG export has it. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.photo.url} alt={card.photo.title} referrerPolicy="no-referrer" />
              </div>
            ) : (
              <Collage
                items={items}
                layout={card.layout}
                blob={card.blob}
                blobSeed={card.kind}
                blobSize={card.blobSize}
                onLayoutChange={onLayoutChange}
                interactive={Boolean(onLayoutChange)}
              />
            )}

            <p className="palette-name">{`“${card.palName}”`}</p>
            <div className="card-swatches">
              {swatches.map((color, index) => (
                <i key={`${color}-${index}`} style={{ background: color }} />
              ))}
            </div>

            <div className="duo">
              <div className="duo-labels">
                <span>Your soundtrack</span>
                <span>Your place</span>
              </div>
              <div className="duo-body">
                <div className="col">
                  <div className="row">
                    <span className="art">
                      {card.song ? (
                        <CoverArt id={card.song.id} imageUrl={card.song.cover_url} colors={songColors(card.song)} />
                      ) : null}
                      <span className="play">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
                      </span>
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="t1">{card.song?.song_title ?? "No song yet"}</span>
                      {splitArtists(card.song?.artist_display ?? "").map((artist) => (
                        <span key={artist} className="t2">{artist}</span>
                      ))}
                    </span>
                  </div>
                </div>
                <div className="vr" />
                <div className="col">
                  <div className="row">
                    <span className="art sq">
                      {card.place ? (
                        <CoverArt id={card.place.id} imageUrl={placeImageUrl(card.place)} colors={placeColors(card.place)} />
                      ) : null}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="t1">{card.place?.place_name ?? "No place yet"}</span>
                      <span className="t2">{card.place?.geography_display ?? ""}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Tonight's strip is dark like its card and wears its accent on the line;
            today's strip is filled with today's accent. */}
        <button
          className={`peek${peekNight ? " night" : ""}`}
          type="button"
          onClick={onPeek}
          disabled={!onPeek}
          style={peekNight ? ({ "--peek-accent": otherBlob } as React.CSSProperties) : { background: otherBlob }}
        >
          <span className="go-edit">Edit this →</span>
          <b>{otherTitle}</b>
          <span>{strip(otherLine).toLowerCase()}</span>
        </button>

        <div className="home-indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
