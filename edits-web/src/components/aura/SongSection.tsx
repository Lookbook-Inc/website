"use client";

import { songColors, type Song } from "./banks";
import { SearchList } from "./SearchList";

export function SongSection({
  songs,
  song,
  onChange,
}: {
  songs: Song[];
  song: Song | null;
  onChange: (song: Song) => void;
}) {
  if (!songs.length) {
    return <div className="empty-note">No songs in the bank yet.</div>;
  }

  return (
    <>
      <p className="hint">Search the song bank, then pick one.</p>
      <SearchList
        round
        options={songs.map((entry) => ({
          id: entry.id,
          primary: entry.song_title,
          secondary: entry.artist_display,
          colors: songColors(entry),
          imageUrl: entry.cover_url,
        }))}
        selectedId={song?.id ?? ""}
        placeholder="Search songs or artists"
        label="Search a song or artist"
        emptyNote={(q) => `No song matches “${q}”.`}
        onSelect={(id) => {
          const next = songs.find((entry) => entry.id === id);
          if (next) onChange(next);
        }}
      />
    </>
  );
}
