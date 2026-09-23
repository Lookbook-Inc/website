'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AnimatePresence, motion } from 'framer-motion';
import { usePostHog } from 'posthog-js/react';

export default function ProcessingPage() {
  const router = useRouter();
  const supabase = createClient();
  const posthog = usePostHog();
  const [checklistStartIndex, setChecklistStartIndex] = useState(0);

  // Processing checklist items
  const checklistItems = [
    'Analyzing your outfits',
    'Extracting clothing items',
    'Sampling your colour palettes',
    'Matching your style archetypes',
    'Determining your city match',
    'Referencing style database',
    'Evaluating your clothing preferences',
    'Inspecting your unique aura',
    'Investigating worldly styles and colors'
  ];

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const isDev = process.env.NODE_ENV === 'development';
      const isMock = isDev && params.get('mock') === 'true';

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !isMock) {
        router.push('/snapshot');
        return;
      }

      if (user) {
        // Track processing page view
        if (posthog) {
          posthog.capture('wrapped_processing_viewed', {
            user_id: user.id,
            email: user.email
          });
        }
      }
    };
    checkAuth();
  }, [router, supabase.auth, posthog]);

  // Cycle through checklist items (slide up animation)
  useEffect(() => {
    const interval = setInterval(() => {
      setChecklistStartIndex((prev) => (prev + 1) % checklistItems.length);
    }, 3000); // Slide up every 3 seconds

    return () => clearInterval(interval);
  }, [checklistItems.length]);

  // Get the 3 visible items (wrapping around the array)
  const visibleItems = [
    checklistItems[checklistStartIndex % checklistItems.length],
    checklistItems[(checklistStartIndex + 1) % checklistItems.length],
    checklistItems[(checklistStartIndex + 2) % checklistItems.length],
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAF4' }}>
      <div className="w-full max-w-md mx-auto bg-[#FFFAF4] min-h-screen">
        <div className="flex flex-col min-h-screen px-10 pb-12">
          {/* Spacer to push content to ~55% down the page */}
          <div className="h-[45vh]" />

          <h1 className="font-display text-4xl text-gray-900 leading-tight mb-6">
            Analyzing... we will send you an email when we&apos;re done
          </h1>

          {/* Checklist - Animated slide-up carousel */}
          <div className="relative h-32 overflow-hidden">
            <AnimatePresence initial={false}>
              {visibleItems.map((item, index) => (
                <motion.div
                  key={item}
                  layout
                  initial={{ y: 120, opacity: 0 }}
                  animate={{
                    y: index * 40,
                    opacity: index === 0 ? 1 : index === 1 ? 0.6 : 0.3,
                  }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    layout: { duration: 0.5 }
                  }}
                  className="absolute w-full flex items-center gap-3"
                >
                  <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    index === 0
                      ? 'border-gray-400 bg-gray-100 animate-pulse'
                      : 'border-gray-200'
                  }`} />
                  <span className={`text-sm transition-all duration-300 ${
                    index === 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'
                  }`}>
                    {item}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex-1" />

          <p className="text-sm text-gray-500 leading-tight mb-6">
            Make sure to check your spam and &quot;all mail&quot; boxes!
          </p>
        </div>
      </div>
    </div>
  );
}
