"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WardrobeCard } from "@/types/api";
import { logout } from "@/app/auth-actions";
import { CardPreview } from "./CardPreview";
import { DaySection } from "./DaySection";
import { FitSection } from "./FitSection";
import { HowToUse } from "./HowToUse";
import { Library } from "./Library";
import { LineSection } from "./LineSection";
import { PaletteSection } from "./PaletteSection";
import { PickerSheet } from "./PickerSheet";
import { SearchList } from "./SearchList";
import { Section } from "./Section";
import { downloadCard } from "./download";
import { classify } from "./garments";
import { paletteNamesFor } from "./palette";
import { BLOB_COLORS, LINES, MAX_PIECES, PLACES, SONGS, WEATHER } from "./placeholders";
import type { CardKind, CardState, Catalogue, Placement, Screen } from "./types";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const SLOT_ORDER = ["outer", "top", "bottom", "shoes", "hat", "acc"] as const;

/** A plausible starting outfit: at most one piece per slot, in wardrobe order. */
function seedPieces(wardrobe: WardrobeCard[]) {
  const chosen: WardrobeCard[] = [];
  const used = new Set<string>();
  for (const slot of SLOT_ORDER) {
    const match = wardrobe.find(
      (item) => !used.has(item.id) && classify(item.item_type).slot === slot,
    );
    if (match) {
      used.add(match.id);
      chosen.push(match);
    }
  }
  // Top up from whatever is left if the wardrobe is thin on variety.
  for (const item of wardrobe) {
    if (chosen.length >= MAX_PIECES) break;
    if (!used.has(item.id)) {
      used.add(item.id);
      chosen.push(item);
    }
  }
  return chosen.slice(0, MAX_PIECES);
}

function seedCard(kind: CardKind, wardrobe: WardrobeCard[]): CardState {
  const pieces = seedPieces(kind === "day" ? wardrobe : [...wardrobe].reverse());
  const names = paletteNamesFor(pieces);
  return {
    kind,
    title: kind === "day" ? "Today's Edit." : "Tonight's Edit.",
    temp: WEATHER[kind].temp,
    sky: WEATHER[kind].sky,
    pieces: pieces.map((item) => item.id),
    line: kind === "day" ? LINES[0].text : LINES[1].text,
    palName: names[0],
    blob: kind === "day" ? BLOB_COLORS[0].hex : BLOB_COLORS[1].hex,
    song: kind === "day" ? SONGS[0] : SONGS[4],
    place: kind === "day" ? PLACES[0] : PLACES[6],
    layout: {},
  };
}

function todayISO() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Format a `yyyy-mm-dd` string for the card. Parsed field by field because
 * `new Date("2026-09-10")` is treated as UTC midnight, which reads as the
 * previous day anywhere west of Greenwich.
 */
function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return {
    weekday: DAYS[date.getDay()],
    monthDay: `${MONTHS[date.getMonth()]} ${date.getDate()}`,
    long: date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
  };
}

function initials(email: string | null) {
  if (!email) return "LB";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
  return letters.toUpperCase();
}

const RAIL: { id: Screen; label: string; icon: React.ReactNode }[] = [
  {
    id: "today", label: "Today's edit",
    icon: <><rect x="3.5" y="4.5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8.5 3v3M15.5 3v3" /></>,
  },
  {
    id: "library", label: "Your Lookbook",
    icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M9 9v11" /></>,
  },
  {
    id: "help", label: "How to use",
    icon: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 1 1 3.2 2.9c-.6.2-.8.7-.8 1.3v.4" /><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none" /></>,
  },
];

export function AuraApp({
  email,
  firstName,
  initialWardrobe,
  itemTypes,
  wardrobeCount,
  outfitCount,
  serverDateISO,
}: {
  email: string | null;
  firstName: string | null;
  initialWardrobe: WardrobeCard[];
  itemTypes: string[];
  wardrobeCount: number;
  outfitCount: number;
  serverDateISO: string;
}) {
  const [catalogue, setCatalogue] = useState<Catalogue>(() =>
    Object.fromEntries(initialWardrobe.map((item) => [item.id, item])),
  );
  const [cards, setCards] = useState<Record<CardKind, CardState>>(() => ({
    day: seedCard("day", initialWardrobe),
    night: seedCard("night", initialWardrobe),
  }));
  const [active, setActive] = useState<CardKind>("day");
  const [screen, setScreen] = useState<Screen>("today");
  const [openSection, setOpenSection] = useState<number | null>(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [fullOpen, setFullOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const paneCardRef = useRef<HTMLDivElement | null>(null);
  const fullCardRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /**
   * Until the member picks a date, this is "today" — which the server computes
   * in UTC and the browser in its own timezone, so the two deliberately
   * disagree around midnight. The elements that show it carry
   * `suppressHydrationWarning`, so React keeps the client's value.
   */
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const dateISO = pickedDate ?? (typeof window === "undefined" ? serverDateISO : todayISO());
  const today = formatDate(dateISO);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const say = useCallback((message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const card = cards[active];
  const items = useMemo(
    () => card.pieces.map((id) => catalogue[id]).filter((item): item is WardrobeCard => Boolean(item)),
    [card.pieces, catalogue],
  );
  const other = cards[active === "day" ? "night" : "day"];

  const patch = useCallback(
    (changes: Partial<CardState>) => {
      setCards((current) => ({ ...current, [active]: { ...current[active], ...changes } }));
    },
    [active],
  );

  const setPieces = useCallback(
    (next: WardrobeCard[]) => {
      const capped = next.slice(0, MAX_PIECES);
      setCatalogue((current) => {
        const merged = { ...current };
        for (const item of capped) merged[item.id] = item;
        return merged;
      });
      setCards((current) => {
        const target = current[active];
        const names = paletteNamesFor(capped);
        return {
          ...current,
          [active]: {
            ...target,
            pieces: capped.map((item) => item.id),
            palName: names.includes(target.palName) ? target.palName : names[0],
          },
        };
      });
    },
    [active],
  );

  const usePieceIds = useCallback(
    (ids: string[]) => {
      const resolved = ids
        .map((id) => catalogue[id])
        .filter((item): item is WardrobeCard => Boolean(item));
      if (!resolved.length) {
        say("Those pieces aren’t loaded yet");
        return;
      }
      setPieces(resolved);
      setScreen("today");
      say(`Put ${resolved.length} piece${resolved.length === 1 ? "" : "s"} on the card`);
    },
    [catalogue, setPieces, say],
  );

  /** Merge a move or a resize into one piece's placement on the active card. */
  const onLayoutChange = useCallback(
    (id: string, changes: Partial<Placement>) => {
      setCards((current) => {
        const target = current[active];
        const placement = { ...(target.layout[id] ?? { fx: 0, fy: 0 }), ...changes };
        return { ...current, [active]: { ...target, layout: { ...target.layout, [id]: placement } } };
      });
    },
    [active],
  );

  function openPicker() {
    setPicked(card.pieces);
    setSheetOpen(true);
  }

  function shuffle() {
    const pool = Object.values(catalogue);
    if (!pool.length) {
      say("Nothing in your wardrobe to shuffle");
      return;
    }
    const picked: WardrobeCard[] = [];
    const used = new Set<string>();
    for (const slot of SLOT_ORDER) {
      const group = pool.filter((item) => !used.has(item.id) && classify(item.item_type).slot === slot);
      if (!group.length) continue;
      const choice = group[Math.floor(Math.random() * group.length)];
      used.add(choice.id);
      picked.push(choice);
    }
    const names = paletteNamesFor(picked);
    setCards((current) => ({
      ...current,
      [active]: {
        ...current[active],
        pieces: picked.map((item) => item.id),
        layout: {},
        line: LINES[Math.floor(Math.random() * LINES.length)].text,
        palName: names[0],
        song: SONGS[Math.floor(Math.random() * SONGS.length)],
        place: PLACES[Math.floor(Math.random() * PLACES.length)],
        blob: BLOB_COLORS[Math.floor(Math.random() * BLOB_COLORS.length)].hex,
      },
    }));
    say("New edit drafted");
  }

  async function download() {
    if (busy) return;
    // Always the pane card: it stays mounted at natural size behind the overlay,
    // so a scaled-to-fit full view never shrinks the exported PNG.
    const node = paneCardRef.current;
    if (!node) return;
    setBusy(true);
    say("Rendering the card…");
    try {
      const name = await downloadCard(node);
      say(`PNG ready · ${name}`);
    } catch {
      if (!fullOpen) setFullOpen(true);
      say("Couldn’t render a PNG here — screenshot this view");
    } finally {
      setBusy(false);
    }
  }

  // Esc closes whatever is on top.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (sheetOpen) setSheetOpen(false);
      else if (fullOpen) setFullOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen, fullOpen]);

  useEffect(() => {
    document.body.style.overflow = fullOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullOpen]);

  /**
   * Shrink the full-view card until the action bar fits on screen. `zoom` is used
   * rather than `transform` because it actually reflows the box, so nothing is
   * left floating over empty space. Written straight to the node — no state, so
   * no re-render per resize tick.
   */
  useEffect(() => {
    if (!fullOpen) return;
    const card = fullCardRef.current;
    if (!card) return;
    const fit = () => {
      card.style.zoom = "1";
      const natural = card.offsetHeight;
      if (!natural) return;
      const room = window.innerHeight - 200;
      card.style.zoom = String(Math.max(0.45, Math.min(1, room / natural)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fullOpen]);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("lb-theme", next);
    } catch {
      // Private browsing — the theme just won't stick between visits.
    }
    say(next === "dark" ? "Dark" : "Light");
  }

  const which = active === "day" ? "Today's" : "Tonight's";
  const crumb =
    screen === "today" ? `${which} edit`
    : screen === "library" ? "Your Lookbook"
    : "How to use";

  const cardProps = {
    card,
    items,
    ownerLabel: `${(firstName ?? email?.split("@")[0] ?? "Your").toUpperCase()}'S EDIT.`,
    weekday: today.weekday,
    monthDay: today.monthDay,
    otherKind: other.kind,
    otherTitle: other.title,
    otherLine: other.line,
    otherBlob: other.blob,
  };

  return (
    <>
      <nav className="rail" aria-label="Main">
        <div className="logo mark" title="e. by lookbook">e.</div>
        {RAIL.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`nav${screen === entry.id ? " on" : ""}`}
            aria-label={entry.label}
            aria-current={screen === entry.id ? "page" : undefined}
            onClick={() => setScreen(entry.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              {entry.icon}
            </svg>
            <span className="nav-tip">{entry.label}</span>
          </button>
        ))}
        <div className="spacer" />
        <button type="button" className="nav" aria-label="Toggle theme" onClick={toggleTheme}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M20 13.5A8 8 0 1 1 10.5 4a6.4 6.4 0 0 0 9.5 9.5z" />
          </svg>
          <span className="nav-tip">Theme</span>
        </button>
        <form action={logout}>
          <button type="submit" className="nav" aria-label="Sign out">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M15 4.5h3.5A1.5 1.5 0 0 1 20 6v12a1.5 1.5 0 0 1-1.5 1.5H15M10 8l-4 4 4 4M6 12h10" />
            </svg>
            <span className="nav-tip">Sign out</span>
          </button>
        </form>
        <div className="avatar" title={email ?? "Lookbook member"}>{initials(email)}</div>
      </nav>

      <div className="layout">
        <aside className="cardpane">
          <div className="cardpane-head">
            <div>
              <p className="eyebrow">{active === "day" ? "Today's card" : "Tonight's card"}</p>
              <div className="cardpane-date" suppressHydrationWarning>{today.long}</div>
            </div>
            <span className="synced"><span className="dot" />Live</span>
          </div>

          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <CardPreview
              {...cardProps}
              cardRef={paneCardRef}
              onLayoutChange={onLayoutChange}
              onPeek={() => {
                setActive(active === "day" ? "night" : "day");
                say(active === "day" ? "Editing tonight's edit" : "Editing today's edit");
              }}
            />
          </div>

          <div className="cardpane-foot">
            <button className="btn btn-primary" type="button" onClick={download} disabled={busy}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" /><path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" /></svg>
              Download image
            </button>
            <button className="btn btn-ghost narrow" type="button" title="Surprise me" aria-label="Shuffle the edit" onClick={shuffle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 7h4l8 10h4M4 17h4l2-2.5M16 7h4M18 5l2 2-2 2M18 15l2 2-2 2" /></svg>
            </button>
          </div>
          <div className="cardpane-foot" style={{ marginTop: "-8px" }}>
            <button className="btn btn-ghost" type="button" onClick={() => setFullOpen(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" /></svg>
              See final aura card
            </button>
          </div>
        </aside>

        <div className="toolpane">
          <div className="toolbar">
            <strong className="crumb">{crumb}</strong>
            <span className="synced"><span className="dot" />{wardrobeCount} pieces synced</span>
          </div>

          {screen === "today" ? (
            <div className="toolwrap">
              <header className="tp-head">
                <p className="eyebrow">Signed in as {firstName ?? email ?? "Lookbook member"}</p>
                <h1>Generate your own <em>edit</em>.</h1>
              </header>

              <Section
                index={1} title="The fit" value={`${items.length} pieces`}
                open={openSection === 1} onToggle={() => setOpenSection(openSection === 1 ? null : 1)}
              >
                <FitSection
                  items={items}
                  layout={card.layout}
                  onOpenPicker={openPicker}
                  onResize={(id, size) => onLayoutChange(id, { s: size })}
                  onSetPieces={setPieces}
                  onResetLayout={() => { patch({ layout: {} }); say("Layout reset"); }}
                  onToast={say}
                />
              </Section>

              <Section
                index={2} title="The line" value={`“${card.line}”`}
                open={openSection === 2} onToggle={() => setOpenSection(openSection === 2 ? null : 2)}
              >
                <LineSection line={card.line} onChange={(line) => patch({ line })} onToast={say} />
              </Section>

              <Section
                index={3} title="The palette" value={card.palName}
                open={openSection === 3} onToggle={() => setOpenSection(openSection === 3 ? null : 3)}
              >
                <PaletteSection
                  items={items} palName={card.palName}
                  onChange={(palName) => patch({ palName })} onToast={say}
                />
              </Section>

              <Section
                index={4} title="Your soundtrack" value={`${card.song.title} · ${card.song.artist}`}
                open={openSection === 4} onToggle={() => setOpenSection(openSection === 4 ? null : 4)}
              >
                <SearchList
                  round
                  options={SONGS.map((song) => ({
                    id: song.id, primary: song.title, secondary: song.artist, colors: song.colors,
                  }))}
                  selectedId={card.song.id}
                  placeholder="Search a song or artist…"
                  label="Search a song or artist"
                  emptyNote={(q) => `No track matches “${q}”.`}
                  onSelect={(id) => {
                    const song = SONGS.find((entry) => entry.id === id);
                    if (song) patch({ song });
                  }}
                />
              </Section>

              <Section
                index={5} title="Your place" value={card.place.name}
                open={openSection === 5} onToggle={() => setOpenSection(openSection === 5 ? null : 5)}
              >
                <SearchList
                  options={PLACES.map((place) => ({
                    id: place.id, primary: place.name, secondary: place.city, colors: place.colors,
                  }))}
                  selectedId={card.place.id}
                  placeholder="Search a place…"
                  label="Search a place"
                  emptyNote={(q) => `No place matches “${q}”.`}
                  onSelect={(id) => {
                    const place = PLACES.find((entry) => entry.id === id);
                    if (place) patch({ place });
                  }}
                />
              </Section>

              <Section
                index={6} title="The day" value={`${today.monthDay} · ${card.temp} ${card.sky}`}
                open={openSection === 6} onToggle={() => setOpenSection(openSection === 6 ? null : 6)}
              >
                <DaySection
                  dateISO={dateISO}
                  temp={card.temp}
                  sky={card.sky}
                  onDateChange={setPickedDate}
                  onTempChange={(temp) => patch({ temp })}
                  onSkyChange={(sky) => patch({ sky })}
                  blob={card.blob}
                  onBlobChange={(blob) => patch({ blob })}
                  onToast={say}
                />
              </Section>

              <div className="publish">
                <button className="btn btn-brass" type="button" style={{ padding: "13px 26px" }} onClick={download} disabled={busy}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" /><path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" /></svg>
                  Download image
                </button>
                <button className="btn btn-ghost" type="button" style={{ padding: "13px 22px" }} onClick={() => setFullOpen(true)}>
                  See final aura card
                </button>
              </div>
            </div>
          ) : null}

          {screen === "library" ? (
            <Library
              wardrobeCount={wardrobeCount}
              outfitCount={outfitCount}
              itemTypes={itemTypes}
              onUsePieces={usePieceIds}
            />
          ) : null}
          {screen === "help" ? <HowToUse /> : null}
        </div>
      </div>

      <PickerSheet
        open={sheetOpen}
        picked={picked}
        itemTypes={itemTypes}
        initialWardrobe={initialWardrobe}
        onPick={setPicked}
        onClose={() => setSheetOpen(false)}
        onCommit={setPieces}
        onToast={say}
      />

      <div className={`fv${fullOpen ? " open" : ""}`} role="dialog" aria-label="Final aura card" aria-hidden={!fullOpen}>
        <span className="fv-mark">{which} aura card</span>
        <button className="fv-close" type="button" aria-label="Close" onClick={() => setFullOpen(false)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {fullOpen ? (
          <div className="fv-inner">
            <CardPreview {...cardProps} cardRef={fullCardRef} onLayoutChange={onLayoutChange} />
            <div className="fv-bar">
              <button className="btn btn-primary" type="button" style={{ width: "auto" }} onClick={download} disabled={busy}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5" /><path d="M4.5 16.5v2A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5v-2" /></svg>
                Download image
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setFullOpen(false)}>Back to editing</button>
            </div>
            <p className="fv-note">Nothing else on screen — screenshot away, or download the PNG.</p>
          </div>
        ) : null}
      </div>

      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
