import Link from 'next/link';

export default function WrappedLandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E7DCCA' }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* Hero Section */}
        <h1 className="text-7xl md:text-9xl font-display text-gray-800 mb-6">
          Lookbook Wrapped
        </h1>

        <p className="text-2xl md:text-3xl font-sans text-gray-700 mb-4">
          Your Fashion Year in Review
        </p>

        <p className="text-lg md:text-xl font-sans text-gray-600 mb-12 max-w-2xl mx-auto">
          Upload your photos and discover your unique style story.
          See your most-worn colors, favorite pieces, and fashion journey through 2024.
        </p>

        {/* CTA Button */}
        <Link
          href="/wrapped/login"
          className="inline-block bg-gray-800 text-white px-12 py-4 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans text-xl"
        >
          Get Started
        </Link>

        {/* Footer */}
        <div className="mt-16">
          <a
            href="/"
            className="text-sm font-sans text-gray-600 hover:text-gray-800 underline"
          >
            Back to Lookbook
          </a>
        </div>
      </div>
    </div>
  );
}
