export type CursorPage<T> = {
  items: T[];
  next_cursor: string | null;
};

export type Shade = {
  name?: string | null;
  color_group?: string | null;
  hex_code?: string | null;
  importance?: number | null;
};

export type WardrobeCard = {
  id: string;
  name: string;
  item_type: string | null;
  brand: string | null;
  image_url: string | null;
  created_at: string | null;
  fit_pic_count: number;
  shades: Shade[];
};

export type WardrobePage = CursorPage<WardrobeCard> & {
  available_item_types: string[];
};

export type WardrobeDetail = WardrobeCard & {
  caption: string | null;
  material: string | null;
  details: string | null;
};

export type FitPicCard = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string | null;
  created_at: string | null;
  garment_count: number;
};

export type FitPicDetail = FitPicCard & {
  details: string | null;
  user_notes: string | null;
  last_worn: string | null;
  favorited: boolean;
  garments: WardrobeCard[];
};

export type OutfitCard = {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  folder_id: string | null;
  source: string;
};

export type OutfitItem = {
  id?: string;
  clothing_item_id?: string;
  name?: string | null;
  item_type?: string | null;
  brand?: string | null;
  image_url?: string | null;
};

export type OutfitMedia = {
  id?: string;
  asset_id?: string;
  image_url?: string | null;
};

export type OutfitDetail = OutfitCard & {
  items: OutfitItem[];
  viton_images: OutfitMedia[];
  visual_assets: OutfitMedia[];
};

export type OutfitPage = CursorPage<OutfitCard>;

export type OutfitFolder = {
  id: string;
  name: string;
  icon: string | null;
  parent_folder_id: string | null;
  source: string;
  combo_count: number;
};

export type FolderList = { items: OutfitFolder[] };

export type RecommendationCombo = OutfitDetail;
export type RecommendationMember = {
  folder_id?: string;
  folder_name?: string;
  combos: RecommendationCombo[];
};
export type Recommendations = {
  generated_at: string | null;
  members: RecommendationMember[];
};

export type Home = {
  first_name: string | null;
  wardrobe_count: number;
  outfit_count: number;
  recent_fit_pics: FitPicCard[];
  recommendations: Recommendations;
};
