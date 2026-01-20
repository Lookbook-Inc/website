'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Phone from './Phone';

interface PhoneData {
  screenSrc: string;
  alt: string;
}

const phoneScreens: PhoneData[] = [
  {
    screenSrc: "/images/iphone-graphics/home-for-website.svg",
    alt: "Home app screen"
  },
  {
    screenSrc: "/images/iphone-graphics/photos-for-website.svg",
    alt: "Photos app screen"
  },
  {
    screenSrc: "/images/iphone-graphics/streetwear-for-website.svg",
    alt: "Streetwear app screen"
  },
  {
    screenSrc: "/images/iphone-graphics/wardrobe-for-website.svg",
    alt: "Wardrobe app screen"
  },
  {
    screenSrc: "/images/iphone-graphics/ClothingDetailView.svg",
    alt: "Clothing detail view screen"
  }
];

// Desktop positions: Ordered clockwise from left to right
const desktopPositions = [
  { x: -140, y: 60, rotate: -8, scale: 0.85, zIndex: 30 },  // Back left
  { x: -80, y: 20, rotate: -3, scale: 0.92, zIndex: 40 },   // Front left
  { x: 0, y: 0, rotate: 0, scale: 1.0, zIndex: 50 },        // Front center
  { x: 80, y: 20, rotate: 5, scale: 0.9, zIndex: 40 },      // Front right
  { x: 140, y: 60, rotate: 12, scale: 0.85, zIndex: 30 }    // Back right
];

// Mobile positions: Ordered clockwise from left to right
const mobilePositions = [
  { x: -80, y: 40, rotate: -15, scale: 0.55, zIndex: 30 },  // Back left
  { x: -50, y: 15, rotate: -8, scale: 0.6, zIndex: 40 },    // Front left
  { x: 0, y: 0, rotate: 0, scale: 0.7, zIndex: 50 },        // Front center
  { x: 50, y: 15, rotate: 8, scale: 0.6, zIndex: 40 },      // Front right
  { x: 80, y: 40, rotate: 15, scale: 0.55, zIndex: 30 }     // Back right
];

export default function PhoneMockupGroup() {
  const [currentRotation, setCurrentRotation] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotate every 3 seconds (clockwise), paused if expanded
  useEffect(() => {
    if (expandedIndex !== null) return;

    const interval = setInterval(() => {
      setCurrentRotation(prev => (prev + 1) % phoneScreens.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [expandedIndex]);

  const positions = isMobile ? mobilePositions : desktopPositions;

  return (
    <div
      className={`relative w-full h-full ${isMobile ? 'min-h-[400px]' : 'min-h-[600px]'}`}
    >
      {/* Dimmed Backdrop when a phone is expanded */}
      <AnimatePresence>
        {expandedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedIndex(null)}
            className="fixed inset-0 z-[60] bg-[#fdfaf2]/60 backdrop-blur-sm cursor-zoom-out"
          />
        )}
      </AnimatePresence>

      {phoneScreens.map((phone, index) => {
        // Calculate which position this phone should be in
        // (index + currentRotation) creates a natural forward circular flow
        const positionIndex = (index + currentRotation) % phoneScreens.length;
        const basePosition = positions[positionIndex];
        const isExpanded = expandedIndex === index;
        const someoneIsExpanded = expandedIndex !== null;

        // Visual state logic
        let currentPos = { ...basePosition };
        let zIndex = basePosition.zIndex;
        let opacity = someoneIsExpanded && !isExpanded ? 0.3 : (basePosition.zIndex <= 30 ? 0.7 : 1);
        let blur = someoneIsExpanded && !isExpanded ? 'blur(4px)' : (basePosition.zIndex <= 30 ? 'blur(1px)' : 'blur(0px)');

        if (isExpanded) {
          currentPos = { 
            x: 0, 
            y: isMobile ? 20 : 0, 
            rotate: 0, 
            scale: isMobile ? 0.9 : 1.3,
            zIndex: 100
          };
          zIndex = 100;
          opacity = 1;
          blur = 'blur(0px)';
        }

        return (
          <Phone
            key={`${phone.alt}-${index}`}
            screenSrc={phone.screenSrc}
            alt={phone.alt}
            position={currentPos}
            zIndex={zIndex}
            depthBlur={blur}
            depthOpacity={opacity}
            isExpanded={isExpanded}
            onClick={() => {
              if (isExpanded) {
                setExpandedIndex(null);
              } else {
                setExpandedIndex(index);
              }
            }}
          />
        );
      })}
    </div>
  );
}
