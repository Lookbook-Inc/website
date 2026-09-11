import { SHAPES } from "@/components/aura/garments";

/**
 * The sync screen. This is the honest version of the mockup's fake progress
 * bar: it's the real Suspense fallback while the wardrobe and home summary load.
 */
const TILES: { shape: keyof typeof SHAPES | string; color: string }[] = [
  { shape: "coat", color: "#2B2B2F" }, { shape: "shirt", color: "#23324F" },
  { shape: "pants", color: "#6E86A8" }, { shape: "sneaker", color: "#F4F1EC" },
  { shape: "dress", color: "#9BAA90" }, { shape: "cap", color: "#1D2A44" },
  { shape: "bag", color: "#232022" }, { shape: "skirt", color: "#7994BC" },
  { shape: "jacket", color: "#5E6543" }, { shape: "tank", color: "#EDE4D7" },
  { shape: "heel", color: "#C09A6E" }, { shape: "tote", color: "#D8BC8C" },
  { shape: "gown", color: "#1B1A1D" }, { shape: "flat", color: "#211F1E" },
];

export default function Loading() {
  return (
    <div className="sync-screen" aria-busy="true" aria-label="Loading your Lookbook">
      <div>
        <p className="eyebrow">Lookbook</p>
        <h2 className="sync-h">Making today&rsquo;s edit</h2>
        <div className="sync-bar"><i /></div>
        <div className="sync-log">Pulling your wardrobe&hellip;</div>
        <div className="sync-tiles">
          {TILES.map((tile, index) => (
            <div
              className="st"
              key={`${tile.shape}-${index}`}
              style={{ animationDelay: `${index * 55}ms` }}
            >
              <svg
                viewBox="0 0 100 120"
                aria-hidden="true"
                width="26"
                height="32"
                dangerouslySetInnerHTML={{ __html: (SHAPES[tile.shape] ?? SHAPES.shirt)(tile.color) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
