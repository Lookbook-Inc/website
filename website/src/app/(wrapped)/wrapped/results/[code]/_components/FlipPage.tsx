'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FlipPageProps {
  isFlipped: boolean;
  children: ReactNode;
  zIndex?: number;
  duration?: number;
  className?: string;
}

export function FlipPage({ 
  isFlipped, 
  children, 
  zIndex = 10,
  duration = 0.5,
  className = '',
}: FlipPageProps) {
  return (
    <motion.div
      className={`absolute inset-0 bg-[#FFFAF4] origin-left ${className}`}
      style={{ zIndex, transformStyle: 'preserve-3d' }}
      initial={false}
      animate={{ rotateY: isFlipped ? -180 : 0 }}
      transition={{ duration, ease: [0.1, 0, 0.4, 0.2] }}
    >
      {/* Front of page */}
      <div 
        className="absolute inset-0 bg-[#FFFAF4]"
        style={{ backfaceVisibility: 'hidden' }}
      >
        {children}
        {/* Spine shadow for depth - only visible during flip */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none"
          style={{ opacity: isFlipped ? 1 : 0, transition: `opacity ${duration * 0.5}s` }}
        />
        {/* Subtle surface gradient - only visible during flip */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/5 pointer-events-none"
          style={{ opacity: isFlipped ? 1 : 0, transition: `opacity ${duration * 0.5}s` }}
        />
      </div>
      
      {/* Page edge - positioned off-screen, visible during flip */}
      <div 
        className="absolute top-0 bottom-0 w-1 pointer-events-none"
        style={{ 
          right: -12, // Position just past the right edge
          background: '#d1bb99',
          boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.1)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      {/* Back of page */}
      <div 
        className="absolute inset-0 bg-[#F5EDE3]"
        style={{ 
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}
      >
        {/* Spine shadow on back */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/15 to-transparent pointer-events-none"
          style={{ opacity: isFlipped ? 1 : 0, transition: `opacity ${duration * 0.5}s` }}
        />
      </div>
    </motion.div>
  );
}
