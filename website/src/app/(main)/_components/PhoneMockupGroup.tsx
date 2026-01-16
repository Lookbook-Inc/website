'use client';

import { useEffect, useState } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);
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

  // Auto-rotate every 3 seconds (clockwise)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentRotation(prev => (prev + 1) % phoneScreens.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const positions = isMobile ? mobilePositions : desktopPositions;

  return (
    <div
      className={`relative w-full h-full ${isMobile ? 'min-h-[400px]' : 'min-h-[600px]'}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {phoneScreens.map((phone, index) => {
        // Calculate which position this phone should be in (clockwise rotation)
        const positionIndex = (index - currentRotation + phoneScreens.length) % phoneScreens.length;
        const position = positions[positionIndex];

        // Scale up only the front center phone (position index 2) when hovered
        const isFrontCenter = positionIndex === 2;
        const hoverScale = isMobile ? 0.8 : 1.15; // Smaller hover effect on mobile
        const currentScale = isFrontCenter && isPaused ? hoverScale : position.scale;

        // Create depth effects based on z-index
        const isBackground = position.zIndex <= 30; // Back phones (lowest z-index)
        const depthBlur = isBackground ? 'blur(1px)' : 'blur(0px)';
        const depthOpacity = isBackground ? 0.7 : 1;

        const delayClasses = ['', 'animate-delay-200', 'animate-delay-400', 'animate-delay-600', 'animate-delay-800'];

        return (
          <Phone
            key={`${phone.alt}-${index}`}
            screenSrc={phone.screenSrc}
            alt={phone.alt}
            position={{ ...position, scale: currentScale }}
            zIndex={position.zIndex}
            delayClass={delayClasses[index] || ''}
            depthBlur={depthBlur}
            depthOpacity={depthOpacity}
          />
        );
      })}
    </div>
  );
}