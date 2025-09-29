'use client';


export default function EditorialBlock() {
  const lines = [
    "If you take outfit photos then",
    "we've built just the thing for you.",
    "It's simple.",
    "We help you organize your pictures the same way your Photos app does people's faces.",
    "We tag and digitize your pieces without any effort on your part.",
  ];

  const sizes = [
    "text-[clamp(2rem,10vw,4rem)]", // biggest
    "text-[clamp(1.5rem,5vw,3rem)]",
    "text-[clamp(1.25rem,4vw,2.5rem)]",
    "text-[clamp(1.125rem,3.2vw,2rem)]",
    "text-[clamp(1rem,2.8vw,1.75rem)]", // smallest
  ];

  return (
    <section
      aria-label="Why Lookbook"
      className="mx-auto w-[38ch] md:w-[48ch] px-6"
    >
      {/* 
        Key bits:
        - [text-align:justify] + [text-align-last:justify] to square the block
        - after:* trick ensures last line justifies in browsers that ignore text-align-last
        - hyphens-auto reduces rivers when justifying
        - tight leading + subtle tracking for an editorial feel
      */}
      <div
        lang="en"
        className="
          font-serif leading-[1.05] tracking-[-0.01em]
          hyphens-auto
          [text-align:justify] [text-align-last:justify]
          after:content-[''] after:inline-block after:w-full
          text-neutral-900
          [word-spacing:-0.05em]
        "
      >
        {lines.map((t, i) => (
          <span
            key={i}
            className={[
              "block",
              sizes[i],
              i <= 1 ? "font-medium tracking-[-0.015em]" : "font-normal",
              i === 2 ? "italic" : "",
              i < lines.length - 1 ? "mb-1.5" : "",
            ].join(" ")}
          >
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}