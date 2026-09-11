"use client";

import { useState } from "react";
import { GradientArt } from "./GradientArt";
import { hash } from "./palette";

export type SearchOption = {
  id: string;
  primary: string;
  secondary: string;
  colors: string[];
};

/**
 * The soundtrack and place pickers. Both run over placeholder banks
 * (see ./placeholders.ts), so search is a local filter rather than a fetch.
 */
export function SearchList({
  options,
  selectedId,
  placeholder,
  label,
  round = false,
  emptyNote,
  onSelect,
}: {
  options: SearchOption[];
  selectedId: string;
  placeholder: string;
  label: string;
  round?: boolean;
  emptyNote?: (queryText: string) => string;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const needle = search.toLowerCase().trim();
  const list = options.filter(
    (option) => !needle || `${option.primary} ${option.secondary}`.toLowerCase().includes(needle),
  );

  return (
    <>
      <div className="srch">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ color: "var(--ink-3)", flex: "0 0 auto" }} aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" />
        </svg>
        <input
          value={search}
          placeholder={placeholder}
          aria-label={label}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="rlist">
        {list.length ? (
          list.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`ritem${option.id === selectedId ? " on" : ""}`}
              onClick={() => onSelect(option.id)}
            >
              <span className={`art${round ? " rd" : ""}`}>
                <GradientArt colors={option.colors} seed={hash(option.id)} />
              </span>
              <span style={{ minWidth: 0 }}>
                <b>{option.primary}</b>
                <em>{option.secondary}</em>
              </span>
              <span className="tick">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><path d="M5 13l4.5 4.5L19 7" /></svg>
              </span>
            </button>
          ))
        ) : (
          <div className="empty-note">
            {emptyNote ? emptyNote(search) : `Nothing matches “${search}”.`}
          </div>
        )}
      </div>
    </>
  );
}
