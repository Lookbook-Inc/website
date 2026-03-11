import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const WardrobeMVPCard = ({ results }: ShareableCardProps) => {
  const topItemName = results.most_worn_item?.name?.split('(')[0]?.trim() || 'Classic Piece';
  
  return (
    <div className="absolute inset-0 bg-[#E8E4DE] border-[4px] border-black box-border rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8">
      <h2 className="font-display text-4xl mb-4 text-center">Wardrobe MVP</h2>
      <p className="text-3xl font-medium text-center">{topItemName}</p>
      <p className="mt-8 text-gray-500 uppercase tracking-widest text-xs">Lookbook Snapshot</p>
    </div>
  );
};
