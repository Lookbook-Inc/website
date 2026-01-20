'use client';

import Image from 'next/image';
import { useState } from 'react';

interface PhotoCarouselProps {
  photos: string[];
  alt: string;
}

export default function PhotoCarousel({ photos, alt }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <div
      className="relative h-96 lg:h-[500px] cursor-pointer"
      onClick={handleClick}
    >
      {photos.map((photo, index) => {
        const isActive = index === currentIndex;
        const isNext = index === (currentIndex + 1) % photos.length;
        const isPrevious = index === (currentIndex - 1 + photos.length) % photos.length;

        let zIndex = 1;
        let scale = 0.9;
        let opacity = 0.3;
        let rotation = 2;
        let translateY = 10;
        let translateX = 5;

        if (isActive) {
          zIndex = 30;
          scale = 1;
          opacity = 1;
          rotation = 0;
          translateY = 0;
          translateX = 0;
        } else if (isNext) {
          zIndex = 20;
          scale = 0.95;
          opacity = 0.7;
          rotation = -1.5;
          translateY = 5;
          translateX = -3;
        } else if (isPrevious) {
          zIndex = 10;
          scale = 0.92;
          opacity = 0.5;
          rotation = 1;
          translateY = 8;
          translateX = 4;
        }

        return (
          <div
            key={index}
            className="absolute inset-0 transition-all duration-500 ease-out"
            style={{
              zIndex,
              transform: `
                scale(${scale})
                rotate(${rotation}deg)
                translateY(${translateY}px)
                translateX(${translateX}px)
              `,
              opacity,
            }}
          >
            <Image
              src={photo}
              alt={`${alt} - Photo ${index + 1}`}
              fill
              className="object-cover rounded-lg shadow-lg"
              priority={index === 0}
            />
          </div>
        );
      })}

      {/* Dots indicator */}
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {photos.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-gray-700 scale-125'
                : 'bg-gray-400 hover:bg-gray-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}