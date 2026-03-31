import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const ColorOfTheYearCard = ({ results }: ShareableCardProps) => {
  const firstName = results.userName.split(' ')[0];
  
  // Use real values from results
  const topColor = results.top_colors[0];
  const colorName = topColor.top_shade;
  const hexCode = topColor.top_shade_hex;
  const colorCategory = topColor.color;
  const year = "2026";

  return (
    <div 
      className="absolute inset-0 overflow-hidden rounded-[32px] p-8 flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 25%, ${hexCode} 50%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.4) 100%), ${hexCode}`
      }}
    >
      {/* Swatch Container - needs to be 32 px wider because 16px "border" */}
      <div className="w-[232px] bg-white shadow-2xl overflow-hidden flex flex-col p-[16px]">
        {/* Top Colored Section */}
        <div 
          className="h-[200px] relative p-5 flex flex-col items-end text-right rounded-sm"
          style={{ backgroundColor: hexCode }}
        >
          <h2 className="text-white text-[24px] font-bold leading-[1.1] opacity-95">
            {firstName}&apos;s<br />
            Color of<br />
            the Year<br />
            {year}
          </h2>
        </div>

        {/* Bottom White Information Section */}
        <div className="py-5 bg-white flex flex-col">
          <h1 className="text-black text-[36px] font-light tracking-tighter leading-[0.9] mb-2">
            {colorName}
          </h1>
          <div className="flex flex-col items-start text-[#999] text-[13px] gap-1 ml-1 mt-1">
            <span className="font-bold uppercase tracking-[0.2em] leading-none">{colorCategory}</span>
            <span className="font-mono uppercase tracking-widest leading-none">{hexCode}</span>
          </div>
        </div>
      </div>

      {/* Footer URL */}
      <div className="mt-2 w-[220px] text-white/80 font-mono text-[11px] tracking-tight text-left ml-[-12px]">
        lookbook.inc/snapshot
      </div>
    </div>
  );
};
