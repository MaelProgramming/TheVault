'use client';

import React from 'react';
import { ThemeProvider } from '@gruand-co/core';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
