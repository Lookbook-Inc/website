import Image from "next/image";
import PhoneMockupGroup from "./components/PhoneMockupGroup";
import OutfitAnalyzer from "./components/OutfitAnalyzer";
import WaitlistForm from "./components/WaitlistForm";

export default function Home() {
  return (
    <>
      {/* Full-width Hero Section */}
      <section className="relative w-full h-[60vh] grid grid-cols-1 md:grid-cols-2">
        {/* Left Hero Image */}
        <div className="relative">
          <Image
            src="/images/hero-1.jpg"
            alt="Hero image 1"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Hero Image */}
        <div className="relative">
          <Image
            src="/images/hero-2.jpg"
            alt="Hero image 2"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Central Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-waitlist text-white drop-shadow-lg">
              Studio Maven Presents
            </p>
            <h1 className="text-6xl md:text-9xl font-display text-white drop-shadow-2xl mb-4">
              LOOKBOOK
            </h1>
            <p className="text-xl md:text-xl font-serif text-white drop-shadow-lg">
              AI powered, frictionless fashion
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="py-16">
        <div className="grid lg:grid-cols-2 items-start">
          {/* Left: Content Cards - Full width with left padding */}
          <div className="order-1 lg:order-1 pl-4 md:pl-8 lg:pl-16 space-y-8">
            {/* First Card */}
            <div className="bg-white/50 p-8 rounded-lg shadow-sm border border-white/20 animate-fly-in-left">
              <h2 className="text-3xl font-display mb-4 text-left">What do Lookbook do?</h2>
              <p className="text-gray-700 font-sans leading-relaxed text-left">
                Ever wanted a centralized place to organize and catalog your closet, your outfit photos, and your style?
                So have we. We&apos;re here to provide that for you.
              </p>
            </div>

            {/* Second Card */}
            <div className="bg-white/50 p-8 rounded-lg shadow-sm border border-white/20 animate-fly-in-left animate-delay-200">
              <h2 className="text-3xl font-display mb-4 text-left">How it works.</h2>
              <p className="text-gray-700 font-sans leading-relaxed text-left">
                Simply upload photos of your outfits. Our AI-powered system automatically categorizes
                and organizes everything, making it easy to discover new style combinations and track your fashion journey.
              </p>
            </div>

            {/* Third Card */}
            <div className="bg-white/50 p-8 rounded-lg shadow-sm border border-white/20 animate-fly-in-left animate-delay-400">
              <h2 className="text-3xl font-display mb-4 text-left">Why choose us?</h2>
              <p className="text-gray-700 font-sans leading-relaxed text-left">
                Unlike most shopping apps, we focus on your personal style evolution. We&apos;re not here to sell you clothes, we&apos;re here
                to actually understand your taste.
              </p>
            </div>
          </div>

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
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-6xl md:text-8xl font-waitlist mb-6 text-gray-800">
            WAITLIST
          </h2>
          <p className="text-lg md:text-xl font-sans text-gray-700 mb-8 max-w-2xl mx-auto">
            We&apos;re currently in beta testing with early users.
            Join our waitlist to become a part of this select group.
          </p>

          <WaitlistForm />
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
