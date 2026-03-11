import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const StyleDestinationCard = ({ results }: ShareableCardProps) => {
  return (
    <div className="absolute inset-0 bg-[#E0DCD6] border-[4px] border-black box-border rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8">
      <h2 className="font-display text-4xl mb-4 text-center">Style Destination</h2>
      <div className="w-full aspect-square rounded-2xl bg-gray-300 overflow-hidden mb-4 border-2 border-black">
        {results.city_photo_url ? (
          <img 
            src={results.city_photo_url} 
            alt={results.city_vibe}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 uppercase tracking-widest">
            {results.city_vibe}
          </div>
        )}
      </div>
      <p className="text-xl font-medium uppercase tracking-widest">{results.city_vibe}</p>
    </div>
  );
};
