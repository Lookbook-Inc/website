export default function EditorialPoster() {
    return (
      <section
        className="
          mx-auto max-w-sm w-full aspect-[4/5]
          relative px-6
          [container-type:inline-size]  /* enables cqw units inside */
          bg-transparent text-neutral-900
        "
        aria-label="Lookbook pitch"
      >
        <div className="grid grid-cols-100 grid-rows-125 h-full">
          {/* Line 1 */}
          <span className="col-start-1 col-end-101 self-start row-end-2
                           font-waitlist font-medium leading-[0.95] tracking-[-0.01em]
                           text-[29cqw] text-justify">
            If you take
          </span>

          {/* Line 2 */}
          <span className="col-start-1 col-end-101 row-start-42 self-end
                           font-waitlist font-medium leading-[0.95] tracking-[-0.01em]
                           text-[21.7cqw] text-justify">
            outfit pictures
          </span>
  
          {/* Line 3 */}
          <span className="col-start-1 col-end-101 row-start-58 self-end
                           font-waitlist leading-[0.95]
                           text-[18.4cqw] text-justify">
            then we&apos;ve built
          </span>

          {/* Line 4 */}
          <span className="col-start-1 col-end-101 row-start-72 self-end
                           font-waitlist leading-[0.95]
                           text-[13.7cqw] text-justify">
            just the thing for you.
          </span>
  
          {/* Combined Lines 5-6 */}
          <div className="col-start-1 col-end-101 self-start row-end-85
                           font-sans leading-[1.2]
                           text-lg space-y-5">
            <p>It&apos;s simple.</p>
            <p>We organize your outfit pics the same way Photos organizes faces.</p>
            <p>No manual tagging, no extra steps.</p>
            <p>Over time, we&apos;ll help you build a library of the clothes you wear.</p>
          </div>

        </div>
      </section>
    );
  }