"use client";

import { useEffect, useRef } from "react";

/**
 * The blob-gradient painter from the mockup, used for album and place art.
 * Static by default — `animate` is only worth it for a hero-sized canvas.
 */
export function GradientArt({
  colors,
  seed,
  animate = false,
  className,
}: {
  colors: string[];
  seed: number;
  animate?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const key = colors.join(",");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const list = key.split(",");
    const n = list.length;
    const blobs = list.map((c, i) => {
      const ang = (i / n) * Math.PI * 2 + (seed % 628) / 100;
      const rad = 0.3 + ((seed >> (i * 3)) % 16) / 100;
      return {
        c,
        ax: 0.5 + Math.cos(ang) * rad,
        ay: 0.5 + Math.sin(ang) * rad * 1.1,
        r: 0.34 + ((seed >> (i * 5 + 2)) % 20) / 100,
        ph: ((seed >> (i * 2)) % 628) / 100,
        sp: 0.16 + (i % 3) * 0.08,
      };
    });

    let raf = 0;
    const moving = animate && !reduce;

    const frame = (t: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth || 60;
      const h = canvas.clientHeight || 60;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = list[list.length - 1];
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.85;

      const tt = moving ? t / 1000 : 0;
      for (const b of blobs) {
        const x = (b.ax + Math.sin(tt * b.sp + b.ph) * 0.09) * w;
        const y = (b.ay + Math.cos(tt * b.sp * 0.8 + b.ph) * 0.09) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, b.c);
        g.addColorStop(0.45, `${b.c}88`);
        g.addColorStop(1, `${b.c}00`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      const vg = ctx.createRadialGradient(
        w / 2, h / 2, Math.min(w, h) * 0.2,
        w / 2, h / 2, Math.max(w, h) * 0.8,
      );
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(8,7,6,.5)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      if (moving) raf = requestAnimationFrame(frame);
    };

    frame(0);
    return () => cancelAnimationFrame(raf);
  }, [key, seed, animate]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
