import Image from "next/image";

export function SocialPanel() {
  return (
    <section className="h-screen w-full snap-start p-2 md:p-4">
      <div 
        className="relative h-full w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-y-auto flex flex-col items-center justify-center p-8 md:p-12"
        style={{ backgroundColor: '#BACAC0' }}
      >
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {[
              { src: "/images/post-previews/max-and-avery.jpg", alt: "Max and Avery" },
              { src: "/images/post-previews/pen-flipping.jpg", alt: "Pen flipping" },
              { src: "/images/post-previews/running-app.jpg", alt: "Running app" },
              { src: "/images/post-previews/sf-fits.jpg", alt: "SF fits" },
              { src: "/images/post-previews/silver-lining.jpg", alt: "Silver lining" },
              { src: "/images/post-previews/the-interval.jpg", alt: "The interval" },
            ].map((img, i) => (
              <div key={i} className="aspect-square bg-white rounded-xl shadow-sm overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
