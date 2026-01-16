import EditorialPoster from "./EditorialPoster";
import PhoneMockupGroup from "./PhoneMockupGroup";

export function PitchPanel() {
  return (
    <section className="h-screen w-full snap-start p-2 md:p-4">
      <div className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-background border border-black/5 flex items-center justify-center">
        <div className="max-w-6xl w-full mx-auto px-4 grid lg:grid-cols-2 items-center gap-12">
          {/* Left: Editorial Poster */}
          <div className="px-4 md:px-8">
            <EditorialPoster />
          </div>

          {/* Right: Phone Mockup */}
          <div className="flex justify-center">
            <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center">
              <PhoneMockupGroup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
