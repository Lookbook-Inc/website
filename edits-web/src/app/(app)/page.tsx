import { AuraApp } from "@/components/aura/AuraApp";
import { requireViewer } from "@/lib/auth";
import { readWeb } from "@/lib/data";
import type { Home, WardrobePage } from "@/types/api";

/** Server-side date, corrected to the viewer's own timezone once mounted. */
function serverDateISO() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export default async function EditorPage() {
  const viewer = await requireViewer();
  const [home, wardrobe] = await Promise.all([
    readWeb<Home>("/web/v1/home"),
    readWeb<WardrobePage>("/web/v1/wardrobe?limit=60"),
  ]);

  return (
    <AuraApp
      email={viewer.email}
      firstName={home.first_name}
      initialWardrobe={wardrobe.items}
      itemTypes={wardrobe.available_item_types ?? []}
      wardrobeCount={home.wardrobe_count}
      outfitCount={home.outfit_count}
      serverDateISO={serverDateISO()}
    />
  );
}
