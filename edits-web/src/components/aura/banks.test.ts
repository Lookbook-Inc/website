import { describe, expect, it } from "vitest";
import { placeImageUrl } from "./banks";
import { bankFixtures } from "@/lib/fixtures";

describe("place bank artwork", () => {
  it("uses the first photo with a signed URL and falls back when there are none", () => {
    const place = bankFixtures.places.items[0];
    expect(placeImageUrl(place)).toBe(place.photos[0].image_url);
    expect(placeImageUrl({ ...place, photos: [place.photos[1], place.photos[0]] })).toBe(place.photos[0].image_url);
    expect(placeImageUrl(bankFixtures.places.items[1])).toBeNull();
  });
});
