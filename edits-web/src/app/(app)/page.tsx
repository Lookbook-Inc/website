import { AuraApp } from "@/components/aura/AuraApp";
import { requireViewer } from "@/lib/auth";
import { readWeb } from "@/lib/data";
import type { EditLineList, Home, PlaceList, SongList, WardrobePage } from "@/types/api";

/** Server-side date, corrected to the viewer's own timezone once mounted. */
function serverDateISO() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function serverFetchedAt() {
  return Date.now();
}

export default async function EditorPage() {
  const viewer = await requireViewer();
  const [home, wardrobe, lines, songs, places] = await Promise.all([
    readWeb<Home>("/web/v1/home"),
    readWeb<WardrobePage>("/web/v1/wardrobe?limit=60"),
    readWeb<EditLineList>("/web/v1/banks/edits-lines"),
    readWeb<SongList>("/web/v1/banks/songs"),
    readWeb<PlaceList>("/web/v1/banks/places"),
  ]);

  return (
    <AuraApp
      email={viewer.email}
      firstName={home.first_name}
      initialWardrobe={wardrobe.items}
      initialWardrobeCursor={wardrobe.next_cursor}
      initialWardrobeFetchedAt={serverFetchedAt()}
      itemTypes={wardrobe.available_item_types ?? []}
      lines={lines.items}
      songs={songs.items}
      places={places.items}
      wardrobeCount={home.wardrobe_count}
      outfitCount={home.outfit_count}
      serverDateISO={serverDateISO()}
    />
  );
}
