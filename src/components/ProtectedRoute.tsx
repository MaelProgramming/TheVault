'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Loader from './Loader';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (profile) {
        const isPayPage = pathname === '/pay' || pathname === '/pay/success';
        
        if (!profile.is_verified && !isPayPage) {
          router.push('/pay');
        } else if (profile.is_verified && isPayPage) {
          router.push('/');
        }
      }
    }
  }, [user, profile, loading, router, pathname]);

  if (loading) {
    return <Loader />;
  }

  if (user && !profile) {
    return <Loader />;
  }

  if (user && profile) {
    const isPayPage = pathname === '/pay' || pathname === '/pay/success';
    if (!profile.is_verified && !isPayPage) {
      return <Loader />;
    }
    if (profile.is_verified && isPayPage) {
      return <Loader />;
    }
  }

  return <>{children}</>;
}
