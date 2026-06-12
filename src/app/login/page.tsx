'use client';

import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Heading, Text, Input, Button } from '@gruand-co/core';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // If already logged in, send directly to home
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      setStatus({ 
        type: 'success', 
        msg: 'Identidad confirmada. Bienvenido al Vault.' 
      });

      setTimeout(() => {
        router.push('/pay');
      }, 1500);

    } catch (err: any) {
      let errorMsg = 'Su credencial no figura en el registro.';
      if (err.code === 'auth/wrong-password') errorMsg = 'Código de acceso incorrecto.';
      if (err.code === 'auth/user-not-found') errorMsg = 'Miembro no reconnu.';

      setStatus({ 
        type: 'error', 
        msg: errorMsg 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#141210] flex items-center justify-center p-4 font-serif text-[#EFEBE4]">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center">
          <Heading level={1} variant="gold" className="italic tracking-tighter">
            The Vault
          </Heading>
          <Text variant="small" style={{ letterSpacing: '0.5em', textTransform: 'uppercase', color: '#C5A059', opacity: 0.6 }} className="mt-4">
            Acceso Restringido
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Field */}
          <div className="py-2">
            <Input
              variant="underline"
              type="email"
              placeholder="CORREO UNIVERSITARIO"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              style={{
                fontSize: '16px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#EFEBE4'
              }}
            />
          </div>

          {/* Password Field */}
          <div className="py-2">
            <Input
              variant="underline"
              type="password"
              placeholder="CÓDIGO DE ACCESO"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              style={{
                fontSize: '16px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#EFEBE4'
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            variant="outline"
            className="w-full cursor-pointer"
            style={{
              padding: '20px 0',
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#C5A059',
              border: '1px solid rgba(197, 160, 89, 0.3)',
              backgroundColor: '#1A1816'
            }}
          >
            {loading ? 'Verificando...' : 'Entrar en el Círculo'}
          </Button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => router.push('/invite')}
              className="text-[#C5A059]/60 hover:text-[#C5A059] text-[10px] tracking-[0.2em] uppercase transition-colors cursor-pointer"
            >
              No soy miembro (Solicitar Admisión)
            </button>
          </div>
        </form>

        {status && (
          <p className={`text-center text-[11px] italic animate-in slide-in-from-bottom-2 duration-700 ${
            status.type === 'success' ? 'text-[#C5A059]' : 'text-red-900/80'
          }`}>
            {status.msg}
          </p>
        )}
      </div>
    </main>
  );
}
