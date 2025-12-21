/**
 * TypeScript types for the Wrapped Backend API responses
 *
 * These types mirror the exact structure returned by:
 * GET /wrapped/insights/code/{share_code}
 *
 * Generated from actual API response (see insights_response.json)
 */

// ============================================================================
// CLOTHING & ITEMS
// ============================================================================

export interface BackendClothingItem {
  name: string;
  path: string;
  signed_url: string;
  photo_id: string;
  item_type: string;
  outfit_count: number;

  // Shade information (up to 3 shades per item)
  shade_hex_1: string | null;
  shade_hex_2: string | null;
  shade_hex_3: string | null;
  shade_name_1: string | null;
  shade_name_2: string | null;
  shade_name_3: string | null;
  shade_color_1: string | null;
  shade_color_2: string | null;
  shade_color_3: string | null;
  shade_importance_1: string | null;
  shade_importance_2: string | null;
  shade_importance_3: string | null;

  // Additional metadata
  details: string | null;
  brand: string | null;
  material: string | null;
  avatar: boolean;
  shared: boolean;
  caption: string | null;
  user_id: string;
  created_at: string;
  tagged_photo_ids: string[];
}

export interface BackendPairing {
  garment_name: string;
  garment_path: string;
  signed_url: string;
  garment_photo_id: string;
  garment_item_type: string;
  garment_color: string;
  times_paired: number;
}

export interface BackendUnwornPairing {
  reasoning: string;
  garment_name: string;
  garment_path: string;
  signed_url: string;
  garment_photo_id: string;
  garment_item_type: string;
  garment_color: string;
}

// ============================================================================
// COLORS
// ============================================================================

export interface BackendTopColor {
  color: string;
  top_shade: string;
  top_shade_hex: string;
  piece_count: number;
  importance_score: number;
}

export interface BackendTopShade {
  color_result: string;
  shade_hex_result: string;
  shade_name_result: string;
  photo_ids_result: string[];
  importance_score_result: number;
}

export interface BackendColorPairing {
  target_color_result: string;
  paired_color_result: string;
  pairing_count_result: number;
}

// ============================================================================
// STYLES
// ============================================================================

export interface BackendStyleResult {
  style_name: string;
  points: number;
  avg_rank: number;
  appearances: number;
}

// ============================================================================
// OUTFITS
// ============================================================================

export interface BackendTopOutfit {
  photo_id: string;
  path: string;
  signed_url: string;
  similarity_score: number;
}

// ============================================================================
// CELEBRITY MATCHES
// ============================================================================

export interface BackendCelebMatch {
  celeb_id: string;
  celeb_name: string;
  celeb_photo_url: string;
  similarity_score: number;
  aura_score: number;
  style_score: number;
  description: string | null;
  categories: string[] | null;
  gender: string | null;
  color_aura_name: string;
  style_1: string;
  style_2: string;
  style_3: string;
}

// ============================================================================
// UPLOADED PHOTOS
// ============================================================================

export interface BackendUploadedPhoto {
  signed_url: string;
}

// ============================================================================
// MAIN INSIGHTS RESPONSE
// ============================================================================

export interface BackendWrappedInsights {
  // Meta
  id: string;
  user_id: string;
  status: 'completed' | 'processing' | 'pending' | 'failed' | 'not_started';
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  share_code: string;

  // User info
  user_first_name: string | null;
  user_last_name: string | null;
  user_city: string | null;

  // Clothing items
  top_clothing_items: BackendClothingItem[];
  most_worn_item: BackendClothingItem;
  best_pairings: BackendPairing[];
  unworn_pairings: BackendUnwornPairing[];
  clothing_items_description: string | null;

  // Colors
  top_colors: BackendTopColor[];
  top_color: BackendTopColor;
  top_shades: BackendTopShade[];
  top_color_pairings: BackendColorPairing[];
  color_aura: string;
  color_aura_id: string | null;
  color_aura_description: string | null;
  color_aura_percentage: number | null;
  colors_description: string | null;

  // Styles
  top_styles: BackendStyleResult[];
  primary_style: string;
  style_decade: string;
  style_decade_id: string | null;
  style_decade_description: string | null;
  style_description: string | null;
  top_outfits_for_style: BackendTopOutfit[];

  // Outfits
  top_outfits: BackendTopOutfit[];

  // Celebrity matches
  celeb_matches: BackendCelebMatch[];
  top_celeb_match: BackendCelebMatch;
  celeb_match_description: string | null;

  // City vibe
  city_vibe: string;
  city_vibe_id: string | null;
  city_vibe_similarity_score: number | null;
  city_vibe_description: string | null;
  city_vibe_image_url: string | null;
  city_photo_url: string | null;

  // Reference photo URLs
  decade_photo_url: string | null;

  // Statistics
  total_photos_uploaded: number;
  total_clothing_items: number;
  total_outfits_analyzed: number;
  unique_colors_worn: number;

  // Uploaded photos
  all_uploaded_photos: BackendUploadedPhoto[];
}
