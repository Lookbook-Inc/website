'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';

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
        body: JSON.stringify({ email, source: 'website-main-page' }),
      });

      const data = await response.json();

      if (response.ok) {
        posthog.capture('waitlist_signup', { email, source: 'website-main-page' });
        setStatus({
          type: 'success',
          message: 'You\'re officially on the list. Stay tuned!.'
        });
        setEmail('');
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to join.'
        });
      }
    } catch {
      setStatus({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    }
  };

  useEffect(() => {
    if (isRevealed) {
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isRevealed]);

  return (
    <div className="relative flex flex-col items-center w-full">
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.button
            key="cta-button"
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 20 }}
            type="button"
            onClick={() => setIsRevealed(true)}
            className="px-10 py-4 bg-black text-white rounded-full hover:bg-zinc-900 transition-all duration-300 font-mono text-xs tracking-widest uppercase flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            I&apos;m interested!
          </motion.button>
        ) : (
          <motion.div
            key="reveal-form"
            initial={{ opacity: 0, width: 0, x: -20 }}
            animate={{ opacity: 1, width: "100%", x: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-lg"
          >
            {/* Status Message */}
            <AnimatePresence>
              {status.message && status.type !== 'loading' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-2xl mb-4 font-sans text-xs text-center backdrop-blur-md border ${
                    status.type === 'success'
                      ? 'bg-green-500/10 text-green-900 border-green-500/20'
                      : 'bg-red-500/10 text-red-900 border-red-500/20'
                  }`}
                >
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                ref={inputRef}
                type="email"
                placeholder="YOUR@EMAIL.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status.type === 'loading'}
                className="flex-1 px-6 py-4 rounded-full border border-black/10 bg-white/60 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-black/5 text-black placeholder:text-black/30 font-mono text-sm disabled:opacity-50 transition-all"
              />
              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="px-8 py-4 bg-black text-white rounded-full hover:bg-zinc-900 transition-all duration-300 font-mono text-xs tracking-widest uppercase disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:scale-105 active:scale-95"
              >
                {status.type === 'loading' ? '...' : 'Submit'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}