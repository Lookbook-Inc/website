'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { uploadPhoto, getAuthToken } from '@/lib/api/wrapped';
import { AnimatePresence, motion } from 'framer-motion';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type Step = 'landing' | 'verify' | 'name' | 'city' | 'upload' | 'processing' | 'done';

export default function WrappedWizard() {
  const supabase = createClient();

  // Step management
  const [step, setStep] = useState<Step>('landing');

  // Form data
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);

  // Cropping state
  const [croppedPhotos, setCroppedPhotos] = useState<(Blob | null)[]>([]);
  const [cropSelections, setCropSelections] = useState<(Crop | undefined)[]>([]); // Saved crop coordinates per photo
  const [cropModalIndex, setCropModalIndex] = useState<number | null>(null);
  const [currentCrop, setCurrentCrop] = useState<Crop>();
  const cropImageRef = useRef<HTMLImageElement>(null);

  // Upload state
  const [batchId, setBatchId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checklistStartIndex, setChecklistStartIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processing checklist items
  const checklistItems = [
    'Analyzing your outfits',
    'Extracting clothing items',
    'Sampling your colour palettes',
    'Matching your style archetypes',
    'Determining your city match',
    'Referencing style database',
    'Evaluating your clothing preferences',
    'Inspecting your unique aura',
    'Investigating worldly styles and colors'
  ];

  // Mock upload mode
  const [mockMode, setMockMode] = useState(false);

  // Dev mode: Check URL params for direct step access (runs after hydration)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const devStep = params.get('step') as Step | null;
    if (devStep) {
      setStep(devStep);
      if (devStep === 'processing' && !name) {
        setName('Dev User');
      }
    }
    // Check for mock mode
    if (params.get('mock') === 'true') {
      setMockMode(true);
      console.log('[WRAPPED] Mock upload mode enabled');
    }
  }, []); // Run once on mount

  // Generate batch ID when entering upload step
  useEffect(() => {
    if (step === 'upload' && !batchId) {
      const newBatchId = uuidv4();
      setBatchId(newBatchId);
      console.log('[WRAPPED] Generated batch ID:', newBatchId);
    }
  }, [step, batchId]);

  // Cycle through checklist items on processing screen (slide up animation)
  useEffect(() => {
    if (step === 'processing') {
      const interval = setInterval(() => {
        setChecklistStartIndex((prev) => (prev + 1) % checklistItems.length);
      }, 3000); // Slide up every 3 seconds

      return () => clearInterval(interval);
    } else {
      // Reset when leaving processing screen
      setChecklistStartIndex(0);
    }
  }, [step, checklistItems.length]);

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
      setStep('name');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid verification code';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Profile handlers ---
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

      // Move to upload step
      setStep('upload');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // --- Photo handlers ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 20 photos total
    const newPhotos = [...photos, ...files].slice(0, 20);
    setPhotos(newPhotos);

    // Generate preview URLs
    const newUrls = newPhotos.map(file => URL.createObjectURL(file));
    // Cleanup old URLs
    photoPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setPhotoPreviewUrls(newUrls);

    // Initialize cropped photos array with nulls for new photos
    const newCroppedPhotos = [...croppedPhotos];
    while (newCroppedPhotos.length < newPhotos.length) {
      newCroppedPhotos.push(null);
    }
    setCroppedPhotos(newCroppedPhotos.slice(0, newPhotos.length));

    // Initialize crop selections array with undefined for new photos
    const newCropSelections = [...cropSelections];
    while (newCropSelections.length < newPhotos.length) {
      newCropSelections.push(undefined);
    }
    setCropSelections(newCropSelections.slice(0, newPhotos.length));
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
    setCroppedPhotos(croppedPhotos.filter((_, i) => i !== index));
    setCropSelections(cropSelections.filter((_, i) => i !== index));
  };

  // --- Cropping handlers ---
  const openCropModal = (index: number) => {
    setCropModalIndex(index);
    // Restore saved crop selection if it exists, otherwise undefined
    setCurrentCrop(cropSelections[index]);
  };

  const closeCropModal = () => {
    setCropModalIndex(null);
    setCurrentCrop(undefined);
  };

  // Generate cropped image blob from canvas
  const getCroppedImageBlob = useCallback(async (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  }, []);

  const handleCropSave = async () => {
    if (cropModalIndex === null || !currentCrop || !cropImageRef.current) {
      closeCropModal();
      return;
    }

    // Convert percentage crop to pixel crop
    const image = cropImageRef.current;
    const pixelCrop: PixelCrop = {
      unit: 'px',
      x: (currentCrop.x / 100) * image.width,
      y: (currentCrop.y / 100) * image.height,
      width: (currentCrop.width / 100) * image.width,
      height: (currentCrop.height / 100) * image.height,
    };

    const croppedBlob = await getCroppedImageBlob(image, pixelCrop);

    if (croppedBlob) {
      // Update cropped photos array
      const newCroppedPhotos = [...croppedPhotos];
      newCroppedPhotos[cropModalIndex] = croppedBlob;
      setCroppedPhotos(newCroppedPhotos);

      // Save crop coordinates for later editing
      const newCropSelections = [...cropSelections];
      newCropSelections[cropModalIndex] = currentCrop;
      setCropSelections(newCropSelections);

      // Update preview URL to show cropped version
      const newPreviewUrls = [...photoPreviewUrls];
      URL.revokeObjectURL(newPreviewUrls[cropModalIndex]);
      newPreviewUrls[cropModalIndex] = URL.createObjectURL(croppedBlob);
      setPhotoPreviewUrls(newPreviewUrls);
    }

    closeCropModal();
  };

  const handleUpload = async () => {
    if (photos.length < 2) {
      setError('Please upload at least 10 photos');
      return;
    }

    if (!batchId && !mockMode) {
      setError('Batch ID not generated. Please try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadTotal(photos.length);
    setUploadProgress(0);

    try {
      // Mock upload mode - simulate uploads with delays
      if (mockMode) {
        const croppedCount = croppedPhotos.filter(Boolean).length;
        console.log(`[WRAPPED] Mock upload: ${photos.length} photos (${croppedCount} cropped)`);
        console.log('[WRAPPED] ===== UPLOAD DETAILS =====');

        for (let i = 0; i < photos.length; i++) {
          const original = photos[i];
          const cropped = croppedPhotos[i];

          // Log details about each photo
          console.log(`[WRAPPED] Photo ${i + 1}/${photos.length}:`);
          console.log(`  Original: ${original.name} (${(original.size / 1024).toFixed(1)} KB)`);

          if (cropped) {
            console.log(`  Cropped:  YES (${(cropped.size / 1024).toFixed(1)} KB)`);
            // Create a temporary URL to preview in console (Chrome supports this)
            const debugUrl = URL.createObjectURL(cropped);
            console.log(`  Preview:  ${debugUrl}`);
          } else {
            console.log(`  Cropped:  NO (will use original)`);
          }

          // Simulate network delay (300-800ms per photo)
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
          setUploadProgress(i + 1);
        }

        console.log('[WRAPPED] ===== UPLOAD COMPLETE =====');
        console.log(`[WRAPPED] Summary: ${photos.length} total, ${croppedCount} cropped, ${photos.length - croppedCount} original`);
        setStep('processing');
        return;
      }

      // Get auth token
      const token = await getAuthToken(supabase);
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      console.log(`[WRAPPED] Starting upload: ${photos.length} photos, batch_id: ${batchId}`);

      // Upload photos one by one
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const croppedPhoto = croppedPhotos[i] || null;
        console.log(`[WRAPPED] Uploading photo ${i + 1}/${photos.length}${croppedPhoto ? ' (cropped)' : ''}`);

        try {
          await uploadPhoto(
            photo,
            croppedPhoto, // Send cropped version if available
            token,
            batchId!,
            photos.length
          );

          // Update progress
          setUploadProgress(i + 1);
          console.log(`[WRAPPED] Photo ${i + 1}/${photos.length} uploaded successfully`);
        } catch (uploadError) {
          console.error(`[WRAPPED] Failed to upload photo ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload photo ${i + 1}. Please try again.`);
        }
      }

      console.log('[WRAPPED] All photos uploaded successfully!');

      // Move to processing screen
      setStep('processing');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      console.error('[WRAPPED] Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- Crop Modal ---
  const renderCropModal = () => {
    // Use original photo URL for cropping (not the cropped preview)
    const originalUrl = cropModalIndex !== null
      ? URL.createObjectURL(photos[cropModalIndex])
      : '';

    return (
      <AnimatePresence>
        {cropModalIndex !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/80">
              <button
                onClick={closeCropModal}
                className="text-white text-lg font-display"
              >
                Cancel
              </button>
              <span className="text-white text-sm font-medium">Crop Photo</span>
              <button
                onClick={handleCropSave}
                className="text-white text-lg font-display"
              >
                Done
              </button>
            </div>

            {/* Crop area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <ReactCrop
                crop={currentCrop}
                onChange={(_, percentCrop) => setCurrentCrop(percentCrop)}
                className="max-h-full"
              >
                <img
                  ref={cropImageRef}
                  src={originalUrl}
                  alt="Crop preview"
                  className="max-h-[70vh] max-w-full object-contain"
                  onLoad={() => {
                    // Cleanup the URL after image loads
                    // Note: We create a new URL each time modal opens
                  }}
                />
              </ReactCrop>
            </div>

            {/* Instructions */}
            <div className="px-6 py-4 bg-black/80">
              <p className="text-zinc-400 text-sm text-center">
                Drag to create a crop border
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // --- Render helpers ---
  const renderLanding = () => (
    <div className="flex flex-col min-h-screen p-4">
      {/* Media placeholder */}
      <div className="flex-1 bg-[#F7EFE5] rounded-xl mb-8 relative overflow-hidden min-h-[400px]">
        {/* Placeholder for video/image */}
      </div>
      
      <div className="px-6 pb-6">
        <h1 className="font-display text-4xl text-gray-900 leading-[1.1] mb-8">
          Your 2025 Styles,<br />Wrapped.
        </h1>
        
        <div className="space-y-4 mb-16">
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
        
        <div className="flex items-end justify-between font-display">
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
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex-1 flex flex-col justify-center px-6">
        <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
          Check your email
        </h1>
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

  const renderName = () => (
    <div className="flex flex-col min-h-screen p-4">
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
            onClick={() => setStep('verify')}
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
  );

  const renderCity = () => (
    <div className="flex flex-col min-h-screen p-4">
      <div className="flex-1 flex flex-col justify-center px-6">
        <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
          Which city are you based in?
        </h1>
        <p className="text-gray-500 text-md mb-4">
          We will only use this to help personalize your Lookbook wrapped for 2025 :)
        </p>
        
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City"
          className="w-full bg-[#F7EFE5] rounded-lg px-4 py-3 text-gray-900 text-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 transition-all"
        />
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
  );

  const renderUpload = () => (
    <div className="flex flex-col min-h-screen px-10 pt-24 pb-6">
      {/* Mock mode indicator */}
      {mockMode && (
        <div className="mb-4 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-lg inline-flex items-center gap-2 self-start">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-800 text-xs font-medium">Mock Mode</span>
        </div>
      )}

      <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
        Upload pics of you from this year!
      </h1>
      <p className="text-gray-500 text-md mb-8">
        We want to see your favorite looks from this year. Pick <strong>between 10 and 30</strong> pictures for us to analyze.
      </p>
      
      {/* Tips & Upload area - hidden during upload */}
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.3 },
              height: { duration: 0.5, delay: 0.1 }
            }}
            className="overflow-hidden"
          >
            {/* Tips */}
            <div className="space-y-3 mb-8">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <div>
                  <p className="font-display text-gray-900 text-md">Prefer pictures that get your full outfit.</p>
                  <p className="text-gray-500 text-sm">The more of your outfit we can see, the better - but we'll manage with partials, too.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <div>
                  <p className="font-display text-gray-900 text-md">Prefer solo pictures.</p>
                  <p className="text-gray-500 text-sm">If you want to use a group photo, we'll let you crop out other people once you've selected your pictures.</p>
                </div>
              </div>
            </div>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors mb-4"
            >
              <div className="text-gray-400 mb-2">
                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Choose Outfit Pictures</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Photo preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {photoPreviewUrls.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
              onClick={() => openCropModal(index)}
            >
              <Image
                src={url}
                alt={`Outfit ${index + 1}`}
                fill
                className="object-cover"
              />
              {/* Cropped indicator */}
              {croppedPhotos[index] && (
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 rounded text-white text-[10px]">
                  Cropped
                </div>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress bar */}
      {loading && uploadTotal > 0 && (
        <div className="mb-4">
          <div className="w-full h-4 border-2 border-gray-900 bg-[#FFFAF4]">
            <div
              className="h-full bg-gray-900 transition-all duration-300 ease-out"
              style={{ width: `${(uploadProgress / uploadTotal) * 100}%` }}
            />
          </div>
          {/* <p className="text-center text-gray-500 text-xs mt-2">
            Uploading {uploadProgress} of {uploadTotal}...
          </p> */}
        </div>
      )}

      {/* Upload button */}
      <div className="mt-auto pt-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={photos.length < 2 || loading}
          className={`w-full py-4 rounded-lg font-medium transition-colors ${
            photos.length >= 2 && !loading
              ? 'bg-gray-900 text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Uploading...' : 'Upload fits'}
        </button>
        {/* <p className="text-center text-gray-400 text-xs mt-2">
          {photos.length} of 10-30 photos selected
        </p> */}
      </div>
    </div>
  );

  const renderProcessing = () => {
    // Get the 3 visible items (wrapping around the array)
    const visibleItems = [
      checklistItems[checklistStartIndex % checklistItems.length],
      checklistItems[(checklistStartIndex + 1) % checklistItems.length],
      checklistItems[(checklistStartIndex + 2) % checklistItems.length],
    ];

    return (
      <div className="flex flex-col min-h-screen px-10 pb-12">
        {/* Spacer to push content to ~55% down the page */}
        <div className="h-[45vh]" />

        <h1 className="font-display text-4xl text-gray-900 leading-tight mb-6">
          Analyzing... we will send you an email when we're done
        </h1>

        {/* Checklist - Animated slide-up carousel */}
        <div className="relative h-32 overflow-hidden">
          <AnimatePresence initial={false}>
            {visibleItems.map((item, index) => (
              <motion.div
                key={item}
                layout
                initial={{ y: 120, opacity: 0 }}
                animate={{
                  y: index * 40,
                  opacity: index === 0 ? 1 : index === 1 ? 0.6 : 0.3,
                }}
                exit={{ y: -40, opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  layout: { duration: 0.5 }
                }}
                className="absolute w-full flex items-center gap-3"
              >
                <div className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  index === 0
                    ? 'border-gray-400 bg-gray-100 animate-pulse'
                    : 'border-gray-200'
                }`} />
                <span className={`text-sm transition-all duration-300 ${
                  index === 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'
                }`}>
                  {item}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex-1" />

        <p className="text-sm text-gray-500 leading-tight mb-6">
          Make sure to check your spam and "all mail" boxes!
        </p>

      </div>
    );
  };

  const renderDone = () => (
    <div className="flex flex-col min-h-screen">
      {/* Blue gradient header */}
      <div className="h-48 bg-gradient-to-b from-blue-400 to-blue-600 relative overflow-hidden flex items-end p-6">
        <div className="text-white">
          <p className="text-xs opacity-70 mb-1">(not a screen)</p>
          <h2 className="font-display text-xl leading-tight">
            User receives an email with a unique link.
          </h2>
          <p className="text-sm opacity-80 mt-2">Click to open next screen</p>
        </div>
      </div>
      
      <div className="flex-1 px-10 pt-8 pb-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="font-display text-2xl text-gray-900 mb-4">
          You're all set, {name}!
        </h1>
        <p className="text-gray-500">
          We'll send your Lookbook Wrapped to<br />
          <span className="text-gray-900 font-medium">{email}</span>
        </p>
      </div>
    </div>
  );

  // --- Main render ---
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAF4' }}>
      <div className="w-full max-w-md mx-auto bg-[#FFFAF4] min-h-screen">
        {step === 'landing' && renderLanding()}
        {step === 'verify' && renderVerify()}
        {step === 'name' && renderName()}
        {step === 'city' && renderCity()}
        {step === 'upload' && renderUpload()}
        {step === 'processing' && renderProcessing()}
        {step === 'done' && renderDone()}
      </div>

      {/* Crop Modal - rendered outside the max-width container for full-screen */}
      {renderCropModal()}
    </div>
  );
}
