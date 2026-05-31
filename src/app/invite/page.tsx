'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { verifyInvitationCode } from '@/services/api';
import { Button, Input, Heading, Text } from '@gruand-co/core';

export default function VaultGate() {
  const [code, setCode] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCode(val);
    setError(null);
  };

  const triggerUnlock = () => {
    setIsUnlocking(true);
    setTimeout(() => {
      router.push('/register');
    }, 2500); // Wait for the heavy doors to open
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsChecking(true);
    setError(null);
    try {
      await verifyInvitationCode(code);
      triggerUnlock();
    } catch (err: any) {
      setError(err.message || 'Llave Invalida');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <main className="fixed inset-0 z-50 bg-[#0A0908] flex items-center justify-center font-serif overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C5A059]/10 via-[#0A0908]/90 to-[#0A0908] pointer-events-none" />

      {/* The Vault Interface */}
      <AnimatePresence>
        {!isUnlocking && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="relative z-10 w-full max-w-md flex flex-col items-center p-8"
          >
            {/* Vault decorative header */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full border border-[#C5A059]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(197,160,89,0.1)]">
                  <div className="w-8 h-8 rounded-full border border-[#C5A059]/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#C5A059]/80 shadow-[0_0_10px_rgba(197,160,89,1)]" />
                  </div>
                </div>
                <Heading level={1} variant="gold" className="italic shadow-black drop-shadow-2xl text-center">
                  Acceso Restringido
                </Heading>
                <Text variant="small" style={{ letterSpacing: '0.4em', color: '#C5A059', opacity: 0.6 }} className="mt-6 uppercase text-center">
                  Introduce tu llave de invitación
                </Text>
              </motion.div>
            </div>

            {/* The Input "Dial" */}
            <form onSubmit={handleSubmit} className="w-full max-w-xs relative group perspective-1000">
              <motion.div
                className={`relative bg-[#141210] p-4 rounded-sm border transition-colors duration-700 ${error ? 'border-red-900/50 shadow-[0_0_30px_rgba(127,29,29,0.2)]' : 'border-[#C5A059]/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]'}`}
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#C5A059]/5 to-transparent pointer-events-none" />
                <Input
                  variant="underline"
                  type="text"
                  value={code}
                  onChange={handleDial}
                  disabled={isChecking || isUnlocking}
                  placeholder="CÓDIGO"
                  style={{
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '0.4em',
                    color: '#EFEBE4',
                    background: '#0A0908',
                    border: '1px solid rgba(197, 160, 89, 0.1)'
                  }}
                  className="w-full"
                />

                {/* Decorative screws/rivets */}
                <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-[#C5A059]/20" />
                <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-[#C5A059]/20" />
                <div className="absolute bottom-2 left-2 w-1 h-1 rounded-full bg-[#C5A059]/20" />
                <div className="absolute bottom-2 right-2 w-1 h-1 rounded-full bg-[#C5A059]/20" />
              </motion.div>

              <Button
                type="submit"
                disabled={isChecking || isUnlocking || !code}
                variant="outline"
                className="w-full mt-10 cursor-pointer"
                style={{
                  padding: '16px 0',
                  fontSize: '9px',
                  letterSpacing: '0.5em',
                  textTransform: 'uppercase',
                  color: '#C5A059',
                  border: '1px solid rgba(197, 160, 89, 0.3)'
                }}
              >
                {isChecking ? 'Verificando...' : 'Desbloquear'}
              </Button>
            </form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: error ? 1 : 0 }}
              className="absolute bottom-0 text-[10px] tracking-widest text-red-800/80 uppercase mt-8"
            >
              {error || 'Llave Invalida'}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Opening Doors Animation */}
      <AnimatePresence>
        {isUnlocking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            {/* Left Door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              transition={{ delay: 0.5, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#0A0908] border-r border-[#C5A059]/20 shadow-[20px_0_50px_rgba(0,0,0,0.9)] z-20 flex items-center justify-end overflow-hidden"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 md:w-8 h-32 md:h-64 bg-gradient-to-r from-transparent to-[#141210] border-r border-[#C5A059]/30 rounded-l-full" />
            </motion.div>

            {/* Right Door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '100%' }}
              transition={{ delay: 0.5, duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#0A0908] border-l border-[#C5A059]/20 shadow-[-20px_0_50px_rgba(0,0,0,0.9)] z-20 flex items-center justify-start overflow-hidden"
            >
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 md:w-8 h-32 md:h-64 bg-gradient-to-l from-transparent to-[#141210] border-l border-[#C5A059]/30 rounded-r-full" />
            </motion.div>

            {/* Glowing inner core */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.5 }}
              transition={{ delay: 1, duration: 1.5 }}
              className="absolute z-10 w-64 h-64 bg-[#C5A059] rounded-full blur-[100px] opacity-20"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
