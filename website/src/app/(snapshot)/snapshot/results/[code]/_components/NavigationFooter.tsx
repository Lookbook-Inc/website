'use client';

import React from 'react';

interface NavigationFooterProps {
  onNext?: () => void;
  onBack?: () => void;
  nextText?: string;
  backText?: string;
  light?: boolean;
  leftLabel?: string;
  disabled?: boolean;
}

export const NavigationFooter = ({ 
  onNext, 
  onBack, 
  nextText = "continue →", 
  backText = "← back",
  light = true,
  leftLabel = "Lookbook",
  disabled = false
}: NavigationFooterProps) => {
  // Match the background color of the current screen to "punch out" the text from the sidebar
  const bgColor = light ? '#FFFAF4' : '#000000';
  
  return (
    <div className="mt-auto pt-2 flex justify-between items-center font-display relative z-10 min-h-[32px]">
      {onBack ? (
        <button 
          onClick={onBack} 
          className={`${light ? 'text-gray-400' : 'text-zinc-500'} text-lg px-2 py-0.5 rounded-sm`}
          style={{ backgroundColor: bgColor }}
        >
          {backText}
        </button>
      ) : (
        <span 
          className={`text-lg px-2 py-0.5 rounded-sm`}
          style={{ 
            color: leftLabel === "Lookbook" ? '#D1BB99' : (light ? '#9CA3AF' : 'rgba(113, 113, 122, 0.5)'),
            backgroundColor: bgColor
          }}
        >
          {leftLabel}
        </span>
      )}
      
      {onNext && (
        <button 
          onClick={onNext} 
          disabled={disabled}
          className={`${light ? 'text-gray-900' : 'text-[#F7EFE5]'} text-lg px-2 py-0.5 rounded-sm transition-opacity ${disabled ? 'opacity-20 cursor-not-allowed' : 'opacity-100'}`}
          style={{ backgroundColor: bgColor }}
        >
          {nextText}
        </button>
      )}
    </div>
  );
};

