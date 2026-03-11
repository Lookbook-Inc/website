import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const TopDecadeCard = ({ results }: ShareableCardProps) => {
  return (
    <div className="absolute inset-0 bg-[#F0F0F0] border-[4px] border-black box-border rounded-[32px] overflow-hidden flex flex-col items-center justify-center p-8">
      <h2 className="font-display text-4xl mb-4">Top Decade</h2>
      <p className="text-6xl font-bold">{results.top_decade}</p>
      <p className="mt-4 text-gray-500 uppercase tracking-widest text-xs">Lookbook Snapshot</p>
    </div>
  );
};
