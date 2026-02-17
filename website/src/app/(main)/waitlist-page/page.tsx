'use client';

import { useState } from 'react';
import posthog from 'posthog-js';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        posthog.capture('waitlist_signup', { email, source: 'website-waitlist-page' });
        setStatus({
          type: 'success',
          message: "You're officially on the list. Stay tuned!",
        });
        setEmail('');
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Something went wrong.',
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-display text-5xl md:text-6xl text-gray-900 mb-4">
          Lookbook
        </h1>
        <p className="text-gray-500 font-mono text-sm tracking-wide uppercase mb-10">
          Join the waitlist
        </p>

        {status.type === 'success' ? (
          <p className="text-green-700 font-mono text-sm">{status.message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status.type === 'loading'}
              className="w-full px-5 py-4 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder:text-gray-400 font-mono text-sm disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="w-full px-5 py-4 bg-gray-900 text-white rounded-full font-mono text-sm tracking-wide uppercase hover:bg-black transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {status.type === 'loading' ? '...' : 'Sign Up'}
            </button>

            {status.type === 'error' && (
              <p className="text-red-600 font-mono text-xs mt-1">
                {status.message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
