import type {
  FitPicDetail,
  FolderList,
  Home,
  OutfitDetail,
  OutfitPage,
  Recommendations,
  WardrobeDetail,
  WardrobePage,
} from "@/types/api";

const image = (label: string, hue: string) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="${hue}"/><circle cx="400" cy="430" r="225" fill="none" stroke="#1a1916" stroke-width="2" opacity=".22"/><text x="400" y="500" text-anchor="middle" font-family="Georgia" font-size="42" fill="#1a1916">${label}</text></svg>`,
  )}`;

const wardrobe = [
  { id: "10000000-0000-0000-0000-000000000001", name: "Ink chore coat", item_type: "Outerwear", brand: "Lemaire", image_url: image("CHORE COAT", "#b9c0bd"), created_at: "2026-08-30T10:00:00Z", fit_pic_count: 8, shades: [{ name: "Ink", hex_code: "#252b31" }] },
  { id: "10000000-0000-0000-0000-000000000002", name: "Soft poplin shirt", item_type: "Tops", brand: "Studio Nicholson", image_url: image("POPLIN SHIRT", "#e1ded4"), created_at: "2026-08-29T10:00:00Z", fit_pic_count: 5, shades: [{ name: "Chalk", hex_code: "#e6e2d7" }] },
  { id: "10000000-0000-0000-0000-000000000003", name: "Wide pleated trouser", item_type: "Bottoms", brand: "COS", image_url: image("TROUSER", "#a6a194"), created_at: "2026-08-28T10:00:00Z", fit_pic_count: 11, shades: [{ name: "Mushroom", hex_code: "#817a6e" }] },
  { id: "10000000-0000-0000-0000-000000000004", name: "Leather fisherman sandal", item_type: "Shoes", brand: "Hereu", image_url: image("SANDAL", "#c4a27b"), created_at: "2026-08-27T10:00:00Z", fit_pic_count: 6, shades: [{ name: "Chestnut", hex_code: "#754f35" }] },
  { id: "10000000-0000-0000-0000-000000000005", name: "Fine knit polo", item_type: "Tops", brand: "Our Legacy", image_url: image("KNIT POLO", "#bac2ad"), created_at: "2026-08-26T10:00:00Z", fit_pic_count: 4, shades: [{ name: "Sage", hex_code: "#8d987e" }] },
  { id: "10000000-0000-0000-0000-000000000006", name: "Canvas market tote", item_type: "Accessories", brand: null, image_url: image("MARKET TOTE", "#d7cab1"), created_at: "2026-08-25T10:00:00Z", fit_pic_count: 3, shades: [{ name: "Canvas", hex_code: "#c9b894" }] },
];

const fitPics = [
  { id: "20000000-0000-0000-0000-000000000001", title: "Museum afternoon", caption: "A quiet uniform for a long Saturday.", image_url: image("MUSEUM AFTERNOON", "#c3b9a5"), created_at: "2026-09-04T18:12:00Z", garment_count: 3 },
  { id: "20000000-0000-0000-0000-000000000002", title: "First cool evening", caption: "The chore coat finally came back out.", image_url: image("COOL EVENING", "#9da6a4"), created_at: "2026-09-01T19:30:00Z", garment_count: 4 },
  { id: "20000000-0000-0000-0000-000000000003", title: "Coffee run", caption: null, image_url: image("COFFEE RUN", "#d6c4aa"), created_at: "2026-08-27T09:10:00Z", garment_count: 2 },
  { id: "20000000-0000-0000-0000-000000000004", title: "Dinner outside", caption: "Easy layers, warm night.", image_url: image("DINNER OUTSIDE", "#ac9b8e"), created_at: "2026-08-22T20:00:00Z", garment_count: 3 },
  { id: "20000000-0000-0000-0000-000000000005", title: "Sunday market", caption: null, image_url: image("SUNDAY MARKET", "#c8c4ab"), created_at: "2026-08-18T11:00:00Z", garment_count: 3 },
  { id: "20000000-0000-0000-0000-000000000006", title: "Studio day", caption: null, image_url: image("STUDIO DAY", "#b7b5ae"), created_at: "2026-08-14T08:30:00Z", garment_count: 2 },
];

const outfitBase = [
  { id: "30000000-0000-0000-0000-000000000001", name: "Quiet structure", description: "Soft tailoring with grounded accessories.", cover_url: image("QUIET STRUCTURE", "#c1b9aa"), created_at: "2026-09-03T10:00:00Z", updated_at: "2026-09-03T10:00:00Z", folder_id: "40000000-0000-0000-0000-000000000001", source: "USER" },
  { id: "30000000-0000-0000-0000-000000000002", name: "Green interval", description: "Muted greens and an easy trouser.", cover_url: image("GREEN INTERVAL", "#afb6a3"), created_at: "2026-08-31T10:00:00Z", updated_at: "2026-08-31T10:00:00Z", folder_id: "40000000-0000-0000-0000-000000000002", source: "RECOMMENDATIONS" },
  { id: "30000000-0000-0000-0000-000000000003", name: "Late summer black", description: null, cover_url: image("LATE SUMMER", "#999b94"), created_at: "2026-08-24T10:00:00Z", updated_at: "2026-08-24T10:00:00Z", folder_id: null, source: "USER" },
];

const outfitDetail = (outfit = outfitBase[0]): OutfitDetail => ({
  ...outfit,
  items: wardrobe.slice(0, 3).map((item) => ({ clothing_item_id: item.id, name: item.name, item_type: item.item_type, brand: item.brand, image_url: item.image_url })),
  viton_images: [],
  visual_assets: [],
});

export const fixtures = {
  home: {
    first_name: "Alex",
    wardrobe_count: 86,
    outfit_count: 24,
    recent_fit_pics: fitPics,
    recommendations: {
      generated_at: "2026-09-05T15:00:00Z",
      members: [{ folder_id: "50000000-0000-0000-0000-000000000001", folder_name: "In rotation", combos: outfitBase.slice(0, 2).map(outfitDetail) }],
    },
  } satisfies Home,
  wardrobe: { items: wardrobe, next_cursor: null, available_item_types: ["Accessories", "Bottoms", "Outerwear", "Shoes", "Tops"] } satisfies WardrobePage,
  wardrobeDetail: { ...wardrobe[0], caption: "A softly constructed cotton layer.", material: "Cotton twill", details: "Relaxed fit · patch pockets" } satisfies WardrobeDetail,
  fitPics: { items: fitPics, next_cursor: null },
  fitPicDetail: { ...fitPics[0], details: null, user_notes: "Felt balanced and comfortable.", last_worn: "2026-09-04", favorited: true, garments: wardrobe.slice(0, 3) } satisfies FitPicDetail,
  outfits: { items: outfitBase, next_cursor: null } satisfies OutfitPage,
  outfitDetail: outfitDetail(),
  folders: { items: [
    { id: "40000000-0000-0000-0000-000000000001", name: "Everyday", icon: "sun", parent_folder_id: null, source: "USER", combo_count: 12 },
    { id: "40000000-0000-0000-0000-000000000002", name: "Edits", icon: "sparkles", parent_folder_id: null, source: "RECOMMENDATIONS", combo_count: 7 },
  ] } satisfies FolderList,
  recommendations: {
    generated_at: "2026-09-05T15:00:00Z",
    members: [
      { folder_id: "50000000-0000-0000-0000-000000000001", folder_name: "In rotation", combos: outfitBase.slice(0, 2).map(outfitDetail) },
      { folder_id: "50000000-0000-0000-0000-000000000002", folder_name: "Something different", combos: [outfitDetail(outfitBase[2])] },
    ],
  } satisfies Recommendations,
};

export function fixtureForPath<T>(path: string): T {
  const [pathname, queryString] = path.split("?");
  const query = new URLSearchParams(queryString);
  if (pathname === "/web/v1/home") return fixtures.home as T;
  if (pathname === "/web/v1/wardrobe") {
    const search = (query.get("query") ?? "").toLowerCase();
    const type = query.get("item_type");
    return {
      ...fixtures.wardrobe,
      items: fixtures.wardrobe.items.filter((item) =>
        (!search || `${item.name} ${item.brand ?? ""}`.toLowerCase().includes(search)) &&
        (!type || item.item_type === type),
      ),
    } as T;
  }
  if (/^\/web\/v1\/wardrobe\/[^/]+\/fit-pics$/.test(pathname)) return fixtures.fitPics as T;
  if (/^\/web\/v1\/wardrobe\/[^/]+$/.test(pathname)) {
    const id = decodeURIComponent(pathname.split("/").at(-1) ?? "");
    const item = fixtures.wardrobe.items.find((candidate) => candidate.id === id) ?? fixtures.wardrobe.items[0];
    return { ...fixtures.wardrobeDetail, ...item } as T;
  }
  if (pathname === "/web/v1/fit-pics") return fixtures.fitPics as T;
  if (/^\/web\/v1\/fit-pics\/[^/]+$/.test(pathname)) {
    const id = decodeURIComponent(pathname.split("/").at(-1) ?? "");
    const photo = fixtures.fitPics.items.find((candidate) => candidate.id === id) ?? fixtures.fitPics.items[0];
    return { ...fixtures.fitPicDetail, ...photo } as T;
  }
  if (pathname === "/web/v1/outfit-folders") return fixtures.folders as T;
  if (pathname === "/web/v1/outfits") {
    const folder = query.get("folder_id");
    return { ...fixtures.outfits, items: fixtures.outfits.items.filter((item) => !folder || item.folder_id === folder) } as T;
  }
  if (/^\/web\/v1\/outfits\/[^/]+$/.test(pathname)) {
    const id = decodeURIComponent(pathname.split("/").at(-1) ?? "");
    const outfit = fixtures.outfits.items.find((candidate) => candidate.id === id) ?? fixtures.outfits.items[0];
    return outfitDetail(outfit) as T;
  }
  if (pathname === "/web/v1/recommendations/latest") return fixtures.recommendations as T;
  throw new Error(`No fixture for ${pathname}`);
}
