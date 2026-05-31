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
  const router = useRouter();

  useEffect(() => {
    setStack(members);
  }, [members]);

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
    <div className={`relative flex justify-center items-center h-[500px] w-full ${className}`}>
      
      {/* MATCH OVERLAY */}
      <AnimatePresence>
        {matchMember && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141210]/95 backdrop-blur-md px-4"
          >
            <Heading 
              level={1} 
              variant="gold"
              className="mb-4 text-center italic tracking-tighter"
              style={{ fontSize: '3.5rem' }}
            >
              Alianza Forjada
            </Heading>
            <Text 
              variant="small" 
              style={{ letterSpacing: '0.4em', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '48px' }}
              className="text-center"
            >
              Tus intereses se alinean con los de {matchMember.full_name || matchMember.name}
            </Text>
            
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              src={matchMember.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(matchMember.full_name || matchMember.name)}&background=F5F5DC&color=C5A059`} 
              alt="Match" 
              className="w-40 h-40 md:w-56 md:h-56 object-cover rounded-full border border-[#C5A059]/50 shadow-[0_0_50px_rgba(197,160,89,0.2)] mb-12"
            />
            
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              <Button 
                onClick={() => router.push('/conversations')} 
                variant="outline"
                className="w-full cursor-pointer"
                style={{
                  backgroundColor: '#1A1816',
                  color: '#C5A059',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  padding: '20px 0',
                  fontSize: '10px',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase'
                }}
              >
                Iniciar Correspondencia
              </Button>
              <Button 
                onClick={() => setMatchMember(null)} 
                variant="ghost"
                className="w-full cursor-pointer"
                style={{
                  color: 'rgba(197, 160, 89, 0.6)',
                  padding: '20px 0',
                  fontSize: '9px',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase'
                }}
              >
                Continuar Explorando
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
