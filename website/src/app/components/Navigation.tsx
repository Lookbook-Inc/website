import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="w-full bg-background shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-display font-normal">
            Studio Maven
          </Link>
          <div className="flex space-x-8">
            {/* <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors font-sans"
            >
              Home
            </Link> */}
            <Link
              href="/about"
              className="text-gray-700 hover:text-gray-900 transition-colors font-sans"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-gray-900 transition-colors font-sans"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}