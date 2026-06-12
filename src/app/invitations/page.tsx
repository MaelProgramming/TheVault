'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getMyInvitations, generateInvitation } from '@/services/api';
import { Card, Heading, Text, Button, Divider } from '@gruand-co/core';
import Modal from '@/components/Modal';

interface Invite {
  id: string;
  code: string;
  status: 'active' | 'used';
  created_at?: string;
}
{ {/* App d'elite avec des invites pour entre  des gens */ } }
export default function InvitationsPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFounder, setIsFounder] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanShare(true);
    }
  }, []);

  useEffect(() => {
    const fetchInvitesAndProfile = async () => {
      try {
        const data = await getMyInvitations();
        setInvites(data);

        const token = localStorage.getItem('vault_token');
        const profileRes = await fetch('/api/members/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const founderCheck = profileData.email === 'maelg396@gmail.com' ||
            profileData.email === 'maelgruand7@gmail.com' ||
            profileData.full_name?.includes('Mael Gruand') ||
            profileData.full_name?.includes('Eliot');
          setIsFounder(founderCheck);
        }
      } catch (err) {
        console.error("Error cargando invitaciones y perfil:", err);
      } finally {
        setLoading(false);
        setProfileLoading(false);
      }
    };
    fetchInvitesAndProfile();
  }, []);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const newInvite = await generateInvitation();
      setInvites(prev => [newInvite, ...prev]);
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: 'Error de Forja',
        message: err.message || "No se pudo forjar el sello de invitación. Verifica tu límite."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareOrCopy = async (code: string, id: string) => {
    const text = `Has sido seleccionado. Presenta este sello en La Bóveda para solicitar tu admisión: ${code}`;
    const shareData = {
      title: 'The Vault',
      text: text,
      url: `${window.location.origin}/invite?code=${code}`
    };

    if (typeof navigator !== 'undefined' && 'share' in navigator && 'canShare' in navigator && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        console.warn("Share failed, falling back to copy:", err);
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#141210] text-[#EFEBE4] flex flex-col font-serif pt-24 pb-32 px-4 md:px-10 overflow-hidden relative">
        <Header className="mb-12 text-center relative z-10" titleContent="Tus Sellos" textContent="El Privilegio de Invitar" />

        {/* Decorative Background Elements */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#C5A059]/5 to-transparent pointer-events-none" />
        <div className="absolute top-1/4 -left-1/4 w-[50vw] h-[50vw] bg-[#C5A059] rounded-full blur-[150px] opacity-10 pointer-events-none" />
        <div className="absolute bottom-1/4 -right-1/4 w-[50vw] h-[50vw] bg-[#C5A059] rounded-full blur-[150px] opacity-10 pointer-events-none" />

        <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col items-center relative z-10">

          {/* Main Vault Generation Area */}
          <div className="w-full relative mb-16 p-10 border border-[#C5A059]/20 bg-[#1A1816]/80 backdrop-blur-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#C5A059]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

            <Heading level={2} variant="gold" className="italic mb-4 text-center">
              Forjar Nueva Llave
            </Heading>
            <Text variant="small" style={{ letterSpacing: '0.3em', textTransform: 'uppercase', color: '#EFEBE4', opacity: 0.6 }} className="mb-10 text-center max-w-lg leading-relaxed">
              Solo los miembros consagrados poseen el derecho de forjar sellos de entrada. Usa este privilegio con sabiduría.
            </Text>

            <Button
              onClick={handleGenerateCode}
              disabled={isGenerating || (!isFounder && invites.length >= 3) || loading || profileLoading}
              variant="outline"
              className="cursor-pointer"
              style={{
                padding: '20px 40px',
                fontSize: '10px',
                letterSpacing: '0.4em',
                textTransform: 'uppercase',
                color: '#C5A059',
                border: '1px solid #C5A059'
              }}
            >
              {isGenerating ? 'Forjando Sello...' : (!isFounder && invites.length >= 3) ? 'Límite Alcanzado (3/3)' : 'Extraer del Cofre'}
            </Button>
          </div>

          {/* Existing Invitations List */}
          <div className="w-full">
            <Heading level={3} variant="gold" className="text-xl italic mb-8">
              Sellos Activos {isFounder ? `(${invites.length})` : `(${invites.length}/3)`}
            </Heading>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              <AnimatePresence>
                {loading && (
                  <div className="col-span-full py-10 text-center text-[#EFEBE4]/40 text-[11px] tracking-widest uppercase italic">
                    Abriendo el cofre...
                  </div>
                )}

                {!loading && invites.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-10 text-center text-[#EFEBE4]/40 text-[11px] tracking-widest uppercase italic"
                  >
                    El cofre está vacío.
                  </motion.div>
                )}

                {invites.map((invite, index) => (
                  <motion.div
                    key={invite.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="relative group"
                  >
                    <Card elevation="high" style={{ backgroundColor: '#141210', border: '1px solid rgba(197, 160, 89, 0.3)', padding: '32px', minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      {/* Wax Seal Design */}
                      <div className="absolute top-4 right-4 w-12 h-12 bg-[#8B0000] rounded-full opacity-80 shadow-[0_4px_10px_rgba(0,0,0,0.5),_inset_0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center mix-blend-multiply">
                        <span className="text-[#141210] font-serif text-sm italic font-bold">V</span>
                      </div>

                      <div className="mb-8">
                        <p className="text-[8px] tracking-[0.4em] text-[#C5A059]/50 uppercase mb-2">Código de Ingreso</p>
                        <Heading level={3} variant="gold" style={{ fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 300 }}>
                          {invite.code}
                        </Heading>
                      </div>

                      <div className="flex justify-between items-end border-t border-[#C5A059]/10 pt-4">
                        <div>
                          <p className="text-[8px] tracking-[0.3em] text-[#EFEBE4]/40 uppercase mb-1">Forjado</p>
                          <p className="text-[10px] tracking-widest text-[#EFEBE4]/70">
                            {invite.created_at ? new Date(invite.created_at).toLocaleDateString() : 'HOY'}
                          </p>
                        </div>

                        <button
                          onClick={() => handleShareOrCopy(invite.code, invite.id)}
                          className="text-[#C5A059] text-[9px] tracking-[0.2em] uppercase hover:text-white transition-colors duration-300 cursor-pointer"
                        >
                          {copiedId === invite.id ? 'COPIADO ✓' : canShare ? 'COMPARTIR' : 'COPIAR SELLO'}
                        </button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Footer className="mt-auto opacity-50 relative z-10" textContent="The Vault - 2026" />
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
