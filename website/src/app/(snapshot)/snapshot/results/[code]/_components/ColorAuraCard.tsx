import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const ColorAuraCard = ({ results, selectedOutfitIndex }: ShareableCardProps) => {
  const signatureOutfit = selectedOutfitIndex !== null 
    ? results.top_outfits[selectedOutfitIndex] 
    : results.top_outfits[0];

  // Helper for brightness/contrast
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

  // Get top color info
  const topColor = results.top_colors[0];
  const topColorHex = topColor?.top_shade_hex || '#888888';
  const contrastColor = getContrastColor(topColorHex);

  // Use the aura shades for the background or accents
  const auraShades = results.top_shades?.length > 0 
    ? results.top_shades.slice(0, 5).map(s => s.shade_hex)
    : ['#E8E4DE', '#D1BB99', '#A5A5A5', '#3D3D3D', '#151515'];

  return (
    <div 
      className="absolute inset-0 border-[4px] border-black box-border rounded-[32px] overflow-hidden flex flex-col"
      style={{ backgroundColor: topColorHex }}
    >
      {/* Background Aura Effect */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay">
        <div 
          className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] rounded-full blur-[100px]"
          style={{ backgroundColor: auraShades[0] }}
        />
        <div 
          className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] rounded-full blur-[100px]"
          style={{ backgroundColor: auraShades[1] || auraShades[0] }}
        />
      </div>

      <div className="relative flex-1 flex flex-col p-8 justify-between z-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <span className="font-display text-2xl tracking-tighter" style={{ color: contrastColor }}>
            Lookbook
          </span>
          <div 
            className="px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest"
            style={{ borderColor: contrastColor, color: contrastColor }}
          >
            Color Aura
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-2xl border-4 border-black/10"
          >
            {signatureOutfit?.path && (
              <img
                src={signatureOutfit.path}
                alt="Signature Look"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="text-center flex flex-col gap-2">
            <p 
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: contrastColor, opacity: 0.7 }}
            >
              Your palette is
            </p>
            <h2 
              className="font-display text-5xl italic leading-none"
              style={{ color: contrastColor }}
            >
              {results.color_aura}
            </h2>
          </div>
        </div>

        {/* Footer: Palette Dots */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            {auraShades.map((hex, i) => (
              <div 
                key={i}
                className="w-10 h-10 rounded-full border-2 border-black/5 shadow-sm"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
          <p 
            className="text-[10px] text-center font-medium uppercase tracking-widest"
            style={{ color: contrastColor, opacity: 0.6 }}
          >
            lookbook.inc/snapshot
          </p>
        </div>
      </div>
    </div>
  );
};
