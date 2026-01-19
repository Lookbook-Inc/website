export default function EditorialPoster() {
    return (
      <section
        className="
          w-full
          relative px-6
          [container-type:inline-size]  /* enables cqw units inside */
          bg-transparent
          text-white
        "
        aria-label="Lookbook pitch"
      >
        {/* negative margin because we're starting row 10 */}
        <div className="grid grid-cols-100 grid-rows-100 w-full aspect-square mt-[-10%]">
          {/* Line 1 */}
          <span className="col-start-1 col-end-101 self-start row-end-10
                           font-waitlist
                           text-[28.0cqw] text-justify leading-none">
            If you take
          </span>

          {/* Line 2 */}
          <span className="col-start-1 col-end-101 row-start-68 self-end
                           font-waitlist text-[#D1BB99]
                           text-[29.9cqw] text-justify">
            outfit pics
          </span>
  
          {/* Line 3 */}
          <span className="col-start-1 col-end-101 row-start-83 self-end
                           font-waitlist
                           text-[18.4cqw] text-justify">
            then we&apos;ve built
          </span>

          {/* Line 4 */}
          <span className="col-start-1 col-end-101 row-start-99 self-end
                           font-waitlist
                           text-[17cqw] text-justify">
            the thing for you.
          </span>
        </div>
      </section>
    );
  }