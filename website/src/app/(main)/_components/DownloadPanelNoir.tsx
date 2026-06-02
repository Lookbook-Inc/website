"use client";

import posthog from "posthog-js";
import { motion } from "framer-motion";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/lookbook-your-style-anthology/id6762231832?itscg=30200&itsct=apps_box_badge&mttnsubad=6762231832";

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function DownloadPanelNoir() {
  return (
    <section id="waitlist" className="h-screen w-full snap-start snap-always p-2 md:p-4">
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-black flex items-center justify-center">

        {/* Film grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.055] mix-blend-screen"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "220px 220px" }}
        />

        {/* Repeating Lookbook text wallpaper */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="flex flex-col">
            {[0, -110, -40, -190, -75, -155, -20, -230, -95, -170, -50, -135, -10, -210, -65].map((offset, row) => (
              <div
                key={row}
                className="flex whitespace-nowrap"
                style={{ transform: `translateX(${offset}px)`, opacity: 0.05 }}
              >
                {Array.from({ length: 6 }).map((_, col) => (
                  <span
                    key={col}
                    className="font-bebas text-white text-[72px] md:text-[100px] lg:text-[150px] leading-[0.85] mr-4 md:mr-7 lg:mr-10"
                  >
                    Lookbook
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            viewport={{ once: true, margin: "-80px" }}
            className="font-mono text-white/50 tracking-[0.55em] text-sm md:text-lg uppercase mb-7"
       
          >
            Now Available
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            className="font-bebas text-white leading-[0.88] tracking-wide mb-8"
            style={{ fontSize: "clamp(72px, 14vw, 144px)" }}
          >
            On The<br />App Store
          </motion.h2>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.45 }}
            viewport={{ once: true, margin: "-80px" }}
            className="w-16 h-px bg-white/20 origin-center mb-8"
          />

          <motion.a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => posthog.capture("app_store_click", { source: "download_panel_noir" })}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            viewport={{ once: true, margin: "-80px" }}
            className="inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/white/en-us?releaseDate=1780012800"
              alt="Download on the App Store"
              width={200}
              height={67}
              className="md:w-[246px] md:h-[82px]"
            />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
