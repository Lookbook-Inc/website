export interface ClothingItem {
  name: string;
  path: string;
  item_type: string;
  outfit_count: number;
  shade_hex_1: string;
  shade_name_1: string;
  details: string | null;
}

export interface ColorGroup {
  color: string;
  top_shade: string;
  top_shade_hex: string;
  piece_count: number;
}

export interface ColorResult {
  color: string;
  photo_ids: string[];
  shade_hex: string;
  shade_name: string;
  importance_score: number;
}

export interface CelebMatch {
  celeb_name: string;
  celeb_photo_url?: string;
  celeb_portrait_url: string;
  description: string;
  similarity_score: number;
  categories: string[];
  color_aura_name: string;
  style_1: string;
  style_2: string;
  style_3: string;
}

export interface UploadedPhoto {
  signed_url: string;
}

export interface TopOutfit {
  photo_id: string;
  path: string;
  similarity_score: number;
}

export interface Pairing {
  garment_name: string;
  garment_path: string;
  times_paired?: number;
  garment_color?: string;
}

export interface StyleResult {
  style_name: string;
  points: number;
  appearances: number;
}

export interface TopOutfitForStyle {
  photo_id: string;
  path: string;
  similarity_score: number;
}

export interface UnwornPairing {
  reasoning: string;
  garment_name: string;
  garment_path: string;
  garment_color?: string;
}

export interface WrappedResults {
  userName: string;
  userCity: string | null;
  city_vibe: string;
  city_photo_url: string | null;
  primary_style: string;
  top_styles: StyleResult[];
  top_outfits_for_style: TopOutfitForStyle[];
  total_outfits_analyzed: number;
  top_colors: ColorGroup[];
  top_shades: ColorResult[];
  top_celeb_match: CelebMatch;
  most_worn_item: ClothingItem;
  best_pairings: Pairing[];
  unworn_pairings: UnwornPairing[];
  clothing_items_description: string;
  color_aura: string;
  color_aura_description: string;
  style_description: string;
  total_clothing_items: number;
  top_outfits: TopOutfit[];
  all_uploaded_photos: UploadedPhoto[];
  top_decade: string;
  decade_description: string;
  decade_photo_url: string | null;
}

export type Step = 'welcome' | 'intro' | 'photo-flip' | 'fav-item' | 'fav-pairings' | 'unworn-pairings' | 'top-styles' | 'colors' | 'color-aura' | 'decade' | 'celebrity' | 'city-intro' | 'city-reveal' | 'top-outfits-selection' | 'summary';

