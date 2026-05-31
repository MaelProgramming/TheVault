'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { createMemberProfile } from '@/services/api';
import { useRouter } from 'next/navigation';
import { Heading, Text, Input, Button } from '@gruand-co/core';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Retrieve token and store it
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('vault_token', token);

      // 3. Create member profile in database via our API route
      await createMemberProfile({
        name,
        full_name: fullName,
        gender,
        major,
        year,
        graduation_year: graduationYear
      });
      
      setStatus({ 
        type: 'success', 
        msg: 'Perfil creado con éxito. Bienvenido a la élite.' 
      });

      setTimeout(() => {
        router.push('/');
      }, 1500);

    } catch (err: any) {
      let errorMsg = 'Error en el registro.';
      if (err.code === 'auth/email-already-in-use') errorMsg = 'Este correo ya pertenece al Vault.';
      if (err.code === 'auth/weak-password') errorMsg = 'El código es demasiado débil.';
      if (err.message) errorMsg = err.message;

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
            Solicitud de Admisión
          </Text>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="py-2">
            <Input
              variant="underline"
              type="email"
              placeholder="CORREO UNIVERSITARIO"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
            />
          </div>

          <div className="py-2">
            <Input
              variant="underline"
              type="password"
              placeholder="CÓDIGO SECRETO (CONTRASEÑA)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
              style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
            />
          </div>
          
          <div className="py-2">
            <Input
              variant="underline"
              type="text"
              placeholder="NOMBRE"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
              style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
            />
          </div>

          <div className="py-2">
            <Input
              variant="underline"
              type="text"
              placeholder="NOMBRE COMPLETO"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full"
              style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
            />
          </div>

          <div className="flex gap-4 border-b border-[#C5A059]/30 py-3">
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#C5A059]/40 flex-1">GÉNERO:</span>
            <label className="text-[11px] uppercase tracking-[0.2em] text-[#EFEBE4] cursor-pointer flex items-center gap-2">
              <input 
                type="radio" 
                value="M" 
                checked={gender === 'M'} 
                onChange={() => setGender('M')} 
                className="text-[#C5A059] bg-transparent border-[#C5A059]/30 focus:ring-[#C5A059]" 
              /> Caballero
            </label>
            <label className="text-[11px] uppercase tracking-[0.2em] text-[#EFEBE4] cursor-pointer flex items-center gap-2">
              <input 
                type="radio" 
                value="F" 
                checked={gender === 'F'} 
                onChange={() => setGender('F')} 
                className="text-[#C5A059] bg-transparent border-[#C5A059]/30 focus:ring-[#C5A059]" 
              /> Dama
            </label>
          </div>

          <div className="py-2">
            <Input
              variant="underline"
              type="text"
              placeholder="ESPECIALIZACIÓN (MAJOR)"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              required
              className="w-full"
              style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 py-2">
              <Input
                variant="underline"
                type="number"
                placeholder="AÑO DE ESTUDIOS"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                min={1}
                max={10}
                className="w-full"
                style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
              />
            </div>
            
            <div className="flex-1 py-2">
              <Input
                variant="underline"
                type="number"
                placeholder="AÑO DE GRADUACIÓN"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                required
                min={2020}
                max={2035}
                className="w-full"
                style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#EFEBE4' }}
              />
            </div>
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
            {loading ? 'Procesando Solicitud...' : 'Solicitar Acceso'}
          </Button>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-[#C5A059]/60 hover:text-[#C5A059] text-[10px] tracking-[0.2em] uppercase transition-colors cursor-pointer"
            >
              Ya soy miembro (Entrar)
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
