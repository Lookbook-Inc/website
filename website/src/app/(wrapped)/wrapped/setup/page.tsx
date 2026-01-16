'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { usePostHog } from 'posthog-js/react';

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const posthog = usePostHog();

  const [step, setStep] = useState<'name' | 'city'>('name');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Check auth and load URL params on mount
  useEffect(() => {
    const checkAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const isDev = process.env.NODE_ENV === 'development';
      const isMock = isDev && params.get('mock') === 'true';

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !isMock) {
        router.push('/wrapped');
        return;
      }

      if (isMock && !user) {
        setEmail('test@example.com');
      } else if (user) {
        // Track setup page view
        if (posthog) {
          posthog.capture('wrapped_setup_viewed', {
            user_id: user.id,
            email: user.email
          });
        }
        setEmail(user.email || null);
      }

      // Load existing name/city from URL if present (e.g. when coming back from upload)
      const urlName = params.get('name');
      const urlCity = params.get('city');
      if (urlName) setName(urlName);
      if (urlCity) setCity(urlCity);
    };
    checkAuth();
  }, [router, supabase, posthog]);

  const handleContinue = () => {
    if (!name.trim() || !city.trim()) return;

    // Pass name and city to the upload page via query params
    const params = new URLSearchParams();
    params.append('name', name.trim());
    params.append('city', city.trim());
    
    router.push(`/wrapped/upload?${params.toString()}`);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/wrapped');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAF4' }}>
      <div className="w-full max-w-md mx-auto bg-[#FFFAF4] min-h-screen">
        {step === 'name' ? (
          <div className="flex flex-col h-[100dvh] p-4">
            <div className="px-6 pt-4">
              <button
                onClick={handleSignOut}
                className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
              >
                Use different email? {email && `(${email})`}
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center px-6">
              <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
                Welcome to Lookbook Wrapped.
              </h1>
              <p className="text-gray-500 text-md mb-8">
                What should we call you?
              </p>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full bg-[#F7EFE5] rounded-lg px-4 py-3 text-gray-900 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
              />
            </div>

            <div className="px-6 pb-6 mt-8">
              <div className="flex items-end justify-between font-display">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-xl mb-1">Lookbook</span>
                </div>

                <button
                  onClick={() => setStep('city')}
                  disabled={!name.trim()}
                  className="text-gray-900 text-xl disabled:opacity-40 transition-opacity mb-1"
                >
                  continue →
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[100dvh] p-4">
            <div className="px-6 pt-4">
              {/* Spacer for consistency with name step */}
              <div className="h-5" />
            </div>
            <div className="flex-1 flex flex-col justify-center px-6">
              <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
                Which city are you based in?
              </h1>
              <p className="text-gray-500 text-md mb-4">
                We only use this to help personalize your Lookbook Wrapped for 2025 :)
              </p>

              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-[#F7EFE5] rounded-lg px-4 py-3 text-gray-900 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
              />

              {error && (
                <p className="text-red-600 text-sm mt-4">{error}</p>
              )}
            </div>

            <div className="px-6 pb-6 mt-8">
              <div className="flex items-end justify-between font-display">
                <button
                  onClick={() => setStep('name')}
                  className="text-gray-400 text-xl mb-1 disabled:opacity-40 transition-opacity"
                >
                  ← back
                </button>

                <button
                  onClick={handleContinue}
                  disabled={!city.trim() || loading}
                  className="text-gray-900 text-xl disabled:opacity-40 transition-opacity mb-1"
                >
                  continue →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
