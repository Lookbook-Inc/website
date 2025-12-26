'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<'name' | 'city'>('name');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/wrapped');
        return;
      }

      // Check if profile already has name/city
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, city')
        .eq('id', user.id)
        .single();

      if (profile?.first_name && profile?.city) {
        // Already completed setup, go to upload
        router.push('/wrapped/upload');
      }
    };
    checkAuth();
  }, [router, supabase]);

  const handleSaveProfile = async () => {
    if (!name.trim() || !city.trim()) return;
    setLoading(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Update profile with name and city
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: name.trim(),
          city: city.trim(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Move to upload page
      router.push('/wrapped/upload');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAF4' }}>
      <div className="w-full max-w-md mx-auto bg-[#FFFAF4] min-h-screen">
        {step === 'name' ? (
          <div className="flex flex-col h-[100dvh] p-4">
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
                <button
                  onClick={() => router.push('/wrapped')}
                  className="text-gray-400 text-xl mb-1 disabled:opacity-40 transition-opacity"
                >
                  ← back
                </button>

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
                  onClick={handleSaveProfile}
                  disabled={!city.trim() || loading}
                  className="text-gray-900 text-xl disabled:opacity-40 transition-opacity mb-1"
                >
                  {loading ? 'Saving...' : 'continue →'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
