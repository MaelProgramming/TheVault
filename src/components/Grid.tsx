'use client';

import React, { useState, useEffect } from "react";
import IdentityCard from './IdentityCard';
import { AnimatePresence, motion } from 'framer-motion';
import { type GridProps, type M } from "@/types/Props";
import { swipeMember } from '@/services/api';
import { useRouter } from 'next/navigation';
import { Heading, Text, Button } from '@gruand-co/core';

const Stack: React.FC<GridProps> = ({ members, className = "", onSwipeSuccess }) => {
  const [stack, setStack] = useState(members);
  const [matchMember, setMatchMember] = useState<M | null>(null);
  const [currentUser, setCurrentUser] = useState<M | null>(null);
  const router = useRouter();

  useEffect(() => {
    setStack(members);
  }, [members]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem('vault_token');
        const res = await fetch('/api/members/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data);
        }
      } catch (err) {
        console.error("Error fetching current user for match screen:", err);
      }
    };
    fetchMe();
  }, []);

  const handleSwipeSuccess = (id: string, direction: 'left' | 'right') => {
    const isLike = direction === 'right';
    const swipedMember = stack.find(m => m.id === id);

    swipeMember(id, isLike)
      .then(res => {
        if (res.match && swipedMember) {
          setMatchMember(swipedMember as M);
        }
      })
      .catch(err => console.error("Erreur serveur lors du swipe:", err));

    setStack(prev => prev.filter(m => m.id !== id));
    if (onSwipeSuccess) {
      onSwipeSuccess(id);
    }
  };

  if (!stack.length) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center">
        <Text variant="serif" style={{ color: '#D4AF37', fontStyle: 'italic', fontSize: '18px' }}>
          Le cercle est complet. Revenez plus tard.
        </Text>
      </div>
    );
  }

  return (
    <div className={`relative flex justify-center items-center h-[420px] sm:h-[480px] md:h-[500px] w-full ${className}`}>
      
      {/* MATCH OVERLAY */}
      <AnimatePresence>
        {matchMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141210]/98 px-4"
            style={{
              background: 'radial-gradient(circle, #2C1A12 0%, #0F0906 100%)'
            }}
          >
            {/* Hand-stitched leather patch frame border */}
            <div 
              className="absolute inset-6 border-dashed border-[1px] border-[#C5A059]/20 rounded-sm pointer-events-none" 
            />

            {/* Glowing ambient light */}
            <div className="absolute w-72 h-72 rounded-full bg-[#C5A059]/10 blur-[100px] pointer-events-none" />

            {/* Gold metallic header with reflections */}
            <motion.h1
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
              className="text-center font-serif font-black tracking-[0.2em] mb-4 drop-shadow-2xl"
              style={{
                fontSize: '3.25rem',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, #FFF3CC 0%, #D4AF37 25%, #4E2E19 50%, #C5A059 75%, #FFF3CC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.9)) drop-shadow(0px 0px 15px rgba(212,175,55,0.4))'
              }}
            >
              It's a Match
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-[10px] tracking-[0.4em] uppercase text-[#EFEBE4]/60 font-serif max-w-sm mb-16 leading-relaxed"
            >
              Una afinidad alquímica ha sido sellada.
            </motion.p>

            {/* AVATARS CONTAINER */}
            <div className="relative flex justify-center items-center w-full max-w-xs h-48 mb-16">
              
              {/* Left Avatar (Current User) */}
              <motion.div
                initial={{ x: -100, opacity: 0, rotate: -15 }}
                animate={{ x: -25, opacity: 1, rotate: -5 }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.5 }}
                className="relative w-36 h-36 rounded-full border-2 border-[#C5A059] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-10"
              >
                <img
                  src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.full_name || 'Tú')}&background=141210&color=C5A059`}
                  alt="Tú"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>

              {/* Central Seal (The Vault "V" Crest) */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 10, delay: 0.9 }}
                className="absolute z-20 w-12 h-12 bg-[#8B0000] rounded-full border border-[#C5A059] shadow-[0_5px_15px_rgba(0,0,0,0.6)] flex items-center justify-center"
              >
                <span className="text-[#C5A059] font-serif text-sm italic font-bold tracking-tighter">V</span>
              </motion.div>

              {/* Right Avatar (Matched Member) */}
              <motion.div
                initial={{ x: 100, opacity: 0, rotate: 15 }}
                animate={{ x: 25, opacity: 1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.5 }}
                className="relative w-36 h-36 rounded-full border-2 border-[#C5A059] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-10"
              >
                <img
                  src={matchMember.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchMember.full_name || matchMember.name)}&background=141210&color=C5A059`}
                  alt={matchMember.full_name || matchMember.name}
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>

            </div>

            {/* MATCH DETAILS */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mb-16"
            >
              <h2 className="text-[11px] tracking-[0.2em] uppercase text-[#C5A059] font-bold mb-2">
                Correspondencia con {matchMember.full_name || matchMember.name}
              </h2>
              {matchMember.elite_score !== undefined && (
                <p className="text-[10px] tracking-[0.15em] text-[#C5A059]/60 italic font-serif">
                  ✧ Afinidad Académica de Élite: {matchMember.elite_score}% ✧
                </p>
              )}
            </motion.div>

            {/* BUTTONS */}
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col gap-4 w-full max-w-xs"
            >
              <Button 
                onClick={() => router.push('/conversations')} 
                variant="outline"
                className="w-full cursor-pointer"
                style={{
                  backgroundColor: '#1E140F',
                  color: '#C5A059',
                  border: '1px solid #C5A059',
                  padding: '20px 0',
                  fontSize: '10px',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
              >
                Escribir Carta
              </Button>
              <Button 
                onClick={() => setMatchMember(null)} 
                variant="ghost"
                className="w-full cursor-pointer"
                style={{
                  color: 'rgba(197, 160, 89, 0.5)',
                  padding: '20px 0',
                  fontSize: '9px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase'
                }}
              >
                Volver al Cofre
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stack.map((member, index) => (
          <IdentityCard
            key={member.id}
            id={member.id}
            name={member.full_name || member.name}
            major={member.major}
            year={member.graduation_year || member.year}
            avatar_url={member.avatar_url}
            bio={member.bio}
            gender={member.gender}
            is_verified={member.is_verified}
            elite_score={member.elite_score}
            isTopCard={index === stack.length - 1}
            onSwiped={(direction) => handleSwipeSuccess(member.id, direction)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Stack;
