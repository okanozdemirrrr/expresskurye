'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { extractUserIdFromSlug } from '@/lib/slugify';
import dynamic from 'next/dynamic';

const KuryeCagirContent = dynamic(() => import('@/components/KuryeCagirContent'), { ssr: false });

export default function KuryeCagirPage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      router.push('/');
      return;
    }

    const slugUserId = extractUserIdFromSlug(params.profileSlug as string);
    
    if (!slugUserId || !user.id.startsWith(slugUserId)) {
      router.push('/');
      return;
    }

    setIsAuthorized(true);
  }, [user, profile, loading, params.profileSlug, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/80 backdrop-blur-md border-b border-blue-900/20 sticky top-0 z-40"
      >
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Geri Dön</span>
            </button>

            <h1 className="text-xl font-bold text-white">Kurye Çağır - Operasyon Merkezi</h1>

            <div className="text-right">
              <p className="text-white font-bold text-sm">
                {profile?.first_name} {profile?.last_name}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <KuryeCagirContent profileSlug={params.profileSlug as string} />
    </div>
  );
}
