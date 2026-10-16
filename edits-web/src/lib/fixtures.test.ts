import { describe, expect, it } from "vitest";
import { fixtureForPath, fixtures } from "@/lib/fixtures";
import type { OutfitPage, PlaceList, WardrobePage } from "@/types/api";

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

  it("serves the nested places bank in fixture mode", () => {
    const result = fixtureForPath<PlaceList>("/web/v1/banks/places");
    expect(result.items).toHaveLength(9);
    expect(result.items.map((place) => place.sort_order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(result.items[0].photos.map((photo) => photo.review_status)).toEqual(["validated", "needs_review"]);
    expect(result.items[0].photos[0].image_url).toMatch(/^data:image\/svg\+xml/);
    expect(result.items[1].photos).toEqual([]);
  });
});
