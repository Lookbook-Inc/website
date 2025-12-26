'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LandingCollage } from './_components/LandingCollage';

type Step = 'landing' | 'verify';

export default function WrappedWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>('landing');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev mode: Check URL params for direct step access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const devStep = params.get('step') as Step | null;
    if (devStep && (devStep === 'landing' || devStep === 'verify')) {
      setStep(devStep);
    }
  }, []);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is already authenticated, redirect to setup
        router.push('/wrapped/setup');
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  // --- Auth handlers ---
  const handleSendOTP = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setStep('verify');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;

      // Redirect to setup page
      router.push('/wrapped/setup');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Render helpers ---
  const renderLanding = () => (
    <div className="flex flex-col h-[100dvh] p-4 overflow-hidden">
      {/* for more animated landing page, remove isStatic. */}
      <LandingCollage isStatic className="w-full aspect-[9/16] max-h-[60vh] flex-1 min-h-0 mb-6" />

      <div className="px-6 pb-6 flex flex-col justify-between flex-1 min-h-0">
        <div>
          <p className="text-gray-400 font-mono tracking-tight uppercase text-sm mb-2">Dec 25 to Jan 14</p>
          <h1 className="font-display text-4xl text-gray-900 leading-[1.1] mb-6">
            Your 2025 Styles,<br />Wrapped.
          </h1>

          <div className="space-y-4 mb-8">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="What's your email?"
              className="w-full bg-[#F7EFE5] rounded-lg px-4 py-3 text-gray-900 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
              disabled={loading}
            />

            {error && (
              <p className="text-red-600 text-sm px-1">{error}</p>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between font-display pb-2">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-xl mb-1">Lookbook</span>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={loading || !email}
            className="text-gray-900 text-xl disabled:opacity-40 transition-opacity mb-1"
          >
            {loading ? 'Sending...' : 'enter →'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="flex flex-col h-[100dvh] p-4">
      <div className="flex-1 flex flex-col justify-center px-6">
        <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
          Check your email
        </h1>
        <p className="text-gray-500 text-md mb-8">
          It might be in your spam!
        </p>
        <p className="text-gray-500 text-md mb-8">
          We sent a 6-digit code to<br />
          <span className="text-gray-900 font-medium">{email}</span>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          maxLength={6}
          className="w-full bg-[#F7EFE5] rounded-lg px-4 py-4 text-gray-900 text-3xl tracking-[0.3em] text-center placeholder:text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all font-mono"
          disabled={loading}
        />

        {error && (
          <p className="text-red-600 text-sm mt-4">{error}</p>
        )}
      </div>

      <div className="px-6 pb-6 mt-8">
        <div className="flex items-end justify-between font-display">
          <button
            onClick={() => { setStep('landing'); setOtp(''); setError(null); }}
            className="text-gray-400 text-xl mb-1 disabled:opacity-40 transition-opacity"
            disabled={loading}
          >
            ← back
          </button>

          <button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="text-gray-900 text-xl disabled:opacity-40 transition-opacity mb-1"
          >
            {loading ? 'Verifying...' : 'continue →'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAF4' }}>
      <div className="w-full max-w-md mx-auto bg-[#FFFAF4] min-h-screen">
        {step === 'landing' && renderLanding()}
        {step === 'verify' && renderVerify()}
      </div>
    </div>
  );
}
