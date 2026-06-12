'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/services/firebase';

const Navbar = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isFounder, setIsFounder] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    const cachedFounder = localStorage.getItem('is_founder');
    if (cachedFounder) {
      setIsFounder(cachedFounder === 'true');
      return;
    }

    const checkFounder = async () => {
      try {
        const token = localStorage.getItem('vault_token');
        const res = await fetch('/api/members/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const profile = await res.json();
          const isF = profile?.full_name?.includes('Mael Gruand') ||
            profile?.full_name?.includes('Eliot Dangas') ||
            profile?.email === 'maelg396@gmail.com';
          setIsFounder(isF);
          localStorage.setItem('is_founder', isF ? 'true' : 'false');
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkFounder();
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    localStorage.removeItem('is_founder');
    auth.signOut();
  };

  const links = [
    { name: 'Registro', path: '/' },
    { name: 'Misivas', path: '/conversations' },
    { name: 'Sellos', path: '/invitations' },
    { name: 'Perfil', path: '/profile' },
  ];

  if (isFounder) {
    links.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <nav className="fixed bottom-0 md:top-0 md:bottom-auto left-0 w-full z-[100] bg-[#141210]/95 backdrop-blur-md border-t md:border-t-0 md:border-b border-[#C5A059]/20 px-3 md:px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="hidden md:block font-serif italic text-xl tracking-tighter text-[#C5A059] hover:opacity-80 transition-opacity">
          The Vault
        </Link>

        {/* Navigation links */}
        <div className="flex gap-3 sm:gap-6 md:gap-10 w-full md:w-auto justify-around md:justify-end items-center">
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`text-[9px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all duration-700 ease-in-out ${isActive
                  ? 'text-[#C5A059] font-bold drop-shadow-[0_0_8px_rgba(197,160,89,0.3)]'
                  : 'text-stone-500 hover:text-[#C5A059]/70'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="text-[9px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] uppercase text-red-900/40 hover:text-red-700 transition-colors duration-500 cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
