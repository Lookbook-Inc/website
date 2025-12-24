'use client';

import { useState, useEffect, ReactNode, useRef } from 'react';
import { FlipPage } from './_components/FlipPage';
import { useFlip } from '@/hooks/useFlip';
import { domToPng } from 'modern-screenshot';
import { motion, AnimatePresence } from 'framer-motion';
import { getInsightsByShareCode } from '@/lib/api/wrapped';
import { transformWrappedInsights, isInsightsCompleted, isInsightsProcessing } from '@/lib/wrapped/transform';
import { 
  ClothingItem, 
  ColorGroup, 
  ColorResult, 
  CelebMatch, 
  UploadedPhoto, 
  TopOutfit, 
  Pairing, 
  StyleResult, 
  TopOutfitForStyle, 
  UnwornPairing, 
  WrappedResults,
  Step 
} from '@/types/wrapped-frontend';
import { NavigationFooter } from './_components/NavigationFooter';
import { SummaryContent } from './_components/SummaryContent';
import { TopOutfitsSelectionContent } from './_components/TopOutfitsSelectionContent';

// --- Types ---
// Moved to @/types/wrapped-frontend

// Mock data populated from the provided CSV values
const mockResults: WrappedResults = {
  userName: 'Anirudh',
  userCity: 'San Francisco',
  city_vibe: 'San Francisco',
  city_vibe_description: "You dress like you're late to something important and you'll still be the best-dressed person there.",
  city_photo_url: null,
  primary_style: 'Minimalist',
  top_styles: [
    { style_name: 'Minimalist', points: 9, appearances: 3 },
    { style_name: 'Streetwear', points: 5, appearances: 2 },
    { style_name: 'Business Casual', points: 2.5, appearances: 1 }
  ],
  top_outfits_for_style: [
    {
      photo_id: '58cae82f-990e-4f45-9bef-069590f93e54',
      path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/58cae82f-990e-4f45-9bef-069590f93e54_original.jpeg',
      similarity_score: 0.92
    },
    {
      photo_id: '8d0c2e1b-b96f-4f63-bdcd-61ee42b477a1',
      path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/8d0c2e1b-b96f-4f63-bdcd-61ee42b477a1_original.jpeg',
      similarity_score: 0.88
    },
    {
      photo_id: '0bdf691d-f8e7-4deb-b3e8-5d4c68ad01c7',
      path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/0bdf691d-f8e7-4deb-b3e8-5d4c68ad01c7_original.jpeg',
      similarity_score: 0.85
    }
  ],
  total_outfits_analyzed: 3,
  color_aura: 'Candlelit Dinner',
  color_aura_description: 'Deep blacks and cool, muted supporting tones. An intimate, evening-leaning mood that reads polished and understated.',
  style_description: 'Your style profile is being analyzed...',
  clothing_items_description: 'Cozy but make it fashion. This knit never missed.',
  total_clothing_items: 8,
  top_colors: [
    { color: 'Black', top_shade: 'Black', top_shade_hex: '#151515', piece_count: 5 },
    { color: 'Gray', top_shade: 'Grout', top_shade_hex: '#ced4d7', piece_count: 3 },
    { color: 'Blue', top_shade: 'Bluebird', top_shade_hex: '#758fbf', piece_count: 1 },
    { color: 'Green', top_shade: 'Satin Moss', top_shade_hex: '#2b4234', piece_count: 1 },
    { color: 'White', top_shade: 'Ice', top_shade_hex: '#FFFFFF', piece_count: 1 }
  ],
  top_shades: [
    { color: 'Black', photo_ids: ['4a7e547f-bca7-4c8e-9326-7fcf216161a8', 'cc3144a8-b42f-47b7-8b47-c58d5ad1c723', 'd6473945-b446-41e0-800d-b4792f869b8d'], shade_hex: '#151515', shade_name: 'Black', importance_score: 9 },
    { color: 'Black', photo_ids: ['246970f9-304c-40ec-9e15-654469e023b0', '640ea6fa-8c56-4eef-9767-0ddf37f45e18'], shade_hex: '#2a2a2c', shade_name: 'Caviar', importance_score: 5 }
  ],
  top_celeb_match: {
    celeb_name: 'Anirudh Satish',
    celeb_portrait_url: '',
    description: 'Brown man looking for his place in the world.',
    similarity_score: 32.78,
    categories: ['Engineer'],
    color_aura_name: 'candlelit dinner',
    style_1: 'minimalist',
    style_2: 'streetwear',
    style_3: 'business casual'
  },
  most_worn_item: {
    name: 'Light-colored athletic sneakers',
    path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/246970f9-304c-40ec-9e15-654469e023b0_original.webp',
    item_type: 'shoes',
    outfit_count: 3,
    shade_hex_1: '#CED4D7',
    shade_name_1: 'Grout',
    details: null
  },
  best_pairings: [
    { garment_name: 'Medium-wash blue jeans', garment_path: '...', times_paired: 2 },
    { garment_name: 'Black pullover sweater', garment_path: '...', times_paired: 1 },
    { garment_name: 'Dark green puffer jacket', garment_path: '...', times_paired: 1 }
  ],
  unworn_pairings: [
    { reasoning: '...', garment_name: 'Medium-wash blue jeans', garment_path: '...' },
    { reasoning: '...', garment_name: 'Light gray T-shirt', garment_path: '...' },
    { reasoning: '...', garment_name: 'Dark casual jacket', garment_path: '...' }
  ],
  top_outfits: [
    {
      photo_id: '58cae82f-990e-4f45-9bef-069590f93e54',
      path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/58cae82f-990e-4f45-9bef-069590f93e54_original.jpeg',
      similarity_score: 0.2209
    },
    {
      photo_id: '8d0c2e1b-b96f-4f63-bdcd-61ee42b477a1',
      path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/8d0c2e1b-b96f-4f63-bdcd-61ee42b477a1_original.jpeg',
      similarity_score: 0.2182
    },
    {
      photo_id: '0bdf691d-f8e7-4deb-b3e8-5d4c68ad01c7',
      path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/0bdf691d-f8e7-4deb-b3e8-5d4c68ad01c7_original.jpeg',
      similarity_score: 0.1974
    }
  ],
  all_uploaded_photos: [
    { signed_url: '2f5c6299-d234-44da-8b6b-8e928f28a68d/58cae82f-990e-4f45-9bef-069590f93e54_original.jpeg' },
    { signed_url: '2f5c6299-d234-44da-8b6b-8e928f28a68d/8d0c2e1b-b96f-4f63-bdcd-61ee42b477a1_original.jpeg' },
    { signed_url: '2f5c6299-d234-44da-8b6b-8e928f28a68d/0bdf691d-f8e7-4deb-b3e8-5d4c68ad01c7_original.jpeg' }
  ],
  top_decade: '2020s',
  decade_description: 'Clean lines meet bold individuality. You dress like someone who scrolls Pinterest ironically but saves everything.',
  decade_photo_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'
};

type Props = {
  params: Promise<{ code: string }>
}

// Test code to skip backend and use mock data
const TEST_CODE = 'TESTME';

// Wrapper for perspective context
const FlipContainer = ({ children }: { children: ReactNode }) => (
  <div
    className="absolute inset-0 overflow-hidden"
    style={{ perspective: '2500px' }}
  >
    {children}
  </div>
);

export default function ResultsPage({ params }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [results, setResults] = useState<WrappedResults>(mockResults); // Start with mock data to avoid null checks
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorsView, setColorsView] = useState<'colors' | 'shades'>('colors');

  const TOTAL_FLIP_PAGES = 10;

  // Helper function to preload images
  const preloadImages = (imagePaths: (string | null | undefined)[]): Promise<void> => {
    // Filter out null/undefined paths
    const validPaths = imagePaths.filter((path): path is string => !!path);

    const promises = validPaths.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolve even on error to not block
        img.src = src;
      });
    });

    return Promise.all(promises).then(() => undefined);
  };

  // Fetch insights on mount
  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true);

        // Get the share code from params
        const resolvedParams = await params;
        const code = resolvedParams.code;

        // Check for test code - skip backend and use mock data
        if (code.toUpperCase() === TEST_CODE) {
          console.log('Using test mode with mock data');
          setResults(mockResults);
          setLoading(false);
          return;
        }

        // Fetch insights from backend
        const backendData = await getInsightsByShareCode(code);

        // Check status
        if (!isInsightsCompleted(backendData)) {
          if (isInsightsProcessing(backendData)) {
            setError('Your insights are still being generated. Please check back in a few minutes!');
          } else {
            setError('Insights not found or failed to generate.');
          }
          setLoading(false);
          return;
        }

        // Transform backend data to frontend format
        const transformed = transformWrappedInsights(backendData);

        // Phase 1: Preload critical images (blocks until loaded)
        // These are needed for the initial flip sequence + first content screen
        const criticalImages: (string | null | undefined)[] = [
          // First 10 photos for flip sequence
          ...transformed.all_uploaded_photos.slice(0, 10).map(p => p.signed_url),
          // Most worn item (shown right after flip)
          transformed.most_worn_item.path,
        ];

        await preloadImages(criticalImages);

        // Set results and hide loading - user can start viewing!
        setResults(transformed as WrappedResults);
        setLoading(false);

        // Phase 2: Preload remaining images in background (non-blocking)
        const remainingImages: (string | null | undefined)[] = [
          // Remaining uploaded photos (if more than 10)
          ...transformed.all_uploaded_photos.slice(10).map(p => p.signed_url),
          // Best pairings
          ...transformed.best_pairings.map(p => p.garment_path),
          // Unworn pairings
          ...transformed.unworn_pairings.map(p => p.garment_path),
          // Top outfits for primary style
          ...transformed.top_outfits_for_style.map(o => o.path),
          // Celebrity photo
          transformed.top_celeb_match.celeb_photo_url,
          // City photo
          transformed.city_photo_url,
          // Decade photo
          transformed.decade_photo_url,
        ];

        // Fire and forget - loads while user views initial screens
        preloadImages(remainingImages);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
        setError(err instanceof Error ? err.message : 'Failed to load insights');
        setLoading(false);
      }
    }

    fetchInsights();
  }, [params]);

  // Individual flip states for single-page transitions
  const welcomeFlip = useFlip(() => setStep('intro'));
  const introFlip = useFlip(() => setStep('photo-flip'));
  const favItemFlip = useFlip(() => setStep('fav-pairings'));
  const favPairingsFlip = useFlip(() => setStep('unworn-pairings'));
  const unwornPairingsFlip = useFlip(() => setStep('top-styles'));
  const topStylesFlip = useFlip(() => { setColorsView('colors'); setStep('colors'); });
  // colorsFlip is no longer used - transition to shades is internal push animation
  const colorsFlip = useFlip(() => {}); // Keep for back navigation compatibility
  const shadesFlip = useFlip(() => setStep('color-aura'));
  const colorAuraFlip = useFlip(() => setStep('decade'));
  const decadeFlip = useFlip(() => setStep('celebrity'));
  const celebrityFlip = useFlip(() => setStep('city-intro'));
  const cityIntroFlip = useFlip(() => setStep('city-reveal'));
  const cityRevealFlip = useFlip(() => setStep('top-outfits-selection'));
  const topOutfitsSelectionFlip = useFlip(() => setStep('summary'));
  
  // Track the previous step to handle reverse animations
  const [prevStep, setPrevStep] = useState<Step | null>(null);

  // Go back handlers
  const onBack = {
    'fav-pairings': () => { setPrevStep(step); setStep('fav-item'); },
    'unworn-pairings': () => { setPrevStep(step); setStep('fav-pairings'); },
    'top-styles': () => { setPrevStep(step); setStep('unworn-pairings'); },
    'colors': () => { setPrevStep(step); setStep('top-styles'); },
    // 'shades' is now internal to 'colors' - back is handled in ColorsShadesContent
    'color-aura': () => { setPrevStep(step); setColorsView('shades'); setStep('colors'); },
    'decade': () => { setPrevStep(step); setStep('color-aura'); },
    'celebrity': () => { setPrevStep(step); setStep('decade'); },
    'city-intro': () => { setPrevStep(step); setStep('celebrity'); },
    'city-reveal': () => { setPrevStep(step); setStep('city-intro'); },
    'top-outfits-selection': () => { setPrevStep(step); setStep('city-reveal'); },
    'summary': () => { setPrevStep(step); setStep('top-outfits-selection'); },
  };

  // Handle the reverse animation when moving to a previous step
  useEffect(() => {
    if (!prevStep) return;

    // Mapping of step to the flip hook that needs to be reset (when going BACK to this step)
    const flipHooks: Record<string, any> = {
      'fav-item': favItemFlip,
      'fav-pairings': favPairingsFlip,
      'unworn-pairings': unwornPairingsFlip,
      'top-styles': topStylesFlip,
      'colors': shadesFlip, // shadesFlip.flip() takes us to color-aura, so unflip it when going back
      'color-aura': colorAuraFlip,
      'decade': decadeFlip,
      'celebrity': celebrityFlip,
      'city-intro': cityIntroFlip,
      'city-reveal': cityRevealFlip,
      'top-outfits-selection': topOutfitsSelectionFlip,
    };

    const hookToReset = flipHooks[step];
    if (hookToReset && hookToReset.isFlipped) {
      // Small delay to ensure the component has rendered in the flipped state
      const timer = setTimeout(() => {
        hookToReset.unflip();
        setPrevStep(null);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setPrevStep(null);
    }
  }, [step, prevStep, favItemFlip, favPairingsFlip, unwornPairingsFlip, topStylesFlip, colorsFlip, shadesFlip, colorAuraFlip, decadeFlip, celebrityFlip, cityIntroFlip, cityRevealFlip, topOutfitsSelectionFlip]);
  
  // Track which pages have been flipped for the photo sequence
  const [flippedPages, setFlippedPages] = useState<boolean[]>(
    new Array(TOTAL_FLIP_PAGES + 1).fill(false)
  );

  // Handle the photo flipping sequence
  useEffect(() => {
    if (step === 'photo-flip') {
      // // Flip intro page first (index 0)
      // setFlippedPages(prev => {
      //   const next = [...prev];
      //   next[0] = true;
      //   return next;
      // });

      // Then flip each photo page with delays
      for (let i = 1; i <= TOTAL_FLIP_PAGES; i++) {
        setTimeout(() => {
          setFlippedPages(prev => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
          
          // After last page flips, transition to fav-item
          if (i === TOTAL_FLIP_PAGES) {
            setTimeout(() => {
              setStep('fav-item');
            }, 600);
          }
        }, i * 300); // Slower flip for better visibility
      }
    }
  }, [step, TOTAL_FLIP_PAGES]);

  // --- Page Contents ---

  const FavSidebar = ({ light = true }: { light?: boolean }) => (
    <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      <div 
        className={`whitespace-nowrap transform -rotate-270 translate-y-[-15vh] font-display text-8xl leading-none tracking-tighter flex gap-8 items-center ${
          light ? 'text-black/5' : 'text-[#F7EFE5]/20'
        }`}
      >
        <span>Your Pieces</span>
        <span>Your Pieces</span>
        <span>Your Pieces</span>
        <span>Your Pieces</span>
        <span className={light ? 'text-black' : 'text-[#F7EFE5]'}>Your Pieces</span>
        <span>Your Pieces</span>
        <span>Your Pieces</span>
        <span>Your Pieces</span>
        <span>Your Pieces</span>
      </div>
    </div>
  );

  const FavItemContent = ({ onNext }: { onNext?: () => void }) => {
    const displayName = results.most_worn_item.name.split('(')[0].trim();

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-[#FFFAF4]">
        <FavSidebar />
        <div className="flex-1 flex flex-col justify-center pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h3 className="font-display text-2xl text-gray-900 mb-4 text-right">One piece anchored your outfits this year...</h3>
          <p className="text-md text-gray-500 leading-snug mb-8 text-right">
              This piece was a constant in your rotation - and for good reason.
            </p>
          <div className="flex flex-col rounded-2xl overflow-hidden bg-[#F1EDE7] shadow-sm shrink-0 mb-4">
            <div className="w-full aspect-[3/4] relative overflow-hidden">
              <img
                src={results.most_worn_item.path}
                alt={results.most_worn_item.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="p-6 pt-4 text-center">
              <p className="font-sans text-xs font-bold uppercase text-gray-900/50 tracking-[0.1em]">{displayName}</p>
              {/* <p className="font-display text-sm text-gray-900/50 lowercase">{displayName}</p> */}
            </div>
          </div>

        </div>
        
        <NavigationFooter onNext={onNext} />
      </div>
    );
  };

  const FavPairingsContent = ({ 
    onNext, 
    onBack,
    isActive = true 
  }: { 
    onNext?: () => void; 
    onBack?: () => void;
    isActive?: boolean;
  }) => {
    // Container variants for staggered children
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.5,
          delayChildren: 0,
        },
      },
    };

    // Individual item variants - slide up from below
    const itemVariants = {
      hidden: {
        y: 60,
        opacity: 0,
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
    };

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-[#FFFAF4]">
        <FavSidebar />
        <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h3 className="font-display text-2xl text-gray-900 mb-8">You've paired it with:</h3>
          
          <motion.div 
            className="flex-1 flex flex-col pb-10"
            variants={containerVariants}
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
          >
            {results.best_pairings.map((pairing, i) => {
              const zIndex = i;
              
              // Overlap and jitter variations
              const overlaps = [0, -45, -65, -40, -35];
              // Jitter as vw percentages, capped at proportion of max-w-md (448px)
              const jitterConfigs = [
                { pct: -5, max: -22 },
                { pct: 3, max: 100 }, 
                { pct: 0, max: 0 },
                { pct: 0, max: 0 },
                { pct: -4, max: -18 },
              ];
              
              const marginTop = i > 0 ? overlaps[i % overlaps.length] : 0;
              const jitter = jitterConfigs[i % jitterConfigs.length];
              const translateX = jitter.pct >= 0 
                ? `min(${jitter.pct}vw, ${jitter.max}px)` 
                : `max(${jitter.pct}vw, ${jitter.max}px)`;

              return (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className={`w-[40vw] max-w-[200px] aspect-square rounded-xl overflow-hidden bg-[#F1EDE7] shadow-md relative shrink-0 border-1 border-[#FFFAF4] ${
                    i % 2 === 0 ? 'self-end mr-4' : 'self-start'
                  }`}
                  style={{ 
                    zIndex, 
                    marginTop: `${marginTop}px`,
                    transform: `translateX(${translateX})`,
                    WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.9) 100%)',
                    maskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.9) 100%)'
                  }}
                >
                  <img
                    src={pairing.garment_path}
                    alt={pairing.garment_name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* 3D effect overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%)'
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        <NavigationFooter onNext={onNext} onBack={onBack} />
      </div>
    );
  };

  const UnwornPairingsContent = ({ 
    onNext, 
    onBack,
    isActive = true 
  }: { 
    onNext?: () => void; 
    onBack?: () => void;
    isActive?: boolean;
  }) => {
    // Container variants for staggered children
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.5,
          delayChildren: 0,
        },
      },
    };

    // Individual item variants - slide up from below
    const itemVariants = {
      hidden: {
        y: 60,
        opacity: 0,
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
    };

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-black text-white">
        <FavSidebar light={false} />
        <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h3 className="font-display text-2xl text-[#F7EFE5] mb-8 text-right">You haven't worn it with these yet...</h3>
          
          <motion.div 
            className="flex-1 flex flex-col pb-10"
            variants={containerVariants}
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
          >
            {results.unworn_pairings.map((pairing, i) => {
              const zIndex = i;
              
              // Overlap and jitter variations
              const overlaps = [0, -45, -65, -40, -35];
              // Jitter as vw percentages, capped at proportion of max-w-md (448px)
              const jitterConfigs = [
                { pct: -5, max: -22 },
                { pct: 3, max: 100 }, 
                { pct: 0, max: 0 },
                { pct: 0, max: 0 },
                { pct: -4, max: -18 },
              ];
              
              const marginTop = i > 0 ? overlaps[i % overlaps.length] : 0;
              const jitter = jitterConfigs[i % jitterConfigs.length];
              const translateX = jitter.pct >= 0 
                ? `min(${jitter.pct}vw, ${jitter.max}px)` 
                : `max(${jitter.pct}vw, ${jitter.max}px)`;

              return (
                <motion.div 
                  key={i} 
                  variants={itemVariants}
                  className={`w-[40vw] max-w-[200px] aspect-square rounded-xl overflow-hidden bg-zinc-400 shadow-md relative shrink-0 border-1 border-zinc-200 ${
                    i % 2 === 0 ? 'self-end mr-4' : 'self-start'
                  }`}
                  style={{ 
                    zIndex, 
                    marginTop: `${marginTop}px`,
                    transform: `translateX(${translateX})`,
                    WebkitMaskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.9) 100%)',
                    maskImage: 'radial-gradient(circle, black 0%, rgba(0,0,0,0.9) 100%)'
                  }}
                >
                  <img
                    src={pairing.garment_path}
                    alt={pairing.garment_name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* 3D effect overlay - adjusted for light card on dark background */}
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%)'
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
        
        <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
      </div>
    );
  };

  const StyleSidebar = ({ light = true }: { light?: boolean }) => (
    <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      <div 
        className={`whitespace-nowrap transform -rotate-270 font-display text-8xl leading-none tracking-tighter flex gap-8 items-center ${
          light ? 'text-black/5' : 'text-[#F7EFE5]/20'
        }`}
      >
        <span>Your Style</span>
        <span>Your Style</span>
        <span>Your Style</span>
        <span>Your Style</span>
        <span className={light ? 'text-black' : 'text-[#F7EFE5]'}>Your Style</span>
        <span>Your Style</span>
        <span>Your Style</span>
        <span>Your Style</span>
        <span>Your Style</span>
      </div>
    </div>
  );

  const TopStylesContent = ({
    onNext,
    onBack,
    isActive = true
  }: {
    onNext?: () => void;
    onBack?: () => void;
    isActive?: boolean;
  }) => {
    // Phase state management: shuffle -> reveal -> gallery
    const [phase, setPhase] = useState<'shuffle' | 'reveal' | 'gallery'>('shuffle');

    // Auto-transition from reveal -> gallery after delay
    useEffect(() => {
      if (phase === 'reveal' && isActive) {
        const timer = setTimeout(() => {
          setPhase('gallery');
        }, 3000); // 2 second pause on reveal before showing photos
        return () => clearTimeout(timer);
      }
    }, [phase, isActive]);

    // Container variants for staggered children - slide from right
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 1.0,
          delayChildren: 0.2,
        },
      },
    };

    // Style item variants - slide in from right
    const styleItemVariants = {
      hidden: {
        x: 60,
        opacity: 0,
      },
      visible: {
        x: 0,
        opacity: 1,
        transition: {
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
    };

    // Text variants - fade and slide up from bottom with extra delay
    const textVariants = {
      hidden: {
        y: 20,
        opacity: 0,
      },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          // delay: 3.5,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
    };

    // Handle navigation
    const handleNext = () => {
      if (phase === 'shuffle') {
        setPhase('reveal');
      } else if (phase === 'reveal') {
        setPhase('gallery'); // Skip ahead if user clicks during reveal
      } else {
        onNext?.();
      }
    };

    const handleBack = () => {
      if (phase === 'gallery' || phase === 'reveal') {
        setPhase('shuffle');
      } else {
        onBack?.();
      }
    };

    // Animation should play when component isActive AND in shuffle phase
    const shouldAnimate = isActive && phase === 'shuffle';

    // Check if we're in the gallery phase (photos visible)
    const isGallery = phase === 'gallery';

    // Shuffle phase inner content
    const ShuffleInner = () => (
      <motion.div
        className="flex-1 flex flex-col"
        initial="hidden"
        animate={shouldAnimate ? "visible" : "hidden"}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
      >
        <h3 className="font-display text-lg text-gray-900 mb-8">Your top 3 aesthetics</h3>

        {/* Vertical spacer */}
        <div className="flex-1" />

        <motion.div
          className="space-y-10"
          variants={containerVariants}
        >
          {results.top_styles.slice(0, 3).map((style, i) => {
            const isPrimary = style.style_name === results.primary_style;
            return (
              <motion.div
                key={style.style_name}
                className="flex flex-col gap-2 shrink-0"
                variants={styleItemVariants}
              >
                <div className="flex items-baseline justify-end border-b border-gray-200 pb-1">
                  <motion.span
                    layoutId={isPrimary ? "primary-style-text" : undefined}
                    className="text-3xl font-display uppercase tracking-tight text-gray-900"
                  >
                    {style.style_name}
                  </motion.span>
                </div>
              </motion.div>
            );
          })}

          <motion.p
            className="text-sm text-gray-600 text-center italic"
            variants={textVariants}
          >
            But if we had to choose one...
          </motion.p>
        </motion.div>

        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
        <div className="flex-1" />
      </motion.div>
    );

    // Reveal/Gallery phase inner content - uses layout animations
    const RevealGalleryInner = () => (
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        layout
        transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
      >
        {/* Header section - centered in reveal, top-aligned in gallery */}
        <motion.div
          layout
          className={`flex flex-col ${isGallery ? 'items-start' : 'items-center justify-center flex-1'}`}
          transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
        >
          <AnimatePresence>
            {isGallery && (
              <motion.p
                key="label-above"
                className="font-display text-medium text-gray-500 mb-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                Your signature:
              </motion.p>
            )}
          </AnimatePresence>

          {/* Primary style name - animates from center to top */}
          <motion.div
            layout
            layoutId="primary-style-text"
            className="font-display uppercase tracking-tight text-gray-900"
            style={{
            fontSize: isGallery ? 'clamp(1.5rem, 8vw, 2.25rem)' : 'clamp(2rem, 12vw, 3.75rem)',
            marginBottom: isGallery ? '1.5rem' : '0',
          }}
          transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
        >
          {results.primary_style}
        </motion.div>

          <AnimatePresence>
          {!isGallery && (
            <motion.p
              key="label-below"
              className="font-display text-lg text-gray-500 mt-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.35,
                delay: 1.0,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              Looking good!
            </motion.p>
          )}
          </AnimatePresence>
        </motion.div>

        {/* Outfit photos - only visible in gallery phase */}
        <AnimatePresence>
          {isGallery && (
            <motion.div
              className="flex-1 flex flex-col pb-4"
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.15,
                    delayChildren: 0.2,
                  },
                },
              }}
            >
              {results.top_outfits_for_style.slice(0, 3).map((outfit, i) => {
                const zIndex = i;

                // Overlap and jitter variations (similar to FavPairingsContent)
                const overlaps = [0, -45, -65];
                const jitterConfigs = [
                  { pct: -5, max: -22 },
                  { pct: 8, max: 36 },
                  { pct: -3, max: -14 },
                ];

                const marginTop = i > 0 ? overlaps[i] : 0;
                const jitter = jitterConfigs[i];
                const translateX = jitter.pct >= 0
                  ? `min(${jitter.pct}vw, ${jitter.max}px)`
                  : `max(${jitter.pct}vw, ${jitter.max}px)`;

                return (
                  <motion.div
                    key={outfit.photo_id}
                    variants={{
                      hidden: { y: 60, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: 0.5,
                          ease: [0.4, 0, 0.2, 1],
                        },
                      },
                    }}
                    className={`w-[45vw] max-w-[220px] aspect-[3/4] rounded-xl overflow-hidden bg-[#F1EDE7] shadow-lg relative shrink-0 ${
                      i % 2 === 0 ? 'self-end mr-4' : 'self-start'
                    }`}
                    style={{
                      zIndex,
                      marginTop: `${marginTop}px`,
                      transform: `translateX(${translateX})`,
                    }}
                  >
                    <img
                      src={outfit.path}
                      alt={`Outfit ${i + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* 3D effect overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%)'
                      }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-[#FFFAF4]">
        <StyleSidebar />
        <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-hidden">
          {/* Phase-based content rendering with AnimatePresence */}
          <AnimatePresence mode="wait">
            {phase === 'shuffle' ? (
              <ShuffleInner key="shuffle" />
            ) : (
              <RevealGalleryInner key="reveal-gallery" />
            )}
          </AnimatePresence>
        </div>

        <NavigationFooter onNext={handleNext} onBack={handleBack} />
      </div>
    );
  };

  const WelcomeContent = ({ onNext, isActive = true }: { onNext?: () => void; isActive?: boolean }) => {
    const lineVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.3 + i * 0.2,
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1] as any,
        },
      }),
    };

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4">
        <div className="flex-1 flex flex-col justify-center overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h1 className="font-display text-5xl text-gray-900 leading-[1.1] mb-8">
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              custom={0}
            >
              {results.userName}—
            </motion.span>
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              custom={1}
            >
              Welcome to your Lookbook.
            </motion.span>
          </h1>
        </div>

        <NavigationFooter onNext={onNext} nextText="enter →" />
      </div>
    );
  };

  const IntroContent = ({ onNext, isActive = true }: { onNext?: () => void; isActive?: boolean }) => {
    const lineVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: 0.3 + i * 0.2,
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1] as any,
        },
      }),
    };

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4">
        <div className="flex-1 flex flex-col justify-center overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h1 className="font-display text-5xl text-gray-900 leading-[1.1] mb-8">
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              custom={0}
            >
              We analyzed <span style={{ color: '#8F9779' }}>{results.total_outfits_analyzed}</span> of your
            </motion.span>
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              custom={1}
            >
              outfits to uncover your
            </motion.span>
            <motion.span
              className="block"
              variants={lineVariants}
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              custom={2}
            >
              styles this year.
            </motion.span>
          </h1>
        </div>

        <NavigationFooter onNext={onNext} nextText="enter →" />
      </div>
    );
  };

  const PhotoPageContent = ({ photo, pageNum }: { photo?: UploadedPhoto; pageNum: number }) => (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-xl relative">
        {photo ? (
          <img
            src={photo.signed_url}
            alt={`Uploaded photo ${pageNum}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FFFAF4] border-2 border-dashed border-gray-200">
            <span className="font-display text-8xl text-gray-200 select-none">
              {pageNum}
            </span>
          </div>
        )}
      </div>
      <p className="mt-4 font-display text-gray-400">
        {photo ? 'Your Outfit' : `Style Moment ${pageNum}`}
      </p>
    </div>
  );

  const ColorAuraContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => {
    // Select 2 outfit pieces and 2 clothing items
    const outfit1 = results.top_outfits[0];
    const outfit2 = results.top_outfits[1];
    const clothing1 = results.best_pairings[0];
    const clothing2 = results.best_pairings[1];

    return (
      <div className="flex flex-col h-[100dvh] pt-12 pb-4 relative bg-[#FFFAF4] overflow-hidden">
        <div className="flex-1 relative">
          {/* Top Left - Outfit 1 */}
          <div className="absolute top-0 left-0 w-[28%] aspect-[3/4] z-5">
            <div className="absolute inset-0 bg-gray-200/30 rounded-lg transform translate-x-2 translate-y-2"></div>
            <div className="relative w-full h-full bg-[#D1D5DB] rounded-lg shadow-xl border border-white/20 overflow-hidden">
              {outfit1 && (
                <img
                  src={outfit1.path}
                  alt="Your outfit"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Top Right - Clothing 1 with color accents */}
          <div className="absolute top-0 right-0 w-[30%] aspect-square z-5">
            <div className="absolute right-[-15%] top-[15%] w-[40%] h-[70%] rounded-lg opacity-60"
                 style={{ backgroundColor: results.top_colors[0]?.top_shade_hex || '#F3CD81' }}></div>
            <div className="absolute left-[-15%] bottom-[-10%] w-[35%] h-[50%] rounded-lg opacity-70"
                 style={{ backgroundColor: results.top_colors[1]?.top_shade_hex || '#4B5563' }}></div>
            <div className="relative w-full h-full bg-white/80 rounded-lg shadow-2xl border border-white/30 overflow-hidden">
              {clothing1 && (
                <img
                  src={clothing1.garment_path}
                  alt={clothing1.garment_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Central Text */}
          <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 z-10 text-center px-10">
            <h2 className="font-display text-lg text-gray-900 mb-2 leading-none">your palette is</h2>
            <h1 className="font-display text-6xl italic text-gray-900 mb-6 leading-none lowercase">{results.color_aura}</h1>
            <p className="font-light text-md text-gray-900 leading-tight px-4">
              {results.color_aura_description}
            </p>
          </div>

          {/* Bottom Left - Clothing 2 with color accent */}
          <div className="absolute bottom-0 left-0 w-[35%] aspect-square z-5">
            <div className="absolute right-[-10%] bottom-[-10%] w-[45%] h-[45%] rounded-lg opacity-75"
                 style={{ backgroundColor: results.top_colors[2]?.top_shade_hex || '#6B7280' }}></div>
            <div className="relative w-full h-full bg-white/80 rounded-lg shadow-xl border border-white/30 overflow-hidden">
              {clothing2 && (
                <img
                  src={clothing2.garment_path}
                  alt={clothing2.garment_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          
          {/* Bottom Right - Outfit 2 */}
          <div className="absolute bottom-0 right-0 w-[45%] aspect-[3/4] z-5">
            <div className="absolute left-[-8%] top-[-5%] w-[30%] h-[25%] rounded-lg opacity-50"
                 style={{ backgroundColor: results.top_colors[3]?.top_shade_hex || '#D1D5DB' }}></div>
            <div className="relative w-full h-full bg-[#E5E7EB] rounded-lg shadow-2xl border border-white/20 overflow-hidden">
              {outfit2 && (
                <img
                  src={outfit2.path}
                  alt="Your outfit"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="px-10 shrink-0">
          <NavigationFooter onNext={onNext} onBack={onBack} />
        </div>
      </div>
    );
  };
  const ColorSidebar = ({ light = true }: { light?: boolean }) => (
    <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      <div 
        className={`whitespace-nowrap transform -rotate-270 translate-y-[15vh] font-display text-8xl leading-none tracking-tighter flex gap-8 items-center ${
          light ? 'text-black/5' : 'text-[#F7EFE5]/20'
        }`}
      >
        <span>Your Color</span>
        <span>Your Color</span>
        <span>Your Color</span>
        <span>Your Color</span>
        <span className={light ? 'text-black' : 'text-[#F7EFE5]'}>Your Color</span>
        <span>Your Color</span>
        <span>Your Color</span>
        <span>Your Color</span>
        <span>Your Color</span>
        </div>
    </div>
  );

  // Combined Colors & Shades component with staggered push transition
  const ColorsShadesContent = ({ 
    view, 
    onNext, 
    onBack,
    onViewChange,
    isActive = true,
  }: { 
    view: 'colors' | 'shades';
    onNext?: () => void; 
    onBack?: () => void;
    onViewChange: (view: 'colors' | 'shades') => void;
    isActive?: boolean;
  }) => {
    const isLightColor = (hex: string) => {
      const color = hex.replace('#', '');
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return brightness > 155;
    };

    // Track direction for animation
    const [direction, setDirection] = useState<'up' | 'down'>('up');

    const handleNext = () => {
      if (view === 'colors') {
        setDirection('up');
        onViewChange('shades');
      } else {
        onNext?.();
      }
    };

    const handleBack = () => {
      if (view === 'shades') {
        setDirection('down');
        onViewChange('colors');
      } else {
        onBack?.();
      }
    };

    // Container variants for staggered children
    const containerVariants = {
      hidden: {},
      visible: {
        transition: {
          staggerChildren: 0.08,
          delayChildren: 0.1,
        },
      },
      exit: {
        transition: {
          staggerChildren: 0.05,
          staggerDirection: -1, // Reverse order on exit
        },
      },
    };

    // Individual item variants
    const itemVariants = {
      hidden: (dir: 'up' | 'down') => ({
        y: dir === 'up' ? 60 : -60,
        opacity: 0,
      }),
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
      exit: (dir: 'up' | 'down') => ({
        y: dir === 'up' ? -60 : 60,
        opacity: 0,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      }),
    };

    // Text variants (animates after swatches)
    const textVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1] as const,
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: 0.25,
        },
      },
    };

    // Colors inner content
    const ColorsInner = () => (
      <motion.div
        className="flex-1 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        exit="exit"
        custom={direction}
      >
        <div className="flex flex-col gap-3 mb-6 items-end">
          {results.top_colors.slice(0, 5).map((c, i) => {
            const light = isLightColor(c.top_shade_hex);
            return (
              <motion.div
                key={i}
                custom={direction}
                variants={itemVariants}
                className={`h-[12vh] w-[50vw] max-w-[224px] rounded-l-3xl min-h-[60px] translate-x-4 shadow-sm flex items-center justify-start pl-5 ${
                  light ? 'text-black' : 'text-white'
                }`}
                style={{ backgroundColor: c.top_shade_hex }}
              >
                <div className="flex flex-col items-center transform -rotate-270 origin-center whitespace-nowrap">
                  <span className="font-mono text-sm uppercase tracking-widest opacity-80 mb-1 leading-none font-bold">
                    {c.color}
                  </span>
                  <span className="font-mono text-xs opacity-60 uppercase leading-none">
                    {c.top_shade_hex}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <motion.div variants={textVariants} className="pl-24 pr-10 text-right">
          <h3 className="font-display text-xl text-gray-900 leading-tight">
            The colors you wore the most of in 2025...
          </h3>
        </motion.div>
      </motion.div>
    );

    // Shades inner content
    const ShadesInner = () => (
      <motion.div
        className="flex-1 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        exit="exit"
        custom={direction}
      >
        <motion.div variants={textVariants} className="pl-24 pr-10 text-right mb-6">
          <h3 className="font-display text-xl text-gray-900 leading-tight">
            ... but one color in particular spoke to you:
          </h3>
          <p className="font-display text-5xl italic text-gray-900 mt-4 uppercase tracking-tighter">
            {results.top_shades[0]?.color}.
          </p>
        </motion.div>

        <div className="flex flex-col gap-3 items-end">
          {results.top_shades.slice(0, 5).map((c, i) => {
            const light = isLightColor(c.shade_hex);
            return (
              <motion.div
                key={i}
                custom={direction}
                variants={itemVariants}
                className={`h-[12vh] w-[50vw] max-w-[224px] rounded-l-3xl min-h-[60px] translate-x-4 shadow-sm flex items-center justify-start pl-5 ${
                  light ? 'text-black' : 'text-white'
                }`}
                style={{ backgroundColor: c.shade_hex }}
              >
                <div className="flex flex-col items-center transform -rotate-270 origin-center whitespace-nowrap">
                  <span className="font-mono text-sm uppercase tracking-widest opacity-80 mb-1 leading-none font-bold">
                    {c.shade_name}
                  </span>
                  <span className="font-mono text-xs opacity-60 uppercase leading-none">
                    {c.shade_hex}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );

    return (
      <div className="flex flex-col h-[100dvh] pt-12 pb-4 relative bg-[#FFFAF4]">
        <ColorSidebar />
        
        {/* Animated content area */}
        <div className="flex-1 flex flex-col pt-4 relative z-10 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {view === 'colors' ? (
              <ColorsInner key="colors" />
            ) : (
              <ShadesInner key="shades" />
            )}
          </AnimatePresence>
        </div>
        
        {/* Fixed footer */}
        <div className="px-10 shrink-0">
          <NavigationFooter onNext={handleNext} onBack={handleBack} />
        </div>
      </div>
    );
  };

  // Legacy wrappers for compatibility with existing flip system (inactive by default)
  const ColorsContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <ColorsShadesContent view="colors" onNext={onNext} onBack={onBack} onViewChange={() => {}} isActive={false} />
  );

  const ShadesContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <ColorsShadesContent view="shades" onNext={onNext} onBack={onBack} onViewChange={() => {}} isActive={false} />
  );

  const DecadeContent = ({ onNext, onBack, isActive = true }: { onNext?: () => void; onBack?: () => void; isActive?: boolean }) => {
    // Animation state: 'intro' -> 'reveal' -> 'final'
    const [phase, setPhase] = useState<'intro' | 'reveal' | 'final'>('intro');

    // Decade styling information
    const decadeStyles: Record<string, { vibe: string; icon: string; color: string }> = {
      '1950s': { vibe: 'Classic elegance meets rebellion', icon: '🎸', color: '#E8D5B7' },
      '1960s': { vibe: 'Mod culture and psychedelic dreams', icon: '✌️', color: '#F5A623' },
      '1970s': { vibe: 'Disco nights and bohemian days', icon: '🪩', color: '#D4A574' },
      '1980s': { vibe: 'Power shoulders and neon lights', icon: '📼', color: '#FF6B9D' },
      '1990s': { vibe: 'Grunge meets minimalism', icon: '📟', color: '#7B8D8E' },
      '2000s': { vibe: 'Y2K dreams and low-rise everything', icon: '💿', color: '#C0C0C0' },
      '2010s': { vibe: 'Athleisure and Instagram aesthetics', icon: '📱', color: '#4A90A4' },
      '2020s': { vibe: 'Quiet luxury meets bold individuality', icon: '✨', color: '#2C3E50' },
    };

    const decade = results.top_decade || '2020s';
    const style = decadeStyles[decade] || decadeStyles['2020s'];

    // Trigger phase transitions after delays - only when active
    useEffect(() => {
      if (!isActive) return;

      // Phase 1 -> Phase 2 (reveal decade)
      const revealTimer = setTimeout(() => {
        setPhase('reveal');
      }, 1400);

      // Phase 2 -> Phase 3 (move to top, show photo)
      const finalTimer = setTimeout(() => {
        setPhase('final');
      }, 3000);

      return () => {
        clearTimeout(revealTimer);
        clearTimeout(finalTimer);
      };
    }, [isActive]);

    const isFinal = phase === 'final';

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
        <motion.div
          className="flex-1 flex flex-col overflow-hidden"
          layout
          transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
        >
          {/* Header section - centered initially, top-aligned in final */}
          <motion.div
            layout
            className={`flex flex-col ${isFinal ? 'items-start pt-8' : 'items-center justify-center flex-1'}`}
            transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
          >
            {/* "Your decade is..." text */}
            <motion.p
              layout
              className={`uppercase tracking-widest mb-2 ${isFinal ? 'text-zinc-500 text-sm' : 'text-zinc-500 text-sm'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1],
                layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
              }}
            >
              Your decade is...
            </motion.p>

            {/* Decade icon and text */}
            <AnimatePresence>
              {isActive && (phase === 'reveal' || phase === 'final') && (
                <motion.div
                  layout
                  className={`${isFinal ? 'flex items-center gap-3' : 'text-center'}`}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.4, 0, 0.2, 1],
                    layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                  }}
                >
                  {/* <motion.span
                    layout
                    className={`block ${isFinal ? 'text-4xl' : 'text-8xl mb-4'}`}
                    transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
                  >
                    {style.icon}
                  </motion.span> */}
                  <motion.h1
                    layout
                    className={`font-display leading-none tracking-tight ${isFinal ? 'text-6xl' : 'text-8xl'} italic`}
                    transition={{ layout: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }}
                  >
                    {decade}
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Photo section - only in final phase */}
          <AnimatePresence>
            {isFinal && (
              <motion.div
                className="flex-1 flex flex-col mt-6 min-h-[280px]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="aspect-[3/4] max-h-[55vh] rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 relative">
                  {results.decade_photo_url ? (
                    <img
                      src={results.decade_photo_url}
                      alt={`${decade} style`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                      <span className="text-zinc-500 text-sm uppercase tracking-widest">
                        {decade} Aesthetic
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {/* <motion.p
                  className="text-zinc-400 text-sm mt-4 leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  {results.decade_description || style.vibe}
                </motion.p> */}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation - show after reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isActive && (phase === 'reveal' || phase === 'final') ? 1 : 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
        </motion.div>
      </div>
    );
  };


  const CelebrityContent = ({ 
    onNext, 
    onBack,
    isActive = true 
  }: { 
    onNext?: () => void; 
    onBack?: () => void;
    isActive?: boolean;
  }) => {
    const [dotsComplete, setDotsComplete] = useState(false);
    const [revealed, setRevealed] = useState(false);
    
    // Dots animation timing: each dot fades in, holds, fades out
    const dotStagger = 0.2; // stagger between dots appearing
    const singleLoopDuration = 1.0; // total time for one complete cycle (in/hold/out)
    const loopPause = 0.4; // pause between loops
    const numLoops = 1;
    const repeatDelay = loopPause + (2 * dotStagger);
    const totalDotsTime = (singleLoopDuration + (numLoops - 1) * (singleLoopDuration + repeatDelay) + (2 * dotStagger)) * 1000;
    
    useEffect(() => {
      if (!isActive) return;
      const dotsTimer = setTimeout(() => {
        setDotsComplete(true);
      }, totalDotsTime + 200); // add a small buffer
      return () => clearTimeout(dotsTimer);
    }, [isActive, totalDotsTime]);
    
    useEffect(() => {
      if (!isActive || !dotsComplete) return;
      const revealTimer = setTimeout(() => {
        setRevealed(true);
      }, 300);
      return () => clearTimeout(revealTimer);
    }, [isActive, dotsComplete]);

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Title - animates from centered/large to top/small */}
          <motion.div 
            className="shrink-0"
            initial={false}
            animate={{
              y: revealed ? 0 : '30vh',
              opacity: revealed ? 0.5 : 1,
            }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.h1 
              className="font-display leading-[0.9]"
              initial={false}
              animate={{
                fontSize: revealed ? '1.25rem' : '3.75rem',
              }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              Your<br />
              Celebrity<br />
              Lookalike
            </motion.h1>
            <motion.span 
              className="font-display block"
              initial={false}
              animate={{
                fontSize: revealed ? '0.5rem' : '2.25rem',
                marginTop: revealed ? '-0.5rem' : '0.5rem',
              }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={isActive ? { 
                    opacity: [0, 1, 1, 0] 
                  } : { opacity: 0 }}
                  style={{ display: 'inline-block' }}
                  transition={{
                    opacity: {
                      delay: i * dotStagger,
                      duration: singleLoopDuration,
                      times: [0, 0.2, 0.7, 1], // fade in quick, hold, fade out
                      repeat: numLoops - 1, // repeat 2 more times (3 total)
                      repeatDelay: repeatDelay, // constant delay to maintain stagger
                      ease: "easeInOut",
                    },
                  }}
                >
                  .
                </motion.span>
              ))}
            </motion.span>
          </motion.div>
          
          {/* Celebrity Name Header - Above image */}
          <motion.div
            className="mt-2 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: revealed ? 1 : 0, 
              y: revealed ? 0 : 10 
            }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="font-display text-3xl leading-tight">
              {results.top_celeb_match.celeb_name}
            </h2>
          </motion.div>

          {/* Celebrity Image - fades in and slides up */}
          <motion.div 
            className="flex-1 flex flex-col min-h-[300px]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ 
              opacity: revealed ? 1 : 0, 
              y: revealed ? 0 : 40 
            }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex-1 aspect-[3/4] mx-auto max-w-full rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 relative">
              {results.top_celeb_match.celeb_photo_url ? (
                <img
                  src={results.top_celeb_match.celeb_photo_url}
                  alt={results.top_celeb_match.celeb_name}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                  <span className="text-zinc-500 text-sm uppercase tracking-widest">
                    {results.top_celeb_match.celeb_name}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Celebrity details - centered against each other */}
          <motion.div
            className="mt-6 grid grid-cols-2 gap-0 shrink-0 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: revealed ? 1 : 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="text-right pr-4 border-r-2 border-zinc-600">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.1em] mb-1">Top Styles</p>
              <div className="flex flex-col gap-1">
                {[results.top_celeb_match.style_1, results.top_celeb_match.style_2, results.top_celeb_match.style_3]
                  .filter(Boolean)
                  .map((style, i) => (
                    <p key={i} className="text-lg font-display text-[#F7EFE5] leading-tight capitalize">
                      {style}
                    </p>
                  ))}
              </div>
            </div>

            <div className="text-left pl-4">
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.1em] mb-1">Color Palette</p>
              <p className="text-lg font-display text-[#F7EFE5] leading-tight capitalize">
                {results.top_celeb_match.color_aura_name}
              </p>
            </div>
          </motion.div>
        </div>
        
        {/* Footer - fades in after reveal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
        </motion.div>
      </div>
    );
  };

  const CityIntroContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
        <h1 className="font-display text-3xl leading-[1.1] text-center">
        You're based in {results.userCity || 'your city'}—but what do your outfits say?
      </h1>
      </div>

      <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
          </div>
  );

  const CityRevealContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => {
    // Get today's date formatted
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // City-specific data mapping
    const cityData: Record<string, { airport: string; fromAirport: string; price: string; reason: string }> = {
      'San Francisco': {
        airport: 'SFO',
        fromAirport: 'JFK',
        price: '$155',
        reason: "You dress like you're late to something important and you'll still be the best-dressed person there."
      },
      'New York': {
        airport: 'JFK',
        fromAirport: 'SFO',
        price: '$155',
        reason: "You dress like you're late to something important and you'll still be the best-dressed person there."
      },
      'Los Angeles': {
        airport: 'LAX',
        fromAirport: 'SFO',
        price: '$89',
        reason: "Your laid-back style with unexpected polish screams West Coast creative."
      },
      'Paris': {
        airport: 'CDG',
        fromAirport: 'SFO',
        price: '$485',
        reason: "Your effortless elegance and neutral palette would blend right in on the Left Bank."
      },
      'Tokyo': {
        airport: 'NRT',
        fromAirport: 'SFO',
        price: '$650',
        reason: "Your avant-garde sensibility and attention to detail match Tokyo's fashion-forward streets."
      },
    };

    const city = results.city_vibe || 'New York';
    const data = cityData[city] || cityData['New York'];

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
        <div className="flex-1 flex flex-col overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <h1 className="font-display text-2xl leading-[1.1] mb-6 shrink-0">
            Your look would fit right into <span className="italic">{city}</span>.
          </h1>

          {/* City Image */}
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 relative mb-8 shrink-0">
            {results.city_photo_url ? (
              <img
                src={results.city_photo_url}
                alt={city}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-zinc-500 text-sm uppercase tracking-widest">
                  {city}
                </span>
              </div>
            )}
          </div>
          
          {/* Why this city? */}
          <div className="mb-6 shrink-0">
            <h3 className="font-display text-sm text-[#F7EFE5] mb-2">Why {city}?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {results.city_vibe_description}
            </p>
          </div>

          {/* Flight Info */}
          <div className="flex gap-8 mb-6 shrink-0">
            <div>
              <p className="font-display text-sm text-[#F7EFE5] mb-1">{data.fromAirport} → {data.airport}</p>
              <p className="text-xs text-zinc-500">{data.price} (one-way)</p>
            </div>
            <div>
              <p className="font-display text-sm text-[#F7EFE5] mb-1">Date</p>
              <p className="text-xs text-zinc-500">{dateStr}</p>
        </div>
      </div>
      
          {/* Disclaimer */}
          <div className="mt-auto shrink-0">
            <p className="font-display text-xs text-zinc-500 mb-1">Disclaimer</p>
            <p className="text-[10px] text-zinc-600 leading-relaxed">
              Lookbook Wrapped is not a licensed travel agency and cannot be held responsible for any spontaneous relocation decisions made after viewing this result.
            </p>
          </div>
        </div>
        
        <NavigationFooter onNext={onNext} onBack={onBack} light={false} nextText="continue →" />
    </div>
  );
  };

  // Photo flipping sequence (multiple pages at once)
  const renderPhotoFlipSequence = () => (
    <FlipContainer>
      {/* Base layer: Fav Item content (revealed as last photo flips) */}
      <div className="absolute inset-0 bg-[#FFFAF4] z-0">
        <FavItemContent onNext={favItemFlip.flip} />
      </div>

      {/* Photo pages - Page 1 on top, Page 10 at bottom */}
      {Array.from({ length: TOTAL_FLIP_PAGES }, (_, i) => {
        const pageNum = i + 1;
        const zIndex = (TOTAL_FLIP_PAGES - i) * 10;
        const photo = results.all_uploaded_photos[i];

        return (
          <FlipPage
            key={pageNum}
            isFlipped={flippedPages[pageNum]}
            zIndex={zIndex}
          >
            <PhotoPageContent photo={photo} pageNum={pageNum} />
          </FlipPage>
        );
      })}
    </FlipContainer>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center bg-[#FFFAF4] relative overflow-hidden">
        {/* Pulsing "wave" background with linear center mask */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
          style={{
            maskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.5) 60%, black 100%)'
          }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span
              key={i}
              className="font-display text-[86px] leading-[0.85] tracking-tight text-[#2D242F]"
              initial={{ opacity: 0.03 }}
              animate={{
                opacity: [0.03, 0.25, 0.03],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "easeInOut"
              }}
            >
              Lookbook
            </motion.span>
          ))}
        </div>

        {/* Loading content on top */}
        <div className="flex flex-col items-center gap-6 relative z-10">
          <div className="w-14 h-14 border-4 border-gray-900/10 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-900/60 text-sm font-medium tracking-wide">Loading your Wrapped...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center px-10 bg-[#FFFAF4]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-4xl">⚠️</div>
          <h2 className="font-display text-xl text-gray-900">Oops!</h2>
          <p className="text-gray-600 text-sm max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render step with flip transitions
  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <IntroContent onNext={introFlip.flip} isActive={false} />
            </div>
            <FlipPage key="welcome" isFlipped={welcomeFlip.isFlipped} zIndex={10}>
              <WelcomeContent onNext={welcomeFlip.flip} isActive={true} />
            </FlipPage>
          </FlipContainer>
        );

      case 'intro':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <PhotoPageContent photo={results.all_uploaded_photos[0]} pageNum={1} />
            </div>
            <FlipPage key="intro" isFlipped={introFlip.isFlipped} zIndex={10}>
              <IntroContent onNext={introFlip.flip} isActive={true} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'photo-flip':
        return renderPhotoFlipSequence();
      
      case 'fav-item':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <FavPairingsContent 
                isActive={false}
                onNext={favPairingsFlip.flip} 
                onBack={onBack['fav-pairings']} 
              />
            </div>
            <FlipPage key="fav-item" isFlipped={favItemFlip.isFlipped} zIndex={10}>
              <FavItemContent onNext={favItemFlip.flip} />
            </FlipPage>
          </FlipContainer>
        );

      case 'fav-pairings':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-black z-0">
              <UnwornPairingsContent 
                isActive={false}
                onNext={unwornPairingsFlip.flip} 
                onBack={onBack['unworn-pairings']} 
              />
            </div>
            <FlipPage key="fav-pairings" isFlipped={favPairingsFlip.isFlipped} zIndex={10}>
              <FavPairingsContent 
                isActive={true}
                onNext={favPairingsFlip.flip} 
                onBack={onBack['fav-pairings']} 
              />
            </FlipPage>
          </FlipContainer>
        );

      case 'unworn-pairings':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <TopStylesContent
                isActive={false}
                onNext={topStylesFlip.flip}
                onBack={onBack['top-styles']}
              />
            </div>
            <FlipPage key="unworn-pairings" isFlipped={unwornPairingsFlip.isFlipped} zIndex={10}>
              <UnwornPairingsContent 
                isActive={true}
                onNext={unwornPairingsFlip.flip} 
                onBack={onBack['unworn-pairings']} 
              />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'top-styles':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <ColorsShadesContent 
                view="colors" 
                onNext={() => setStep('color-aura')} 
                onBack={onBack['colors']} 
                onViewChange={setColorsView}
                isActive={false}
              />
            </div>
            <FlipPage key="top-styles" isFlipped={topStylesFlip.isFlipped} zIndex={10}>
              <TopStylesContent
                isActive={true}
                onNext={topStylesFlip.flip}
                onBack={onBack['top-styles']}
              />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'colors':
        // Colors and shades now use push animation internally (no flip between them)
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <ColorAuraContent onNext={colorAuraFlip.flip} onBack={onBack['color-aura']} />
            </div>
            <FlipPage key="colors" isFlipped={colorsView === 'shades' && shadesFlip.isFlipped} zIndex={10}>
              <ColorsShadesContent 
                view={colorsView} 
                onNext={() => { shadesFlip.flip(); }} 
                onBack={onBack['colors']} 
                onViewChange={setColorsView}
                isActive={true}
              />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'color-aura':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-black z-0">
              <DecadeContent onNext={decadeFlip.flip} onBack={onBack['decade']} isActive={false} />
            </div>
            <FlipPage key="color-aura" isFlipped={colorAuraFlip.isFlipped} zIndex={10}>
              <ColorAuraContent onNext={colorAuraFlip.flip} onBack={onBack['color-aura']} />
            </FlipPage>
          </FlipContainer>
        );

      case 'decade':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-black z-0">
              <CelebrityContent onNext={celebrityFlip.flip} onBack={onBack['celebrity']} isActive={false} />
            </div>
            <FlipPage key="decade" isFlipped={decadeFlip.isFlipped} zIndex={10}>
              <DecadeContent onNext={decadeFlip.flip} onBack={onBack['decade']} isActive={true} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'celebrity':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-black z-0">
              <CityIntroContent onNext={cityIntroFlip.flip} onBack={onBack['city-intro']} />
            </div>
            <FlipPage key="celebrity" isFlipped={celebrityFlip.isFlipped} zIndex={10}>
              <CelebrityContent onNext={celebrityFlip.flip} onBack={onBack['celebrity']} isActive={true} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'city-intro':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-black z-0">
              <CityRevealContent onNext={cityRevealFlip.flip} onBack={onBack['city-reveal']} />
            </div>
            <FlipPage key="city-intro" isFlipped={cityIntroFlip.isFlipped} zIndex={10}>
              <CityIntroContent onNext={cityIntroFlip.flip} onBack={onBack['city-intro']} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'city-reveal':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <TopOutfitsSelectionContent 
                onNext={topOutfitsSelectionFlip.flip} 
                onBack={onBack['top-outfits-selection']} 
                isActive={false} 
                results={results}
                selectedOutfitIndex={selectedOutfitIndex}
                setSelectedOutfitIndex={setSelectedOutfitIndex}
              />
            </div>
            <FlipPage key="city-reveal" isFlipped={cityRevealFlip.isFlipped} zIndex={10}>
              <CityRevealContent onNext={cityRevealFlip.flip} onBack={onBack['city-reveal']} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'top-outfits-selection':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <SummaryContent 
                results={results} 
                selectedOutfitIndex={selectedOutfitIndex} 
                onBack={onBack['summary']} 
                isActive={false}
              />
            </div>
            <FlipPage key="top-outfits-selection" isFlipped={topOutfitsSelectionFlip.isFlipped} zIndex={10}>
              <TopOutfitsSelectionContent 
                onNext={topOutfitsSelectionFlip.flip} 
                onBack={onBack['top-outfits-selection']} 
                isActive={true} 
                results={results}
                selectedOutfitIndex={selectedOutfitIndex}
                setSelectedOutfitIndex={setSelectedOutfitIndex}
              />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'summary':
        return (
          <SummaryContent 
            results={results} 
            selectedOutfitIndex={selectedOutfitIndex} 
            onBack={onBack['summary']} 
            isActive={true}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#FFFAF4]">
      <div className="w-full max-w-md mx-auto h-[100dvh] relative bg-[#FFFAF4]">
        {renderStep()}
      </div>
    </div>
  );
}
