'use client';

import { useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import { getMembers } from '@/services/api';
import type { M } from '@/types/Props';
import Stack from '@/components/Grid';
import { Card, Text } from '@gruand-co/core';

export default function Home() {
  const [members, setMembers] = useState<M[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'M' | 'F'>('ALL');

  useEffect(() => {
    getMembers()
      .then(setMembers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMembers = useMemo(() =>
    members.filter(m => genderFilter === 'ALL' ? true : m.gender === genderFilter),
    [members, genderFilter]
  );

  const handleSwipeSuccess = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#141210] text-[#EFEBE4] flex flex-col items-center pt-24 pb-32 px-4 overflow-hidden">
        <Header
          className="mb-12 text-center max-w-2xl"
          titleContent="The Vault"
          textContent="Exclusividad • Tradición • Futuro"
        />

        {/* GENDER FILTER BUTTONS */}
        <nav className="flex gap-8 mb-16 border-b border-[#C5A059]/20 pb-4 z-10">
          {(['ALL', 'M', 'F'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setGenderFilter(t)}
              className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-500 cursor-pointer ${genderFilter === t
                ? 'text-[#C5A059] font-bold border-b border-[#C5A059]'
                : 'text-[#C5A059]/40 hover:text-[#C5A059]/80'
                }`}
            >
              {t === 'ALL' ? 'Todos' : t === 'M' ? 'Gentlemen' : 'Ladies'}
            </button>
          ))}
        </nav>

        {/* LOADING & ERROR STATES OR STACK */}
        <div className="relative w-full max-w-md flex justify-center items-center h-[550px]">
          {isLoading ? (
            <Loader />
          ) : error ? (
            <div className="w-full max-w-sm">
              <Card elevation="high" style={{ backgroundColor: '#F5F5DC', border: '1px solid #C5A059', padding: '24px' }}>
                <div className="min-h-[200px] flex flex-col items-center justify-center text-center">
                  <p className="text-[#C5A059] uppercase tracking-tighter text-xs mb-4 italic">Erreur de Protocole</p>
                  <Text variant="serif" style={{ color: '#1a1a1a', fontSize: '15px' }} className="max-w-sm">
                    {error}
                  </Text>
                </div>
              </Card>
            </div>
          ) : filteredMembers.length > 0 ? (
            <Stack key={genderFilter} members={filteredMembers} onSwipeSuccess={handleSwipeSuccess} className="w-full flex justify-center" />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#C5A059]/50 italic font-serif">
              <p>Aucun membre ne correspond à ce critère.</p>
            </div>
          )}
        </div>

        <Footer className="mt-20 opacity-50 hover:opacity-100 transition-opacity duration-1000" textContent="The Vault - 2026" />
      </main>
    </ProtectedRoute>
  );
}
