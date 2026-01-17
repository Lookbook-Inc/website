import Image from "next/image";
import appIcon from "../../icon.png";
import WaitlistForm from "./WaitlistForm";

export function BetaPanel() {
  return (
    <section id="waitlist" className="h-screen w-full snap-start p-2 md:p-4">
      <div 
        className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: '#E7DCCA' }}
      >
        <div className="max-w-6xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-10">
            {/* Left: Logos */}
            <div className="relative flex justify-center md:order-1 md:col-span-3">
              <div className="relative w-[200px] h-[200px] md:w-[300px] md:h-[300px]">
                <div className="absolute bottom-0 left-0 w-[80%] h-[80%]">
                  <Image
                    src="/images/testflight-logo.webp"
                    alt="TestFlight logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="absolute top-0 right-0 w-[55%] h-[55%]">
                  <Image
                    src={appIcon}
                    alt="Lookbook app icon"
                    fill
                    className="object-contain rounded-2xl shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* Center: Copy + Form */}
            <div className="md:order-2 md:col-span-6 text-center flex flex-col items-center">
              <h2 className="text-6xl md:text-8xl font-waitlist mb-6 text-gray-800">
                OUR BETA
              </h2>
              <p className="text-lg md:text-xl font-sans text-gray-700 mb-8 max-w-2xl mx-auto">
                We&apos;re currently testing with early users on Apple&apos;s Testflight program.
                If you&apos;re interested in being a part of this select group, let us know below.
              </p>
              <WaitlistForm />
            </div>

            {/* Right: TestFlight Screen */}
            <div className="hidden md:flex justify-center md:order-3 md:col-span-3">
              <div className="relative w-[190px] h-[400px] rounded-[36px] overflow-hidden shadow-2xl border-4 border-black/10 bg-black">
                <Image
                  src="/images/testflight-screen.jpeg"
                  alt="Lookbook TestFlight screen"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
