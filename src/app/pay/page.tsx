'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Card, Heading, Text } from '@gruand-co/core';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function PayPage() {
  const { token, profile } = useAuth();

  const handleFounderCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const jwt = token || localStorage.getItem('vault_token');
      const response = await fetch('/api/checkout/founder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo crear la sesión de pago para el Founder');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de pago Stripe manquante');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al iniciar el pago del Founder.');
      setLoading(false);
    }
  };

  // Existing handleCheckout remains unchanged

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const jwt = token || localStorage.getItem('vault_token');
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'No se pudo crear la sesión de pago');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de paiement Stripe manquante');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al iniciar el pago.');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#141210] flex flex-col items-center justify-center p-4 font-serif text-[#EFEBE4]">
        <div className="max-w-md w-full py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border border-[#C5A059]/30 flex items-center justify-center mb-6 mx-auto shadow-[0_0_30px_rgba(197,160,89,0.1)]">
              <div className="w-12 h-12 rounded-full border border-[#C5A059]/50 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#C5A059]/80 shadow-[0_0_10px_rgba(197,160,89,1)]" />
              </div>
            </div>
            <Heading level={1} variant="gold" className="italic tracking-tighter">
              The Vault Club Entry
            </Heading>
            <Text variant="small" style={{ letterSpacing: '0.4em', color: '#C5A059', opacity: 0.6 }} className="mt-4 uppercase">
              Cuota de solicitud requerida
            </Text>
          </div>

          {/* Pricing Card */}
          <Card elevation="high" style={{ backgroundColor: '#1A1816', border: '1px solid rgba(197, 160, 89, 0.25)', padding: '40px' }} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A059]/5 rounded-bl-full pointer-events-none" />
            
            <div className="text-center mb-8">
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059]/60">Acceso VIP Único & Vitalicio</span>
              <div className="mt-4 flex justify-center items-baseline text-[#EFEBE4]">
                <span className="text-6xl font-bold tracking-tight">
                  {profile?.invited_by_founder ? '50' : '80'}
                </span>
                <span className="text-3xl ml-1 text-[#C5A059] font-sans">€</span>
              </div>
              <p className="mt-2 text-xs text-[#C5A059]/40 uppercase tracking-widest">
                {profile?.invited_by_founder ? 'Cuota con descuento de fundador' : 'Cuota de admisión única'}
              </p>
            </div>

            {/* List of Benefits */}
            <div className="space-y-4 my-8 border-t border-b border-[#C5A059]/10 py-6 text-xs text-[#EFEBE4]/80 tracking-wide leading-relaxed font-sans">
              <div className="flex items-center gap-3">
                <span className="text-[#C5A059] text-base">✦</span>
                <span>Acceso completo a la red de élite del Vault</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#C5A059] text-base">✦</span>
                <span>Deslizamientos ilimitados y algoritmo de afinidad de élite</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#C5A059] text-base">✦</span>
                <span>Mensajería cifrada & exclusiva entre miembros</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#C5A059] text-base">✦</span>
                <span>Generación de invitaciones para tus pares</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="space-y-4">
              <Button
                onClick={handleCheckout}
                disabled={loading}
                variant="outline"
                className="w-full cursor-pointer transition-all duration-300 hover:bg-[#C5A059]/10"
                style={{
                  padding: '18px 0',
                  fontSize: '11px',
                  letterSpacing: '0.45em',
                  textTransform: 'uppercase',
                  color: '#C5A059',
                  border: '1px solid rgba(197, 160, 89, 0.4)',
                  backgroundColor: '#1E1B19'
                }}
              >
                {loading ? 'Redirigiendo a Stripe...' : 'Pagar The Vault Club Entry'}
              </Button>
                {profile?.invited_by_founder && (
                  <Button
                    onClick={handleFounderCheckout}
                    disabled={loading}
                    variant="outline"
                    className="w-full cursor-pointer mt-4 transition-all duration-300 hover:bg-[#C5A059]/10"
                    style={{
                      padding: '18px 0',
                      fontSize: '11px',
                      letterSpacing: '0.45em',
                      textTransform: 'uppercase',
                      color: '#C5A059',
                      border: '1px solid rgba(197, 160, 89, 0.4)',
                      backgroundColor: '#1E1B19'
                    }}
                  >
                    {loading ? 'Redirigiendo a Stripe...' : 'Pagar Invitación Founder'}
                  </Button>
                )}

              
              {error && (
                <p className="text-center text-xs text-red-500/80 italic font-serif">
                  {error}
                </p>
              )}
            </div>
          </Card>

          <Footer className="opacity-40" textContent="Exclusivité • Tradition • Futuro" />
        </div>
      </main>
    </>
  );
}
