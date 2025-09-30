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
            Aesthetic Intelligence.
          </h2>
          <p className="text-lg md:text-lg font-sans text-gray-700 max-w-2xl mx-auto">
            No need to dig up and photograph each individual item you own - we&apos;ll take care it for you. See it in action:
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_5rem_1fr] gap-8 md:gap-12 xl:gap-16 items-start mb-16">
          {/* Left Side - Gallery */}
          <div className={`space-y-6 lg:justify-self-end ${isVisible ? 'animate-fly-in-left' : 'opacity-0'}`}>
            {/* Your Gallery Title */}
            <div className="text-center">
              <h3 className="text-2xl md:text-4xl font-display text-gray-800 mb-6">From your gallery...</h3>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto lg:mx-0">
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

          </div>

          {/* Middle - Analyze Action */}
          <div className={`flex flex-col items-center justify-start md:mt-50 ${isVisible ? 'animate-fly-in-left' : 'opacity-0'}`}>
            <button
              onClick={analyzeOutfit}
              disabled={isAnalyzing}
              aria-label="Analyze This Outfit"
              className="w-20 h-20 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-200 font-sans disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
            >
              {isAnalyzing ? (
                <div className="animate-spin w-6 h-6 border-4 border-white/30 border-t-white rounded-full mx-auto" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-base">Go!</span>
                  <svg className="mt-1 w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Right Side - Results */}
          <div className="space-y-6 min-h-[1100px] lg:justify-self-start">
            {/* Analyzed Title */}
            <div className={`text-center ${isVisible ? 'animate-fly-in-left' : 'opacity-0'}`}>
              <h3 className="text-2xl md:text-4xl font-display text-gray-800 mb-6">... to organized outfits</h3>
            </div>
            {!showResults && !isAnalyzing && (
              <div className="space-y-6">
                {/* Placeholder Main Photo */}
                <div className={`${isVisible ? 'animate-fly-in-left animate-delay-200' : 'opacity-0'}`}>
                  <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 bg-gray-200 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                      {/* <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2"/>
                        <polyline points="21,15 16,10 5,21" strokeWidth="2"/>
                      </svg> */}
                      <p className="font-sans text-gray-700">Select a photo from your gallery to get started.</p>
                      <p className="font-sans text-gray-500 text-sm">(Then tap &quot;Go!&quot;)</p>
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
                  <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 bg-gray-100 rounded-lg overflow-hidden">
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

        <div className={`text-center`}>

          <p className="text-sm font-mono font-light text-gray-700 max-w-2xl mx-auto">
            (Above samples generated in-app and representatively capture our performance).
          </p>
        </div>
      </div>
    </section>
  );
}