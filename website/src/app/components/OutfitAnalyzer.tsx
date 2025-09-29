'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { outfitExamples, ClothingItem } from '../data/outfitData';

const ANALYZING_MESSAGES = [
  "Fanagling",
  "Mulling",
  "Tinkering",
  "Contemplating",
  "Stewing",
  "Percolating",
  "Marinating",
  "Ruminating",
  "Churning",
  "Twisting and Turning",
  "Evaluating",
  "Corralling"
];

export default function OutfitAnalyzer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analyzedIndex, setAnalyzedIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ClothingItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const currentOutfit = outfitExamples[currentIndex];
  const analyzedOutfit = outfitExamples[analyzedIndex];

  // Intersection Observer to detect when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we don't need to observe anymore
          observer.disconnect();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '50px 0px', // Trigger slightly before the section is fully visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Cycle through analyzing messages when analyzing is active
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAnalyzing) {
      // Set initial random message
      setCurrentMessage(ANALYZING_MESSAGES[Math.floor(Math.random() * ANALYZING_MESSAGES.length)]);

      // Change message every 1.5 seconds during analysis
      interval = setInterval(() => {
        setCurrentMessage(ANALYZING_MESSAGES[Math.floor(Math.random() * ANALYZING_MESSAGES.length)]);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnalyzing]);

  const analyzeOutfit = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setAnalyzedIndex(currentIndex);

    // Random delay between 2-10 seconds (2000-10000ms)
    const randomDelay = Math.floor(Math.random() * 8000) + 2000;

    setTimeout(() => {
      setResults(currentOutfit.items);
      setIsAnalyzing(false);
      setShowResults(true);
    }, randomDelay);
  };


  const goToOutfit = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section ref={sectionRef} className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className={`text-center mb-16 ${isVisible ? 'animate-fly-in-left' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-6xl font-display mb-4 text-gray-800">
            See it in Action
          </h2>
          <p className="text-lg md:text-xl font-sans text-gray-700 max-w-2xl mx-auto">
            No more taking hundreds of photos. Onboard your closet with ease.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-30 items-start">
          {/* Left Side - Gallery */}
          <div className={`space-y-6 ${isVisible ? 'animate-fly-in-left' : 'opacity-0'}`}>
            {/* Your Gallery Title */}
            <div className="text-center">
              <h3 className="text-2xl font-display text-gray-800 mb-6">Your Gallery</h3>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {outfitExamples.map((outfit, index) => (
                <button
                  key={outfit.id}
                  onClick={() => goToOutfit(index)}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200 ${
                    index === currentIndex
                      ? 'ring-4 ring-gray-800 ring-offset-2'
                      : 'hover:ring-2 hover:ring-gray-400 hover:ring-offset-1'
                  }`}
                >
                  <Image
                    src={outfit.outfitImage}
                    alt={outfit.name}
                    fill
                    className="object-cover"
                  />
                  {/* Selection Overlay */}
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-gray-800/10"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Analyze Button */}
            <div className="text-center mt-8">
              <button
                onClick={analyzeOutfit}
                disabled={isAnalyzing}
                className="px-8 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze This Outfit'}
              </button>
            </div>
          </div>

          {/* Right Side - Results */}
          <div className="space-y-6 min-h-[1100px]">
            {!showResults && !isAnalyzing && (
              <div className="space-y-6">
                {/* Placeholder Main Photo */}
                <div className={`${isVisible ? 'animate-fly-in-left animate-delay-200' : 'opacity-0'}`}>
                  <div className="relative aspect-[3/4] max-w-sm mx-auto bg-gray-200 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2"/>
                        <polyline points="21,15 16,10 5,21" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Placeholder Tagged Items Section */}
                <div className="space-y-4">
                  <h3 className={`text-2xl font-display text-gray-500 mb-6 text-center ${isVisible ? 'animate-fly-in-left animate-delay-400' : 'opacity-0'}`}>Tagged Items</h3>
                  {[1, 2, 3].map((index) => {
                    const delays = ['animate-delay-600', 'animate-delay-800', 'animate-delay-1000'];
                    return (
                      <div
                        key={index}
                        className={`flex gap-4 p-4 bg-gray-200 rounded-lg opacity-60 ${isVisible ? `animate-fly-in-left ${delays[index - 1]}` : 'opacity-0'}`}
                      >
                        <div className="w-20 h-20 bg-gray-300 rounded-lg flex-shrink-0 animate-pulse">
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
                          </div>
                          <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="h-[1100px] pt-20">
                <div className="text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full mx-auto mb-4"></div>
                  <p
                    key={currentMessage}
                    className="font-sans text-gray-600 mb-2 min-h-[1.5rem] animate-slide-fade-in animate-ellipses"
                  >
                    {currentMessage}
                  </p>
                </div>
              </div>
            )}

            {showResults && (
              <div className="space-y-6">
                {/* Main Outfit Photo */}
                <div className={`${isVisible ? 'animate-fly-in-left' : 'opacity-0'}`}>
                  <div className="relative aspect-[3/4] max-w-sm mx-auto bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={analyzedOutfit.outfitImage}
                      alt={analyzedOutfit.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Tagged Items Section */}
                <div className="space-y-4">
                  <h3 className={`text-2xl font-display text-gray-800 mb-6 text-center ${isVisible ? 'animate-fly-in-left animate-delay-200' : 'opacity-0'}`}>Tagged Items</h3>
                  {results.map((item, index) => {
                    const delays = ['animate-delay-400', 'animate-delay-600', 'animate-delay-800', 'animate-delay-1000'];
                    return (
                      <div
                        key={item.id}
                        className={`flex gap-4 p-4 bg-gray-50 rounded-lg ${isVisible ? `animate-fly-in-left ${delays[index] || ''}` : 'opacity-0'}`}
                      >
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.imageSrc}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-sans font-medium text-gray-800">{item.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{item.category} • {item.color}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}