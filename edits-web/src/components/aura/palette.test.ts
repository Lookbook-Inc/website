import { describe, expect, it } from "vitest";
import type { WardrobeCard } from "@/types/api";
import { COLOR_FAMILIES, MOODS, colorFamily, paletteNamesFor } from "./palette";

const piece = (hex: string, id = hex): WardrobeCard => ({
  id,
  name: id,
  item_type: "t-shirt",
  brand: null,
  image_url: null,
  created_at: null,
  fit_pic_count: 0,
  shades: [{ name: id, color_group: null, hex_code: hex, importance: 3 }],
});

describe("colorFamily", () => {
  it.each([
    ["#111111", "black"],
    ["#F4F1EA", "white"],
    ["#8A8A8A", "grey"],
    ["#1F2A44", "navy"],
    ["#5B7BA6", "denim"],
    ["#C8102E", "red"],
    ["#6D1A2A", "burgundy"],
    ["#F4B6C2", "pink"],
    ["#6B8E23", "olive"],
    ["#2E8B57", "green"],
    ["#C9B894", "beige"],
    ["#6B4226", "brown"],
    ["#B5562B", "rust"],
    ["#F4D35E", "yellow"],
  ])("%s is %s", (hex, family) => {
    expect(colorFamily(hex)).toBe(family);
  });
});

describe("paletteNamesFor", () => {
  it("leads with the outfit's mood", () => {
    expect(paletteNamesFor([piece("#111111"), piece("#F4F1EA")])[0]).toBe("MONOCHROME");
    expect(paletteNamesFor([piece("#6B4226"), piece("#C9B894"), piece("#6B8E23")])[0]).toBe("EARTHBOUND");
    expect(paletteNamesFor([piece("#F4B6C2"), piece("#B8D8F2"), piece("#FFF1A8")])[0]).toBe("PASTEL");
  });

  it("names a colourful piece ahead of the neutrals around it", () => {
    const names = paletteNamesFor([piece("#111111"), piece("#F4F1EA"), piece("#C8102E")]);
    expect(names[0]).toBe("CRIMSON");
    expect(names).toContain("NOIR");
  });

  it("offers names for denim and navy together", () => {
    const names = paletteNamesFor([piece("#5B7BA6"), piece("#1F2A44"), piece("#F4F1EA")]);
    expect(names).toEqual(expect.arrayContaining(["DENIM", "NAVY"]));
  });

  it("suggests a handful of unique names, all from the bank", () => {
    const bank = new Set<string>([...COLOR_FAMILIES, ...MOODS].flatMap((group) => [...group.names]));
    const names = paletteNamesFor([piece("#C8102E"), piece("#2E8B57"), piece("#1F2A44"), piece("#F4D35E")]);
    expect(names.length).toBeLessThanOrEqual(9);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(bank.has(name)).toBe(true);
  });

  it("falls back to light neutrals when nothing has a colour", () => {
    expect(paletteNamesFor([])[0]).toBe("PAPER");
  });

  it("keeps every name short enough for the card", () => {
    for (const group of [...COLOR_FAMILIES, ...MOODS]) {
      for (const name of group.names) expect(name.length).toBeLessThanOrEqual(18);
    }
  });
});
