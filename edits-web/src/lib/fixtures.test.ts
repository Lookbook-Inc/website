import { describe, expect, it } from "vitest";
import { fixtureForPath, fixtures } from "@/lib/fixtures";
import type { EditLineListResponse, OutfitPage, SongListResponse, WardrobePage } from "@/types/api";

describe("fixture-backed data contract", () => {
  it("filters wardrobe by name and type", () => {
    const result = fixtureForPath<WardrobePage>("/web/v1/wardrobe?query=shirt&item_type=Tops");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toContain("shirt");
    expect(result.available_item_types).toContain("Tops");
  });

  it("filters outfits by folder", () => {
    const folder = fixtures.folders.items[0].id;
    const result = fixtureForPath<OutfitPage>(`/web/v1/outfits?folder_id=${folder}`);
    expect(result.items.every((item) => item.folder_id === folder)).toBe(true);
  });

  it("returns only the latest recommendation contract", () => {
    expect(fixtures.recommendations.generated_at).toBeTruthy();
    expect(fixtures.recommendations.members.length).toBeGreaterThan(0);
  });

  it("returns both creative-bank contracts", () => {
    const songs = fixtureForPath<SongListResponse>("/web/v1/banks/songs");
    const editLines = fixtureForPath<EditLineListResponse>("/web/v1/banks/edits-lines");

    expect(songs.items[0]).toMatchObject({ song_title: expect.any(String), sort_order: 1 });
    expect(editLines.items[0]).toMatchObject({ aura_text: expect.any(String) });
  });
});
