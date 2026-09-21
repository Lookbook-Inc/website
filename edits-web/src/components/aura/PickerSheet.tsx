"use client";

import { useEffect, useMemo, useState } from "react";
import type { WardrobePage, WardrobeCard } from "@/types/api";
import { PieceArt } from "./PieceArt";
import { readApi, query } from "./client-api";
import { MAX_PIECES } from "./placeholders";

const SEARCH_DEBOUNCE_MS = 260;

/**
 * The add-items sheet. Search and type filtering are server-side via
 * `/api/wardrobe`, so the whole wardrobe is reachable without loading it all.
 *
 * Selection lives in the parent: it already owns the card's pieces, and keeping
 * one source of truth avoids resyncing state every time the sheet opens.
 */
export function PickerSheet({
  open,
  picked,
  itemTypes,
  initialWardrobe,
  onPick,
  onClose,
  onCommit,
  onToast,
}: {
  open: boolean;
  picked: string[];
  itemTypes: string[];
  initialWardrobe: WardrobeCard[];
  onPick: (ids: string[]) => void;
  onClose: () => void;
  onCommit: (items: WardrobeCard[]) => void;
  onToast: (message: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [itemType, setItemType] = useState<string | null>(null);
  const [items, setItems] = useState<WardrobeCard[]>(initialWardrobe);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Every item this sheet has shown. A piece stays resolvable after the filter
   * that surfaced it has moved on, so a multi-filter selection still commits.
   */
  const [pool, setPool] = useState<Record<string, WardrobeCard>>(() =>
    Object.fromEntries(initialWardrobe.map((item) => [item.id, item])),
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const page = await readApi<WardrobePage>(
          `/wardrobe${query({ query: debounced, item_type: itemType, limit: 60 })}`,
          controller.signal,
        );
        setItems(page.items);
        setPool((current) => {
          const merged = { ...current };
          for (const item of page.items) merged[item.id] = item;
          return merged;
        });
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "We couldn’t load your wardrobe.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void run();
    return () => controller.abort();
  }, [open, debounced, itemType]);

  const grouped = useMemo(() => {
    const groups = new Map<string, WardrobeCard[]>();
    for (const item of items) {
      const key = item.item_type ?? "Other";
      const bucket = groups.get(key);
      if (bucket) bucket.push(item);
      else groups.set(key, [item]);
    }
    return [...groups.entries()];
  }, [items]);

  function toggle(id: string) {
    if (picked.includes(id)) {
      onPick(picked.filter((value) => value !== id));
      return;
    }
    if (picked.length >= MAX_PIECES) {
      onToast(`${MAX_PIECES} pieces is the limit on a card`);
      return;
    }
    onPick([...picked, id]);
  }

  function commit() {
    onCommit(picked.map((id) => pool[id]).filter((item): item is WardrobeCard => Boolean(item)));
    onClose();
  }

  return (
    <>
      <div className={`sheet-bg${open ? " open" : ""}`} onClick={onClose} />
      <div
        className={`sheet${open ? " open" : ""}`}
        role="dialog"
        aria-label="Add clothing items"
        aria-hidden={!open}
      >
        <div className="sheet-top">
          <div className="sheet-grab" />
          <div className="sheet-bar">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="button" onClick={commit}>Done</button>
          </div>
          <div className="srch" style={{ margin: "14px 0 0" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--ink-3)", flex: "0 0 auto" }} aria-hidden="true">
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
        </div>

        <div className="sheet-body">
          {error ? <div className="empty-note">{error}</div> : null}
          {!error && loading && !items.length ? <div className="empty-note">Loading your wardrobe…</div> : null}
          {!error && !loading && !items.length ? (
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
                  const on = picked.includes(item.id);
                  return (
                    <button
                      type="button"
                      className={`item${on ? " sel" : ""}`}
                      key={item.id}
                      onClick={() => toggle(item.id)}
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

        <div className="sheet-foot">
          <span style={{ fontSize: "12.5px", color: "var(--ink-3)" }}>
            {picked.length ? `${picked.length} of ${MAX_PIECES} pieces selected` : "Nothing selected"}
          </span>
          <button
            className="btn btn-brass"
            type="button"
            style={{ padding: "10px 20px", fontSize: "13px" }}
            disabled={!picked.length}
            onClick={commit}
          >
            Put on the card
          </button>
        </div>
      </div>
    </>
  );
}
