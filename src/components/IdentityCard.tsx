'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { uploadAvatar } from '@/services/api';
import { type ExtendedProps } from '@/types/Props';
import { Card, Heading, Text, Button, Modal } from '@gruand-co/core';
import { RankBadge } from './RankBadge';
import type { RankType } from './RankBadge';
import { useAuth } from '@/context/AuthContext';

const IdentityCard: React.FC<ExtendedProps> = ({
  id, name, major, year, avatar_url, bio, gender, isTopCard, is_verified, elite_score, onSwiped
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(avatar_url);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const isFounder = name.includes('Mael Gruand');
  const isCoFounder = name.includes('Eliot Dangas');
  let rank: RankType = 'POSTULANT';
  if (isFounder) { rank = 'FOUNDER'; }
  else if (isCoFounder) { rank = 'CO-FOUNDER'; }
  else if (is_verified) { rank = 'HEIR'; }

  useEffect(() => {
    setCurrentImage(avatar_url);
  }, [avatar_url]);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [0, 80], [0, 1]);
  const nopeOpacity = useTransform(x, [0, -80], [0, 1]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const newUrl = await uploadAvatar(file, id);
      if (newUrl) setCurrentImage(newUrl);
    } catch (err) {
      console.error("Échec de l'upload, très peu distingué.", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      const direction = info.offset.x > 0 ? 'right' : 'left';
      if (onSwiped) onSwiped(direction);
    }
  };

  const avatarSrc = currentImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F5F5DC&color=C5A059`;

  const cardInnerContent = (
    <div className="group w-full max-w-[350px] transition-all duration-700 gold-shine-card">
      <Card elevation="high" hoverable style={{ backgroundColor: '#F5F5DC', border: '1px solid #C5A059' }}>
        <div className="relative h-[400px] w-full overflow-hidden bg-[#F5F5F5] mb-4">
          <img
            src={avatarSrc}
            alt={name}
            className="h-full w-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-[1.5s] ease-in-out scale-100 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F5F5DC&color=C5A059`;
            }}
          />

          {isTopCard && (
            <>
              <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-8 z-50 transform -rotate-12 border-4 border-emerald-500 rounded-full p-3 backdrop-blur-sm bg-black/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500 fill-current" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </motion.div>
              <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-8 z-50 transform rotate-12 border-4 border-red-500 rounded-full p-3 backdrop-blur-sm bg-black/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.div>
            </>
          )}

          <div className="absolute bottom-4 left-4 overflow-hidden">
            <span className="block text-[9px] tracking-[0.3em] text-white bg-black/80 px-3 py-1 uppercase transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
              {gender === 'F' ? 'Lady' : 'Gentleman'}
            </span>
          </div>
        </div>

        <div className="text-center px-2">
          <RankBadge rank={rank} className="mb-4" />
          {elite_score !== undefined && (
            <Text variant="small" style={{ color: '#C5A059', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>
              ✧ Afinidad Élite: {elite_score}%
            </Text>
          )}
          <Heading level={2} style={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'black', fontSize: '1.25rem' }}>
            {name}
          </Heading>
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-[10px] font-light tracking-widest text-stone-600 uppercase">{major}</p>
            <span className="w-1 h-1 bg-stone-400 rounded-full"></span>
            <p className="text-[10px] font-light tracking-widest text-stone-600 uppercase">{year}</p>
          </div>

          <Button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            variant="outline"
            className="mt-6 w-full cursor-pointer"
            style={{
              border: '1px solid black',
              color: 'black',
              padding: '12px 0',
              fontSize: '9px',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
            }}
          >
            Acceder al perfil
          </Button>
        </div>
      </Card>
    </div>
  );

  return (
    <motion.div
      style={isTopCard ? { x, rotate, opacity, position: 'absolute', zIndex: 50 } : { position: 'absolute', zIndex: 0 }}
      exit={{
        x: x.get() > 0 ? 1000 : -1000,
        opacity: 0,
        scale: 0.5,
        transition: { duration: 0.4 }
      }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      className={isTopCard ? "cursor-grab active:cursor-grabbing" : "opacity-40 scale-95 translate-y-4 pointer-events-none"}
    >
      {cardInnerContent}

      {/* MODAL SYSTEM */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="">
        <div className="w-full flex flex-col md:flex-row bg-[#FDFDFD]">
          {/* Avatar side */}
          <div className="relative h-80 md:h-auto md:w-1/2 overflow-hidden group/img bg-stone-100 min-h-[350px]">
            <img src={avatarSrc} alt={name} className="h-full w-full object-cover object-top absolute inset-0" />
            {user?.uid === id && (
              <>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all cursor-pointer"
                >
                  <span className="text-white text-[9px] tracking-[0.3em] uppercase border border-white/30 px-6 py-3 hover:bg-white hover:text-black transition-all">
                    {isUploading ? 'Procesando...' : 'Cambiar Retrato'}
                  </span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </>
            )}
          </div>

          {/* Details side */}
          <div className="p-10 md:w-1/2 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <Heading level={2} style={{ color: 'black', letterSpacing: '-0.02em' }}>
                  {name}
                </Heading>
                <RankBadge rank={rank} />
              </div>
              <p className="text-[10px] tracking-[0.2em] text-stone-400 uppercase mt-1">
                {gender === 'F' ? 'Lady' : 'Gentleman'} — {year}
              </p>
              {elite_score !== undefined && (
                <Text variant="small" style={{ color: '#C5A059', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '12px', fontWeight: 600 }} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span> Afinidad Élite: {elite_score}%
                </Text>
              )}
            </div>

            <div className="my-6">
              <Text variant="small" style={{ letterSpacing: '0.15em', textTransform: 'uppercase', color: 'stone-400', marginBottom: '8px' }} className="italic">
                Semblanza
              </Text>
              <Text variant="serif" style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#1c1917', lineHeight: '1.6', borderLeft: '2px solid #C5A059', paddingLeft: '16px' }}>
                "{bio || "Sin biografía disponible por el momento."}"
              </Text>
            </div>

            <div className="pt-6 border-t border-stone-100">
              <Text variant="small" style={{ letterSpacing: '0.3em', textTransform: 'uppercase', color: 'stone-400' }}>
                Grado: <span style={{ color: 'black' }}>{major}</span>
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
};
export default IdentityCard;
