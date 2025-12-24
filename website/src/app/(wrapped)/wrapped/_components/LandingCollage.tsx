'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';

// Import images from the screens folder
import Image79 from '../../screens/image 79.png';
import Image76 from '../../screens/image 76.png';
import Image75 from '../../screens/image 75.png';
import Image74 from '../../screens/image 74.png';
import Image73 from '../../screens/image 73.png';
import Image72 from '../../screens/image 72.png';
import Image71 from '../../screens/image 71.png';
import Image69 from '../../screens/image 69.png';
import Image70 from '../../screens/image 70.png';

const LANDING_IMAGES = [
  { src: Image79, top: '10%', left: '8%', width: '32%', duration: 12 },
  { src: Image76, top: '58%', left: '58%', width: '32%', duration: 14 },
  { src: Image75, top: '48%', left: '22%', width: '34%', duration: 11 },
  { src: Image73, top: '18%', left: '58%', width: '30%', duration: 15 },
  { src: Image71, top: '72%', left: '12%', width: '28%', duration: 13 },
  { src: Image69, top: '0%', left: '52%', width: '24%', duration: 12 },
  { src: Image70, top: '32%', left: '38%', width: '28%', duration: 16 },
  { src: Image72, top: '38%', left: '72%', width: '26%', duration: 18 },
  { src: Image74, top: '12%', left: '32%', width: '22%', duration: 11 },
];

const AURA_BLOBS = [
  { color: '#FDE68A', top: '10%', left: '10%', width: '60%', height: '40%', duration: 15 },
  { color: '#E9D5FF', top: '40%', left: '40%', width: '50%', height: '50%', duration: 20 },
  { color: '#99F6E4', top: '10%', left: '50%', width: '40%', height: '40%', duration: 18 },
  { color: '#FED7AA', top: '60%', left: '10%', width: '50%', height: '30%', duration: 22 },
];

const THEME_PALETTES = {
  candlelit: ['#FF8C00', '#FAD5A5', '#E25822', '#FFFDD0'],
  darkAcademia: ['#3D2B1F', '#1B3022', '#641E16', '#2C3E50'],
  winterNight: ['#191970', '#87CEEB', '#F0F8FF', '#4B0082'],
  frenchPainting: ['#F4C2C2', '#B0E0E6', '#FFFACD', '#8FBC8F'],
  hyperpop: ['#FF00FF', '#00FFFF', '#39FF14', '#BF00FF'],
  industrial: ['#71797E', '#0047AB', '#8B4513', '#36454F'],
  midnightDisco: ['#1A1A1A', '#C0C0C0', '#FF1493', '#FFD700'],
  naturalOrder: ['#556B2F', '#D2B48C', '#F5F5DC', '#4682B4'],
  gemstone: ['#50C878', '#E0115F', '#0F52BA', '#9966CC'],
  cloudtop: ['#F0FFFF', '#FFFFFF', '#E6E6FA', '#ADD8E6'],
};

const ALL_THEME_COLORS = Object.values(THEME_PALETTES).flat();

interface LandingCollageProps {
  isStatic?: boolean;
}

export function LandingCollage({ isStatic = false }: LandingCollageProps) {
  const [imageIndices, setImageIndices] = useState<Set<number>>(new Set());
  const [cardColors, setCardColors] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Pick a single theme at random for this session
    const themeKeys = Object.keys(THEME_PALETTES);
    const randomThemeKey = themeKeys[Math.floor(Math.random() * themeKeys.length)];
    const themeColors = THEME_PALETTES[randomThemeKey as keyof typeof THEME_PALETTES];

    // Initialize random colors from the selected theme and indices only on client
    const initialColors = LANDING_IMAGES.map(() => 
      themeColors[Math.floor(Math.random() * themeColors.length)]
    );
    setCardColors(initialColors);

    // If static, reveal all images immediately and don't start the loop
    if (isStatic) {
      setImageIndices(new Set(LANDING_IMAGES.map((_, i) => i)));
      return;
    }

    const initialIndices = new Set<number>();
    const count = Math.floor(Math.random() * 2) + 4; // Start with 4 or 5 images revealed
    while (initialIndices.size < count) {
      initialIndices.add(Math.floor(Math.random() * LANDING_IMAGES.length));
    }
    setImageIndices(initialIndices);

    let timeoutId: NodeJS.Timeout;

    const triggerNextUpdate = () => {
      setImageIndices(prev => {
        const next = new Set(prev);
        const randomIndex = Math.floor(Math.random() * LANDING_IMAGES.length);
        
        if (next.has(randomIndex)) {
          // Hide an image (back to color) - but keep at least 3 images visible
          if (next.size > 3) {
            next.delete(randomIndex);
          }
        } else {
          // Reveal an image - limit to 6 visible images for focus
          if (next.size >= 6) {
            const items = Array.from(next);
            next.delete(items[0]);
          }
          next.add(randomIndex);
        }
        return next;
      });

      // Randomize the next update between 2 and 6 seconds
      const nextDelay = Math.random() * 4000 + 2000;
      timeoutId = setTimeout(triggerNextUpdate, nextDelay);
    };

    // Kick off the first update after a short random delay
    timeoutId = setTimeout(triggerNextUpdate, Math.random() * 2000 + 3000);

    return () => clearTimeout(timeoutId);
  }, [isStatic]);

  return (
    <div 
      className="flex-1 bg-[#F7EFE5] rounded-xl mb-8 relative overflow-hidden min-h-[400px]"
      style={{
        maskImage: 'radial-gradient(circle at center, black 0%, black 100%)', // Fallback for some browsers
        WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.9) 100%)',
      }}
    >
      {/* Soft Aura Blobs for background texture */}
      {AURA_BLOBS.map((blob, i) => (
        <motion.div
          key={`blob-${i}`}
          className="absolute rounded-full blur-[60px] opacity-60"
          style={{
            backgroundColor: blob.color,
            top: blob.top,
            left: blob.left,
            width: blob.width,
            height: blob.height,
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -40, 40, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "linear",
            delay: -(i * 5),
          }}
        />
      ))}

      {/* Bobbling Images with Color Overlays */}
      {LANDING_IMAGES.map((img, i) => {
        const isRevealed = imageIndices.has(i);
        const color = cardColors[i] || ALL_THEME_COLORS[0];
        
        return (
          <motion.div
            key={`img-${i}`}
            className="absolute shadow-xl rounded-lg overflow-hidden"
            style={{
              top: img.top,
              left: img.left,
              width: img.width,
              zIndex: i + 1,
            }}
            animate={{
              // Bobbling animation
              x: [0, 6, -6, 0],
              y: [-4, 4, -4],
              rotate: [0, 0.4, -0.4, 0],
            }}
            transition={{
              // Desynchronized oscillations for bobbing
              x: {
                duration: img.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: -(i * 1.7) % img.duration,
              },
              y: {
                duration: img.duration * 1.3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: -(i * 2.3) % (img.duration * 1.3),
              },
              rotate: {
                duration: img.duration * 1.7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: -(i * 3.1) % (img.duration * 1.7),
              },
            }}
          >
            {/* The Image - Visible only when revealed and mounted (or if static) */}
            <motion.div
              style={{ opacity: isStatic ? 1 : 0 }} // Base starts at 1 so mask handles gradient
              animate={{ opacity: (isStatic || (isRevealed && isMounted)) ? 1 : 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <Image
                src={img.src}
                alt="Style preview"
                className="w-full h-auto object-cover"
                priority
              />
            </motion.div>

            {/* The Color Overlay - Hidden if revealed or if static */}
            <motion.div 
              className="absolute inset-0 w-full h-full"
              style={{ 
                backgroundColor: color,
                opacity: isStatic ? 0 : 0.2 // Start at 0 if static
              }}
              animate={{ opacity: (isStatic || (isRevealed && isMounted)) ? 0 : 0.2 }}
              transition={{ duration: 1.5, ease: "easeInOut" }} 
            />
          </motion.div>
        );
      })}
    </div>
  );
}

