'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadAvatar } from '@/services/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RankBadge } from '@/components/RankBadge';
import type { RankType } from '@/components/RankBadge';
import { Card, Heading, Text, Button } from '@gruand-co/core';
import Modal from '@/components/Modal';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMyProfile = async () => {
      if (!user?.email) return;
      try {
        const token = localStorage.getItem('vault_token');
        const response = await fetch('/api/members/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Erreur de registre.");
        
        const me = await response.json();
        setProfile(me);
        setBio(me.bio);
      } catch (err) {
        console.error("Erreur de chargement du profil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProfile();
  }, [user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsUploading(true);
    const newUrl = await uploadAvatar(file, profile.id);
    if (newUrl) {
      setProfile({ ...profile, avatar_url: newUrl });
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      const response = await fetch(`/api/members/${profile.id}/bio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('vault_token')}`
        },
        body: JSON.stringify({ bio })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      setProfile({ ...profile, bio });
      setIsEditing(false);
      console.log("Semblanza synchronisée avec le coffre.");
      
    } catch (err: any) {
      console.error("Échec de la persistance :", err.message);
      setErrorModal({
        isOpen: true,
        title: 'Error de Actualización',
        message: 'No pudimos actualizar tu semblanza en el registro. Comprueba tu conexión.'
      });
    }
  };

  if (loading) return <Loader />;

  const isFounder = profile?.full_name?.includes('Mael Gruand') || profile?.full_name?.includes('Eliot'); 
  let rank: RankType = 'POSTULANT';
  if (isFounder) { rank = 'FOUNDER'; }
  else if (profile?.is_verified) { rank = 'HEIR'; }

  const avatarSrc = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'VIP')}&background=F5F5DC&color=C5A059`;

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#141210] text-[#EFEBE4] flex flex-col items-center py-24 px-4 font-serif">
        <Header className="mb-16 text-center" titleContent="Tu Perfil" textContent="Identidad de Miembro" />

        <div className="w-full max-w-4xl border border-[#C5A059]/20 shadow-2xl flex flex-col md:flex-row overflow-hidden bg-[#1A1816]">
          {/* IMAGE & UPLOAD */}
          <div className="md:w-1/2 relative bg-[#141210] h-[400px] md:h-auto group min-h-[350px]">
            <img 
              src={avatarSrc} 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 absolute inset-0" 
              alt={profile?.full_name} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
            >
              <span className="text-white text-[10px] tracking-[0.3em] uppercase border border-white/50 px-6 py-3 hover:bg-white hover:text-black transition-colors">
                {isUploading ? 'Procesando...' : 'Actualizar Retrato'}
              </span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
          </div>

          {/* DETAILS */}
          <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-[#1A1816]">
            <div className="flex gap-4 items-center mb-8 flex-wrap">
              <Heading level={2} variant="gold" className="leading-none italic">
                {profile?.full_name}
              </Heading>
              <RankBadge rank={rank} />
            </div>
            
            <div className="space-y-8">
              <div className="relative">
                <Text variant="small" style={{ color: '#C5A059', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '16px', display: 'block' }} className="italic">
                  Semblanza
                </Text>
                {isEditing ? (
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-[#141210] text-[#EFEBE4] border border-[#C5A059]/30 p-5 text-sm italic font-serif focus:ring-0 focus:border-[#C5A059] transition-all h-36 resize-none leading-relaxed"
                  />
                ) : (
                  <Text variant="serif" style={{ fontSize: '1.25rem', fontStyle: 'italic', color: '#EFEBE4', opacity: 0.9, lineHeight: '1.7' }} className="font-light">
                    "{bio || "El silencio es la mayor de las elegancias."}"
                  </Text>
                )}
              </div>

              <div className="pt-8 border-t border-[#C5A059]/20 grid grid-cols-2 gap-4">
                <div>
                  <Text variant="small" style={{ color: '#C5A059', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>
                    Grado
                  </Text>
                  <p className="text-[11px] text-[#EFEBE4] uppercase mt-1 tracking-wider">{profile?.major}</p>
                </div>
                <div>
                  <Text variant="small" style={{ color: '#C5A059', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>
                    Clase
                  </Text>
                  <p className="text-[11px] text-[#EFEBE4] uppercase mt-1 tracking-wider">{profile?.graduation_year}</p>
                </div>
              </div>

              <div className="mt-12 flex flex-col gap-4">
                {isEditing ? (
                  <Button 
                    onClick={handleSave} 
                    className="w-full cursor-pointer"
                    style={{
                      backgroundColor: '#C5A059',
                      color: '#141210',
                      fontWeight: 'bold',
                      padding: '16px 0',
                      fontSize: '10px',
                      letterSpacing: '0.4em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Confirmar Cambios
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    variant="outline"
                    className="w-full cursor-pointer"
                    style={{
                      border: '1px solid #C5A059',
                      color: '#C5A059',
                      padding: '16px 0',
                      fontSize: '10px',
                      letterSpacing: '0.4em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Editar Semblanza
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer className="mt-20 opacity-50 hover:opacity-100 transition-opacity duration-1000" textContent="The Vault - 2026" />
      </main>

      {errorModal && (
        <Modal
          isOpen={errorModal.isOpen}
          onClose={() => setErrorModal(null)}
          title={errorModal.title}
          message={errorModal.message}
          type="error"
        />
      )}
    </ProtectedRoute>
  );
}
