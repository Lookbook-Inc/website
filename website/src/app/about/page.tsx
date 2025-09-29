import { Metadata } from "next";
import Image from "next/image";
import PhotoCarousel from "../components/PhotoCarousel";

export const metadata: Metadata = {
  title: "About Us - Studio Maven",
  description: "Meet the team behind Studio Maven and learn about our journey.",
};

export default function About() {
  return (
    <>
      {/* Full-width Hero Section */}
      <section className="relative w-full h-[30vh] md:h-[60vh]">
        <div className="relative w-full h-full">
          <Image
            src="/images/SF.jpg"
            alt="San Francisco hero image"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Central Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            {/* <h1 className="text-6xl md:text-8xl font-display font-black text-white drop-shadow-2xl mb-4"> */}
            <h1 className="text-6xl md:text-9xl font-display text-white drop-shadow-2xl mix-blend-exclusion">
              ABOUT US
            </h1>
            {/* <p className="text-xl md:text-2xl font-serif text-white drop-shadow-lg">
              Two technical founders with a keen eye for the consumer
            </p> */}
          </div>
        </div>
      </section>

      <div className="py-16">
        <main>
        {/* Intro Blurb Section */}
        <div className="max-w-6xl mx-auto px-4 mb-20 text-center">
          {/* <p className="text-xl md:text-2xl font-serif text-gray-700 leading-relaxed mb-6">
            We're two technical founders with a keen eye for the consumer. Follow with us as we go about our journey!
          </p> */}
          <p className="text-lg font-sans text-gray-600 max-w-4xl mx-auto mb-6">
            Based in SF, we&apos;re two technical founders with liberal arts backgrounds and a keen eye for the consumer space. We want to build products that will
            revolutionize tech, fashion, and design.
          </p>
          <p className="text-lg font-sans text-gray-600 max-w-4xl mx-auto mb-6">
            We originally met through our college <a href="https://open.spotify.com/artist/0jXr3CLA2HMJ3E7rVoPqGY?si=uT3OY6ReSnK_yn_Bt6fPGg" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">a cappella group</a> (shoutout Mood Swing), and have since worked together professionally before launching into this app.
            We&apos;ve got a unique blend of technical depth and social insight that guides us to build true value for our users.
          </p>
        </div>

        {/* Person 1 */}
        <section className="max-w-7xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Left Text */}
            <div className="lg:pr-8">
              <h2 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-2">
                CO-FOUNDER
              </h2>
              <h3 className="text-2xl font-display mb-2">Avery Chen</h3>
              <h4 className="text-sm font-mono font-light text-gray-500 mb-6">
                Pomona College &apos;24
              </h4>
              <p className="text-gray-700 font-sans leading-relaxed mb-6">
              Avery is a full-stack engineer and product strategist passionate about designing applications that matter. 
              With industry experience ranging from big tech to pre-seed startups, 
              he blends technical depth, design sensibility, and product vision to deliver impactful solutions.
              With Lookbook, Avery works across the full stack and drives technical implementation.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-3">
                <a
                  href="https://linkedin.com/in/averyychen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-200 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://github.com/averyc88"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-900 rounded-full flex items-center justify-center transition-colors duration-200 group"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Center Image Carousel */}
            <div className="relative">
              <PhotoCarousel
                photos={[
                  "/images/team/avery/avery-1.JPG",
                  "/images/team/avery/avery-coding.jpg",
                  "/images/team/avery/avery-golf.jpg"
                ]}
                alt="Avery Chen - Co-Founder"
              />
            </div>

            {/* Right Text */}
            <div className="lg:pl-8">
              <p className="text-gray-700 font-sans leading-relaxed mb-6">
              A former collegiate golfer, Avery counts his successful athletic career among his proudest achievements. 
              These days, you&apos;ll find him staying active and competitve on the driving range or the basketball court.
              </p>
              <p className="text-gray-700 font-sans leading-relaxed mb-10">
              Alongside his passion for technology, Avery thrives on artistic and intellectual pursuits. 
              Don&apos;t be afraid to bother him for a thoughtful conversation—whether it&apos;s philosophy, politics, or a deep dive into music.
              </p>
            </div>
          </div>
        </section>

        {/* Person 2 */}
        <section className="max-w-7xl mx-auto px-4 mb-30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Left Text */}
            <div className="lg:pr-8">
              <h2 className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-2">
                CO-FOUNDER
              </h2>
              <h3 className="text-2xl font-display mb-2">Max Hui</h3>
              <h4 className="text-sm font-mono font-light text-gray-500 mb-6">
                Harvey Mudd College &apos;23
              </h4>
              <p className="text-gray-700 font-sans leading-relaxed mb-6">
                Max is a product engineer that dives deep into the technical, business, and human-centric aspects of product development.
                He&apos;s previously worked on ML research pipelines and led operational and business development teams at engineering firms.
              </p>
              <p className="text-gray-700 font-sans leading-relaxed mb-6">
                Having dealt with the hassle of managing his own outfit pictures for the past 5 years, Max recently realized the state of technology was at last
                ready to help address this problem.
                With Avery, he decided to create Lookbook, where he builds specific product features and oversees non-technical operations.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-3">
                <a
                  href="https://www.linkedin.com/in/mmax-hui/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-200 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200 group"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* <a
                  href="https://twitter.com/averyschen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-gray-200 hover:bg-gray-900 rounded-full flex items-center justify-center transition-colors duration-200 group"
                >
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors duration-200"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a> */}
              </div>
            </div>

            {/* Center Image Carousel */}
            <div className="relative">
              <PhotoCarousel
                photos={[
                  "/images/team/max/max-1.jpeg",
                  "/images/team/max/max-lookbook.jpg",
                  "/images/team/max/max-3.jpeg"
                ]}
                alt="Max Hui - Co-Founder"
              />
            </div>

            {/* Right Text */}
            <div className="lg:pl-8">
              <p className="text-gray-700 font-sans leading-relaxed mb-6">
                Max loves cars (and things that go vroom in general).
                Outside of his work, some of his favorite accomplishments stem from this—
                from pitching his concept car <a href="https://www.linkedin.com/in/mmax-hui/details/honors/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">design</a> to BMW&apos;s executive panel, to being awarded a <a href="https://uspto.report/patent/app/20200124442" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">patent</a> for an aviation heads-up-display interface at age 17.
              </p>
              <p className="text-gray-700 font-sans leading-relaxed mb-10">
                A couple things will always make Max&apos;s day—a good acai bowl, a song that hits just the right spot, or a sunset drive with the roof down.
              </p>
            </div>
          </div>
        </section>
        
        {/* <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm font-sans text-gray-400 max-w-4xl mx-auto">
            <em>Where's your fashion background?</em>
            <br />
            That&apos;s exactly the point— we're not "fashion people". Most users aren&apos;t, either. <br />
            Like us, they don&apos;t want to spend time manually inventorying their closet. <br />
            However, also like us, many people <em>do</em> already have outfit pictures that can do this for them. <br />
            We're delivering a zero-friction experience that even we would use.
          </p>
        </div> */}
        </main>
      </div>
    </>
  );
}