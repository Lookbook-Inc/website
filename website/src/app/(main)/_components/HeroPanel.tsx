"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useMotionTemplate, animate } from "framer-motion";
import { useRef, useEffect } from "react";
import posthog from "posthog-js";

export function HeroPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Motion values for mouse position and spotlight size
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightSize = useMotionValue(0);

  // Smooth springs to make the movement feel "heavy" and premium
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 300 });

  useEffect(() => {
    // Set initial position to center
    if (typeof window !== "undefined") {
      mouseX.set(window.innerWidth / 2);
      mouseY.set(window.innerHeight / 2);
    }

    // Animate spotlight size in with the background fade
    animate(spotlightSize, 600, { 
      duration: 1.5, 
      delay: 0.4, 
      ease: [0.23, 1, 0.32, 1] // Custom easeOutQuint for a smoother reveal
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, spotlightSize]);

  // Create the radial mask string using the animated spotlightSize
  const maskImage = useMotionTemplate`radial-gradient(${spotlightSize}px circle at ${smoothX}px ${smoothY}px, black 0%, rgba(0,0,0,0.9) 10%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.1) 70%, transparent 100%)`;

  return (
    <section className="h-screen w-full snap-start snap-always p-2 md:p-4">
      <div 
        ref={containerRef}
        className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-zinc-950"
      >
        {/* Layer 1: Blurred Background (Initial Fade-in) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
          className="relative h-full w-full"
        >
          <Image
            src="/images/grey-girl.jpg"
            alt="Hero image blurred"
            fill
            className="object-cover blur-md scale-105 opacity-50"
            priority
          />
        </motion.div>
        
        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0, ease: "easeOut" }}
          className="absolute inset-0 pointer-events-none z-20"
        >
          {/* Top Left: Style Snapshot */}
          <div className="absolute top-6 md:top-10 left-6 md:left-10 pointer-events-auto">
            <Link
              href="/snapshot/"
              className="text-zinc-200 hover:text-zinc-600 font-mono text-xs md:text-sm tracking-[0.2em] uppercase transition-colors"
            >
              Style Snapshot
            </Link>
          </div>

          {/* Top Right: Get the App */}
          <div className="absolute top-6 md:top-10 right-6 md:right-10 pointer-events-auto">
            <Link
              href="#waitlist"
              className="text-zinc-400 hover:text-zinc-200 font-mono text-xs md:text-sm tracking-[0.2em] uppercase transition-colors"
            >
              Get the App
            </Link>
          </div>

          {/* Bottom Left: About */}
          <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 pointer-events-auto">
            <Link 
              href="/about/" 
              className="text-zinc-400 hover:text-zinc-200 font-mono text-xs md:text-sm tracking-[0.2em] uppercase transition-colors"
            >
              About
            </Link>
          </div>
        </motion.div>

        {/* Layer 2: Sharp Image (Revealed by Mouse) */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ 
            WebkitMaskImage: maskImage,
            maskImage: maskImage 
          }}
        >
          <Image
            src="/images/grey-girl.jpg"
            alt="Hero image sharp"
            fill
            className="object-cover blur-xs"
            priority
          />
        </motion.div>

        {/* Central Text Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none md:bg-black/20">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <h1 className="text-6xl md:text-[12cqw] font-display text-zinc-200 mix-blend-difference">
              Lookbook
            </h1>
            <p className="text-xl md:text-4xl font-mono font-thin text-white drop-shadow-lg">
              Your Style Anthology
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[9rem] md:translate-y-[12rem] pointer-events-auto md:hidden"
          >
            <a
              href="https://apps.apple.com/us/app/lookbook-your-style-anthology/id6762231832?itscg=30200&itsct=apps_box_badge&mttnsubad=6762231832"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => posthog.capture("app_store_click", { source: "hero" })}
              className="hover:scale-105 active:scale-95 transition-transform duration-200 inline-block drop-shadow-2xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1780012800"
                alt="Download on the App Store"
                width={155}
                height={52}
                className="w-[155px] h-auto"
              />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
