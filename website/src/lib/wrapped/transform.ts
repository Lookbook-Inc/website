/**
 * Data transformation utilities for Wrapped API responses
 *
 * Transforms backend API response format to frontend UI format
 */

import type { BackendWrappedInsights } from '@/types/wrapped-api';

/**
 * Transform backend insights response to frontend format
 *
 * This function maps the backend field names to the frontend's expected format.
 * It handles:
 * - Field renaming (e.g., total_photos → total_outfits_analyzed)
 * - Nested object transformation
 * - Default values for optional fields
 *
 * @param backend - Raw backend API response
 * @returns Transformed data matching frontend types
 */
export function transformWrappedInsights(backend: BackendWrappedInsights) {
  return {
    // User info
    userName: backend.user_first_name || 'User',
    userCity: backend.user_city || null,

    // City vibe
    city_vibe: backend.city_vibe,
    city_photo_url: backend.city_photo_url || null,

    // Styles
    primary_style: backend.primary_style,
    top_styles: backend.top_styles.map(style => ({
      style_name: style.style_name,
      points: style.points,
      appearances: style.appearances,
    })),

    // Statistics
    total_outfits_analyzed: backend.total_outfits_analyzed,
    total_clothing_items: backend.total_clothing_items,

    // Colors
    top_colors: backend.top_colors.map(color => ({
      color: color.color,
      top_shade: color.top_shade,
      top_shade_hex: color.top_shade_hex,
      piece_count: color.piece_count,
    })),

    // Top shades (for the #1 color)
    top_shades: backend.top_shades.map(shade => ({
      color: shade.color_result,
      shade_hex: shade.shade_hex_result,
      shade_name: shade.shade_name_result,
      photo_ids: shade.photo_ids_result,
      importance_score: shade.importance_score_result,
    })),

    // Celebrity match
    top_celeb_match: {
      celeb_name: backend.top_celeb_match.celeb_name,
      celeb_photo_url: backend.top_celeb_match.celeb_photo_url,
      description: backend.top_celeb_match.description || '',
      similarity_score: backend.top_celeb_match.similarity_score,
      categories: backend.top_celeb_match.categories || [],
      color_aura_name: backend.top_celeb_match.color_aura_name,
      top_style: backend.top_celeb_match.style_1,
    },

    // Most worn item
    most_worn_item: {
      name: backend.most_worn_item.name,
      path: backend.most_worn_item.signed_url, // Use signed URL for display
      item_type: backend.most_worn_item.item_type,
      outfit_count: backend.most_worn_item.outfit_count,
      shade_hex_1: backend.most_worn_item.shade_hex_1 || '#000000',
      shade_name_1: backend.most_worn_item.shade_name_1 || 'Unknown',
      details: backend.most_worn_item.details,
    },

    // Best pairings
    best_pairings: backend.best_pairings.map(pairing => ({
      garment_name: pairing.garment_name,
      garment_path: pairing.signed_url, // Use signed URL for display
      times_paired: pairing.times_paired,
      garment_color: pairing.garment_color,
    })),

    // Unworn pairings
    unworn_pairings: backend.unworn_pairings.map(pairing => ({
      reasoning: pairing.reasoning,
      garment_name: pairing.garment_name,
      garment_path: pairing.signed_url, // Use signed URL for display
      garment_color: pairing.garment_color,
    })),

    // Descriptions (LLM-generated)
    clothing_items_description: backend.clothing_items_description ||
      'Your wardrobe insights are being generated...',

    color_aura: backend.color_aura,

    color_aura_description: backend.color_aura_description ||
      'Your color personality analysis is coming soon...',

    style_description: backend.style_description ||
      'Your style profile is being analyzed...',

    // Top outfits
    top_outfits: backend.top_outfits.map(outfit => ({
      photo_id: outfit.photo_id,
      path: outfit.signed_url, // Use signed URL for display
      similarity_score: outfit.similarity_score,
    })),

    // All uploaded photos
    all_uploaded_photos: backend.all_uploaded_photos.map(photo => ({
      signed_url: photo.signed_url,
    })),
  };
}

/**
 * Type guard to check if insights are completed and ready to display
 */
export function isInsightsCompleted(insights: BackendWrappedInsights): boolean {
  return insights.status === 'completed';
}

/**
 * Type guard to check if insights are still processing
 */
export function isInsightsProcessing(insights: BackendWrappedInsights): boolean {
  return insights.status === 'processing' || insights.status === 'pending';
}

/**
 * Type guard to check if insights failed
 */
export function isInsightsFailed(insights: BackendWrappedInsights): boolean {
  return insights.status === 'failed';
}
