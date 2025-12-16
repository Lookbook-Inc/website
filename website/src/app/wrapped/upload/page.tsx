'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function WrappedUploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/wrapped/login');
    } else {
      setUser(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E7DCCA' }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-6xl md:text-7xl font-display text-gray-800 mb-6">
          Upload Page
        </h1>

        <p className="text-xl font-sans text-gray-700 mb-8">
          Welcome, {user?.email}!
        </p>

        <p className="text-lg font-sans text-gray-600 mb-8">
          Upload functionality coming soon...
        </p>

        <button
          onClick={() => router.push('/wrapped/results')}
          className="bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200 font-sans text-lg"
        >
          Go to Results
        </button>
      </div>
    </div>
  );
}
