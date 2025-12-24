'use client';

import React, { useRef, useState, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';
import { WrappedResults } from '@/types/wrapped-frontend';
import { NavigationFooter } from './NavigationFooter';

interface SummaryContentProps {
  results: WrappedResults;
  selectedOutfitIndex: number | null;
  onBack?: () => void;
  isActive?: boolean;
}

export const SummaryContent = ({ 
  results, 
  selectedOutfitIndex, 
  onBack,
  isActive = true
}: SummaryContentProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareSupported] = useState(() => 
    typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
  );

  // Update scale whenever the window resizes
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const targetWidth = 360;
      const containerHeight = containerRef.current.offsetHeight;
      const targetHeight = 640;
      
      const widthScale = (containerWidth - 32) / targetWidth;
      const heightScale = (containerHeight - 32) / targetHeight;
      
      setScale(Math.min(1, widthScale, heightScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 100);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, []);

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
        width: 360,
        height: 640,
        scale: 4, // Maximum quality
        backgroundColor: 'transparent',
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
      
      {/* Centered Group: Card + Buttons */}
      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
        
        {/* Shareable Card Container */}
        <div 
          ref={containerRef}
          className="w-full flex items-center justify-center overflow-hidden"
        >
          {/* Scaling Wrapper - This applies the visual scale and entry animation */}
          <div
            style={{
              transform: `scale(${isActive ? scale : scale * 1.1})`,
              opacity: isActive ? 1 : 0,
              transformOrigin: 'center center',
              transition: isActive 
                ? 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out' 
                : 'none',
            }}
          >
            {/* Capture Target - This stays at 100% scale for perfect capture */}
            <div
              ref={cardRef}
              className="shrink-0 overflow-hidden relative"
              style={{
                width: '360px',
                height: '640px',
              }}
            >
              {/* The actual card with its border and background */}
              <div
                className="absolute inset-0 bg-[#F7F7F7] overflow-hidden shadow-2xl"
                style={{
                  borderRadius: '32px',
                  border: '8px solid #000000',
                  boxSizing: 'border-box'
                }}
              >
                {/* Card Inner Content */}
                <div className="relative p-5 h-full flex flex-col justify-between overflow-hidden">
                  
                  {/* Vertical Lookbook branding - Adjusted for inside-border alignment */}
                  <div
                    className="absolute left-[-55px] top-[140px] w-[200px]"
                    style={{ 
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center center',
                      zIndex: 20
                    }}
                  >
                    <span
                      className="font-display text-[54px] tracking-tight leading-none block text-center"
                      style={{
                        fontWeight: 400,
                        color: '#C4B8A8', 
                        letterSpacing: '-0.05em',
                      }}
                    >
                      Lookbook
                    </span>
                  </div>

                  {/* Main content area */}
                  <div className="flex-1 flex flex-col justify-between ml-9">
                    
                    {/* Header - Name's Top Aesthetics */}
                    <div className="mb-2">
                      <p
                        className="text-[9px] uppercase tracking-[0.15em] mb-3 text-right"
                        style={{ color: '#A5A5A5' }}
                      >
                        {results.userName.toUpperCase()}'S TOP AESTHETICS
                      </p>

                      {/* Aesthetics with highlight bars */}
                      <div className="flex flex-col items-end gap-0.5">
                        {results.top_styles.slice(0, 3).map((style, i) => (
                          <div
                            key={i}
                            className="relative flex items-center justify-end"
                          >
                            {/* Background bar */}
                            <div 
                              className="absolute right-0 h-3 rounded-sm" 
                              style={{ 
                                backgroundColor: '#D4C8B8',
                                width: i === 0 ? '120px' : i === 1 ? '150px' : '180px',
                                transform: 'translateY(4px)',
                                zIndex: 0
                              }} 
                            />
                            <span
                              className="font-display text-[32px] lowercase relative z-10"
                              style={{
                                fontWeight: 700,
                                color: '#000000',
                                letterSpacing: '-0.03em',
                                lineHeight: '1.1'
                              }}
                            >
                              {style.style_name.toLowerCase()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Main photo with side info */}
                    <div className="flex gap-4 mb-2">
                      {/* Left side info panels */}
                      <div className="flex flex-col justify-between py-1 shrink-0" style={{ width: '80px' }}>
                        {/* Top Decade */}
                        <div className="text-right">
                          <p 
                            className="text-[8px] uppercase tracking-[0.12em] mb-0.5"
                            style={{ color: '#9A9A9A' }}
                          >
                            TOP DECADE
                          </p>
                          <p 
                            className="text-base font-medium"
                            style={{ color: '#3D3D3D' }}
                          >
                            {results.top_decade || '2010s'}
                          </p>
                        </div>

                        {/* Top Item */}
                        <div className="text-right">
                          <p 
                            className="text-[8px] uppercase tracking-[0.12em] mb-0.5"
                            style={{ color: '#9A9A9A' }}
                          >
                            TOP ITEM
                          </p>
                          <p 
                            className="text-[11px] font-medium leading-tight line-clamp-2"
                            style={{ color: '#3D3D3D' }}
                          >
                            {topItemName}
                          </p>
                        </div>

                        {/* Top Color */}
                        <div className="text-right">
                          <p 
                            className="text-[8px] uppercase tracking-[0.12em] mb-0.5"
                            style={{ color: '#9A9A9A' }}
                          >
                            TOP COLOR
                          </p>
                          <p 
                            className="text-[11px] font-medium leading-tight"
                            style={{ color: '#3D3D3D' }}
                          >
                            {topColorName}
                          </p>
                          <p 
                            className="text-[9px] uppercase font-mono tracking-tighter"
                            style={{ color: '#AAAAAA' }}
                          >
                            {topColorHex}
                          </p>
                        </div>
                      </div>

                      {/* Main photo */}
                      <div 
                        className="flex-1 relative"
                        style={{ aspectRatio: '3/4' }}
                      >
                        <div 
                          className="absolute inset-0 bg-[#E8E4DE] rounded-[20px] overflow-hidden z-10"
                          style={{ 
                            boxShadow: '4px 4px 0px #E0DCD6, 0 4px 20px rgba(0,0,0,0.08)',
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
                    </div>

                    {/* Color dots row */}
                    <div className="flex justify-center gap-1 mb-2">
                      {results.top_colors.slice(0, 3).map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: c.top_shade_hex,
                            border: c.top_shade_hex.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none',
                          }}
                        />
                      ))}
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: 'transparent',
                          border: '1px solid #9A9A9A',
                        }}
                      />
                      {results.top_colors.slice(3, 6).map((c, i) => (
                        <div
                          key={i + 3}
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: c.top_shade_hex,
                            border: c.top_shade_hex.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none',
                          }}
                        />
                      ))}
                    </div>

                    {/* Color Aura name - script/display font */}
                    <div className="text-center mb-3">
                      <p
                        className="font-display text-[42px] italic"
                        style={{
                          color: '#1D1B20',
                          fontWeight: 600,
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                        }}
                      >
                        {results.color_aura}
                      </p>
                    </div>

                    {/* Bottom section - Celebrity Twin & Style Destination */}
                    <div className="flex gap-4">
                      {/* Celebrity Twin */}
                      <div className="flex-1">
                        <p 
                          className="text-[8px] uppercase tracking-[0.12em] mb-1.5 text-center"
                          style={{ color: '#9A9A9A' }}
                        >
                          CELEBRITY TWIN
                        </p>
                        <div 
                          className="relative overflow-hidden mb-1.5 shadow-sm"
                          style={{ 
                            aspectRatio: '4/5',
                            backgroundColor: '#E0DCD6',
                            borderRadius: '20px',
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
                          className="text-[9px] text-center uppercase tracking-wider font-medium"
                          style={{ color: '#3D3D3D' }}
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
                          className="relative overflow-hidden mb-1.5 shadow-sm"
                          style={{ 
                            aspectRatio: '4/5',
                            backgroundColor: '#E0DCD6',
                            borderRadius: '20px',
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
                          className="text-[9px] text-center uppercase tracking-wider font-medium"
                          style={{ color: '#3D3D3D' }}
                        >
                          {(results.city_vibe || 'Your City').toUpperCase()}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - Moved closer to the card visually */}
        <div 
          className="flex gap-3 w-full max-w-[320px] px-4 mt-6 mb-2"
          style={{ 
            opacity: isActive ? 1 : 0,
            transition: 'opacity 0.6s ease-out 0.4s'
          }}
        >
          <button 
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-medium text-xs shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Wait...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save
              </>
            )}
          </button>
          <button 
            onClick={handleShare}
            disabled={isProcessing}
            className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareSupported ? 'Share' : 'Link'}
          </button>
        </div>
      </div>
      
      <NavigationFooter onBack={onBack} leftLabel={`${results.userName}'s Lookbook`} />
    </div>
  );
};
