'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Modal from '@/components/Modal';
import { Card, Heading, Text, Button } from '@gruand-co/core';

type Tab = 'members' | 'invitations';

export default function AdminPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('members');

  // Members data
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Invitations data
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  // Modal Configurations
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'confirm';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
  } | null>(null);

  const showError = (title: string, message: string) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'error',
      confirmText: 'Entendido'
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>, confirmText = 'Confirmar') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      confirmText,
      cancelText: 'Cancelar',
      onConfirm
    });
  };

  useEffect(() => {
    const fetchProfileAndData = async () => {
      if (!user?.email) return;
      try {
        const token = localStorage.getItem('vault_token');
        const profileRes = await fetch('/api/members/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!profileRes.ok) throw new Error('Error al cargar perfil');
        const me = await profileRes.json();
        setProfile(me);

        const isFounder = me?.full_name?.includes('Mael Gruand') || 
                          me?.full_name?.includes('Eliot') || 
                          me?.email === 'maelg396@gmail.com' || 
                          me?.email === 'maelgruand7@gmail.com';

        if (isFounder) {
          // Fetch initial data
          await Promise.all([fetchMembers(), fetchInvitations()]);
        }
      } catch (err) {
        console.error('Error in Admin init:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndData();
  }, [user]);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch('/api/admin/members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch('/api/admin/invitations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const handleToggleVerification = async (memberId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_verified: !currentStatus })
      });

      if (res.ok) {
        // Update local state
        setMembers(prev =>
          prev.map(m => m.id === memberId ? { ...m, is_verified: !currentStatus } : m)
        );
      } else {
        showError('Error de Verificación', 'Hubo un error al intentar actualizar el estado de verificación de este miembro.');
      }
    } catch (err) {
      console.error(err);
      showError('Error del Servidor', 'No se pudo conectar con el servidor.');
    }
  };

  const handleDeleteMember = (memberId: string, fullName: string) => {
    showConfirm(
      'Retirar Miembro',
      `¿Estás seguro de que deseas retirar a ${fullName} del Vault definitivamente? Esta acción suspenderá su acceso de manera inmediata y definitiva.`,
      async () => {
        try {
          const token = localStorage.getItem('vault_token');
          const res = await fetch(`/api/admin/members/${memberId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
          } else {
            showError('Error al Retirar', 'No se pudo retirar al miembro de la base de datos.');
          }
        } catch (err) {
          console.error(err);
          showError('Error de Conexión', 'Se produjo un error al intentar contactar con el servidor.');
        }
      },
      'Retirar'
    );
  };

  const handleForgeInvitation = async () => {
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchInvitations();
      } else {
        showError('Error de Creación', 'No se pudo forjar el nuevo código de invitación VIP.');
      }
    } catch (err) {
      console.error(err);
      showError('Error del Servidor', 'Se produjo un error al intentar forjar la invitación.');
    }
  };

  const handleToggleInvitationStatus = async (invitationId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
    try {
      const token = localStorage.getItem('vault_token');
      const res = await fetch(`/api/admin/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setInvitations(prev =>
          prev.map(i => i.id === invitationId ? { ...i, status: newStatus } : i)
        );
      } else {
        showError('Error de Modificación', 'No se pudo cambiar el estado de la invitación.');
      }
    } catch (err) {
      console.error(err);
      showError('Error de Conexión', 'Error al conectarse con el backend.');
    }
  };

  const handleDeleteInvitation = (invitationId: string) => {
    showConfirm(
      'Eliminar Invitación',
      '¿Estás seguro de que deseas eliminar esta invitación definitivamente? Esta acción no se puede deshacer y cualquier postulante con este código ya no podrá usarlo.',
      async () => {
        try {
          const token = localStorage.getItem('vault_token');
          const res = await fetch(`/api/admin/invitations/${invitationId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (res.ok) {
            setInvitations(prev => prev.filter(i => i.id !== invitationId));
          } else {
            showError('Error al Eliminar', 'No se pudo eliminar el código de invitación.');
          }
        } catch (err) {
          console.error(err);
          showError('Error del Servidor', 'Error de red al intentar eliminar la invitación.');
        }
      },
      'Eliminar'
    );
  };

  if (loading) return <Loader />;

  const isFounder = profile?.full_name?.includes('Mael Gruand') || 
                    profile?.full_name?.includes('Eliot') || 
                    profile?.email === 'maelg396@gmail.com' || 
                    profile?.email === 'maelgruand7@gmail.com';

  if (!isFounder) {
    return (
      <ProtectedRoute>
        <Navbar />
        <main className="min-h-screen bg-[#141210] text-[#EFEBE4] flex flex-col items-center justify-center font-serif px-4">
          <Card elevation="high" style={{ backgroundColor: '#1A1816', border: '1px solid rgba(197, 160, 89, 0.2)', padding: '40px' }} className="max-w-md text-center">
            <div className="w-12 h-12 rounded-full border border-red-900/30 flex items-center justify-center mb-6 mx-auto">
              <span className="text-red-700 text-lg font-bold">!</span>
            </div>
            <Heading level={2} variant="gold" className="italic mb-4">Acceso Denegado</Heading>
            <Text variant="serif" style={{ color: '#EFEBE4', opacity: 0.8, fontSize: '14px' }}>
              Este panel de administración está reservado estrictamente para los fundadores de The Vault.
            </Text>
          </Card>
          <Footer className="mt-20 opacity-50" textContent="The Vault - 2026" />
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#141210] text-[#EFEBE4] flex flex-col items-center py-24 px-4 md:px-8 font-serif">
        <Header className="mb-12 text-center" titleContent="Consola de Control" textContent="Administración del Gremio" />

        {/* Tab Menu */}
        <div className="flex gap-8 mb-12 border-b border-[#C5A059]/20 pb-4 z-10 w-full max-w-5xl justify-center">
          <button
            id="tab-members-btn"
            onClick={() => setActiveTab('members')}
            className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-500 cursor-pointer ${
              activeTab === 'members'
                ? 'text-[#C5A059] font-bold border-b border-[#C5A059]'
                : 'text-[#C5A059]/40 hover:text-[#C5A059]/80'
            }`}
          >
            Miembros ({members.length})
          </button>
          <button
            id="tab-invitations-btn"
            onClick={() => setActiveTab('invitations')}
            className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-500 cursor-pointer ${
              activeTab === 'invitations'
                ? 'text-[#C5A059] font-bold border-b border-[#C5A059]'
                : 'text-[#C5A059]/40 hover:text-[#C5A059]/80'
            }`}
          >
            Invitaciones ({invitations.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="w-full max-w-5xl text-[#EFEBE4]">
          {activeTab === 'members' ? (
            <div className="border border-[#C5A059]/10 rounded-sm bg-[#1A1816] shadow-2xl p-6 md:p-10 overflow-x-auto">
              <Heading level={3} variant="gold" className="italic mb-6 text-lg">Registro de Aspirantes y Herederos</Heading>
              
              {loadingMembers ? (
                <div className="py-20 flex justify-center"><Loader /></div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[#C5A059]/20 text-[#C5A059]/60 uppercase tracking-[0.25em] text-[9px] font-sans">
                      <th className="pb-4 font-normal">Retrato</th>
                      <th className="pb-4 font-normal">Nombre</th>
                      <th className="pb-4 font-normal">Contacto</th>
                      <th className="pb-4 font-normal">Major / Clase</th>
                      <th className="pb-4 font-normal text-center">Estado</th>
                      <th className="pb-4 font-normal text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C5A059]/10 text-sm">
                    {members.map((m) => {
                      const avatar = m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name || 'VIP')}&background=F5F5DC&color=C5A059`;
                      const isFounderUser = m.full_name?.includes('Mael Gruand') || m.full_name?.includes('Eliot') || m.email === 'maelg396@gmail.com' || m.email === 'maelgruand7@gmail.com';
                      const statusLabel = isFounderUser ? 'FOUNDER' : m.is_verified ? 'HEIR' : 'POSTULANT';

                      return (
                        <tr key={m.id} className="hover:bg-[#141210]/40 transition-colors duration-300">
                          <td className="py-4">
                            <img src={avatar} alt={m.full_name} className="w-10 h-10 object-cover rounded-full border border-[#C5A059]/30 grayscale" />
                          </td>
                          <td className="py-4 font-semibold text-[#EFEBE4]">{m.full_name}</td>
                          <td className="py-4 text-xs opacity-75 font-sans lowercase">{m.email}</td>
                          <td className="py-4 text-xs">
                            <span className="block font-medium uppercase text-[10px] tracking-wider">{m.major}</span>
                            <span className="block text-[9px] opacity-50">Clase {m.graduation_year || 'N/A'}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[8px] tracking-widest font-sans font-bold ${
                              statusLabel === 'FOUNDER' ? 'bg-[#C5A059]/20 text-[#C5A059]' :
                              statusLabel === 'HEIR' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                              'bg-amber-950/40 text-amber-500 border border-amber-600/20'
                            }`}>
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex gap-4 justify-end items-center">
                              {!isFounderUser && (
                                <button
                                  id={`verify-btn-${m.id}`}
                                  onClick={() => handleToggleVerification(m.id, m.is_verified)}
                                  className={`text-[9px] tracking-wider uppercase border px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                                    m.is_verified
                                      ? 'border-[#C5A059]/20 text-[#C5A059]/60 hover:border-[#C5A059] hover:text-[#C5A059]'
                                      : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                  }`}
                                >
                                  {m.is_verified ? 'Quitar Verificación' : 'Verificar'}
                                </button>
                              )}
                              {!isFounderUser && (
                                <button
                                  id={`delete-btn-${m.id}`}
                                  onClick={() => handleDeleteMember(m.id, m.full_name)}
                                  className="text-[9px] tracking-wider uppercase text-red-900/60 hover:text-red-500 border border-red-900/20 hover:border-red-950/60 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
                                >
                                  Retirar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="border border-[#C5A059]/10 rounded-sm bg-[#1A1816] shadow-2xl p-6 md:p-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <Heading level={3} variant="gold" className="italic text-lg">Sellos e Invitaciones Forjadas</Heading>
                  <Text variant="small" style={{ opacity: 0.6 }} className="mt-1">Códigos de acceso al gremio</Text>
                </div>
                <Button
                  id="forge-invite-btn"
                  onClick={handleForgeInvitation}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: '#C5A059',
                    color: '#141210',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    padding: '12px 24px'
                  }}
                >
                  Forjar Código VIP
                </Button>
              </div>

              {loadingInvitations ? (
                <div className="py-20 flex justify-center"><Loader /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-[#C5A059]/20 text-[#C5A059]/60 uppercase tracking-[0.25em] text-[9px] font-sans">
                        <th className="pb-4 font-normal">Código</th>
                        <th className="pb-4 font-normal">Creador</th>
                        <th className="pb-4 font-normal">Creado El</th>
                        <th className="pb-4 font-normal text-center">Estado</th>
                        <th className="pb-4 font-normal text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C5A059]/10 text-sm">
                      {invitations.map((i) => (
                        <tr key={i.id} className="hover:bg-[#141210]/40 transition-colors duration-300">
                          <td className="py-4 font-mono text-[#C5A059] tracking-wider font-semibold text-xs">{i.code}</td>
                          <td className="py-4">
                            <span className="block font-medium">{i.creator?.full_name || 'Desconocido'}</span>
                            <span className="block text-[9px] opacity-50 lowercase">{i.creator?.email || ''}</span>
                          </td>
                          <td className="py-4 text-xs opacity-75 font-sans">
                            {new Date(i.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[8px] tracking-widest font-sans font-bold ${
                              i.status === 'active'
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-950/40 text-red-400 border border-red-500/20'
                            }`}>
                              {i.status === 'active' ? 'ACTIVO' : 'REVOCADO'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex gap-4 justify-end items-center">
                              <button
                                id={`toggle-invite-btn-${i.id}`}
                                onClick={() => handleToggleInvitationStatus(i.id, i.status)}
                                className={`text-[9px] tracking-wider uppercase border px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                                  i.status === 'active'
                                    ? 'border-red-900/30 text-red-400 hover:bg-red-950/10'
                                    : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                                }`}
                              >
                                {i.status === 'active' ? 'Revocar' : 'Re-Activar'}
                              </button>
                              <button
                                id={`delete-invite-btn-${i.id}`}
                                onClick={() => handleDeleteInvitation(i.id)}
                                className="text-[9px] tracking-wider uppercase text-red-900/60 hover:text-red-500 border border-red-900/20 hover:border-red-950/60 px-3 py-1.5 rounded-sm transition-colors cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <Footer className="mt-20 opacity-50 hover:opacity-100 transition-opacity duration-1000" textContent="The Vault - 2026" />
      </main>

      {modalConfig && (
        <Modal
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(null)}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
        />
      )}
    </ProtectedRoute>
  );
}
