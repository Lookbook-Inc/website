"use client";

import { useEffect, useState } from "react";
import type {
  FitPicCard, FitPicPage, FolderList, OutfitCard, OutfitPage,
  Recommendations, WardrobeCard, WardrobePage,
} from "@/types/api";
import { readApi, query } from "./client-api";
import { LibraryDetail, type DetailTarget } from "./LibraryDetail";

type Tab = "wardrobe" | "fit-pics" | "outfits" | "edits";

const TABS: { id: Tab; label: string }[] = [
  { id: "wardrobe", label: "Wardrobe" },
  { id: "fit-pics", label: "Fit Pics" },
  { id: "outfits", label: "Outfits" },
  { id: "edits", label: "Edits" },
];

const PAGE_SIZE = 24;

function formatDate(value: string | null | undefined) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

function Thumb({ src, alt, square = false }: { src: string | null | undefined; alt: string; square?: boolean }) {
  return (
    <div className={`lib-media${square ? " square" : ""}`}>
      {src ? (
        // Signed private media bypasses Next's shared image cache.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <div className="lib-media-fallback" role="img" aria-label={`${alt} image unavailable`}>
          <span>LOOKBOOK</span>
        </div>
      )}
    </div>
  );
}

/**
 * The read-only browse surface, condensed from four routes into one tab.
 * Everything here reads through this app's existing `/api/*` GET handlers.
 */
export function Library({
  wardrobeCount,
  outfitCount,
  itemTypes,
  onUsePieces,
}: {
  wardrobeCount: number;
  outfitCount: number;
  itemTypes: string[];
  onUsePieces?: (ids: string[]) => void;
}) {
  const [tab, setTab] = useState<Tab>("wardrobe");
  const [detail, setDetail] = useState<DetailTarget | null>(null);

  return (
    <div className="toolwrap">
      <header className="tp-head">
        <p className="eyebrow">Your Lookbook</p>
        <h1>Everything you <em>own</em>.</h1>
        <div className="lib-stats" style={{ marginTop: "18px" }}>
          <span className="lib-stat"><strong>{wardrobeCount}</strong> pieces</span>
          <span className="lib-stat"><strong>{outfitCount}</strong> outfits</span>
        </div>
      </header>

      <div className="lib-tabs" role="tablist">
        {TABS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={tab === entry.id}
            className={`tab${tab === entry.id ? " on" : ""}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "wardrobe" ? <WardrobeTab itemTypes={itemTypes} onOpen={setDetail} /> : null}
      {tab === "fit-pics" ? <FitPicsTab onOpen={setDetail} /> : null}
      {tab === "outfits" ? <OutfitsTab onOpen={setDetail} /> : null}
      {tab === "edits" ? <EditsTab onOpen={setDetail} /> : null}

      <LibraryDetail target={detail} onClose={() => setDetail(null)} onUsePieces={onUsePieces} />
    </div>
  );
}

/**
 * Shared cursor-paged loader for the three paginated tabs.
 *
 * The fetch itself is a plain function with no state in it, so both the initial
 * effect and the "load more" handler can own their own updates without either
 * one setting state synchronously inside an effect body.
 */
async function fetchPage<TPage>(
  basePath: string,
  params: Record<string, string | number | undefined>,
  cursor: string | null,
  signal?: AbortSignal,
) {
  return readApi<TPage>(`${basePath}${query({ ...params, cursor, limit: PAGE_SIZE })}`, signal);
}

function usePagedList<TPage extends { items: TItem[]; next_cursor: string | null }, TItem>(
  basePath: string,
  params: Record<string, string | number | undefined>,
) {
  const paramsKey = JSON.stringify(params);
  const [items, setItems] = useState<TItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const message = (err: unknown) =>
    err instanceof Error ? err.message : "We couldn’t load this.";

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const parsed = JSON.parse(paramsKey) as Record<string, string | number | undefined>;
        const page = await fetchPage<TPage>(basePath, parsed, null, controller.signal);
        setItems(page.items);
        setCursor(page.next_cursor);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(message(err));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void run();
    return () => controller.abort();
  }, [basePath, paramsKey]);

  const more = async () => {
    if (!cursor) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(paramsKey) as Record<string, string | number | undefined>;
      const page = await fetchPage<TPage>(basePath, parsed, cursor);
      setItems((current) => [...current, ...page.items]);
      setCursor(page.next_cursor);
    } catch (err: unknown) {
      setError(message(err));
    } finally {
      setLoading(false);
    }
  };

  return { items, cursor, loading, error, more: () => void more() };
}

function WardrobeTab({ itemTypes, onOpen }: { itemTypes: string[]; onOpen: (t: DetailTarget) => void }) {
  const [search, setSearch] = useState("");
  const [applied, setApplied] = useState("");
  const [itemType, setItemType] = useState("");

  const { items, cursor, loading, error, more } = usePagedList<WardrobePage, WardrobeCard>(
    "/wardrobe",
    { query: applied, item_type: itemType },
  );

  return (
    <>
      <form
        className="lib-filters"
        onSubmit={(event) => {
          event.preventDefault();
          setApplied(search.trim());
        }}
      >
        <label className="grow">
          Search
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or brand"
          />
        </label>
        <label>
          Filter by garment type
          <select value={itemType} onChange={(event) => setItemType(event.target.value)}>
            <option value="">All types</option>
            {itemTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>
        <button className="btn btn-ghost" type="submit">Apply</button>
      </form>

      <ListState loading={loading} error={error} empty={!items.length} emptyCopy="No wardrobe pieces yet." />

      <div className="lib-grid cols-4">
        {items.map((item) => (
          <button className="lib-card" type="button" key={item.id} onClick={() => onOpen({ kind: "wardrobe", id: item.id })}>
            <Thumb src={item.image_url} alt={item.name} />
            <div className="lib-meta">
              <div>
                <h3>{item.name}</h3>
                <p>{[item.brand, item.item_type].filter(Boolean).join(" · ") || "Wardrobe item"}</p>
              </div>
              <span className="count-pill">{item.fit_pic_count} fits</span>
            </div>
          </button>
        ))}
      </div>

      <More cursor={cursor} loading={loading} onMore={more} />
    </>
  );
}

function FitPicsTab({ onOpen }: { onOpen: (t: DetailTarget) => void }) {
  const { items, cursor, loading, error, more } = usePagedList<FitPicPage, FitPicCard>("/fit-pics", {});

  return (
    <>
      <ListState loading={loading} error={error} empty={!items.length} emptyCopy="Your fit pics will appear here." />
      <div className="lib-grid cols-3">
        {items.map((item) => (
          <button className="lib-card" type="button" key={item.id} onClick={() => onOpen({ kind: "fit-pic", id: item.id })}>
            <Thumb src={item.image_url} alt={item.title} />
            <div className="lib-meta">
              <div>
                <h3>{item.title}</h3>
                <p>{formatDate(item.created_at)} · {item.garment_count} pieces</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <More cursor={cursor} loading={loading} onMore={more} />
    </>
  );
}

function OutfitsTab({ onOpen }: { onOpen: (t: DetailTarget) => void }) {
  const [folders, setFolders] = useState<FolderList["items"]>([]);
  const [folderId, setFolderId] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    readApi<FolderList>("/outfit-folders", controller.signal)
      .then((result) => setFolders(result.items))
      .catch(() => {
        /* Folder filtering is optional; the unfiltered list still works. */
      });
    return () => controller.abort();
  }, []);

  const { items, cursor, loading, error, more } = usePagedList<OutfitPage, OutfitCard>(
    "/outfits",
    { folder_id: folderId },
  );

  return (
    <>
      {folders.length ? (
        <div className="lib-filters">
          <label>
            Folder
            <select value={folderId} onChange={(event) => setFolderId(event.target.value)}>
              <option value="">All outfits</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.name} ({folder.combo_count})</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <ListState loading={loading} error={error} empty={!items.length} emptyCopy="No saved outfits yet." />
      <div className="lib-grid cols-3">
        {items.map((item) => (
          <button className="lib-card" type="button" key={item.id} onClick={() => onOpen({ kind: "outfit", id: item.id })}>
            <Thumb src={item.cover_url} alt={item.name} square />
            <div className="lib-meta">
              <div>
                <h3>{item.name}</h3>
                <p>{item.source === "RECOMMENDATIONS" ? "Saved recommendation" : formatDate(item.created_at)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      <More cursor={cursor} loading={loading} onMore={more} />
    </>
  );
}

function EditsTab({ onOpen }: { onOpen: (t: DetailTarget) => void }) {
  const [data, setData] = useState<Recommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    readApi<Recommendations>("/recommendations/latest", controller.signal)
      .then(setData)
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "We couldn’t load your latest edit.");
        }
      });
    return () => controller.abort();
  }, []);

  if (error) return <p className="empty-note">{error}</p>;
  if (!data) return <p className="lib-loading">Loading your latest edit…</p>;

  const members = data.members.filter((member) => member.combos?.length);
  if (!members.length) {
    return <p className="empty-note">Your next recommendation set hasn’t been generated yet.</p>;
  }

  return (
    <>
      <p className="publish-note" style={{ marginBottom: "22px" }}>
        Generated {data.generated_at ? formatDate(data.generated_at) : "recently"}. Browsing here won’t
        mark it as viewed.
      </p>
      {members.map((member, index) => (
        <div className="lib-group" key={member.folder_id ?? index}>
          <div className="lib-group-head">
            <h2>{member.folder_name ?? "In rotation"}</h2>
            <span className="eyebrow">{member.combos.length} looks</span>
          </div>
          <div className="lib-grid cols-3">
            {member.combos.map((combo) => (
              <button className="lib-card" type="button" key={combo.id} onClick={() => onOpen({ kind: "outfit", id: combo.id })}>
                <Thumb src={combo.cover_url} alt={combo.name} square />
                <div className="lib-meta">
                  <div>
                    <h3>{combo.name}</h3>
                    <p>{combo.description ?? "Recommended look"}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ListState({
  loading, error, empty, emptyCopy,
}: { loading: boolean; error: string | null; empty: boolean; emptyCopy: string }) {
  if (error) return <p className="empty-note">{error}</p>;
  if (loading && empty) return <p className="lib-loading">Loading…</p>;
  if (!loading && empty) return <p className="empty-note">{emptyCopy}</p>;
  return null;
}

function More({ cursor, loading, onMore }: { cursor: string | null; loading: boolean; onMore: () => void }) {
  if (!cursor) return null;
  return (
    <div className="lib-more">
      <button className="btn btn-ghost" type="button" disabled={loading} onClick={onMore}>
        {loading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}
