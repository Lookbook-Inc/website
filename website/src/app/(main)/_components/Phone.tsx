'use client';

import Image from 'next/image';

interface PhoneProps {
  screenSrc: string;
  alt: string;
  position: {
    x: number; // pixels from left
    y: number; // pixels from top
    rotate: number; // rotation in degrees
    scale: number; // scale factor (1.0 = normal)
  };
  zIndex: number;
  delayClass: string; // CSS delay class
  depthBlur?: string; // CSS blur filter
  depthOpacity?: number; // Opacity for depth effect
}

export default function Phone({ screenSrc, alt, position, zIndex, delayClass, depthBlur = 'blur(0px)', depthOpacity = 1 }: PhoneProps) {
  return (
    <div
      className="absolute transition-all duration-1000 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `rotate(${position.rotate}deg) scale(${position.scale})`,
        zIndex,
        filter: depthBlur,
        opacity: depthOpacity,
      }}
    >
      {/* Phone Frame + Screen */}
      <div className={`relative w-72 h-[580px] animate-fly-in-right ${delayClass}`}>
        <Image
          src={screenSrc}
          alt={alt}
          fill
          className="object-contain drop-shadow-2xl"
          priority
        />
      </div>
    </div>
  );
}