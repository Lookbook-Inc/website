'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LandingCollage } from './_components/LandingCollage';
import { usePostHog } from 'posthog-js/react';
import { getWrappedInsights, getAuthToken } from '@/lib/api/wrapped';
import { BackendWrappedInsights } from '@/types/wrapped-api';

type Step = 'landing' | 'verify' | 'exists';

export default function WrappedWizard() {
  const router = useRouter();
  const supabase = createClient();
  const posthog = usePostHog();

  const [step, setStep] = useState<Step>('landing');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<BackendWrappedInsights | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Dev mode: Check URL params for direct step access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const devStep = params.get('step') as Step | null;
    if (devStep && (devStep === 'landing' || devStep === 'verify' || devStep === 'exists')) {
      setStep(devStep);
    }
  }, []);

  // --- Auth & Navigation logic ---
  const handlePostAuthRedirect = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken(supabase);
      if (!token) {
        router.push('/wrapped/setup');
        return;
      }

      const userInsights = await getWrappedInsights(token);
      setInsights(userInsights);

      // If they have any status other than not_started, show them the "exists" step
      // so they can choose to see results, check progress, or start over.
      if (userInsights.status !== 'not_started') {
        setStep('exists');
      } else {
        router.push('/wrapped/setup');
      }
    } catch (err) {
      console.error('Error checking insights status:', err);
      // On error, just go to setup as default
      router.push('/wrapped/setup');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsInitialLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Populate email from user object if available
          if (user.email) setEmail(user.email);
          // User is already authenticated, check if they have results
          await handlePostAuthRedirect();
        }
      } finally {
        setIsInitialLoading(false);
      }
    };
    checkAuth();
  }, [router, supabase.auth]);

  // Track landing page view
  useEffect(() => {
    if (posthog) {
      posthog.capture('wrapped_landing_viewed');
    }
  }, [posthog]);

  // --- Auth handlers ---
  const handleSendOTP = async () => {
    if (!email) return;

    // Track email submission
    posthog?.capture('wrapped_email_submitted', { email });

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      // Track OTP sent successfully
      posthog?.capture('wrapped_otp_sent', { email });

      setStep('verify');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification code';

      // Track OTP send failure
      posthog?.capture('wrapped_otp_failed', {
        email,
        error_type: 'send_failed',
        error_message: message
      });

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

      // Get authenticated user and identify in PostHog
      const { data: { user } } = await supabase.auth.getUser();
      if (user && posthog) {
        // Identify user in PostHog
        posthog.identify(user.id, {
          email: user.email
        });

        // Track successful OTP verification
        posthog.capture('wrapped_otp_verified', {
          user_id: user.id,
          email: user.email
        });
      }

      // Check for existing results instead of direct redirect
      await handlePostAuthRedirect();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';

      // Track verification failure
      posthog?.capture('wrapped_otp_verification_failed', {
        email,
        error_type: 'invalid_code',
        error_message: message
      });

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
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isInitialLoading ? "Loading session..." : "What's your email?"}
                className="w-full bg-[#F7EFE5] rounded-lg px-4 py-3 text-gray-900 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
                disabled={loading || isInitialLoading}
              />
              {isInitialLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>

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
            disabled={loading || isInitialLoading || !email}
            className="text-gray-900 text-xl disabled:opacity-40 transition-opacity mb-1"
          >
            {loading ? 'Sending...' : isInitialLoading ? 'Checking...' : 'enter →'}
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

  const renderExists = () => (
    <div className="flex flex-col h-[100dvh] p-4">
      <div className="flex-1 flex flex-col justify-center px-6">
        <h1 className="font-display text-4xl text-gray-900 leading-[1.1] mb-6">
          Welcome back{insights?.user_first_name ? `, ${insights.user_first_name}` : ''}!
        </h1>
        
        {insights?.status === 'completed' ? (
          <>
            <p className="text-gray-500 text-md mb-8">
              Your Lookbook Wrapped results are ready for you to view.
            </p>
            <button
              onClick={() => router.push(`/wrapped/results/${insights.share_code}`)}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-4 text-xl font-display transition-all hover:bg-gray-800 mb-4"
            >
              see your results →
            </button>
          </>
        ) : insights?.status === 'processing' || insights?.status === 'pending' ? (
          <>
            <p className="text-gray-500 text-md mb-8">
              We&apos;re still analyzing your style profile. We&apos;ll email you when it&apos;s ready!
            </p>
            <button
              onClick={() => router.push('/wrapped/processing')}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-4 text-xl font-display transition-all hover:bg-gray-800 mb-4"
            >
              check progress →
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-md mb-8">
              Welcome back! Ready to continue your style journey?
            </p>
            <button
              onClick={() => router.push('/wrapped/setup')}
              className="w-full bg-gray-900 text-white rounded-lg px-4 py-4 text-xl font-display transition-all hover:bg-gray-800 mb-4"
            >
              continue →
            </button>
          </>
        )}

        <div className="space-y-4 mt-8">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setStep('landing');
              setInsights(null);
              setEmail('');
              setOtp('');
            }}
            className="w-full text-gray-400 text-sm hover:text-gray-600 transition-colors underline underline-offset-4"
          >
            Try again with a different email
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
        {step === 'exists' && renderExists()}
      </div>
    </div>
  );
}
