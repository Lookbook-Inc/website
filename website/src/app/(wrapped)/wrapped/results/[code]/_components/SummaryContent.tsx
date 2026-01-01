'use client';

import React, { useRef, useState, useEffect } from 'react';
import { domToPng } from 'modern-screenshot';
import { WrappedResults } from '@/types/wrapped-frontend';
import { NavigationFooter } from './NavigationFooter';

const WRAPPED_URL = 'lookbook.inc/wrapped';

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
  const [heroScale, setHeroScale] = useState(1);
  const [isSettled, setIsSettled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preCapturedDataUrl, setPreCapturedDataUrl] = useState<string | null>(null);
  const [isImageSwapped, setIsImageSwapped] = useState(false);
  const [shareSupported] = useState(() => 
    typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
  );

  // Update scale whenever the window resizes
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      // Get the full available area from the parent flex-1 container
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      
      const containerWidth = parent.offsetWidth;
      const containerHeight = parent.offsetHeight;
      const targetWidth = 360;
      const targetHeight = 640;
      
      const widthScale = (containerWidth - 32) / targetWidth;
      
      // Final Scale: Leaves room for buttons at the bottom (approx 100px)
      const finalHeightScale = (containerHeight - 100 - 32) / targetHeight;
      setScale(Math.min(1, widthScale, finalHeightScale));

      // Hero Scale: Uses the full available height
      const fullHeightScale = (containerHeight - 32) / targetHeight;
      setHeroScale(Math.min(1.05, widthScale, fullHeightScale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    const timer = setTimeout(updateScale, 100);
    
    return () => {
      window.removeEventListener('resize', updateScale);
      clearTimeout(timer);
    };
  }, []);

  // Settlement timer triggers after the flip finishes
  useEffect(() => {
    if (isActive) {
      // Timer to start the "shrink" animation
      const settlementTimer = setTimeout(() => {
        setIsSettled(true);
      }, 3000); // 3 seconds of "Hero" view before shrinking

      // Timer to swap DOM for Image (after animation finishes: 3s + 1.8s)
      const swapTimer = setTimeout(() => {
        setIsImageSwapped(true);
      }, 4800);

      // Pre-capture the card in the background so share/save is instant
      const captureTimer = setTimeout(async () => {
        const url = await captureCard();
        setPreCapturedDataUrl(url);
      }, 1000); // Capture after 1s while still in "Hero" view

      return () => {
        clearTimeout(settlementTimer);
        clearTimeout(swapTimer);
        clearTimeout(captureTimer);
      };
    } else {
      setIsSettled(false);
      setIsImageSwapped(false);
      setPreCapturedDataUrl(null);
    }
  }, [isActive, selectedOutfitIndex]);

  // Clear the pre-captured image if the outfit changes to allow re-capture
  useEffect(() => {
    setPreCapturedDataUrl(null);
    setIsImageSwapped(false);
  }, [selectedOutfitIndex]);

  // Determine the current scale based on state
  const currentDisplayScale = !isActive || !isSettled ? heroScale : scale;

  // Determine which outfit to show - use user selection if available, else top outfit
  const signatureOutfit = selectedOutfitIndex !== null 
    ? results.top_outfits[selectedOutfitIndex] 
    : results.top_outfits[0];

  // Calculate top style and palette for sharing
  const topStyle = results.top_styles.sort((a, b) => (b.points || 0) - (a.points || 0))[0]?.style_name.toLowerCase() || 'unique style';
  const palette = results.color_aura.toLowerCase();

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
      const dataUrl = preCapturedDataUrl || await captureCard();
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
      const dataUrl = preCapturedDataUrl || await captureCard();
      if (!dataUrl) {
        alert('Failed to generate image. Please try again.');
        return;
      }

      // Convert data URL to blob for sharing - sync conversion to keep gesture alive
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      
      const file = new File([blob], `lookbook-${results.userName.toLowerCase()}-2025.png`, { 
        type: 'image/png' 
      });

      const shareText = `My top style was ${topStyle} and my palette was ${palette}. Try yours at ${WRAPPED_URL}`;

      // Check if we can share files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${results.userName}'s 2025 Lookbook Wrapped`,
          text: shareText,
        });
      } else if (navigator.share) {
        // Fallback: share without file (just text/url)
        await navigator.share({
          title: `${results.userName}'s Lookbook 2025`,
          text: shareText,
          url: `https://${WRAPPED_URL}`,
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
  const topColorGroup = topColor?.color || 'Color';
  const topShadeName = topColor?.top_shade || 'signature shade';
  const topColorHex = topColor?.top_shade_hex || '#888888';

  // Determine if the background color is light or dark for text contrast
  const getBrightness = (hex: string) => {
    if (!hex || hex.length < 7) return 0;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
  };

  const getContrastColor = (hex: string) => {
    return getBrightness(hex) > 160 ? '#000000' : '#FFFFFF';
  };
  const contrastColor = getContrastColor(topColorHex);

  // Sort styles by points descending and take top 3
  const sortedTopStyles = [...results.top_styles]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 3);

  // Helper for color dots - 4 on left (shades), 4 on right (colors)
  const leftDots = results.top_shades?.length > 0 
    ? Array.from({ length: 4 }, (_, i) => results.top_shades[i % results.top_shades.length].shade_hex)
    : Array(4).fill('#D1D1D1');

  const rightDots = results.top_colors?.length > 0
    ? Array.from({ length: 4 }, (_, i) => results.top_colors[i % results.top_colors.length].top_shade_hex)
    : Array(4).fill('#A1A1A1');

  return (
    <div className="flex flex-col h-[100dvh] px-4 pt-6 pb-4 bg-[#FFFAF4]">
      
      {/* Centered Group: Card + Buttons */}
      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden relative">
        
        {/* Shareable Card Container */}
        <div 
          ref={containerRef}
          className="w-full flex-1 flex items-center justify-center overflow-hidden"
        >
          {/* Scaling Wrapper - This applies the visual scale and entry animation */}
          <div
            style={{
              transform: `scale(${currentDisplayScale}) translateY(${isSettled ? -60 : 0}px)`,
              opacity: isActive ? 1 : 0,
              transformOrigin: 'center center',
              transition: isActive 
                ? 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease-out' 
                : 'none',
            }}
          >
            {/* Capture Target - This stays at 100% scale for perfect capture */}
            <div
              ref={cardRef}
              className="shrink-0 relative overflow-hidden"
              style={{
                width: '360px',
                height: '640px',
                borderRadius: '32px',
              }}
            >
              {preCapturedDataUrl && isImageSwapped ? (
                /* Render the high-quality captured image instead of complex DOM */
                <img 
                  src={preCapturedDataUrl} 
                  alt={`${results.userName}'s Lookbook Card`}
                  className="w-full h-full"
                  style={{ 
                    display: 'block',
                    borderRadius: '32px',
                    imageRendering: 'auto'
                  }}
                />
              ) : (
                /* The actual card with its border and background (used for capture) */
                <div 
                  className="absolute inset-0 bg-[#F7F7F7] border-[4px] border-black box-border rounded-[32px] overflow-hidden"
                >
                  {/* Card Inner Content */}
                  <div className="relative pt-4 pr-6 pb-6 pl-6 h-full flex flex-col justify-between">
                      
                    {/* Top Header Section: Lookbook branding + Aesthetics */}
                    <div className="flex justify-between items-start mb-0 relative z-20">
                      {/* Lookbook branding - Vertical but in a contained box */}
                      <div className="flex flex-col items-start pt-1 -ml-4">
                        <div 
                          className="relative"
                          style={{ 
                            height: '140px', 
                            width: '40px',
                          }}
                        >
                          <span
                            className="font-display text-3xl tracking-tight leading-none block absolute top-0 left-0 origin-top-left"
                            style={{
                              fontWeight: 400,
                              letterSpacing: '-0.05em',
                              transform: 'rotate(90deg) translateY(-100%)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span style={{ color: '#000000' }}>Look</span><span style={{ color: '#D1BB99' }}>book</span>
                          </span>
                        </div>
                      </div>

                      {/* Aesthetics Header */}
                      <div className="flex-1 flex flex-col items-end">
                        <p
                          className="text-[12px] uppercase tracking-wider mb-1 text-right"
                          style={{ color: '#A5A5A5', fontWeight: 800 }}
                        >
                          {results.userName.toUpperCase()}&apos;S TOP AESTHETICS
                        </p>

                        {/* Aesthetics with highlight bars */}
                        <div className="flex flex-col items-end gap-0.5">
                          {sortedTopStyles.map((style, i) => (
                            <div
                              key={i}
                              className="relative flex items-center justify-end"
                            >
                              {/* Background bar - top bar is longest */}
                              <div 
                                className="absolute right-0 h-[10px]" 
                                style={{ 
                                  backgroundColor: i === 0 ? 'rgba(209, 187, 153, 0.4)' : i === 1 ? 'rgba(209, 187, 153, 0.3)' : 'rgba(209, 187, 153, 0.2)',
                                  width: i === 0 ? '180px' : i === 1 ? '140px' : '110px',
                                  transform: 'translateY(8px)',
                                  zIndex: 0
                                }} 
                              />
                              <span
                                className="font-display text-2xl lowercase relative z-10"
                                style={{
                                  fontWeight: 400,
                                  color: '#000000',
                                  lineHeight: '1.05'
                                }}
                              >
                                {style.style_name.toLowerCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Main content area - No longer restricted by the sidebar margin */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Main photo with side info */}
                      <div className="flex gap-3 mb-2">
                        {/* Left side info panels */}
                        <div className="flex flex-col justify-center gap-4 py-1 shrink-0" style={{ width: '90px' }}>
                          {/* Top Decade */}
                          <div className="text-right">
                            <p 
                              className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                              style={{ color: '#9A9A9A' }}
                            >
                              NOSTALGIC FOR
                            </p>
                            <p 
                              className="text-[12px] font-medium leading-tight"
                              style={{ color: '#3D3D3D' }}
                            >
                              {results.top_decade}
                            </p>
                          </div>

                          {/* Top Item */}
                          <div className="text-right">
                            <p 
                              className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                              style={{ color: '#9A9A9A' }}
                            >
                              WARDROBE MVP
                            </p>
                            <p 
                              className="text-[12px] font-medium leading-tight"
                              style={{ color: '#3D3D3D' }}
                            >
                              {topItemName}
                            </p>
                          </div>

                          {/* Top Color */}
                          <div className="text-right">
                            <p
                              className="text-[9px] font-bold uppercase tracking-wider mb-0.5"
                              style={{ color: '#9A9A9A' }}
                            >
                              FAVORITE COLOR
                            </p>
                            <p 
                              className="text-[12px] font-medium leading-tight"
                              style={{ color: '#3D3D3D' }}
                            >
                              {topColorGroup}
                            </p>
                          </div>
                        </div>

                        {/* Main photo */}
                        <div 
                          className="flex-1 relative bg-[#E8E4DE] rounded-[20px] overflow-hidden"
                          style={{ 
                            aspectRatio: '3/4',
                            marginTop: '-30px',
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

                      {/* Color dots row - 4 shades, separator (pill), 4 colors */}
                      <div className="flex justify-center items-center gap-1 mt-1 mb-1">
                        {leftDots.map((hex, i) => (
                          <div
                            key={`left-${i}`}
                            className="w-3 h-2.5 rounded-full"
                            style={{
                              backgroundColor: hex,
                              border: getBrightness(hex) > 230 ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
                            }}
                          />
                        ))}
                        
                        {/* Top Color Pill as separator */}
                        <div 
                          className="px-2 h-3.5 rounded-full flex items-center justify-center border border-black/5 mx-0.5"
                          style={{ backgroundColor: topColorHex }}
                        >
                          <span 
                            className="text-[7px] font-bold uppercase tracking-wider"
                            style={{ color: contrastColor }}
                          >
                            {topShadeName}
                          </span>
                        </div>

                        {rightDots.map((hex, i) => (
                          <div
                            key={`right-${i}`}
                            className="w-3 h-2.5 rounded-full"
                            style={{
                              backgroundColor: hex,
                              border: getBrightness(hex) > 230 ? '0.5px solid rgba(0,0,0,0.1)' : 'none',
                            }}
                          />
                        ))}
                      </div>

                      {/* Color Aura name - script/display font */}
                      <div className="text-center mb-3">
                        <p
                          className="font-display text-2xl italic"
                          style={{
                            color: '#000000',
                            fontWeight: 400,
                            lineHeight: '0.9',
                          }}
                        >
                          {results.color_aura}
                        </p>
                      </div>

                      {/* Bottom section - Celebrity Twin & Style Destination */}
                      <div className="flex gap-4 px-6">
                        {/* Celebrity Twin */}
                        <div className="flex-1">
                          <p 
                            className="text-[9px] font-bold uppercase tracking-wider mb-1 text-center"
                            style={{ color: '#9A9A9A' }}
                          >
                            CELEBRITY TWIN
                          </p>
                          <div 
                            className="relative mb-1 bg-[#E0DCD6] rounded-[20px] overflow-hidden"
                            style={{ aspectRatio: '1/1' }}
                          >
                            {results.top_celeb_match.celeb_portrait_url ? (
                              <img
                                src={results.top_celeb_match.celeb_portrait_url}
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
                            className="text-[9px] font-bold uppercase tracking-wider mb-1 text-center"
                            style={{ color: '#9A9A9A' }}
                          >
                            STYLE DESTINATION
                          </p>
                          <div 
                            className="relative mb-1 bg-[#E0DCD6] rounded-[20px] overflow-hidden"
                            style={{ aspectRatio: '1/1' }}
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
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - Absolute positioned to reveal after shrink */}
        <div 
          className="absolute bottom-6 flex flex-col items-center gap-2 w-full max-w-[320px] px-4 z-30"
          style={{ 
            opacity: (isActive && isSettled) ? 1 : 0,
            transform: `translateY(${(isActive && isSettled) ? 0 : 20}px)`,
            transition: 'opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: isActive ? 'auto' : 'none'
          }}
        >
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] font-bold animate-pulse">
            Press and hold image to save
          </p>
          <button 
            onClick={handleShare}
            disabled={isProcessing}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {shareSupported ? 'Share Result' : 'Copy Link'}
              </>
            )}
          </button>
        </div>
      </div>
      
      <NavigationFooter onBack={onBack} leftLabel={`${results.userName}'s Lookbook`} />
    </div>
  );
};
