'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

interface Position {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
}

interface PhoneProps {
  screenSrc: string;
  alt: string;
  position: Position;
  zIndex: number;
  index: number;
  depthBlur?: string;
  depthOpacity?: number;
  onClick?: () => void;
  isExpanded?: boolean;
}

export default function Phone({ 
  screenSrc, 
  alt, 
  position, 
  zIndex, 
  index,
  depthBlur = 'blur(0px)', 
  depthOpacity = 1,
  onClick,
  isExpanded = false
}: PhoneProps) {
  return (
    <motion.div
      animate={{
        x: position.x,
        y: position.y,
        rotate: position.rotate,
        scale: position.scale,
        opacity: depthOpacity,
        zIndex: zIndex,
      }}
      transition={{
        type: "spring",
        stiffness: 150, // Slightly snappier but still smooth
        damping: 28,
        mass: 1,
      }}
      style={{
        position: 'absolute',
        left: '50%',
        translateX: '-50%',
        filter: depthBlur, // Move filter here to avoid costly interpolation during spring animation
        willChange: 'transform', // Hint to browser to use GPU
      }}
      onClick={onClick}
      className={`cursor-pointer origin-center ${isExpanded ? 'z-[100]' : ''}`}
      whileHover={!isExpanded ? { 
        scale: position.scale * 1.05,
        y: position.y - 15,
        transition: { duration: 0.2, type: "tween" } 
      } : {}}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative w-72 h-[580px]">
        <Image
          src={screenSrc}
          alt={alt}
          fill
          className={`object-contain transition-all duration-700 ${
            isExpanded ? 'drop-shadow-[0_40px_80px_rgba(0,0,0,0.4)]' : 'drop-shadow-2xl'
          }`}
          priority
        />
      </div>
    </motion.div>
  );
}
