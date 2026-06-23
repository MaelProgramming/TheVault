'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load pages to minimize bundle sizes for landing page visitors
const LandingPage = dynamic(() => import('@/components/LandingPage'), {
  loading: () => <LoadingSpinner />,
});

const MemberDashboard = dynamic(() => import('@/components/MemberDashboard'), {
  loading: () => <LoadingSpinner />,
});

export default function Home() {
  const { user, loading } = useAuth();

  // 1. If auth state is loading, display the minimalist cream LoadingSpinner
  if (loading) {
    return <LoadingSpinner />;
  }

  // 2. If user is authenticated, render the private member app dashboard
  if (user) {
    return <MemberDashboard />;
  }

  // 3. Otherwise, serve the public landing page to guests
  return <LandingPage />;
}
