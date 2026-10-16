import { hash } from "./palette";

/**
 * The backdrop behind the outfit: an organic blob rather than an oval.
 *
 * The outline is seeded from the pieces on the card, so it re-forms whenever the
 * fit changes and holds still otherwise. Seeded rather than random so the server
 * and the client render the same path. Every path has the same command
 * structure — one `C` per point — which is what lets CSS tween `d` between
 * shapes.
 */

const POINTS = 7;

/** mulberry32 — a tiny deterministic PRNG. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (value: number) => value.toFixed(2);

/** A closed, smooth blob in a 100×100 box. */
export function blobPath(seed: string) {
  const next = random(hash(seed));
  const points = Array.from({ length: POINTS }, (_, index) => {
    // Jitter stays under half a step, so neighbouring points never cross.
    const angle = ((index + (next() - 0.5) * 0.45) / POINTS) * Math.PI * 2;
    const radius = 50 * (0.74 + next() * 0.24);
    return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius] as const;
  });

  // Catmull-Rom through the points, written out as cubic Béziers.
  const at = (index: number) => points[(index + POINTS) % POINTS];
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let index = 0; index < POINTS; index++) {
    const [p0, p1, p2, p3] = [at(index - 1), at(index), at(index + 1), at(index + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}
