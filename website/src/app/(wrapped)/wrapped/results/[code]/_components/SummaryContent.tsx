'use client';

import React, { useRef, useState } from 'react';
import { domToPng } from 'modern-screenshot';
import { WrappedResults } from '@/types/wrapped-frontend';
import { NavigationFooter } from './NavigationFooter';

interface SummaryContentProps {
  results: WrappedResults;
  selectedOutfitIndex: number | null;
  onBack?: () => void;
}

export const SummaryContent = ({ 
  results, 
  selectedOutfitIndex, 
  onBack 
}: SummaryContentProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareSupported] = useState(() => 
    typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
  );

  // Determine which outfit to show - use user selection if available, else top outfit
  const signatureOutfit = selectedOutfitIndex !== null 
    ? results.top_outfits[selectedOutfitIndex] 
    : results.top_outfits[0];

  // Capture card as data URL
  const captureCard = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    try {
      // modern-screenshot is more reliable for modern CSS
      return await domToPng(cardRef.current, {
        scale: 2, // Higher resolution for better quality
        backgroundColor: '#F5F0EB',
      });
    } catch (error) {
      console.error('Failed to capture card:', error);
      return null;
    }
  };

  // Handle download - works on mobile by opening image in new tab
  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = await captureCard();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }

      // Check if iOS Safari (download attribute doesn't work well)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        // On iOS, open image in new tab - user can long-press to save
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <html>
              <head>
                <title>Your Lookbook Card</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    margin: 0; 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    min-height: 100vh; 
                    background: #f5f5f5;
                    padding: 20px;
                    box-sizing: border-box;
                  }
                  img { 
                    max-width: 100%; 
                    height: auto; 
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  }
                  p {
                    margin-top: 20px;
                    font-family: system-ui, -apple-system, sans-serif;
                    color: #666;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="Lookbook Card" />
                <p>Long press on the image to save it</p>
              </body>
            </html>
          `);
          newTab.document.close();
        }
      } else {
        // On other devices, trigger download
        const link = document.createElement('a');
        link.download = `lookbook-${results.userName.toLowerCase()}-2025.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle share - uses Web Share API on mobile
  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = await captureCard();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }

      // Convert data URL to blob for sharing
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      
      const file = new File([blob], `lookbook-${results.userName.toLowerCase()}-2025.png`, { 
        type: 'image/png' 
      });

      // Check if we can share files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${results.userName}'s Lookbook 2025`,
          text: `Check out my 2025 style wrapped! My color palette is "${results.color_aura}" ✨`,
        });
      } else if (navigator.share) {
        // Fallback: share without file (just text/url)
        await navigator.share({
          title: `${results.userName}'s Lookbook 2025`,
          text: `Check out my 2025 style wrapped! My color palette is "${results.color_aura}" ✨`,
          url: window.location.href,
        });
      } else {
        // No share API - fallback to download
        handleDownload();
      }
    } catch (error) {
      // User cancelled share or share failed
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Get top item name (truncated if needed)
  const topItemName = results.most_worn_item?.name?.split('(')[0]?.trim() || 'Classic Piece';
  
  // Get top color info
  const topColor = results.top_colors[0];
  const topColorName = topColor?.top_shade || 'signature shade';
  const topColorHex = topColor?.top_shade_hex || '#888888';

  return (
    <div className="flex flex-col h-[100dvh] px-4 pt-6 pb-4 bg-[#FFFAF4]">
      {/* Shareable Card */}
      <div className="flex-1 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-4">
        <div 
          ref={cardRef}
          className="w-full max-w-sm mx-auto overflow-hidden"
          style={{ 
            backgroundColor: '#F5F0EB',
            borderRadius: '0px',
          }}
        >
          {/* Card Inner Content */}
          <div className="relative p-4 pb-6">
            
            {/* Vertical Lookbook branding - left side */}
            <div 
              className="absolute left-3 top-12 bottom-12 flex items-center justify-center"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              <span 
                className="font-display text-3xl tracking-tight"
                style={{ 
                  fontWeight: 400,
                  color: '#3D3D3D',
                  transform: 'rotate(180deg)',
                  letterSpacing: '-0.02em',
                }}
              >
                Lookbook
              </span>
            </div>

            {/* Main content area - offset for vertical branding */}
            <div className="ml-10">
              
              {/* Header - Name's Top Aesthetics */}
              <div className="mb-3">
                <p 
                  className="text-[10px] uppercase tracking-[0.15em] mb-2"
                  style={{ color: '#8A8A8A' }}
                >
                  {results.userName.toUpperCase()}'S TOP AESTHETICS
                </p>
                
                {/* Aesthetics with highlight bars */}
                <div className="flex flex-col items-end gap-0.5">
                  {results.top_styles.slice(0, 3).map((style, i) => (
                    <div 
                      key={i}
                      className="flex items-center"
                    >
                      <div 
                        className="h-7 px-2 flex items-center"
                        style={{ backgroundColor: '#D4C8B8' }}
                      >
                        <span 
                          className="font-display text-lg lowercase italic"
                          style={{ 
                            fontWeight: 700,
                            color: '#2D2D2D',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {style.style_name.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main photo with side info */}
              <div className="flex gap-2 mb-3">
                {/* Left side info panels */}
                <div className="flex flex-col justify-between py-2 shrink-0" style={{ width: '72px' }}>
                  {/* Top Decade */}
                  <div className="text-right">
                    <p 
                      className="text-[8px] uppercase tracking-[0.1em] mb-0.5"
                      style={{ color: '#9A9A9A' }}
                    >
                      TOP DECADE
                    </p>
                    <p 
                      className="text-sm font-medium"
                      style={{ color: '#3D3D3D' }}
                    >
                      {results.top_decade || '2020s'}
                    </p>
                  </div>

                  {/* Top Item */}
                  <div className="text-right">
                    <p 
                      className="text-[8px] uppercase tracking-[0.1em] mb-0.5"
                      style={{ color: '#9A9A9A' }}
                    >
                      TOP ITEM
                    </p>
                    <p 
                      className="text-xs leading-tight"
                      style={{ color: '#3D3D3D' }}
                    >
                      {topItemName.length > 24 
                        ? topItemName.substring(0, 24) + '...' 
                        : topItemName}
                    </p>
                  </div>

                  {/* Top Color */}
                  <div className="text-right">
                    <p 
                      className="text-[8px] uppercase tracking-[0.1em] mb-0.5"
                      style={{ color: '#9A9A9A' }}
                    >
                      TOP COLOR
                    </p>
                    <p 
                      className="text-xs leading-tight"
                      style={{ color: '#3D3D3D' }}
                    >
                      {topColorName}
                    </p>
                    <p 
                      className="text-[9px] uppercase"
                      style={{ color: '#AAAAAA' }}
                    >
                      {topColorHex}
                    </p>
                  </div>
                </div>

                {/* Main photo */}
                <div 
                  className="flex-1 relative overflow-hidden"
                  style={{ 
                    aspectRatio: '3/4',
                    backgroundColor: '#E8E4DE',
                    borderRadius: '4px',
                    boxShadow: '4px 4px 0px rgba(0,0,0,0.08)',
                  }}
                >
                  {signatureOutfit?.path ? (
                    <img
                      src={signatureOutfit.path}
                      alt="Your signature look"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">
                        Your Look
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Color dots row */}
              <div className="flex justify-center gap-1.5 mb-3">
                {results.top_colors.slice(0, 4).map((c, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full"
                    style={{ 
                      backgroundColor: c.top_shade_hex,
                      border: c.top_shade_hex.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none',
                    }}
                  />
                ))}
                {/* Outline dot for contrast */}
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ 
                    backgroundColor: 'transparent',
                    border: '1.5px solid #C0C0C0',
                  }}
                />
                {/* Additional accent colors */}
                {results.top_colors.slice(4, 7).map((c, i) => (
                  <div
                    key={i + 4}
                    className="w-5 h-5 rounded-full"
                    style={{ 
                      backgroundColor: c.top_shade_hex,
                      border: c.top_shade_hex.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Color Aura name - script/display font */}
              <div className="text-center mb-4">
                <p 
                  className="font-display text-3xl italic"
                  style={{ 
                    color: '#2D2D2D',
                    fontWeight: 400,
                  }}
                >
                  {results.color_aura}
                </p>
              </div>

              {/* Bottom section - Celebrity Twin & Style Destination */}
              <div className="flex gap-3">
                {/* Celebrity Twin */}
                <div className="flex-1">
                  <p 
                    className="text-[8px] uppercase tracking-[0.12em] mb-1.5 text-center"
                    style={{ color: '#9A9A9A' }}
                  >
                    CELEBRITY TWIN
                  </p>
                  <div 
                    className="relative overflow-hidden mb-1.5"
                    style={{ 
                      aspectRatio: '4/5',
                      backgroundColor: '#E0DCD6',
                      borderRadius: '12px',
                    }}
                  >
                    {results.top_celeb_match.celeb_photo_url ? (
                      <img
                        src={results.top_celeb_match.celeb_photo_url}
                        alt={results.top_celeb_match.celeb_name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 uppercase">
                          {results.top_celeb_match.celeb_name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p 
                    className="text-[10px] text-center uppercase tracking-wide"
                    style={{ color: '#4D4D4D' }}
                  >
                    {results.top_celeb_match.celeb_name.toUpperCase()}
                  </p>
                </div>

                {/* Style Destination */}
                <div className="flex-1">
                  <p 
                    className="text-[8px] uppercase tracking-[0.12em] mb-1.5 text-center"
                    style={{ color: '#9A9A9A' }}
                  >
                    STYLE DESTINATION
                  </p>
                  <div 
                    className="relative overflow-hidden mb-1.5"
                    style={{ 
                      aspectRatio: '4/5',
                      backgroundColor: '#E0DCD6',
                      borderRadius: '12px',
                    }}
                  >
                    {results.city_photo_url ? (
                      <img
                        src={results.city_photo_url}
                        alt={results.city_vibe}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] text-gray-400 uppercase">
                          {results.city_vibe?.charAt(0) || 'C'}
                        </span>
                      </div>
                    )}
                  </div>
                  <p 
                    className="text-[10px] text-center uppercase tracking-wide"
                    style={{ color: '#4D4D4D' }}
                  >
                    {(results.city_vibe || 'Your City').toUpperCase()}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="space-y-3 shrink-0 mb-2">
        <button 
          onClick={handleDownload}
          disabled={isProcessing}
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save to Photos
            </>
          )}
        </button>
        <button 
          onClick={handleShare}
          disabled={isProcessing}
          className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {shareSupported ? 'Share' : 'Copy Link'}
        </button>
      </div>
      
      <NavigationFooter onBack={onBack} leftLabel={`${results.userName}'s Lookbook`} />
    </div>
  );
};
