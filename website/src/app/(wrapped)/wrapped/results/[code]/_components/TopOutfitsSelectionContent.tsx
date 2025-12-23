import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WrappedResults } from '@/types/wrapped-frontend';
import { NavigationFooter } from './NavigationFooter';

// Centralized timing configuration for the intro sequence
const TIMINGS = {
  SETTLE_DELAY: 400,
  FIRST_LINE_DURATION: 1000,
  GAP_BETWEEN_LINES: 800,
  SECOND_LINE_DURATION: 2000,
  GAP_TO_THIRD_LINE: 800,
  THIRD_LINE_PAUSE: 1200, // Time before text starts "flying"
  FLY_TO_GRID_DURATION: 800, // Duration of the text movement
};

interface TopOutfitsSelectionContentProps {
  onNext?: () => void;
  onBack?: () => void;
  isActive?: boolean;
  results: WrappedResults;
  selectedOutfitIndex: number | null;
  setSelectedOutfitIndex: (index: number) => void;
}

export const TopOutfitsSelectionContent = ({ 
  onNext, 
  onBack, 
  isActive = true,
  results,
  selectedOutfitIndex,
  setSelectedOutfitIndex
}: TopOutfitsSelectionContentProps) => {
  const [isPicking, setIsPicking] = useState(false);
  const [isTextMoving, setIsTextMoving] = useState(false);
  const [phase, setPhase] = useState<'initial' | 'first' | 'transition' | 'second' | 'transition2' | 'third'>('initial');

  useEffect(() => {
    if (!isActive) {
      setPhase('initial');
      setIsPicking(false);
      setIsTextMoving(false);
      return;
    }
    if (isPicking) return;

    const timers: NodeJS.Timeout[] = [];

    const startSequence = () => {
      setPhase('first');
      
      let currentTime = TIMINGS.FIRST_LINE_DURATION;
      timers.push(setTimeout(() => setPhase('transition'), currentTime));

      currentTime += TIMINGS.GAP_BETWEEN_LINES;
      timers.push(setTimeout(() => setPhase('second'), currentTime));

      currentTime += TIMINGS.SECOND_LINE_DURATION;
      timers.push(setTimeout(() => setPhase('transition2'), currentTime));

      currentTime += TIMINGS.GAP_TO_THIRD_LINE;
      timers.push(setTimeout(() => setPhase('third'), currentTime));

      currentTime += TIMINGS.THIRD_LINE_PAUSE;
      timers.push(setTimeout(() => setIsTextMoving(true), currentTime));

      currentTime += TIMINGS.FLY_TO_GRID_DURATION;
      timers.push(setTimeout(() => setIsPicking(true), currentTime));
    };

    const settleTimer = setTimeout(startSequence, TIMINGS.SETTLE_DELAY);
    timers.push(settleTimer);

    return () => timers.forEach(clearTimeout);
  }, [isActive, isPicking]);

  const handleBack = () => {
    onBack?.();
  };

  const topFive = results.top_outfits.slice(0, 5);

  return (
    <div className={`flex flex-col h-[100dvh] transition-colors duration-1000 ease-in-out ${isPicking ? 'bg-black' : 'bg-[#FFFAF4]'} pt-12 pb-4 px-10`}>
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Phase 1 & 2: Introductory Sequential Lines */}
        <div className="absolute inset-0 flex flex-col justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {(phase === 'first' || phase === 'transition') && !isTextMoving && !isPicking && (
              <motion.h1
                key="first"
                className="font-display text-4xl leading-[1.2] text-left text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'first' ? 1 : 0, 
                  y: phase === 'first' ? 0 : -10 
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                Okay, this is it.
              </motion.h1>
            )}

            {(phase === 'second' || phase === 'transition2') && !isTextMoving && !isPicking && (
              <motion.p
                key="second"
                className="font-display text-4xl leading-[1.2] text-left text-gray-900"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: phase === 'second' ? 1 : 0, 
                  y: phase === 'second' ? 0 : -10 
                }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              >
                Out of your {results.total_outfits_analyzed} photos, here are our <span style={{ color: '#D1BB99' }}> 5 favorite outfits.</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Phase 3 & Picking: Persistent Text that transitions layout */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <AnimatePresence>
            {(phase === 'third' || isTextMoving || isPicking) && (
              <motion.div
                layout="position"
                layoutId="personal-fav-container"
                className={`absolute flex flex-col ${
                  (isTextMoving || isPicking) 
                    ? 'top-4 left-0 w-[calc(50%-6px)] justify-start' 
                    : 'top-[35%] left-0 w-full justify-center items-start'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  layout: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.5 }
                }}
              >
                <motion.h3
                  layout="position"
                  className={`font-display leading-[1.1] text-left transition-all duration-700 ${
                    (isTextMoving || isPicking) ? 'text-2xl' : 'text-4xl'
                  } ${
                    isPicking ? 'text-[#F7EFE5]' : 'text-gray-900'
                  }`}
                >
                  Pick out <br />your <br /> <span style={{ color: '#D1BB99' }}>personal <br /> favorite.</span>
                </motion.h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Picking Grid - Fades in after text starts moving */}
        <motion.div 
          className="flex-1 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-0"
          animate={{ opacity: isPicking ? 1 : 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 1.8, delay: 0.3 }}
        >
          <div className="grid grid-cols-2 gap-3 pt-4">
            {/* Spacer for the persistent text in the top-left slot */}
            <div className="aspect-[3/4] pointer-events-none" />

            {topFive.map((outfit, i) => (
              <motion.button
                key={outfit.photo_id}
                onClick={() => setSelectedOutfitIndex(i)}
                className={`aspect-[3/4] rounded-xl overflow-hidden relative border-2 transition-all ${
                  selectedOutfitIndex === i 
                    ? 'border-white shadow-lg scale-[1.02]' 
                    : 'border-transparent'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <img
                  src={outfit.path}
                  alt={`Outfit ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {selectedOutfitIndex === i && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/10 flex items-center justify-center"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </motion.div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                  #{i + 1}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Navigation Footer - Disabled until selection is made */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isPicking ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <NavigationFooter 
          onNext={onNext} 
          onBack={handleBack} 
          light={!isPicking} 
          nextText="see summary →"
          disabled={selectedOutfitIndex === null}
        />
      </motion.div>
    </div>
  );
};
