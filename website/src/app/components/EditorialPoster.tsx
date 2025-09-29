export default function EditorialPoster() {
    return (
      <section
        className="
          mx-auto max-w-md w-full aspect-[4/5]
          relative p-6
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
          <span className="col-start-1 col-end-101 row-start-48 self-end
                           font-waitlist font-medium leading-[0.95] tracking-[-0.01em]
                           text-[21.7cqw] text-justify">
            outfit pictures
          </span>
  
          {/* Line 3 */}
          <span className="col-start-1 col-end-101 row-start-67 self-end
                           font-waitlist leading-[0.95]
                           text-[18.4cqw] text-justify">
            then we&apos;ve built
          </span>

          {/* Line 4 */}
          <span className="col-start-1 col-end-101 row-start-82 self-end
                           font-waitlist leading-[0.95]
                           text-[13.7cqw] text-justify">
            just the thing for you.
          </span>
  
          {/* Line 5 */}
          <span className="col-start-1 col-end-101 row-start-97 self-end
                           font-sans leading-[0.95]
                           text-lg">
            It&apos;s simple.
          </span>
  
          {/* Line 6 */}
          <span className="col-start-1 col-end-101 row-start-119 self-end
                           font-sans leading-[1.3]
                           text-lg">
            We help you organize your pictures the same way your Photos app does for your friends&apos;s faces. Effortlessly.
          </span>

        </div>
      </section>
    );
  }