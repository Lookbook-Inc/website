import React from 'react';
import { WrappedResults } from '@/types/wrapped-frontend';

export interface ShareableCardProps {
  results: WrappedResults;
  selectedOutfitIndex: number | null;
}

export const SummaryCard = ({ results, selectedOutfitIndex }: ShareableCardProps) => {
  // Determine which outfit to show - use user selection if available, else top outfit
  const signatureOutfit = selectedOutfitIndex !== null 
    ? results.top_outfits[selectedOutfitIndex] 
    : results.top_outfits[0];

  // Get top item name (truncated if needed)
  const topItemName = results.most_worn_item?.name?.split('(')[0]?.trim() || 'Classic Piece';
  
  // Get top color info
  const topColor = results.top_colors[0];
  const topColorGroup = topColor?.color || 'Color';
  const topShadeName = topColor?.top_shade || 'signature shade';
  const topColorHex = topColor?.top_shade_hex || '#888888';

  // Determine if the background color is light or dark for text contrast
  const getBrightness = (hex: string) => {
    if (!hex || hex.length < 7) return 0;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
  };

  const getContrastColor = (hex: string) => {
    return getBrightness(hex) > 160 ? '#000000' : '#FFFFFF';
  };
  const contrastColor = getContrastColor(topColorHex);

  // Sort styles by points descending and take top 3
  const sortedTopStyles = [...results.top_styles]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 3);

  // Helper for color dots - 4 on left (shades), 4 on right (colors)
  const leftDots = results.top_shades?.length > 0 
    ? Array.from({ length: 4 }, (_, i) => results.top_shades[i % results.top_shades.length].shade_hex)
    : Array(4).fill('#D1D1D1');

  const rightDots = results.top_colors?.length > 0
    ? Array.from({ length: 4 }, (_, i) => results.top_colors[i % results.top_colors.length].top_shade_hex)
    : Array(4).fill('#A1A1A1');

  return (
    <div 
      className="absolute inset-0 bg-[#F7F7F7] border-[4px] border-black box-border rounded-[32px] overflow-hidden"
    >
      {/* Card Inner Content */}
      <div className="relative pt-4 pr-6 pb-6 pl-6 h-full flex flex-col justify-between">
          
        {/* Top Header Section: Lookbook branding + Aesthetics */}
        <div className="flex justify-between items-start mb-0 relative z-20">
          {/* Lookbook branding - Vertical but in a contained box */}
          <div className="flex flex-col items-start pt-1 -ml-4">
            <div 
              className="relative"
              style={{ 
                height: '140px', 
                width: '40px',
              }}
            >
              <span
                className="font-display text-3xl tracking-tight leading-none block absolute top-0 left-0 origin-top-left"
                style={{
                  fontWeight: 400,
                  letterSpacing: '-0.05em',
                  transform: 'rotate(90deg) translateY(-100%)',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ color: '#000000' }}>Look</span><span style={{ color: '#D1BB99' }}>book</span>
              </span>
            </div>
          </div>

          {/* Aesthetics Header */}
          <div className="flex-1 flex flex-col items-end">
            <p
              className="text-[12px] uppercase tracking-wider mb-1 text-right"
              style={{ color: '#A5A5A5', fontWeight: 800 }}
            >
              {results.userName.toUpperCase()}&apos;S TOP AESTHETICS
            </p>

            {/* Aesthetics with highlight bars */}
            <div className="flex flex-col items-end gap-0.5">
              {sortedTopStyles.map((style, i) => (
                <div
                  key={i}
                  className="relative flex items-center justify-end"
                >
                  {/* Background bar - top bar is longest */}
                  <div 
                    className="absolute right-0 h-[10px]" 
                    style={{ 
                      backgroundColor: i === 0 ? 'rgba(209, 187, 153, 0.4)' : i === 1 ? 'rgba(209, 187, 153, 0.3)' : 'rgba(209, 187, 153, 0.2)',
                      width: i === 0 ? '180px' : i === 1 ? '140px' : '110px',
                      transform: 'translateY(8px)',
                      zIndex: 0
                    }} 
                  />
                  <span
                    className="font-display text-2xl lowercase relative z-10"
                    style={{
                      fontWeight: 400,
                      color: '#000000',
                      lineHeight: '1.05'
                    }}
                  >
                    {style.style_name.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area - No longer restricted by the sidebar margin */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Main photo with side info */}
          <div className="flex gap-3 mb-2">
            {/* Left side info panels */}
            <div className="flex flex-col justify-center gap-4 py-1 shrink-0" style={{ width: '90px' }}>
              {/* Top Decade */}
              <div className="text-right">
                <p 
                  className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: '#9A9A9A' }}
                >
                  NOSTALGIC FOR
                </p>
                <p 
                  className="text-[12px] font-medium leading-tight"
                  style={{ color: '#3D3D3D' }}
                >
                  {results.top_decade}
                </p>
              </div>

              {/* Top Item */}
              <div className="text-right">
                <p 
                  className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: '#9A9A9A' }}
                >
                  WARDROBE MVP
                </p>
                <p 
                  className="text-[12px] font-medium leading-tight"
                  style={{ color: '#3D3D3D' }}
                >
                  {topItemName}
                </p>
              </div>

              {/* Top Color */}
              <div className="text-right">
                <p
                  className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                  style={{ color: '#9A9A9A' }}
                >
                  FAVORITE COLOR
                </p>
                <p 
                  className="text-[12px] font-medium leading-tight"
                  style={{ color: '#3D3D3D' }}
                >
                  {topColorGroup}
                </p>
              </div>
            </div>

            {/* Main photo */}
            <div 
              className="flex-1 relative bg-[#E8E4DE] rounded-[20px] overflow-hidden"
              style={{ 
                aspectRatio: '3/4',
                marginTop: '-30px',
              }}
            >
              {signatureOutfit?.path ? (
                <img
                  src={signatureOutfit.path}
                  alt="Your signature look"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    Your Look
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Color dots row - 4 shades, separator (pill), 4 colors */}
          <div className="flex justify-center items-center gap-1 mt-1 mb-1">
            {leftDots.map((hex, i) => (
              <div
                key={`left-${i}`}
                className="w-3 h-2.5 rounded-full"
                style={{
                  backgroundColor: hex,
                  border: getBrightness(hex) > 230 ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
                }}
              />
            ))}
            
            {/* Top Color Pill as separator */}
            <div 
              className="px-2 h-3.5 rounded-full flex items-center justify-center border border-black/5 mx-0.5"
              style={{ backgroundColor: topColorHex }}
            >
              <span 
                className="text-[7px] font-bold uppercase tracking-wider"
                style={{ color: contrastColor }}
              >
                {topShadeName}
              </span>
            </div>

            {rightDots.map((hex, i) => (
              <div
                key={`right-${i}`}
                className="w-3 h-2.5 rounded-full"
                style={{
                  backgroundColor: hex,
                  border: getBrightness(hex) > 230 ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Color Aura name - script/display font */}
          <div className="text-center mb-3">
            <p
              className="font-display text-2xl italic"
              style={{
                color: '#000000',
                fontWeight: 400,
                lineHeight: '0.9',
              }}
            >
              {results.color_aura}
            </p>
          </div>

          {/* Bottom section - Celebrity Twin & Style Destination */}
          <div className="flex gap-4 px-6">
            {/* Celebrity Twin */}
            <div className="flex-1">
              <p 
                className="text-[9px] font-bold uppercase tracking-wider mb-1 text-center"
                style={{ color: '#9A9A9A' }}
              >
                CELEBRITY TWIN
              </p>
              <div 
                className="relative mb-1 bg-[#E0DCD6] rounded-[20px] overflow-hidden"
                style={{ aspectRatio: '1/1' }}
              >
                {results.top_celeb_match.celeb_portrait_url ? (
                  <img
                    src={results.top_celeb_match.celeb_portrait_url}
                    alt={results.top_celeb_match.celeb_name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 uppercase">
                      {results.top_celeb_match.celeb_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p 
                className="text-[9px] text-center uppercase tracking-wider font-medium"
                style={{ color: '#3D3D3D' }}
              >
                {results.top_celeb_match.celeb_name.toUpperCase()}
              </p>
            </div>

            {/* Style Destination */}
            <div className="flex-1">
              <p 
                className="text-[9px] font-bold uppercase tracking-wider mb-1 text-center"
                style={{ color: '#9A9A9A' }}
              >
                STYLE DESTINATION
              </p>
              <div 
                className="relative mb-1 bg-[#E0DCD6] rounded-[20px] overflow-hidden"
                style={{ aspectRatio: '1/1' }}
              >
                {results.city_photo_url ? (
                  <img
                    src={results.city_photo_url}
                    alt={results.city_vibe}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-gray-400 uppercase">
                      {results.city_vibe?.charAt(0) || 'C'}
                    </span>
                  </div>
                )}
              </div>
              <p 
                className="text-[9px] text-center uppercase tracking-wider font-medium"
                style={{ color: '#3D3D3D' }}
              >
                {(results.city_vibe || 'Your City').toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
