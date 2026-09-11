import { describe, expect, it } from "vitest";
import { fixtureForPath, fixtures } from "@/lib/fixtures";
import type { OutfitPage, WardrobePage } from "@/types/api";

describe("fixture-backed data contract", () => {
  it("filters wardrobe by name and type", () => {
    const result = fixtureForPath<WardrobePage>("/web/v1/wardrobe?query=shirt&item_type=button-up-shirt");
    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toContain("shirt");
    expect(result.available_item_types).toContain("button-up-shirt");
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
});
