import React from 'react';
import { ShareableCardProps } from './SummaryCard';

export const CelebrityTwinCard = ({ results }: ShareableCardProps) => {
  const { top_celeb_match, userName, top_styles } = results;
  
  // Get user style names in lowercase for comparison
  const userStyleNames = top_styles.map(s => s.style_name.toLowerCase());

  const aesthetics = [
    top_celeb_match.style_1,
    top_celeb_match.style_2,
    top_celeb_match.style_3
  ].filter(Boolean);

  return (
    <div className="absolute inset-0 bg-white border-[4px] border-black box-border rounded-[48px] overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Title Section */}
      <div className="text-center mb-8">
        <h2 className="font-display text-[36px] leading-[1.1] text-black">
          {userName}’s<br />Style Twin
        </h2>
      </div>

      {/* Image Section */}
      <div className="relative mb-6">
        <div className="w-[160px] h-[160px] rounded-full overflow-hidden">
          {top_celeb_match.celeb_portrait_url ? (
            <img 
              src={top_celeb_match.celeb_portrait_url} 
              alt={top_celeb_match.celeb_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl text-gray-400">
              {top_celeb_match.celeb_name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Name Section */}
      <div className="text-center mb-10">
        <h3 className="font-display text-[36px] leading-[1.1] text-black">
          {top_celeb_match.celeb_name}
        </h3>
      </div>
      
      {/* Spacer */}
      <div className="h-10"></div>

      {/* Aesthetics & Aura Section at Bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center w-full px-4">
        <div className="flex items-center justify-center gap-1.5 mb-4">
          <span className="text-[12px] tracking-[0.1em] font-bold uppercase border-b-2 border-gray-200">
            <span className="text-gray-400">SHARED</span>
            <span className="text-gray-300"> AESTHETICS</span>
          </span>
        </div>
        
        {/* Aesthetics Grid with Overlap Emphasis */}
        <div className="grid grid-cols-3 items-start w-full px-4">
          {aesthetics.map((style, index) => {
            const isShared = userStyleNames.includes(style.toLowerCase());
            return (
              <div 
                key={style}
                className={`flex items-center justify-center px-2 h-full `}
              >
                <span 
                  className={`text-[15px] leading-tight tracking-tight text-center ${
                    isShared ? 'font-display text-gray-500' : 'font-display text-gray-300'
                  }`}
                >
                  {style.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Separator and Color Aura */}
        <div className="flex flex-col items-center">
          <span className="text-[15px] font-display text-gray-500 my-[-4px]">×</span>
          <span className={`text-[15px] font-display tracking-tight lowercase ${
            results.color_aura.toLowerCase() === top_celeb_match.color_aura_name.toLowerCase() 
              ? 'text-gray-500' 
              : 'text-gray-300'
          }`}>
            {top_celeb_match.color_aura_name}
          </span>
        </div>
      </div>
    </div>
  );
};
