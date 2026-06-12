'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getConversations, getMessages, sendMessage, markAsRead } from '@/services/api';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Heading, Text, Button, Input } from '@gruand-co/core';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const lastTimestampRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial conversations load
  useEffect(() => {
    getConversations()
      .then(convs => {
        setConversations(convs);
        if (window.innerWidth >= 768 && convs.length > 0 && !activeConv) {
          setActiveConv(convs[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // 2. Intelligent Polling & Synchronization
  useEffect(() => {
    if (!activeConv) return;

    setMessages([]);
    lastTimestampRef.current = null;

    const initChat = async () => {
      try {
        const msgs = await getMessages(activeConv.id);
        setMessages(msgs);
        if (msgs.length > 0) {
          lastTimestampRef.current = msgs[msgs.length - 1].created_at;
        }
        await markAsRead(activeConv.id);
      } catch (err) {
        console.error("Erreur init chat:", err);
      }
    };

    initChat();

    // Polling every 3 seconds
    const interval = setInterval(async () => {
      try {
        const newMsgs = await getMessages(activeConv.id, lastTimestampRef.current || undefined);

        if (newMsgs && newMsgs.length > 0) {
          setMessages(prev => {
            const filtered = newMsgs.filter((nM: any) => !prev.some(pM => pM.id === nM.id));
            if (filtered.length === 0) return prev;

            const updated = [...prev, ...filtered];
            lastTimestampRef.current = updated[updated.length - 1].created_at;
            return updated;
          });

          markAsRead(activeConv.id);
        }
      } catch (e) {
        console.error("Sync error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeConv?.id]);

  // Autoscroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Client-side auto-delivery updater for sent messages (simulating letter arrival)
  useEffect(() => {
    if (messages.length === 0) return;

    const checkDelivery = () => {
      const now = Date.now();
      const TRANSIT_DELAY_MS = 10000;
      let hasUpdates = false;

      const updated = messages.map(msg => {
        if (msg.is_mine && !msg.is_delivered) {
          const messageTime = new Date(msg.created_at).getTime();
          if (now - messageTime >= TRANSIT_DELAY_MS) {
            hasUpdates = true;
            return { ...msg, is_delivered: true };
          }
        }
        return msg;
      });

      if (hasUpdates) {
        setMessages(updated);
      }
    };

    const timer = setInterval(checkDelivery, 1000);
    return () => clearInterval(timer);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    try {
      const msg = await sendMessage(activeConv.id, newMessage);
      setMessages(prev => [...prev, msg]);
      lastTimestampRef.current = msg.created_at;
      setNewMessage('');
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  if (loading) return <Loader />;

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="min-h-screen bg-[#141210] text-[#EFEBE4] pt-24 pb-32 px-4 md:px-10 flex border-t border-[#C5A059]/20 font-serif">
        <div className="w-full max-w-6xl mx-auto flex h-[75vh] bg-[#1A1816] shadow-2xl border border-[#C5A059]/30 rounded-sm overflow-hidden">
          
          {/* CONVERSATION LIST */}
          <div className={`w-full md:w-1/3 border-r border-[#C5A059]/20 flex flex-col ${activeConv ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b border-[#C5A059]/20 text-center">
              <Heading level={2} variant="gold" className="text-xl italic tracking-widest uppercase text-center">
                Correspondencia
              </Heading>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`p-4 border-b border-[#C5A059]/10 cursor-pointer transition-all duration-500 flex items-center gap-4 ${activeConv?.id === conv.id ? 'bg-[#C5A059]/10' : 'hover:bg-[#C5A059]/5'}`}
                >
                  <img
                    src={conv.peer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.peer_name)}&background=141210&color=C5A059`}
                    className="w-12 h-12 rounded-full object-cover border border-[#C5A059]/30 grayscale hover:grayscale-0 transition-all duration-700"
                    alt="Avatar"
                  />
                  <div>
                    <h3 className="text-sm tracking-[0.1em] text-[#C5A059] uppercase">{conv.peer_name}</h3>
                    <p className="text-[9px] text-stone-500 tracking-widest uppercase mt-1">{conv.peer_major}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MESSAGES VIEW */}
          <div className={`w-full md:w-2/3 flex flex-col relative ${!activeConv ? 'hidden md:flex items-center justify-center opacity-20' : 'flex'}`}>
            {!activeConv ? (
              <div className="text-center italic tracking-widest text-[#C5A059] p-8">The Vault - Seleccione un enlace</div>
            ) : (
              <>
                <div className="p-4 border-b border-[#C5A059]/20 bg-[#141210] flex items-center gap-4">
                  <button onClick={() => setActiveConv(null)} className="md:hidden text-[#C5A059] text-[10px] tracking-widest uppercase cursor-pointer">&lt; Volver</button>
                  <Text variant="small" style={{ letterSpacing: '0.3em', textTransform: 'uppercase', color: '#EFEBE4' }} className="uppercase">
                    {activeConv.peer_name}
                  </Text>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#1A1816]/50">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative max-w-[80%] p-4 text-[13px] tracking-wide border ${msg.is_mine ? 'bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]' : 'bg-[#141210] border-stone-800 text-[#EFEBE4]'}`}>
                        <p className="font-sans font-light leading-relaxed">{msg.content}</p>

                        {msg.is_mine && (
                          <div className="absolute -bottom-5 right-0 flex items-center gap-2">
                            {!msg.is_delivered ? (
                              <>
                                <span className="text-[7px] uppercase tracking-[0.2em] text-stone-500/70 animate-pulse">En tránsito...</span>
                                <svg className="w-2.5 h-2.5 text-[#C5A059]/50 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                                </svg>
                              </>
                            ) : (
                              <>
                                <span className={`text-[7px] uppercase tracking-[0.2em] transition-all duration-1000 ${msg.is_read ? 'text-[#C5A059] opacity-100' : 'text-stone-600 opacity-40'}`}>
                                  {msg.is_read ? 'Leído' : 'Entregado'}
                                </span>
                                <div className={`w-1 h-1 rounded-full transition-all duration-1000 ${msg.is_read ? 'bg-[#C5A059] shadow-[0_0_8px_#C5A059]' : 'bg-stone-600'}`} />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* MISIVE WRITER */}
                <form onSubmit={handleSend} className="p-6 border-t border-[#C5A059]/20 bg-[#141210] flex gap-4">
                  <Input
                    variant="underline"
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribir misiva..."
                    className="flex-1"
                    style={{
                      fontSize: '16px',
                      letterSpacing: '0.05em',
                      color: '#EFEBE4'
                    }}
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()} 
                    variant="outline"
                    className="cursor-pointer"
                    style={{
                      padding: '12px 24px',
                      fontSize: '9px',
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: '#C5A059',
                      border: '1px solid rgba(197, 160, 89, 0.4)'
                    }}
                  >
                    Enviar
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
