'use client';

import { useEffect, useRef, useState } from 'react';

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [status, setStatus] = useState<FormStatus>({
    type: 'idle',
    message: ''
  });
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setStatus({ type: 'loading', message: '' });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you! You\'ve been added to our waitlist.'
        });
        setEmail('');
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to join waitlist. Please try again.'
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please check your connection and try again.'
      });
    }
  };

  useEffect(() => {
    if (isRevealed) {
      // Focus the input once the field is revealed
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isRevealed]);

  return (
    <div className="max-w-md mx-auto md:mx-0">
      {/* Step 1: CTA button */}
      <button
        type="button"
        onClick={() => setIsRevealed(true)}
        className={`px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans flex items-center gap-2 ${
          isRevealed ? 'hidden' : 'inline-flex'
        }`}
        aria-expanded={isRevealed}
        aria-controls="waitlist-form-fields"
      >
        Join Waitlist
      </button>

      {/* Step 2: Revealable form */}
      <div
        id="waitlist-form-fields"
        className={`transition-all duration-300 ${
          isRevealed
            ? 'opacity-100 translate-y-0 max-h-[500px] mt-4'
            : 'opacity-0 -translate-y-1 max-h-0 overflow-hidden pointer-events-none'
        }`}
      >
        {/* Status Message */}
        {status.message && status.type !== 'loading' && (
          <div className={`p-4 rounded-md mb-4 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : status.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status.type === 'loading'}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={status.type === 'loading'}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {status.type === 'loading' ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Joining...
                </>
              ) : (
                'Join Waitlist'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}