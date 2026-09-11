"use client";

import type { WardrobeCard } from "@/types/api";
import { Collage } from "./Collage";
import { GradientArt } from "./GradientArt";
import { hash, swatchColors } from "./palette";
import type { CardKind, CardState, Placement } from "./types";

const strip = (value: string) => value.replace(/^["“]|["”]$/g, "");

function StatusBar() {
  return (
    <div className="statusbar">
      <span>9:41</span>
      <span className="sb-r">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true"><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="4.5" y="5" width="3" height="7" rx="1" /><rect x="9" y="2.5" width="3" height="9.5" rx="1" /><rect x="13.5" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true"><path d="M8 11.2l2.1-2.4a3.1 3.1 0 0 0-4.2 0zM8 6.1c1.5 0 2.9.6 3.9 1.6l1.4-1.6A7.6 7.6 0 0 0 8 4a7.6 7.6 0 0 0-5.3 2.1l1.4 1.6A5.4 5.4 0 0 1 8 6.1zM8 1.4c2.5 0 4.8 1 6.5 2.5l1.3-1.5A11.3 11.3 0 0 0 8 0C5 0 2.3 1.1.2 2.4l1.3 1.5A9.9 9.9 0 0 1 8 1.4z" /></svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true"><rect x=".7" y=".7" width="19.6" height="10.6" rx="3.2" stroke="currentColor" strokeOpacity=".5" /><rect x="2.2" y="2.2" width="16.6" height="7.6" rx="1.9" fill="currentColor" /><path d="M22 4.3v3.4a2 2 0 0 0 0-3.4z" fill="currentColor" fillOpacity=".5" /></svg>
      </span>
    </div>
  );
}

export function CardPreview({
  card,
  items,
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
  const swatches = swatchColors(items);
  const peekNight = otherKind === "night";

  return (
    <div className={`phone${card.kind === "night" ? " night" : ""}`} ref={cardRef}>
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

            <p className="quote">{`“${strip(card.line)}”`}</p>

            <Collage
              items={items}
              layout={card.layout}
              blob={card.blob}
              onLayoutChange={onLayoutChange}
              interactive={Boolean(onLayoutChange)}
            />

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
                      <GradientArt colors={card.song.colors} seed={hash(card.song.id)} />
                      <span className="play">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
                      </span>
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="t1">{card.song.title}</span>
                      <span className="t2">{card.song.artist}</span>
                    </span>
                  </div>
                </div>
                <div className="vr" />
                <div className="col">
                  <div className="row">
                    <span className="art sq">
                      <GradientArt colors={card.place.colors} seed={hash(card.place.id)} />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span className="t1">{card.place.name}</span>
                      <span className="t2">{card.place.city}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="actbar" style={{ background: card.blob }}>
            <span className="pill out">Did smth diff</span>
            <span className="shr">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 15V3.5m0 0L8 7.5M12 3.5 16 7.5" /><path d="M4.5 13v6a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-6" /></svg>
            </span>
            <span className="pill fill">I fw this</span>
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
          <span>{`“${strip(otherLine).toLowerCase()}”`}</span>
        </button>
      </div>
    </div>
  );
}
