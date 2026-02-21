'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/Dashboard';
import { extractUserIdFromSlug } from '@/lib/slugify';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user, profile, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    if (!user || !profile) {
      router.push('/');
      return;
    }

    // Slug'dan user ID'yi çıkar
    const slugUserId = extractUserIdFromSlug(params.profileSlug as string);
    
    // Slug geçersizse veya kullanıcının ID'si ile eşleşmiyorsa ana sayfaya yönlendir
    if (!slugUserId || !user.id.startsWith(slugUserId)) {
      router.push('/');
      return;
    }

    // Her şey tamam, yetkili
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

  return <Dashboard />;
}
