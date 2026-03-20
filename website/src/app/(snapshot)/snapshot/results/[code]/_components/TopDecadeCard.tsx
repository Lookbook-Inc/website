import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const TopDecadeCard = ({ results }: ShareableCardProps) => {
  const primaryStyle = results.top_styles[0]?.style_name.toLowerCase() || "";
  const otherStyles = results.top_styles.slice(1).map(s => s.style_name.toLowerCase());
  
  // Format decade: if starts with 19, use apostrophe (1990 -> '90s), if starts with 20, keep full year (2000 -> 2000s)
  const formattedDecade = results.top_decade.startsWith('19') 
    ? `'${results.top_decade.slice(2)}` 
    : results.top_decade;

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center p-8">
      <div className="aspect-square w-full border-[2px] border-[#DDDDDD] rounded-[40px] px-8 py-6 flex flex-col justify-center relative">
        <div>
          <h2 className="font-display text-[24px] leading-[1.1] text-[#D1BB99] font-medium">
            {results.userName}'s<br />
            favorite era<br />
            was the
          </h2>
          <p className="font-display text-[36px] leading-[1.1] text-[#DDDDDD] font-medium">
            {formattedDecade}
          </p>
        </div>
        
        <div className="self-end text-right mb-2 mt-[-16px]">
          <p className="font-display text-[24px] leading-[1.1] text-[#D1BB99] font-medium">
            and<br />
            wore a lot of
          </p>
          <p className="font-display text-[32px] leading-[1.1] text-[#DDDDDD] font-medium">
            {primaryStyle}*
          </p>
        </div>

        <div className="flex-col justify-between items-end text-right w-full mt-2 gap-1">
          <p className="text-[10px] text-[#DDDDDD]/60 font-mono">
            * and {otherStyles.map((style, i) => (
              <span key={style}>
                <span className="font-bold tracking-tight">{style}</span>
                {i < otherStyles.length - 1 ? ", and " : ""}
                </span>
              ))}
          </p>
          <p className="text-[10px] text-[#DDDDDD]/40 font-mono">
            lookbook.inc/snapshot
          </p>
        </div>
      </div>
    </div>
  );
};
