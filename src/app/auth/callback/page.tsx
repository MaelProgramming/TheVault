'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase returns auth info inside URL hash fragment
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      
      if (hash) {
        const params = new URLSearchParams(hash.replace('#', '?'));
        const token = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (token) {
          localStorage.setItem('vault_token', token);
          if (refreshToken) localStorage.setItem('vault_refresh_token', refreshToken);
          
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#141210] flex flex-col items-center justify-center">
      <Loader />
      <p className="mt-4 font-serif italic text-stone-500 animate-pulse text-[12px] tracking-widest uppercase text-center">
        Verificando credenciales...
      </p>
    </div>
  );
}
