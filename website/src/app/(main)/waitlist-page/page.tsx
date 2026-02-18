'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const displayedMessage =
    status.type === 'success' || status.type === 'error'
      ? status.message
      : "We'll be in touch.";
  const messageColor =
    status.type === 'success'
      ? 'text-green-700'
      : status.type === 'error'
        ? 'text-red-600'
        : 'text-gray-400';
  const isInitialMount = useRef(true);
  const messageInitial = isInitialMount.current
    ? { opacity: 0, y: 20 }
    : { opacity: 0, y: -5 };
  const messageTransition = isInitialMount.current
    ? { duration: 0.6, delay: 0.7 }
    : { duration: 0.3 };
  if (status.type !== 'idle') isInitialMount.current = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: '' });

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'website-waitlist-page' }),
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
    <div className="min-h-[100dvh] bg-[#f5f2ee] p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full h-[calc(100dvh-2rem)] md:h-[calc(100dvh-4rem)] border border-[#d5d0c9]"
      >
        {/* ===== MOBILE LAYOUT (< md) ===== */}
        <div className="md:hidden h-full grid grid-cols-2 grid-rows-[auto_1fr_auto] ">

          {/* Row 1, Col 1 — Logo */}
          <div className="border-r border-b border-[#d5d0c9] p-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image src="/LB-logo-dark.svg" alt="Lookbook" width={44} height={44} />
            </motion.div>
          </div>

          {/* Row 1, Col 2 — Empty */}
          <div className="border-b border-[#d5d0c9]" />

          {/* Row 2, Col 1-2 — Heading + Email form */}
          <div className="col-span-2 border-b border-[#d5d0c9] p-6 flex flex-col">
            <div>
              <h1 className="font-serif text-4xl text-gray-900 leading-tight mb-4">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="block"
                >
                  Get notified
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55 }}
                  className="block"
                >
                  when it&apos;s ready.
                </motion.span>
              </h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={displayedMessage}
                  initial={messageInitial}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={messageTransition}
                  className={`text-sm font-mono ${messageColor}`}
                >
                  {displayedMessage}
                </motion.p>
              </AnimatePresence>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="mt-6"
            >
              <div className="flex items-center border-b border-gray-900 pb-1">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status.type === 'loading' || status.type === 'success'}
                  className="flex-1 bg-transparent font-serif text-2xl text-gray-900 placeholder:text-gray-900 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status.type === 'loading' || status.type === 'success'}
                  className="text-gray-900 text-2xl hover:translate-x-1 transition-transform disabled:opacity-50 ml-2"
                >
                  &rsaquo;
                </button>
              </div>
            </motion.form>
          </div>

          {/* Row 3 — Nav links */}
          <div className="border-r border-[#d5d0c9] p-4 flex items-end">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="font-serif text-base text-gray-900"
            >
              <Link href="/"><strong>About</strong> <span className="text-[#c4b5a0]">Lookbook</span></Link>
            </motion.span>
          </div>
          <div className="p-4 flex flex-col justify-end gap-4">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="font-serif text-base text-gray-900"
            >
              <Link href="/about"><strong>Meet</strong> <span className="text-[#c4b5a0]">the Team</span></Link>
            </motion.span>
          </div>
        </div>

        {/* ===== DESKTOP LAYOUT (>= md) ===== */}
        <div className="hidden md:grid h-full grid-cols-[1fr_1.5fr_1.5fr_1fr] grid-rows-3">

          {/* Row 1, Col 1 — Logo */}
          <div className="border-r border-b border-[#d5d0c9] p-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Image src="/LB-logo-dark.svg" alt="Lookbook" width={60} height={60} />
            </motion.div>
          </div>

          {/* Row 1, Col 2 — Heading */}
          <div className="border-r border-b border-[#d5d0c9] p-6 flex items-end">
            <h1 className="font-serif text-3xl md:text-4xl text-gray-900 leading-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="block"
              >
                Get notified
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="block"
              >
                {/* when it&apos;s ready. */}
                when Lookbook drops.
              </motion.span>
            </h1>
          </div>

          {/* Row 1, Col 3 — Empty */}
          <div className="border-r border-b border-[#d5d0c9]" />

          {/* Row 1, Col 4 — About link */}
          <div className="border-b border-[#d5d0c9] p-6 flex items-end">
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="font-serif text-lg text-gray-900"
            >
              <Link href="/"><strong>About</strong> <span className="text-[#c4b5a0]">Lookbook</span></Link>
            </motion.span>
          </div>

          {/* Row 2, Col 1 — Empty */}
          <div className="border-r border-b border-[#d5d0c9]" />

          {/* Row 2, Col 2-3 — Email form area */}
          <div className="col-span-2 border-r border-b border-[#d5d0c9] p-6 flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.p
                key={displayedMessage}
                initial={messageInitial}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={messageTransition}
                className={`text-sm font-mono ${messageColor}`}
              >
                {displayedMessage}
              </motion.p>
            </AnimatePresence>

            <motion.form
              onSubmit={handleSubmit}
              className="max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <div className="flex items-center border-b border-gray-900 pb-1">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status.type === 'loading' || status.type === 'success'}
                  className="flex-1 bg-transparent font-serif text-2xl text-gray-900 placeholder:text-gray-900 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={status.type === 'loading' || status.type === 'success'}
                  className="text-gray-900 text-2xl hover:translate-x-1 transition-transform disabled:opacity-50 ml-2"
                >
                  &rsaquo;
                </button>
              </div>
            </motion.form>
          </div>

          {/* Row 2, Col 4 — Meet the Team link */}
          <div className="border-b border-[#d5d0c9] p-6 flex items-end">
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.85 }}
              className="font-serif text-lg text-gray-900"
            >
              <Link href="/about"><strong>Meet</strong> <span className="text-[#c4b5a0]">the Team</span></Link>
            </motion.span>
          </div>

          {/* Row 3, Col 1 — Empty */}
          <div className="border-r border-[#d5d0c9]" />

          {/* Row 3, Col 2 — Empty */}
          <div className="border-r border-[#d5d0c9]" />

          {/* Row 3, Col 3 — Empty */}
          <div className="border-r border-[#d5d0c9]" />

          {/* Row 3, Col 4 — Empty */}
          <div />
        </div>

      </motion.div>
    </div>
  );
}
