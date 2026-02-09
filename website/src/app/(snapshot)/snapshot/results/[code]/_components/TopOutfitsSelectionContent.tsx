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
  THIRD_LINE_PAUSE: 2000, // Time before text starts "flying"
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
  const [isFinishing, setIsFinishing] = useState(false);
  const [phase, setPhase] = useState<'initial' | 'first' | 'transition' | 'second' | 'transition2' | 'third'>('initial');

  useEffect(() => {
    if (!isActive) {
      setPhase('initial');
      setIsPicking(false);
      setIsTextMoving(false);
      setIsFinishing(false);
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

  const handleNext = () => {
    if (selectedOutfitIndex === null) return;
    setIsFinishing(true);
    // Longer delay to let the fade-out effect settle
    setTimeout(() => {
      onNext?.();
    }, 2500);
  };

  const topFive = results.top_outfits.slice(0, 5);

  const photoVariants = {
    hidden: { 
      opacity: 0, 
      y: 15,
      scale: 1,
      transition: { duration: 0.5 } 
    },
    enter: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        opacity: { delay: 0.4 + i * 0.1, duration: 0.5 },
        y: { delay: 0.4 + i * 0.1, duration: 0.5 },
      }
    }),
    active: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2 }
    },
    selected: {
      opacity: 1,
      y: 0,
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-1000 ease-in-out ${isPicking ? 'bg-black' : 'bg-[#FFFAF4]'} pt-12 pb-4 px-10`}>
      <AnimatePresence>
        {isFinishing && selectedOutfitIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex items-center justify-center p-12 pointer-events-none"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-12 left-0 right-0 text-center font-display text-4xl text-[#F7EFE5]"
            >
              Gotcha!
            </motion.h1>
            <motion.div
              layoutId={`outfit-card-${topFive[selectedOutfitIndex].photo_id}`}
              className="w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/20"
              transition={{
                layout: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
              }}
            >
              <motion.img
                layoutId={`outfit-image-${topFive[selectedOutfitIndex].photo_id}`}
                src={topFive[selectedOutfitIndex].path}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="flex-1 flex flex-col overflow-hidden relative min-h-0"
        animate={{ opacity: isFinishing ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        
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
                animate={{ opacity: isFinishing ? 0 : 1, y: 0 }}
                transition={{ 
                  layout: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.8 }
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

        {/* Picking Grid - Elements animate individually */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-0 z-10 min-h-0 relative">
          <div className="grid grid-cols-2 gap-3 pt-4">
            {/* Spacer for the persistent text in the top-left slot */}
            <div className="aspect-[3/4] pointer-events-none" />

            {topFive.map((outfit, i) => {
              const isSelected = selectedOutfitIndex === i;
              
              // Determine the current variant
              let variant = "hidden";
              if (isPicking) {
                if (isSelected) {
                  variant = isFinishing ? "hidden" : "selected";
                } else if (isFinishing) {
                  variant = "hidden";
                } else {
                  // Use "enter" for the first appearance, "active" for subsequent unselected states
                  variant = "enter"; 
                }
              }

              return (
                <motion.button
                  key={outfit.photo_id}
                  onClick={() => !isFinishing && setSelectedOutfitIndex(i)}
                  variants={photoVariants}
                  initial="hidden"
                  animate={variant}
                  custom={i}
                  className="aspect-[3/4] rounded-xl overflow-hidden relative"
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.img
                    layoutId={`outfit-image-${outfit.photo_id}`}
                    src={outfit.path}
                    alt={`Outfit ${i + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {isSelected && (
                    <motion.div 
                      layoutId={`outfit-card-${outfit.photo_id}`}
                      className="absolute inset-0 border-2 border-white rounded-xl shadow-lg z-20 pointer-events-none"
                    />
                  )}
                  {isSelected && !isFinishing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-white/10 flex items-center justify-center z-30"
                    >
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                  {!isFinishing && (
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white z-30">
                      #{i + 1}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
      
      {/* Navigation Footer - Disabled until selection is made */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: (isPicking && !isFinishing) ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <NavigationFooter 
          onNext={handleNext} 
          onBack={handleBack} 
          light={!isPicking} 
          nextText="see summary →"
          disabled={selectedOutfitIndex === null || isFinishing}
        />
      </motion.div>
    </div>
  );
};
