'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { uploadPhoto, getAuthToken } from '@/lib/api/wrapped';
import { AnimatePresence, motion } from 'framer-motion';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { usePostHog } from 'posthog-js/react';

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const posthog = usePostHog();

  // Photo state
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [resizedBlobs, setResizedBlobs] = useState<(Blob | null)[]>([]); // Store resized JPEGs for upload

  // Cropping state
  const [croppedPhotos, setCroppedPhotos] = useState<(Blob | null)[]>([]);
  const [cropSelections, setCropSelections] = useState<(Crop | undefined)[]>([]);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock upload mode
  const [mockMode, setMockMode] = useState(false);

  // Check auth and profile on mount
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/wrapped');
        return;
      }

      // Check if profile has name/city
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, city')
        .eq('id', user.id)
        .single();

      if (!profile?.first_name || !profile?.city) {
        // Need to complete setup first
        router.push('/wrapped/setup');
        return;
      }

      // Track upload page view
      if (posthog) {
        posthog.capture('wrapped_upload_viewed', {
          user_id: user.id,
          email: user.email
        });
      }
    };
    checkAuthAndProfile();
  }, [router, supabase, posthog]);

  // Generate batch ID on mount
  useEffect(() => {
    if (!batchId) {
      const newBatchId = uuidv4();
      setBatchId(newBatchId);
      console.log('[WRAPPED] Generated batch ID:', newBatchId);
    }
  }, [batchId]);

  // Check for mock mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mock') === 'true') {
      setMockMode(true);
      console.log('[WRAPPED] Mock upload mode enabled');
    }
  }, []);


  // Resize image for preview (reduces memory usage on mobile)
  const resizeImageForPreview = async (file: File): Promise<{ url: string; blob: Blob; originalSize: number; resizedSize: number }> => {
    // Check if file is HEIC and convert to JPEG first
    const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    let fileToProcess = file;

    if (isHEIC) {
      try {
        console.log(`[WRAPPED] Converting HEIC to JPEG: ${file.name}`);

        // Dynamic import - only loads heic2any when needed (in browser)
        const heic2any = (await import('heic2any')).default;

        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        });
        // heic2any can return Blob or Blob[], handle both
        const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        fileToProcess = new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
        console.log(`[WRAPPED] ✅ HEIC converted successfully`);
      } catch (err) {
        console.error(`[WRAPPED] Failed to convert HEIC ${file.name}:`, err);
        throw new Error(`Failed to convert HEIC file ${file.name}`);
      }
    }

    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const reader = new FileReader();

      reader.onerror = () => reject(new Error(`Failed to read ${fileToProcess.name}`));

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onerror = () => reject(new Error(`Failed to load image ${fileToProcess.name}`));

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 1920;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions (maintain aspect ratio)
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height = (height * MAX_DIMENSION) / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width = (width * MAX_DIMENSION) / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const originalKB = file.size / 1024;
                const resizedKB = blob.size / 1024;
                const savings = ((1 - blob.size / file.size) * 100).toFixed(0);
                console.log(`[WRAPPED] ${file.name}: ${originalKB.toFixed(0)}KB → ${resizedKB.toFixed(0)}KB (${savings}% smaller)`);
                resolve({ url, blob, originalSize: file.size, resizedSize: blob.size });
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            'image/jpeg',
            0.85
          );
        } catch (err) {
          reject(err);
        }
      };

      reader.readAsDataURL(fileToProcess);
    });
  };

  // --- Photo handlers ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // Calculate how many new photos we can add
      const availableSlots = 24 - photos.length;
      const filesToAdd = files.slice(0, availableSlots);

      if (filesToAdd.length === 0) return; // Already at limit

      // Generate resized preview URLs for new photos (saves memory!)
      const results = await Promise.all(
        filesToAdd.map(async (file) => {
          try {
            return await resizeImageForPreview(file);
          } catch (err) {
            console.error(`[WRAPPED] Failed to process ${file.name}:`, err);

            // If it's a HEIC file that failed to convert, skip it
            const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
            if (isHEIC) {
              console.warn(`[WRAPPED] ⚠️ Skipping unsupported HEIC file: ${file.name}`);
              return null;
            }

            // For non-HEIC files that fail, try using original as fallback
            const blob = new Blob([file], { type: file.type });
            return { url: URL.createObjectURL(blob), blob, originalSize: file.size, resizedSize: file.size };
          }
        })
      );

      // Filter out failed HEIC files
      const successfulResults = results.filter((r): r is NonNullable<typeof r> => r !== null);
      const failedCount = results.length - successfulResults.length;

      // Only add successfully processed files to photos array
      const successfulFiles = filesToAdd.filter((_, index) => results[index] !== null);
      const newPhotos = [...photos, ...successfulFiles];
      setPhotos(newPhotos);

      if (failedCount > 0) {
        setError(`⚠️ ${failedCount} HEIC file(s) could not be processed and were skipped. For best results, convert photos to JPG/PNG`);
      } else if (error) {
        // Clear any previous errors if all photos processed successfully
        setError(null);
      }

      // Calculate totals
      const totalOriginal = successfulResults.reduce((sum, r) => sum + r.originalSize, 0);
      const totalResized = successfulResults.reduce((sum, r) => sum + r.resizedSize, 0);
      const totalSavings = totalOriginal > 0 ? ((1 - totalResized / totalOriginal) * 100).toFixed(0) : '0';

      console.log(`\n[WRAPPED] 📊 COMPRESSION SUMMARY:`);
      console.log(`[WRAPPED] Original total: ${(totalOriginal / 1048576).toFixed(2)} MB`);
      console.log(`[WRAPPED] Compressed total: ${(totalResized / 1048576).toFixed(2)} MB`);
      console.log(`[WRAPPED] Total savings: ${totalSavings}% smaller\n`);

      const newUrls = successfulResults.map(r => r.url);
      const newBlobs = successfulResults.map(r => r.blob);

      setPhotoPreviewUrls([...photoPreviewUrls, ...newUrls]);
      setResizedBlobs([...resizedBlobs, ...newBlobs]);

      // Initialize cropped photos array with nulls for new successful photos
      const newCroppedPhotos = [...croppedPhotos, ...new Array(successfulResults.length).fill(null)];
      setCroppedPhotos(newCroppedPhotos);

      // Initialize crop selections array with undefined for new successful photos
      const newCropSelections = [...cropSelections, ...new Array(successfulResults.length).fill(undefined)];
      setCropSelections(newCropSelections);

      // Track photos selected
      if (posthog) {
        const totalSizeMB = totalResized / (1024 * 1024);
        posthog.capture('wrapped_photos_selected', {
          photo_count: newPhotos.length,
          new_photos_count: successfulResults.length,
          total_size_mb: parseFloat(totalSizeMB.toFixed(2))
        });
      }
    } catch (err) {
      console.error('[WRAPPED] Error in handleFileSelect:', err);
      setError('Failed to load photos. Try selecting fewer photos at once.');
    }
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviewUrls(photoPreviewUrls.filter((_, i) => i !== index));
    setResizedBlobs(resizedBlobs.filter((_, i) => i !== index));
    setCroppedPhotos(croppedPhotos.filter((_, i) => i !== index));
    setCropSelections(cropSelections.filter((_, i) => i !== index));
  };

  // --- Cropping handlers ---
  const openCropModal = (index: number) => {
    setCropModalIndex(index);
    setCurrentCrop(cropSelections[index]);
  };

  const closeCropModal = () => {
    setCropModalIndex(null);
    setCurrentCrop(undefined);
  };

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

      // Track photo cropped
      if (posthog) {
        posthog.capture('wrapped_photo_cropped', {
          photo_index: cropModalIndex,
          total_cropped: newCroppedPhotos.filter(Boolean).length
        });
      }
    }

    closeCropModal();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/wrapped');
  };

  const handleUpload = async () => {
    if (photos.length < 10) {
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

    // Track upload started
    const uploadStartTime = Date.now();
    const croppedCount = croppedPhotos.filter(Boolean).length;

    if (posthog) {
      posthog.capture('wrapped_upload_started', {
        photo_count: photos.length,
        cropped_count: croppedCount,
        batch_id: batchId || 'mock',
        is_mock: mockMode
      });
    }

    try {
      // Mock upload mode - simulate uploads with delays
      if (mockMode) {
        const croppedCount = croppedPhotos.filter(Boolean).length;
        console.log(`[WRAPPED] Mock upload: ${photos.length} photos (${croppedCount} cropped)`);
        console.log('[WRAPPED] ===== UPLOAD DETAILS =====');

        for (let i = 0; i < photos.length; i++) {
          const original = photos[i];
          const resized = resizedBlobs[i];
          const cropped = croppedPhotos[i];

          console.log(`[WRAPPED] Photo ${i + 1}/${photos.length}:`);
          console.log(`  Original: ${original.name} (${(original.size / 1024).toFixed(1)} KB)`);

          if (resized) {
            console.log(`  Resized:  YES (${(resized.size / 1024).toFixed(1)} KB) - THIS WILL BE UPLOADED`);
          }

          if (cropped) {
            console.log(`  Cropped:  YES (${(cropped.size / 1024).toFixed(1)} KB)`);
          }

          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
          setUploadProgress(i + 1);

          // Track individual photo upload (mock)
          if (posthog) {
            posthog.capture('wrapped_photo_uploaded', {
              photo_index: i,
              photo_count: photos.length,
              is_mock: true
            });
          }
        }

        console.log('[WRAPPED] ===== UPLOAD COMPLETE =====');
        console.log(`[WRAPPED] Summary: ${photos.length} total, ${croppedCount} cropped`);

        // Track upload completed (mock)
        if (posthog) {
          const uploadDuration = (Date.now() - uploadStartTime) / 1000;
          posthog.capture('wrapped_upload_completed', {
            photo_count: photos.length,
            cropped_count: croppedCount,
            batch_id: 'mock',
            is_mock: true,
            upload_duration_seconds: parseFloat(uploadDuration.toFixed(2))
          });
        }

        router.push('/wrapped/processing');
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
        const originalFile = photos[i];
        const resizedBlob = resizedBlobs[i];
        const croppedPhoto = croppedPhotos[i] || null;

        // Use resized JPEG blob for upload (not original file)
        // Convert Blob to File for upload
        const photoToUpload = resizedBlob
          ? new File([resizedBlob], originalFile.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
          : originalFile;

        console.log(`[WRAPPED] Uploading photo ${i + 1}/${photos.length}${croppedPhoto ? ' (cropped)' : ''} (${(photoToUpload.size / 1024).toFixed(0)}KB)`);

        try {
          await uploadPhoto(
            photoToUpload,
            croppedPhoto,
            token,
            batchId!,
            photos.length
          );

          setUploadProgress(i + 1);
          console.log(`[WRAPPED] Photo ${i + 1}/${photos.length} uploaded successfully`);

          // Track individual photo upload (real)
          if (posthog) {
            posthog.capture('wrapped_photo_uploaded', {
              photo_index: i,
              photo_count: photos.length,
              file_size_kb: parseFloat((photoToUpload.size / 1024).toFixed(2)),
              is_cropped: !!croppedPhoto,
              is_mock: false
            });
          }
        } catch (uploadError) {
          console.error(`[WRAPPED] Failed to upload photo ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload photo ${i + 1}. Please try again.`);
        }
      }

      console.log('[WRAPPED] All photos uploaded successfully!');

      // Track upload completed (real)
      if (posthog) {
        const uploadDuration = (Date.now() - uploadStartTime) / 1000;
        posthog.capture('wrapped_upload_completed', {
          photo_count: photos.length,
          cropped_count: croppedCount,
          batch_id: batchId,
          is_mock: false,
          upload_duration_seconds: parseFloat(uploadDuration.toFixed(2))
        });
      }

      // Move to processing page
      router.push('/wrapped/processing');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      console.error('[WRAPPED] Upload error:', err);

      // Track upload failure
      if (posthog) {
        posthog.capture('wrapped_upload_failed', {
          photo_count: photos.length,
          upload_progress: uploadProgress,
          error_message: message,
          is_mock: mockMode
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Crop Modal ---
  const renderCropModal = () => {
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFAF4' }}>
      <div className="w-full max-w-md mx-auto bg-[#FFFAF4] min-h-screen">
        <div className="flex flex-col min-h-screen px-10 pt-24 pb-6">
          {/* Mock mode indicator */}
          {mockMode && (
            <div className="mb-4 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-lg inline-flex items-center gap-2 self-start">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-800 text-xs font-medium">Mock Mode</span>
            </div>
          )}

          {/* Sign out button */}
          <div className="mb-6">
            <button
              onClick={handleSignOut}
              className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
            >
              Use different email?
            </button>
          </div>

          <h1 className="font-display text-4xl text-gray-900 leading-[1] mb-8">
            Upload pics of you from this year!
          </h1>
          <p className="text-gray-500 text-md mb-8">
            We&apos;ll analyze your outfits automatically from any photo. Pick at least 10 pictures for us to work with.
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
                <div className="space-y-4 mb-10">
                  <div className="flex gap-3 items-start">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-2.5 shrink-0" />
                    <p className="text-gray-600 text-sm leading-relaxed font-semibold">
                      Prefer pictures that get your outfit clearly.
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-2.5 shrink-0" />
                    <p className="text-gray-600 text-sm leading-relaxed font-semibold">
                      Solo pictures are best. If using a group photo, tap to crop yourself out.
                    </p>
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
            </div>
          )}

          {/* Upload button */}
          <div className="mt-auto pt-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {photos.length > 0 && !loading && (
              <p className="text-center text-gray-500 text-sm mb-3">
                Remember to crop group photos by tapping.
              </p>
            )}

            <button
              onClick={handleUpload}
              disabled={photos.length < 10 || loading}
              className={`w-full py-4 rounded-lg text-xl font-display transition-colors ${
                photos.length >= 10 && !loading
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Crop Modal - rendered outside the max-width container for full-screen */}
      {renderCropModal()}
    </div>
  );
}
