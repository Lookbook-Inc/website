import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const CelebrityTwinCard = ({ results }: ShareableCardProps) => {
  return (
    <div className="absolute inset-0 bg-[#F7F7F7] border-[4px] border-black box-border rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8">
      <h2 className="font-display text-4xl mb-6 text-center">Celebrity Twin</h2>
      <div className="w-48 h-48 rounded-full bg-gray-200 overflow-hidden mb-4 border-2 border-black">
        {results.top_celeb_match.celeb_portrait_url ? (
          <img 
            src={results.top_celeb_match.celeb_portrait_url} 
            alt={results.top_celeb_match.celeb_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
            {results.top_celeb_match.celeb_name.charAt(0)}
          </div>
        )}
      </div>
      <p className="text-2xl font-display italic">{results.top_celeb_match.celeb_name}</p>
    </div>
  );
};
