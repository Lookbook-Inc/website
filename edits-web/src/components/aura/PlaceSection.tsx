"use client";

import { placeColors, placePhotoUrl, type Place } from "./banks";
import { SearchList } from "./SearchList";

export function PlaceSection({
  places,
  place,
  onChange,
}: {
  places: Place[];
  place: Place | null;
  onChange: (place: Place) => void;
}) {
  if (!places.length) {
    return <div className="empty-note">No places in the bank yet.</div>;
  }

  return (
    <>
      <p className="hint">Search the place bank, then pick one.</p>
      <SearchList
        options={places.map((entry) => ({
          id: entry.id,
          primary: entry.place_name,
          secondary: entry.category,
          colors: placeColors(entry),
          imageUrl: placePhotoUrl(entry),
        }))}
        selectedId={place?.id ?? ""}
        placeholder="Search places"
        label="Search a place"
        emptyNote={(q) => `No place matches “${q}”.`}
        onSelect={(id) => {
          const next = places.find((entry) => entry.id === id);
          if (next) onChange(next);
        }}
      />
    </>
  );
}
