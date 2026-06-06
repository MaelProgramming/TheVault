'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heading, Text, Card } from '@gruand-co/core';
import Loader from '@/components/Loader';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaySuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { token, refreshProfile } = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const verificationStarted = useRef(false);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('Code de session de paiement Stripe manquant.');
      return;
    }

    if (verificationStarted.current) return;
    verificationStarted.current = true;

    const verifyPayment = async () => {
      try {
        const jwt = token || localStorage.getItem('vault_token');
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'La vérification du paiement a échoué');
        }

        setStatus('success');
        await refreshProfile();

        // Let the nice success screen show for a moment
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setErrorMsg(err.message || 'Impossible de vérifier votre paiement.');
      }
    };

    verifyPayment();
  }, [sessionId, token, refreshProfile, router]);

  return (
    <main className="fixed inset-0 z-50 bg-[#0A0908] flex items-center justify-center font-serif overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/10 via-[#0A0908]/90 to-[#0A0908] pointer-events-none" />

      <AnimatePresence mode="wait">
        {status === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 max-w-sm px-4"
          >
            <Loader />
            <Heading level={2} variant="gold" className="italic tracking-tighter">
              Authentification du Sceau
            </Heading>
            <Text variant="small" style={{ letterSpacing: '0.3em', color: '#C5A059', opacity: 0.6 }} className="uppercase">
              Vérification de la transaction...
            </Text>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Glowing inner core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.1, 0.4, 0.2], scale: [1, 2, 2.5] }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="absolute w-96 h-96 bg-[#C5A059] rounded-full blur-[120px]"
            />

            <div className="relative z-10 text-center space-y-8 max-w-md px-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="w-20 h-20 rounded-full border border-[#C5A059]/40 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(197,160,89,0.3)] bg-[#141210]"
              >
                <span className="text-[#C5A059] text-3xl">✓</span>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
                className="space-y-4"
              >
                <Heading level={1} variant="gold" className="italic tracking-tighter">
                  Acceso Concedido
                </Heading>
                <Text variant="small" style={{ letterSpacing: '0.4em', color: '#C5A059', opacity: 0.7 }} className="uppercase">
                  Bienvenido a la élite
                </Text>
                <p className="text-xs text-[#EFEBE4]/50 tracking-[0.2em] uppercase font-sans animate-pulse">
                  Ouverture des portes du Vault...
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-md w-full px-4 text-center"
          >
            <Card elevation="high" style={{ backgroundColor: '#1A1816', border: '1px solid rgba(197, 160, 89, 0.2)', padding: '40px' }} className="space-y-6">
              <div className="w-12 h-12 rounded-full border border-red-900/30 flex items-center justify-center mx-auto">
                <span className="text-red-700 text-lg font-bold">!</span>
              </div>
              <Heading level={2} variant="gold" className="italic">
                Échec du Protocole
              </Heading>
              <Text variant="serif" style={{ color: '#EFEBE4', opacity: 0.8, fontSize: '14px' }}>
                {errorMsg || 'La transaction n\'a pas pu être validée par Stripe.'}
              </Text>
              <button
                onClick={() => router.push('/pay')}
                className="text-[10px] tracking-[0.3em] uppercase border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] px-6 py-3 transition-colors duration-300 w-full cursor-pointer bg-[#141210]"
              >
                Réessayer le paiement
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
