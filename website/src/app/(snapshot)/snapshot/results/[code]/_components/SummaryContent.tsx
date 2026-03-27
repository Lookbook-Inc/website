'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { domToPng } from 'modern-screenshot';
import { WrappedResults } from '@/types/wrapped-frontend';
import { NavigationFooter } from './NavigationFooter';
import { SummaryCard } from './SummaryCard';
import { ColorAuraCard } from './ColorAuraCard';
import { TopDecadeCard } from './TopDecadeCard';
import { ColorOfTheYearCard } from './ColorOfTheYearCard';
import { CelebrityTwinCard } from './CelebrityTwinCard';
import { StyleDestinationCard } from './StyleDestinationCard';
import { motion, AnimatePresence } from 'framer-motion';

const SNAPSHOT_URL = 'lookbook.inc/snapshot';

const CARDS = [
  { id: 'summary', Component: SummaryCard, shareText: (name: string, style: string, palette: string) => `My top style was ${style} and my palette was ${palette}. Try yours at ${SNAPSHOT_URL}` },
  { id: 'aura', Component: ColorAuraCard, shareText: (name: string, style: string, palette: string) => `Check out my Lookbook outfit palette! My color aura was ${palette}. Try yours at ${SNAPSHOT_URL}` },
  { id: 'decade', Component: TopDecadeCard, shareText: (name: string, style: string, palette: string) => `Nostalgic for the ${style}! Check out my Lookbook style snapshot at ${SNAPSHOT_URL}` },
  { id: 'mvp', Component: ColorOfTheYearCard, shareText: (name: string, style: string, palette: string) => `My color of the year was ${style}. Check out my Lookbook style snapshot at ${SNAPSHOT_URL}` },
  { id: 'celeb', Component: CelebrityTwinCard, shareText: (name: string, style: string, palette: string) => `My celebrity style twin is ${style}! Check out my Lookbook style snapshot at ${SNAPSHOT_URL}` },
  { id: 'destination', Component: StyleDestinationCard, shareText: (name: string, style: string, palette: string) => `My style destination is ${style}. Check out my Lookbook style snapshot at ${SNAPSHOT_URL}` },
] as const;

type SummaryPhase = 'REVEAL' | 'TRANSITION' | 'GALLERY';

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
  
  // Phase and Card state
  const [phase, setPhase] = useState<SummaryPhase>('REVEAL');
  const [revealIndex, setRevealIndex] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  
  // Display state
  const [scale, setScale] = useState(1);
  const [heroScale, setHeroScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shareSupported] = useState(() => 
    typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
  );

  // Update scale whenever the window resizes
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      
      const containerWidth = parent.offsetWidth;
      const containerHeight = parent.offsetHeight;
      const targetWidth = 360;
      const targetHeight = 640;
      
      const widthScale = (containerWidth - 32) / targetWidth;
      const finalHeightScale = (containerHeight - 100 - 32) / targetHeight;
      setScale(Math.min(1, widthScale, finalHeightScale));

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

  // Capture card as data URL
  const captureCard = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    
    try {
      // Use the exact dimensions of the card for capture, 
      // regardless of current CSS scaling/transforms
      return await domToPng(cardRef.current, {
        width: 360,
        height: 640,
        scale: 4,
        backgroundColor: 'transparent',
      });
    } catch (error) {
      console.error('Failed to capture card:', error);
      return null;
    }
  }, []);

  // Main Sequential Reveal Logic
  useEffect(() => {
    if (!isActive || phase !== 'REVEAL') return;

    let isMounted = true;

    const runRevealSequence = async () => {
      // 1. Fade in the current card
      setIsCardVisible(true);
      
      // 2. Wait for fade-in animation to settle (800ms duration + buffer)
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!isMounted) return;

      // 3. Capture the card while it's fully visible
      const dataUrl = await captureCard();
      if (!isMounted) return;
      
      if (dataUrl) {
        setCapturedImages(prev => [...prev, dataUrl]);
      }

      // 4. Fade out the card
      setIsCardVisible(false);
      
      // 5. Wait for fade-out animation (800ms duration + buffer)
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!isMounted) return;

      // 6. Move to next card or finish
      if (revealIndex < CARDS.length - 1) {
        setRevealIndex(prev => prev + 1);
      } else {
        // All cards captured! Move to transition
        setPhase('TRANSITION');
      }
    };

    runRevealSequence();

    return () => {
      isMounted = false;
    };
  }, [isActive, phase, revealIndex, captureCard]);

  // Handle the timed transition from TRANSITION to GALLERY
  useEffect(() => {
    if (phase === 'TRANSITION') {
      const timer = setTimeout(() => {
        setPhase('GALLERY');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Calculate top style and palette for sharing
  const topStyle = results.top_styles.sort((a, b) => (b.points || 0) - (a.points || 0))[0]?.style_name.toLowerCase() || 'unique style';
  const palette = results.color_aura.toLowerCase();

  // Handle download
  const handleDownload = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = capturedImages[currentCardIndex];
      if (!dataUrl) return;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isIOS) {
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(`
            <html>
              <head>
                <title>Your Lookbook Card</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #f5f5f5; padding: 20px; box-sizing: border-box; }
                  img { max-width: 100%; height: auto; border-radius: 16px; }
                  p { margin-top: 20px; font-family: system-ui, -apple-system, sans-serif; color: #666; text-align: center; }
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
        const link = document.createElement('a');
        link.download = `lookbook-${results.userName.toLowerCase()}-style-snapshot.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    setIsProcessing(true);
    try {
      const dataUrl = capturedImages[currentCardIndex];
      if (!dataUrl) return;

      const byteString = atob(dataUrl.split(',')[1]);
      const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      
      const file = new File([blob], `lookbook-${results.userName.toLowerCase()}-style-snapshot.png`, { 
        type: 'image/png' 
      });

      const shareText = CARDS[currentCardIndex].shareText(results.userName, topStyle, palette);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${results.userName}'s Lookbook Style Snapshot`,
          text: shareText,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: `${results.userName}'s Lookbook Style Snapshot`,
          text: shareText,
          url: `https://${SNAPSHOT_URL}`,
        });
      } else {
        handleDownload();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const ActiveCardComponent = CARDS[revealIndex].Component;

  return (
    <div 
      className="flex flex-col h-[100dvh] transition-colors duration-1000 ease-in-out relative overflow-hidden"
      style={{ backgroundColor: phase === 'GALLERY' ? '#FFFAF4' : '#000000' }}
    >
      {/* Reveal Phase: Cinematic sequential reveal */}
      {phase === 'REVEAL' && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <AnimatePresence mode="wait">
            {isCardVisible && (
              <motion.div
                key={revealIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: 'center center' }}
              >
                {/* Capture Target */}
                <div
                  ref={cardRef}
                  className="relative shrink-0 overflow-hidden"
                  style={{
                    width: '360px',
                    height: '640px',
                    borderRadius: '32px',
                  }}
                >
                  <ActiveCardComponent results={results} selectedOutfitIndex={selectedOutfitIndex} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Gallery Phase: Interactive carousel of static images */}
      <div className={`flex-1 flex flex-col px-4 pt-6 pb-4 transition-opacity duration-1000 ${phase === 'GALLERY' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden relative">
          <div 
            ref={containerRef}
            className="w-full flex-1 flex items-center justify-center overflow-hidden"
          >
            <div
              style={{
                transform: `scale(${scale}) translateY(-60px)`,
                transformOrigin: 'center center',
              }}
            >
              <div
                className="shrink-0 relative overflow-hidden"
                style={{
                  width: '360px',
                  height: '640px',
                  borderRadius: '32px',
                }}
              >
                {capturedImages[currentCardIndex] && (
                  <img 
                    src={capturedImages[currentCardIndex]} 
                    alt={`${results.userName}'s Lookbook Card`}
                    className="w-full h-full"
                    style={{ 
                      display: 'block',
                      borderRadius: '32px',
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="absolute bottom-6 flex flex-col items-center gap-2 w-full max-w-[320px] px-4 z-30">
            {/* Card Navigation Dots */}
            <div className="flex gap-2 mb-2">
              {CARDS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCardIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentCardIndex === i ? 'bg-gray-900 w-4' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

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
    </div>
  );
};
