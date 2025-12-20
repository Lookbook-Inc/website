'use client';

import { useState, useEffect, ReactNode, useRef } from 'react';
import { FlipPage } from '@/app/components/FlipPage';
import { useFlip } from '@/hooks/useFlip';
import { domToPng } from 'modern-screenshot';
import { motion, AnimatePresence } from 'framer-motion';
import { getInsightsByShareCode } from '@/lib/api/wrapped';
import { transformWrappedInsights, isInsightsCompleted, isInsightsProcessing } from '@/lib/wrapped/transform';

// --- Types ---

interface ClothingItem {
  name: string;
  path: string;
  item_type: string;
  outfit_count: number;
  shade_hex_1: string;
  shade_name_1: string;
  details?: string;
}

interface ColorGroup {
  color: string;
  top_shade: string;
  top_shade_hex: string;
  piece_count: number;
}

interface ColorResult {
  color: string;
  photo_ids: string[];
  shade_hex: string;
  shade_name: string;
  importance_score: number;
}

interface CelebMatch {
  celeb_name: string;
  celeb_photo_url?: string;
  description: string;
  similarity_score: number;
  categories: string[];
}

interface TopOutfit {
  photo_id: string;
  path: string;
  similarity_score: number;
}

interface Pairing {
  garment_name: string;
  garment_path: string;
  times_paired?: number;
  garment_color?: string;
}

interface StyleResult {
  style_name: string;
  points: number;
  appearances: number;
}

interface UnwornPairing {
  reasoning: string;
  garment_name: string;
  garment_path: string;
  garment_color?: string;
}

interface WrappedResults {
  userName: string;
  userCity: string | null;
  city_vibe: string;
  city_photo_url: string | null;
  primary_style: string;
  top_styles: StyleResult[];
  total_outfits_analyzed: number;
  top_colors: ColorGroup[];
  top_shades: ColorResult[];
  top_celeb_match: CelebMatch;
  most_worn_item: ClothingItem;
  best_pairings: Pairing[];
  unworn_pairings: UnwornPairing[];
  clothing_items_description: string;
  color_aura: string;
  color_aura_description: string;
  style_description: string;
  total_clothing_items: number;
  top_outfits: TopOutfit[];
  top_decade: string;
  decade_description: string;
}

// Mock data populated from the provided CSV values
const mockResults: WrappedResults = {
  userName: 'Anirudh',
  userCity: 'San Francisco',
  city_vibe: 'San Francisco',
  city_photo_url: null,
  primary_style: 'minimalist',
  top_styles: [
    { style_name: 'minimalist', points: 9, appearances: 3 },
    { style_name: 'streetwear', points: 5, appearances: 2 },
    { style_name: 'business casual', points: 2.5, appearances: 1 }
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
    description: 'Brown man looking for his place in the world.',
    similarity_score: 32.78,
    categories: ['Engineer']
  },
  most_worn_item: {
    name: 'Light-colored athletic sneakers',
    path: '2f5c6299-d234-44da-8b6b-8e928f28a68d/246970f9-304c-40ec-9e15-654469e023b0_original.webp',
    item_type: 'shoes',
    outfit_count: 3,
    shade_hex_1: '#CED4D7',
    shade_name_1: 'Grout'
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
  top_decade: '2020s',
  decade_description: 'Clean lines meet bold individuality. You dress like someone who scrolls Pinterest ironically but saves everything.'
};

type Step = 'welcome' | 'intro' | 'photo-flip' | 'fav-item' | 'fav-pairings' | 'unworn-pairings' | 'top-styles' | 'colors' | 'color-aura' | 'decade' | 'celebrity-intro' | 'celebrity' | 'city-intro' | 'city-reveal' | 'summary';

type Props = {
  params: Promise<{ code: string }>
}

// Test code to skip backend and use mock data
const TEST_CODE = 'TESTME';

// Helper function to format style names (remove underscores, capitalize)
const formatStyleName = (style: string): string => {
  return style
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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

        // Extract all image URLs for preloading
        const imageUrls: (string | null | undefined)[] = [
          // Top outfits (flip sequence)
          ...transformed.top_outfits.map(o => o.path),
          // Most worn item
          transformed.most_worn_item.path,
          // Best pairings
          ...transformed.best_pairings.map(p => p.garment_path),
          // Unworn pairings
          ...transformed.unworn_pairings.map(p => p.garment_path),
          // Celebrity photo
          transformed.top_celeb_match.celeb_photo_url,
          // City photo
          transformed.city_photo_url,
        ];

        // Preload all images before showing results
        await preloadImages(imageUrls);

        // Set results and hide loading
        setResults(transformed as WrappedResults);
        setLoading(false);
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
  const decadeFlip = useFlip(() => setStep('celebrity-intro'));
  const celebrityIntroFlip = useFlip(() => setStep('celebrity'));
  const celebrityFlip = useFlip(() => setStep('city-intro'));
  const cityIntroFlip = useFlip(() => setStep('city-reveal'));
  const cityRevealFlip = useFlip(() => setStep('summary'));
  
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
    'celebrity-intro': () => { setPrevStep(step); setStep('decade'); },
    'celebrity': () => { setPrevStep(step); setStep('celebrity-intro'); },
    'city-intro': () => { setPrevStep(step); setStep('celebrity'); },
    'city-reveal': () => { setPrevStep(step); setStep('city-intro'); },
    'summary': () => { setPrevStep(step); setStep('city-reveal'); },
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
      'celebrity-intro': celebrityIntroFlip,
      'celebrity': celebrityFlip,
      'city-intro': cityIntroFlip,
      'city-reveal': cityRevealFlip,
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
  }, [step, prevStep, favItemFlip, favPairingsFlip, unwornPairingsFlip, topStylesFlip, colorsFlip, shadesFlip, colorAuraFlip, decadeFlip, celebrityIntroFlip, celebrityFlip, cityIntroFlip, cityRevealFlip]);
  
  // Track which pages have been flipped for the photo sequence
  const [flippedPages, setFlippedPages] = useState<boolean[]>(
    new Array(TOTAL_FLIP_PAGES + 1).fill(false)
  );

  // Handle the photo flipping sequence
  useEffect(() => {
    if (step === 'photo-flip') {
      // Flip intro page first (index 0)
      setFlippedPages(prev => {
        const next = [...prev];
        next[0] = true;
        return next;
      });

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

  const NavigationFooter = ({ 
    onNext, 
    onBack, 
    nextText = "continue →", 
    backText = "← back",
    light = true,
    leftLabel = "Lookbook"
  }: { 
    onNext?: () => void; 
    onBack?: () => void; 
    nextText?: string;
    backText?: string;
    light?: boolean;
    leftLabel?: string;
  }) => {
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
            className={`${light ? 'text-gray-900' : 'text-white'} text-lg px-2 py-0.5 rounded-sm`}
            style={{ backgroundColor: bgColor }}
          >
            {nextText}
          </button>
        )}
      </div>
    );
  };

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

  const FavItemContent = ({ onNext }: { onNext?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-[#FFFAF4]">
      <FavSidebar />
      <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h3 className="font-display text-lg text-gray-900 mb-1">One piece carried your aesthetic</h3>
        <p className="text-sm text-gray-500 mb-8 leading-snug max-w-[200px]">
          {results.clothing_items_description}
        </p>
        
        <div className="flex-1 flex flex-col">
          <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#F1EDE7] shadow-sm relative shrink-0">
            <img
              src={results.most_worn_item.path}
              alt={results.most_worn_item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      <NavigationFooter onNext={onNext} />
    </div>
  );

  const FavPairingsContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-[#FFFAF4]">
      <FavSidebar />
      <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h3 className="font-display text-lg text-gray-900 mb-8">You've worn it with...</h3>
        
        <div className="space-y-4 flex-1">
          {results.best_pairings.map((pairing, i) => (
            <div key={i} className="w-full aspect-video rounded-xl overflow-hidden bg-[#F1EDE7] shadow-sm relative shrink-0">
              <img
                src={pairing.garment_path}
                alt={pairing.garment_name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      
      <NavigationFooter onNext={onNext} onBack={onBack} />
    </div>
  );

  const UnwornPairingsContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-black text-white">
      <FavSidebar light={false} />
      <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h3 className="font-display text-lg text-white mb-8">You haven't worn it with these yet...</h3>
        
        <div className="relative flex-1 min-h-[300px]">
          {/* Staggered layout as seen in image */}
          {results.unworn_pairings[0] && (
            <div className="absolute top-0 right-0 w-2/3 aspect-[3/4] rounded-xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800">
              <img
                src={results.unworn_pairings[0].garment_path}
                alt={results.unworn_pairings[0].garment_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {results.unworn_pairings[1] && (
            <div className="absolute top-1/4 left-0 w-2/3 aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800 z-10 opacity-60">
              <img
                src={results.unworn_pairings[1].garment_path}
                alt={results.unworn_pairings[1].garment_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {results.unworn_pairings[2] && (
            <div className="absolute bottom-0 right-4 w-3/4 aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800 opacity-40">
              <img
                src={results.unworn_pairings[2].garment_path}
                alt={results.unworn_pairings[2].garment_name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
      
      <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
    </div>
  );

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

  const TopStylesContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 relative bg-[#FFFAF4]">
      <StyleSidebar />
      <div className="flex-1 flex flex-col pt-4 pl-20 relative z-10 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h3 className="font-display text-lg text-gray-900 mb-8">Your top 3 aesthetics</h3>
        
        <div className="space-y-6 flex-1">
          {results.top_styles.slice(0, 3).map((style, i) => (
            <div key={i} className="flex flex-col gap-2 shrink-0">
              <div className="flex items-baseline justify-between border-b border-gray-200 pb-1">
                <span className="text-sm text-gray-400 font-display">0{i + 1}</span>
                <span className="text-2xl font-display uppercase tracking-tight text-gray-900">
                  {formatStyleName(style.style_name)}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-gray-400">
                <span>{style.appearances} Appearances</span>
                <span>{Math.round(style.points)} Points</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-[#F1EDE7] rounded-2xl shrink-0">
          <p className="text-sm text-gray-600 leading-relaxed italic">
            "Your style blends {formatStyleName(results.top_styles[0].style_name)} with {formatStyleName(results.top_styles[1].style_name)} touches,
            creating a look that's uniquely yours."
          </p>
        </div>
      </div>
      
      <NavigationFooter onNext={onNext} onBack={onBack} />
    </div>
  );

  const WelcomeContent = ({ onNext }: { onNext?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4">
      <div className="flex-1 flex flex-col justify-center overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h1 className="font-display text-4xl text-gray-900 leading-[1.1] mb-8">
          {results.userName}—<br />
          Welcome to your Lookbook.
        </h1>
      </div>
      
      <NavigationFooter onNext={onNext} nextText="enter →" />
    </div>
  );

  const IntroContent = ({ onNext }: { onNext?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4">
      <div className="flex-1 flex flex-col justify-center overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <h1 className="font-display text-4xl text-gray-900 leading-[1.1] mb-8">
          We analyzed {results.total_outfits_analyzed} of your outfits to uncover your styles this year.
        </h1>
      </div>
      
      <NavigationFooter onNext={onNext} nextText="enter →" />
    </div>
  );

  const PhotoPageContent = ({ outfit, pageNum }: { outfit?: TopOutfit; pageNum: number }) => (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-xl relative">
        {outfit ? (
          <img
            src={outfit.path}
            alt={`Top outfit ${pageNum}`}
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
        {outfit ? 'Top Outfit' : `Style Moment ${pageNum}`}
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
              {results.color_aura_description.split('.')[0]}.
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
                className={`h-[12vh] w-[50vw] rounded-l-3xl min-h-[60px] translate-x-4 shadow-sm flex items-center justify-start pl-5 ${
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
                className={`h-[12vh] w-[50vw] rounded-l-3xl min-h-[60px] translate-x-4 shadow-sm flex items-center justify-start pl-5 ${
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

  const DecadeContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => {
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

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
          <p className="text-zinc-500 text-sm mb-4 uppercase tracking-widest">Your decade is</p>
          
          <div className="text-center mb-8">
            <span className="text-8xl mb-4 block">{style.icon}</span>
            <h1 className="font-display text-7xl leading-none tracking-tight">
              {decade}
        </h1>
          </div>
        
          <p className="text-zinc-400 text-center text-lg italic max-w-[280px] leading-relaxed">
            {results.decade_description || style.vibe}
        </p>
        </div>
        
        <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
        </div>
    );
  };

  const CelebrityIntroContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    
    useEffect(() => {
      // Start animation after a brief delay
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 500);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <h1 
            className={`font-display leading-[0.9] transition-all duration-1000 ease-out ${
              isAnimating 
                ? 'text-2xl' 
                : 'text-6xl'
            }`}
          >
            Your<br />
            Celebrity<br />
            Lookalike
          </h1>
          <span className="font-display text-4xl mt-2">...</span>
      </div>
      
        <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
    </div>
  );
  };

  const CelebrityContent = ({ onNext, onBack, interactive = true }: { onNext?: () => void; onBack?: () => void; interactive?: boolean }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
      <div className="flex-1 flex flex-col overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="shrink-0 mb-6">
          <h1 className="font-display text-2xl leading-[0.9]">
            Your<br />
            Celebrity<br />
            Lookalike
        </h1>
          <span className="font-display text-2xl">...</span>
            </div>
        
        {/* Celebrity Image */}
        <div className="flex-1 flex flex-col min-h-[350px]">
          <div className="flex-1 rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 relative">
            {results.top_celeb_match.celeb_photo_url ? (
              <img
                src={results.top_celeb_match.celeb_photo_url}
                alt={results.top_celeb_match.celeb_name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                <span className="text-zinc-500 text-sm uppercase tracking-widest">
                  {results.top_celeb_match.celeb_name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <NavigationFooter onNext={onNext} onBack={onBack} light={false} />
    </div>
  );

  const CityIntroContent = ({ onNext, onBack }: { onNext?: () => void; onBack?: () => void }) => (
    <div className="flex flex-col h-[100dvh] px-10 pt-12 pb-4 bg-black text-[#F7EFE5]">
      <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
        <h1 className="font-display text-3xl leading-[1.1] text-center">
        You're based in [San Francisco]—but what do your outfits say?
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
            Your look would fit right into <span className="italic">[{city}]</span>.
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
              {data.reason}
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
        
        <NavigationFooter onNext={onNext} onBack={onBack} light={false} nextText="see summary →" />
    </div>
  );
  };

  const SummaryContent = ({ onBack }: { onBack?: () => void }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [shareSupported] = useState(() => 
      typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
    );

    // Capture card as data URL
    const captureCard = async (): Promise<string | null> => {
      if (!cardRef.current) return null;
      
      try {
        // modern-screenshot is more reliable for modern CSS
        return await domToPng(cardRef.current, {
          scale: 2, // Higher resolution for better quality
          backgroundColor: '#FFFFFF',
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

    return (
      <div className="flex flex-col h-[100dvh] px-6 pt-8 pb-4 bg-[#FFFAF4]">
        {/* Shareable Card */}
        <div className="flex-1 overflow-y-auto [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden mb-4">
          <div 
            ref={cardRef}
            className="w-full max-w-sm mx-auto bg-white rounded-3xl border-4 border-black shadow-2xl overflow-hidden"
          >
            {/* Card Inner Content with padding */}
            <div className="p-5 h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                {/* Lookbook branding - vertical text */}
                <div className="flex flex-col">
                  <span className="font-display text-2xl leading-none tracking-tighter text-[#4A3B33]">Look</span>
                  <span className="font-display text-2xl leading-none tracking-tighter text-[#7A5547]">book</span>
                </div>
                
                {/* Title */}
                <div className="text-right flex-1 ml-4">
                  <h1 className="font-display text-3xl leading-none tracking-tight text-gray-900 mb-1">
                    {results.color_aura}
                  </h1>
                  <p className="text-xs text-gray-500 tracking-wide">
                    {results.userName}'s 2025 palette
                  </p>
                </div>
              </div>

              {/* Main photo */}
              <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden mb-4 relative min-h-[280px]">
                {results.top_outfits[0]?.path ? (
                  <img
                    src={results.top_outfits[0].path}
                    alt="Your signature look"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      Your signature look
                    </span>
                  </div>
                )}
              </div>

              {/* Info sections */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left column - colors + info */}
                <div className="space-y-3">
                  {/* Colors */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">colours</p>
                    <div className="flex gap-1.5">
                      {results.top_colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="w-10 h-10 rounded-lg shadow-sm"
                          style={{ backgroundColor: c.top_shade_hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Style Twin */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-semibold">style twin</p>
                    <p className="text-xs text-gray-900 leading-tight">
                      {results.top_celeb_match.celeb_name}
                    </p>
                  </div>

                  {/* Decade */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-semibold">decade</p>
                    <p className="text-xs text-gray-900">
                      2020s
                    </p>
                  </div>

                  {/* City */}
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5 font-semibold">city</p>
                    <p className="text-xs text-gray-900">
                      {results.city_vibe}
                    </p>
                  </div>
                </div>

                {/* Right column - aesthetics */}
                <div className="flex flex-col justify-end">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-semibold">aesthetic</p>
                  <div className="space-y-1.5">
                    {results.top_styles.slice(0, 3).map((style, i) => (
                      <div
                        key={i}
                        className="bg-[#F5EFE7] px-3 py-2.5 rounded-lg text-right"
                      >
                        <p className="text-sm font-display text-gray-900 leading-none">
                          {formatStyleName(style.style_name)}
                        </p>
                      </div>
                    ))}
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
        const outfit = results.top_outfits[i];
        
        return (
          <FlipPage
            key={pageNum}
            isFlipped={flippedPages[pageNum]}
            zIndex={zIndex}
          >
            <PhotoPageContent outfit={outfit} pageNum={pageNum} />
          </FlipPage>
        );
      })}

      {/* Intro page on top of everything */}
      <FlipPage isFlipped={flippedPages[0]} zIndex={(TOTAL_FLIP_PAGES + 1) * 10}>
        <IntroContent />
      </FlipPage>
    </FlipContainer>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] items-center justify-center px-10 bg-[#FFFAF4]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Loading your Wrapped...</p>
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
              <IntroContent onNext={introFlip.flip} />
            </div>
            <FlipPage key="welcome" isFlipped={welcomeFlip.isFlipped} zIndex={10}>
              <WelcomeContent onNext={welcomeFlip.flip} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'intro':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              {/* Empty background - will transition to photo flip */}
            </div>
            <FlipPage key="intro" isFlipped={introFlip.isFlipped} zIndex={10}>
              <IntroContent onNext={introFlip.flip} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'photo-flip':
        return renderPhotoFlipSequence();
      
      case 'fav-item':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <FavPairingsContent onNext={favPairingsFlip.flip} onBack={onBack['fav-pairings']} />
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
              <UnwornPairingsContent onNext={unwornPairingsFlip.flip} onBack={onBack['unworn-pairings']} />
            </div>
            <FlipPage key="fav-pairings" isFlipped={favPairingsFlip.isFlipped} zIndex={10}>
              <FavPairingsContent onNext={favPairingsFlip.flip} onBack={onBack['fav-pairings']} />
            </FlipPage>
          </FlipContainer>
        );

      case 'unworn-pairings':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-[#FFFAF4] z-0">
              <TopStylesContent onNext={topStylesFlip.flip} onBack={onBack['top-styles']} />
            </div>
            <FlipPage key="unworn-pairings" isFlipped={unwornPairingsFlip.isFlipped} zIndex={10}>
              <UnwornPairingsContent onNext={unwornPairingsFlip.flip} onBack={onBack['unworn-pairings']} />
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
              <TopStylesContent onNext={topStylesFlip.flip} onBack={onBack['top-styles']} />
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
              <DecadeContent onNext={decadeFlip.flip} onBack={onBack['decade']} />
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
              <CelebrityIntroContent onNext={celebrityIntroFlip.flip} onBack={onBack['celebrity-intro']} />
            </div>
            <FlipPage key="decade" isFlipped={decadeFlip.isFlipped} zIndex={10}>
              <DecadeContent onNext={decadeFlip.flip} onBack={onBack['decade']} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'celebrity-intro':
        return (
          <FlipContainer>
            <div className="absolute inset-0 bg-black z-0">
              <CelebrityContent onNext={celebrityFlip.flip} onBack={onBack['celebrity']} />
            </div>
            <FlipPage key="celebrity-intro" isFlipped={celebrityIntroFlip.isFlipped} zIndex={10}>
              <CelebrityIntroContent onNext={celebrityIntroFlip.flip} onBack={onBack['celebrity-intro']} />
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
              <CelebrityContent onNext={celebrityFlip.flip} onBack={onBack['celebrity']} />
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
              <SummaryContent onBack={onBack['summary']} />
            </div>
            <FlipPage key="city-reveal" isFlipped={cityRevealFlip.isFlipped} zIndex={10}>
              <CityRevealContent onNext={cityRevealFlip.flip} onBack={onBack['city-reveal']} />
            </FlipPage>
          </FlipContainer>
        );
      
      case 'summary':
        return <SummaryContent onBack={onBack['summary']} />;
      
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
