'use client';

import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5F5DC] font-sans">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Rotating gold ring */}
        <div className="absolute inset-0 border-t border-b border-[#C5A059] rounded-full animate-spin"></div>
        {/* Inner gold ornament */}
        <div className="text-[#C5A059] text-xl font-serif">◇</div>
      </div>
      <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-[#C5A059]/80 font-medium animate-pulse">
        Vérification des Sceaux
      </p>
    </div>
  );
}
