'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';

type Step = 'name' | 'email' | 'success';

const slideVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

const slideTransition = { duration: 0.4, ease: [0.23, 1, 0.32, 1] as const };

export default function EarlyAccessPage() {
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => nameRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (step === 'email') {
      const frame = requestAnimationFrame(() => emailRef.current?.focus());
      return () => cancelAnimationFrame(frame);
    }
  }, [step]);

  const handleNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep('email');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'beta-round-2' }),
      });

      const data = await response.json();

      if (response.ok) {
        posthog.capture('early_access_signup', { email, name, source: 'beta-round-2' });
        setStep('success');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = name.split(' ')[0];

  return (
    <div className="min-h-[100dvh] bg-[#f5f2ee] p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full h-[calc(100dvh-2rem)] md:h-[calc(100dvh-4rem)] border border-[#d5d0c9] overflow-hidden flex flex-col md:flex-row"
      >

        {/* ===== LEFT PANEL — Brand Manifesto ===== */}
        <div className="hidden md:flex md:w-[55%] flex-col bg-[#0A0A0A] text-white relative overflow-hidden">

          {/* Subtle grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '128px',
            }}
          />

          {/* Top-left logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-[80px] flex items-center px-8 border-b border-white/10 shrink-0"
          >
            <Image src="/LB-logo-light.svg" alt="Lookbook" width={44} height={44} />
          </motion.div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-between p-10 lg:p-14">
            <div>
              <motion.p
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="font-mono text-xs tracking-[0.25em] uppercase text-white/40 mb-4 lg:mt-4 xl:mt-10"
              >
                Early Access
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: [0.23, 1, 0.32, 1] }}
                className="font-serif text-4xl lg:text-5xl xl:text-6xl leading-[1.1] text-white/90 mb-8"
              >
                Pinterest &times;
                <span className=" text-[#c4b5a0]"> your <br />camera roll.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-white/50 font-sans font-medium text-sm leading-relaxed tracking-normal max-w-xl"
              >
                Lookbook is a living journal of your outfits, your finds, and the clothes you like to wear.
                We use the taste that you&apos;ve curated in your photo gallery to give you 
                outfit inspo that&apos;s truly personal to you.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.88 }}
                className="text-white/50 font-sans font-medium text-sm leading-relaxed tracking-normal max-w-xl mt-4"
              >
                We&apos;re inviting ~100 users into a one-month beta.
                Our only ask: use the app regularly and share honest feedback.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.95 }}
                className="text-white/50 font-sans font-medium text-sm leading-relaxed tracking-normal max-w-xl mt-4"
              >
                Your input will directly shape what we build next.
                Thank you for becoming part of our journey.
              </motion.p>
            </div>

            {/* Bottom decorative detail */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-px bg-white/20" />
              <p className="font-mono text-xs text-white/25 tracking-widest uppercase">
                Your Style Anthology
              </p>
            </motion.div>
          </div>
        </div>

        {/* ===== RIGHT PANEL — Form ===== */}
        <div className="flex-1 flex flex-col border-l border-[#d5d0c9]">

          {/* Mobile-only top bar */}
          <div className="flex md:hidden items-center justify-between p-5 border-b border-[#d5d0c9]">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Image src="/LB-logo-dark.svg" alt="Lookbook" width={36} height={36} />
            </motion.div>
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#c4b5a0]"
            >
              Early Access
            </motion.span>
          </div>

          {/* Nav link (desktop top right) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="hidden md:flex h-[80px] items-center justify-end px-8 border-b border-[#d5d0c9] shrink-0"
          >
            <Link
              href="/"
              className="font-serif text-base text-gray-900 hover:text-[#c4b5a0] transition-colors"
            >
              About{' '}
              <span className="text-[#c4b5a0]">Lookbook</span>
            </Link>
          </motion.div>

          {/* Form area */}
          <div className="flex-1 flex flex-col justify-between p-8 md:p-10 lg:p-14">
            
            {/* Top mobile copy (moved from bottom) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="md:hidden mb-10 pb-6 border-b border-[#d5d0c9]"
            >
              <p className="font-sans text-xs text-gray-400 leading-relaxed">
                Lookbook is like Pinterest &times; your camera roll — a living record of your outfits,
                your taste, and inspo that&apos;s personalized to you and your clothes.
              </p>
              <p className="font-sans text-xs text-gray-400 leading-relaxed mt-2">
                We&apos;re inviting ~100 users into a one-month beta. Our only ask: use the app regularly and share honest feedback.
              </p>
            </motion.div>

            <div className="flex-1 flex flex-col justify-center max-w-sm">

              {/* Step counter */}
              <AnimatePresence mode="wait">
                {step !== 'success' && (
                  <motion.p
                    key={step + '-label'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    className="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 mb-6"
                  >
                    {step === 'name' ? '01 / 02 — Your name' : '02 / 02 — Your email'}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Step heading */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={step + '-heading'}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                  className="font-serif text-3xl md:text-4xl text-gray-900 leading-tight mb-10"
                >
                  {step === 'name' && (
                    <>What&apos;s your<br />full name?</>
                  )}
                  {step === 'email' && (
                    <>And your<br />email address?</>
                  )}
                  {step === 'success' && (
                    <>You&apos;re in,<br /><span className="text-[#c4b5a0]">{firstName}.</span></>
                  )}
                </motion.h1>
              </AnimatePresence>

              {/* Form fields */}
              <AnimatePresence mode="wait">

                {/* Step 1 — Name */}
                {step === 'name' && (
                  <motion.form
                    key="name-form"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={slideTransition}
                    onSubmit={handleNameNext}
                  >
                    <div className="flex items-center border-b border-gray-900 pb-1 mb-8">
                      <input
                        ref={nameRef}
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        autoComplete="name"
                        className="flex-1 bg-transparent font-serif text-2xl text-gray-900 placeholder:text-gray-300 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!name.trim()}
                      className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase text-gray-900 hover:text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                      <span>Next</span>
                      <span className="group-hover:translate-x-1 transition-transform">›</span>
                    </button>
                  </motion.form>
                )}

                {/* Step 2 — Email */}
                {step === 'email' && (
                  <motion.form
                    key="email-form"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={slideTransition}
                    onSubmit={handleEmailSubmit}
                  >
                    <div className="flex items-center border-b border-gray-900 pb-1 mb-3">
                      <input
                        ref={emailRef}
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        disabled={isLoading}
                        className="flex-1 bg-transparent font-serif text-2xl text-gray-900 placeholder:text-gray-300 focus:outline-none disabled:opacity-50"
                      />
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="font-mono text-xs text-red-500 mb-5"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-5">
                      <button
                        type="button"
                        onClick={() => setStep('name')}
                        className="font-mono text-xs tracking-[0.2em] uppercase text-gray-300 hover:text-gray-600 transition-colors"
                      >
                        ‹ Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !email.trim()}
                        className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] uppercase text-gray-900 hover:text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group"
                      >
                        <span>{isLoading ? 'Submitting...' : 'Submit'}</span>
                        {!isLoading && (
                          <span className="group-hover:translate-x-1 transition-transform">›</span>
                        )}
                      </button>
                    </div>
                  </motion.form>
                )}

                {/* Step 3 — Success */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={slideTransition}
                  >
                    <p className="font-sans text-sm text-gray-500 leading-relaxed mb-6">
                      We&apos;ll reach out to <span className="text-gray-900">{email}</span> when
                      your early access is ready.
                    </p>
                    <Link
                      href="/"
                      className="font-mono text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      ← Back to Lookbook
                    </Link>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Bottom desktop footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:flex items-center gap-3 mt-8"
            >
              <div className="w-6 h-px bg-[#d5d0c9]" />
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400">
                Lookbook
              </span>
            </motion.div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
