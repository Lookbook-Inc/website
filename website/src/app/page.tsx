import Image from "next/image";
import appIcon from "./icon.png";
import PhoneMockupGroup from "./components/PhoneMockupGroup";
import OutfitAnalyzer from "./components/OutfitAnalyzer";
import WaitlistForm from "./components/WaitlistForm";
// import EditorialBlock from "./components/EditorialBlock";
import EditorialPoster from "./components/EditorialPoster";

export default function Home() {
  return (
    <>
      {/* Full-width Hero Section */}
      <section className="relative w-full h-[30vh] md:h-[60vh] grid grid-cols-3">
        {/* Images */}
        <div className="relative">
          <Image src="/images/man-tunnel.avif" alt="Hero image 1" fill className="object-cover" priority />
        </div>
        <div className="relative">
          <Image src="/images/grey-girl.jpg" alt="Hero image 2" fill className="object-cover" priority />
        </div>
        <div className="relative">
          <Image src="/images/green-girl.jpg" alt="Hero image 3" fill className="object-cover" priority />
        </div>

        {/* Central Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <p className="text-xl md:text-4xl font-waitlist text-white drop-shadow-lg md:mb-4">
              Studio Maven Presents
            </p>
            <h1 className="text-6xl md:text-[10cqw] font-display text-white drop-shadow-2xl mix-blend-exclusion">
              Lookbook
            </h1>
            <p className="text-xl md:text-4xl font-mono font-thin text-white drop-shadow-lg">
              Your Style Anthology
            </p>
          </div>
        </div>
      </section>


      {/* Content Section */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 items-center gap-12">
          {/* Left: Content Cards - Full width with left padding */}
          <EditorialPoster />


          {/* Right: Phone Mockup - I added manual right margin padding to try and center it cause i could not figure out
          why it was not centering and i wanted to break my computer but its fine its fine */}
          <div className="order-2 lg:order-2 flex justify-center">
            <div className="relative h-[500px] lg:h-[600px] flex items-center justify-center mr-70 lg:mr-50">
              <PhoneMockupGroup />
            </div>
          </div>
        </div>
      </div>

      {/* AI Outfit Analyzer Section */}
      <OutfitAnalyzer />

      {/* Waitlist Section */}
      <section className="w-full py-20" style={{ backgroundColor: '#E7DCCA' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
            {/* Left: Logos (diagonal layout) */}
            <div className="relative flex justify-center md:justify-start">
              <div className="relative w-[240px] h-[240px] md:w-[300px] md:h-[300px]">
                <div className="absolute bottom-0 left-0 w-[65%] h-[65%]">
                  <Image
                    src="/images/testflight-logo.webp"
                    alt="TestFlight logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className="absolute top-0 right-0 w-[55%] h-[55%]">
                  <Image
                    src={appIcon}
                    alt="Lookbook app icon"
                    fill
                    className="object-contain rounded-2xl shadow-md"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Right: Copy + Form */}
            <div>
              <h2 className="text-6xl md:text-8xl font-waitlist mb-6 text-gray-800">
                OUR BETA
              </h2>
              <p className="text-lg md:text-xl font-sans text-gray-700 mb-8 max-w-2xl">
                We&apos;re currently testing with early users on Apple's Testflight program.
                If you're interested in being a part of this select group, sign up below.
              </p>

              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="w-full py-20" style={{ backgroundColor: '#BACAC0' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-display mb-4 text-gray-800">
            Follow Our Journey
          </h2>
          <p className="text-lg md:text-xl font-sans text-gray-700 mb-8 max-w-2xl mx-auto">
            Get behind-the-scenes content, early previews of new features, and general life updates!
          </p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-6 mb-12">
            <a
              href="https://tiktok.com/@max.shoots.avery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-white rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="font-sans font-medium text-gray-800">TikTok</span>
            </a>
            <a
              href="https://instagram.com/max.shoots.avery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-white rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
                <path d="m16 11.37-4-4.24-4 4.24" stroke="none"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
              </svg>
              <span className="font-sans font-medium text-gray-800">Instagram</span>
            </a>
          </div>

          {/* Image Preview Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src="/images/post-previews/max-and-avery.jpg"
                alt="Max and Avery"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src="/images/post-previews/pen-flipping.jpg"
                alt="Pen flipping"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src="/images/post-previews/running-app.jpg"
                alt="Running app"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden">
              <Image
                src="/images/post-previews/sf-fits.jpg"
                alt="SF fits"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden hidden md:block">
              <Image
                src="/images/post-previews/silver-lining.jpg"
                alt="Silver lining"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="aspect-square bg-white rounded-lg shadow-sm overflow-hidden hidden lg:block">
              <Image
                src="/images/post-previews/the-interval.jpg"
                alt="The interval"
                width={200}
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
