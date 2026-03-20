import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const TopDecadeCard = ({ results }: ShareableCardProps) => {
  const primaryStyle = results.top_styles[0]?.style_name.toLowerCase() || "";
  const otherStyles = results.top_styles.slice(1).map(s => s.style_name.toLowerCase());
  
  // Format decade to have a leading apostrophe if it's a 2-digit year (e.g., "90s" -> "‘90s")
  const formattedDecade = results.top_decade.match(/^\d{2}s$/) 
    ? `‘${results.top_decade}` 
    : results.top_decade;

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center p-6">
      <div className="aspect-square w-full border border-white/40 rounded-[40px] p-8 flex flex-col justify-between relative">
        <div className="mt-4">
          <h2 className="font-display text-[28px] leading-[1.1] text-[#E5D1B8] font-medium">
            {results.userName}’s<br />
            favorite era<br />
            was the
          </h2>
          <p className="font-display text-[56px] leading-none text-[#E5D1B8] mt-1 font-medium">
            {formattedDecade}
          </p>
        </div>
        
        <div className="self-end text-right mb-10">
          <p className="font-display text-[24px] leading-[1.1] text-[#E5D1B8] font-medium">
            and<br />
            wore a lot of
          </p>
          <p className="font-display text-[44px] leading-none text-white font-medium">
            {primaryStyle}*
          </p>
        </div>

        <div className="flex justify-between items-end w-full px-1">
          <div className="flex flex-col gap-0.5">
            <p className="text-[9px] tracking-wider text-white/40 font-mono">
              * and {otherStyles.join(", and ")}
            </p>
          </div>
          <p className="text-[9px] tracking-wider text-white/20 font-mono">
            lookbook.inc/wrapped
          </p>
        </div>
      </div>
    </div>
  );
};
