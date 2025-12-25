'use client';

export default function AuthConfirmPage() {
  // const searchParams = useSearchParams();
  // const router = useRouter();

  // useEffect(() => {
  //   // Get token_hash and type from URL parameters
  //   const tokenHash = searchParams.get('token_hash');
  //   const type = searchParams.get('type');

  //   // Check if required parameters exist
  //   if (!tokenHash || !type) {
  //     // No valid token, redirect to home
  //     router.push('/');
  //   }
  // }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E7DCCA' }}>
      <div className="max-w-2xl mx-auto px-4 text-center">
        {/* Success Icon */}
        {/* <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div> */}

        {/* Main Message */}
        <h1 className="text-6xl md:text-8xl font-display text-gray-800 mb-6">
          Confirmed!
        </h1>

        <p className="text-xl md:text-2xl font-sans text-gray-700 mb-8">
          You can now log in to the Lookbook app.
        </p>

        {/* <p className="text-lg font-sans text-gray-600 mb-12">
          Thank you for confirming your email address. We&apos;ll be in touch soon with updates about Lookbook.
        </p> */}

        {/* Go to Website Button */}
        {/* <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans text-lg"
        >
          Go to Website
        </a> */}
      </div>
    </div>
  );
}
