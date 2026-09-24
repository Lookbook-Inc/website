"use client";

import { useEffect, useMemo, useState } from "react";
import type { WardrobePage, WardrobeCard } from "@/types/api";
import { PieceArt } from "./PieceArt";
import { readApi, query } from "./client-api";
import { MAX_PIECES } from "./placeholders";

const SEARCH_DEBOUNCE_MS = 260;

/**
 * The member's wardrobe, open in the Outfit tab. Search and type filtering are
 * server-side via `/api/wardrobe`, so the whole wardrobe is reachable without
 * loading it all. Clicking a piece puts it on (or takes it off) the card straight away.
 */
export function WardrobePicker({
  items,
  itemTypes,
  initialWardrobe,
  onSetPieces,
  onToast,
}: {
  items: WardrobeCard[];
  itemTypes: string[];
  initialWardrobe: WardrobeCard[];
  onSetPieces: (items: WardrobeCard[]) => void;
  onToast: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [itemType, setItemType] = useState<string | null>(null);
  const [results, setResults] = useState<WardrobeCard[]>(initialWardrobe);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await readApi<WardrobePage>(
          `/wardrobe${query({ query: debounced, item_type: itemType, limit: 60 })}`,
          controller.signal,
        );
        setResults(page.items);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "We couldn’t load your wardrobe.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [debounced, itemType]);

  const grouped = useMemo(() => {
    const groups = new Map<string, WardrobeCard[]>();
    for (const item of results) {
      const key = item.item_type ?? "Other";
      const bucket = groups.get(key);
      if (bucket) bucket.push(item);
      else groups.set(key, [item]);
    }
    return [...groups.entries()];
  }, [results]);

  const picked = new Set(items.map((item) => item.id));

  function toggle(item: WardrobeCard) {
    if (picked.has(item.id)) {
      onSetPieces(items.filter((other) => other.id !== item.id));
      return;
    }
    if (items.length >= MAX_PIECES) {
      onToast(`${MAX_PIECES} pieces is the limit on a card`);
      return;
    }
    onSetPieces([...items, item]);
  }

  return (
    <div className="wardrobe">
      <div className="srch">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="srch-icon" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
        </svg>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search items…"
          aria-label="Search your wardrobe"
        />
      </div>
      <div className="tabs">
        <button
          type="button"
          className={`tab${itemType === null ? " on" : ""}`}
          onClick={() => setItemType(null)}
        >
          All
        </button>
        {itemTypes.map((type) => (
          <button
            key={type}
            type="button"
            className={`tab${itemType === type ? " on" : ""}`}
            onClick={() => setItemType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="wardrobe-body">
        {error ? <div className="empty-note">{error}</div> : null}
        {!error && loading && !results.length ? <div className="empty-note">Loading your wardrobe…</div> : null}
        {!error && !loading && !results.length ? (
          <div className="empty-note">
            {debounced ? `Nothing matches “${debounced}”.` : "No wardrobe pieces yet."}
          </div>
        ) : null}
        {grouped.map(([category, group]) => (
          <div className="cat" key={category}>
            <div className="cat-head">
              <h4>{category}</h4>
              <span className="count">{group.length} item{group.length === 1 ? "" : "s"}</span>
            </div>
            <div className="cat-grid">
              {group.map((item) => {
                const on = picked.has(item.id);
                return (
                  <button
                    type="button"
                    className={`item${on ? " sel" : ""}`}
                    key={item.id}
                    onClick={() => toggle(item)}
                    aria-pressed={on}
                  >
                    <div className="thumb">
                      <PieceArt item={item} />
                      <span className="check">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 13l4.5 4.5L19 7" /></svg>
                      </span>
                    </div>
                    <div className="nm">{item.name}</div>
                    <div className="br">{item.brand ?? "—"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="wardrobe-foot">
        {items.length ? `${items.length} of ${MAX_PIECES} pieces on the card` : `Pick up to ${MAX_PIECES} pieces`}
      </div>
    </div>
  );
}
