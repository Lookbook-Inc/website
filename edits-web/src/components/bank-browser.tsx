"use client";

import { useMemo, useState } from "react";
import { EmptyState, Media } from "@/components/ui";
import type { EditLine, Song } from "@/types/api";

type BankName = "songs" | "edit-lines";

export function BankBrowser({ songs, editLines }: { songs: Song[]; editLines: EditLine[] }) {
  const [activeBank, setActiveBank] = useState<BankName>("songs");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredSongs = useMemo(() => songs.filter((song) =>
    `${song.song_title} ${song.artist_display}`.toLocaleLowerCase().includes(normalizedQuery),
  ), [normalizedQuery, songs]);
  const filteredEditLines = useMemo(() => editLines.filter((line) =>
    line.aura_text.toLocaleLowerCase().includes(normalizedQuery),
  ), [editLines, normalizedQuery]);

  function selectBank(bank: BankName) {
    setActiveBank(bank);
    setQuery("");
  }

  const searchLabel = activeBank === "songs" ? "Search songs or artists" : "Search edit lines";

  return (
    <section className="bank-browser" aria-label="Creative banks">
      <div className="bank-controls">
        <div className="bank-tabs" role="tablist" aria-label="Choose a bank">
          <button
            aria-controls="songs-panel"
            aria-selected={activeBank === "songs"}
            className={activeBank === "songs" ? "active" : ""}
            id="songs-tab"
            onClick={() => selectBank("songs")}
            role="tab"
            type="button"
          >
            Songs <span>{songs.length}</span>
          </button>
          <button
            aria-controls="edit-lines-panel"
            aria-selected={activeBank === "edit-lines"}
            className={activeBank === "edit-lines" ? "active" : ""}
            id="edit-lines-tab"
            onClick={() => selectBank("edit-lines")}
            role="tab"
            type="button"
          >
            Edit Lines <span>{editLines.length}</span>
          </button>
        </div>
        <label className="bank-search">
          <span>{searchLabel}</span>
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchLabel}
            type="search"
            value={query}
          />
        </label>
      </div>

      {activeBank === "songs" ? (
        <div aria-labelledby="songs-tab" id="songs-panel" role="tabpanel">
          {filteredSongs.length ? (
            <div className="song-bank-grid">
              {filteredSongs.map((song) => (
                <article className="song-bank-card" key={song.id}>
                  <Media src={song.cover_url} alt={`${song.song_title} cover`} ratio="square" />
                  <div><h2>{song.song_title}</h2><p>{song.artist_display}</p></div>
                </article>
              ))}
            </div>
          ) : <EmptyState title="No songs found" copy="Try another song title or artist." />}
        </div>
      ) : (
        <div aria-labelledby="edit-lines-tab" id="edit-lines-panel" role="tabpanel">
          {filteredEditLines.length ? (
            <div className="edit-line-grid">
              {filteredEditLines.map((line, index) => (
                <article className="edit-line-card" key={line.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <blockquote>{line.aura_text}</blockquote>
                </article>
              ))}
            </div>
          ) : <EmptyState title="No edit lines found" copy="Try a different word or phrase." />}
        </div>
      )}
    </section>
  );
}
