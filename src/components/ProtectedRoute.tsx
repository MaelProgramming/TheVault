'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Loader from './Loader';
import { auth } from '@/services/firebase';

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

  // Handle case where user is authenticated but profile database entry is missing/null
  if (user && !profile) {
    return (
      <main className="min-h-screen bg-[#141210] flex flex-col items-center justify-center p-6 text-center font-serif text-[#EFEBE4]">
        <div className="max-w-md w-full border border-[#C5A059]/20 p-8 sm:p-12 space-y-6 bg-[#1A1816]">
          <p className="text-[#C5A059] uppercase tracking-[0.4em] text-xs font-semibold">Erreur de Profil</p>
          <h2 className="text-xl sm:text-2xl text-[#EFEBE4] font-serif font-medium leading-relaxed">
            Identité introuvable dans le registre.
          </h2>
          <p className="text-[#C5A059]/70 text-xs leading-relaxed font-sans max-w-sm mx-auto">
            Votre compte est connecté mais aucun profil n'a été trouvé dans la base de données.
            Cela peut se produire si votre inscription a été interrompue ou si votre fiche membre a été révoquée.
          </p>
          <button
            onClick={() => auth.signOut()}
            className="w-full text-[#C5A059] hover:text-[#EFEBE4] border border-[#C5A059]/30 hover:border-[#C5A059] bg-[#141210] px-6 py-4 text-[10px] uppercase tracking-[0.3em] font-semibold transition-all duration-700 cursor-pointer"
          >
            Se Déconnecter
          </button>
        </div>
      </main>
    );
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
