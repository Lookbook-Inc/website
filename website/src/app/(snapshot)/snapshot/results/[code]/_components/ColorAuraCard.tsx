import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const ColorAuraCard = ({ results, selectedOutfitIndex }: ShareableCardProps) => {
  const signatureOutfit = selectedOutfitIndex !== null 
    ? results.top_outfits[selectedOutfitIndex] 
    : results.top_outfits[0];

  // Get top color info
  const topColor = results.top_colors[0];
  const topColorHex = topColor?.top_shade_hex || '#695130';
  const topColorName = topColor?.top_shade || 'BROWN';
  
  // Get other colors for the bottom row
  // We want up to 4 other colors
  const otherColors = results.top_colors
    .filter(c => c.top_shade_hex !== topColorHex)
    .slice(0, 4);

  // If we don't have enough, add some defaults or duplicates (though results usually have 5)
  while (otherColors.length < 4 && results.top_colors.length > 0) {
    otherColors.push(results.top_colors[otherColors.length % results.top_colors.length]);
  }

  // Helper to convert hex to LAB-ish values for display (mimicking the UI in the image)
  // These are just for aesthetic "data" display
  const getPseudoLab = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    // Very simplified pseudo-LAB for visual effect
    const l = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 2.55).toFixed(2);
    const a = ((r - g) / 20).toFixed(2);
    const b_val = ((g - b) / 20).toFixed(2);
    
    return { l, a, b: b_val };
  };

  const lab = getPseudoLab(topColorHex);

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

  const mainCardContrast = getContrastColor(topColorHex);

  return (
    <div 
      className="absolute inset-0 bg-white border-[4px] border-white box-border rounded-[48px] overflow-hidden flex flex-col font-sans"
    >
      {/* Background Image with heavy blur/grain effect */}
      <div className="absolute inset-0 z-0">
        {signatureOutfit?.path && (
          <div className="relative w-full h-full">
            <img
              src={signatureOutfit.path}
              alt="Background"
              className="w-full h-full object-cover scale-110 blur-[40px] opacity-60 saturate-[1.2]"
            />
            {/* Grain overlay */}
            <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            {/* Gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
          </div>
        )}
      </div>

      <div className="relative z-10 flex flex-col px-6 pt-16 pb-16 items-center gap-6 text-white w-full h-fit">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-[14px] font-black uppercase tracking-widest drop-shadow-sm text-white">
            {results.userName}&apos;S COLOR AURA
          </h3>
        </div>

        {/* Main Color Card */}
        <div 
          className="w-full rounded-[32px] p-6 flex flex-col justify-between aspect-[1.6/1] shadow-2xl relative overflow-hidden shrink-0"
          style={{ backgroundColor: topColorHex, color: mainCardContrast }}
        >
          {/* Subtle inner shadow/gradient for the card */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-start relative z-10">
            <h1 className="text-4xl font-black leading-[0.9] tracking-tighter uppercase">
              {topColorName}
            </h1>
          </div>

          <div className="flex justify-between items-end relative z-10">
            <div className="flex flex-col">
              <span className="text-[18px] font-black opacity-60 uppercase tracking-[0.15em] leading-none">
                {topColor.color}
              </span>
              <span className="text-[12px] opacity-60 font-mono font-medium tracking-widest mt-1 uppercase">
                {topColorHex}
              </span>
            </div>
            <div className="flex flex-col font-mono text-[12px] leading-tight opacity-60">
              <div className="flex justify-between gap-3">
                <span>L:</span>
                <span>{lab.l}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>a:</span>
                <span>{lab.a.padStart(5, '0')}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>b:</span>
                <span>{lab.b.padStart(5, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Colors Row */}
        <div className="grid grid-cols-4 gap-1 h-32 w-full shrink-0 mt-[-2]">
          {otherColors.map((color, i) => {
            const contrast = getContrastColor(color.top_shade_hex);
            return (
              <div 
                key={i}
                className="rounded-[18px] p-2.5 flex flex-col justify-end shadow-lg relative overflow-hidden"
                style={{ backgroundColor: color.top_shade_hex, color: contrast }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black leading-tight uppercase line-clamp-2 break-words hyphens-auto">
                    {color.top_shade}
                  </p>
                  <p className="text-[10px] font-mono opacity-60 uppercase font-semibold">
                    {color.color}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Color Aura section */}
        <div className="text-center flex flex-col gap-1 text-white">
          <div className="flex flex-col gap-0.5">
            <p className="text-[12px] italic font-bold tracking-wide">it&apos;s giving</p>
            <h2 className="text-2xl font-black uppercase tracking-wider drop-shadow-sm italic leading-tight">
              {results.color_aura}
            </h2>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] font-mono font-bold opacity-50 tracking-widest z-8 text-white">
        lookbook.inc/snapshot
      </p>
    </div>
  );
};
