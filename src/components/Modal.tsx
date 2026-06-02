'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Heading, Text, Button } from '@gruand-co/core';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm
}) => {
  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={type === 'confirm' ? undefined : onClose}
            className="absolute inset-0 bg-[#0A0908]/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md z-10"
          >
            <Card
              elevation="high"
              style={{
                backgroundColor: '#1A1816',
                border: type === 'error' ? '1px solid rgba(185, 28, 28, 0.3)' : '1px solid rgba(197, 160, 89, 0.25)',
                padding: '32px',
                borderRadius: '2px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
              }}
            >
              {/* Type indicator icon */}
              <div className="flex justify-center mb-6">
                {type === 'error' ? (
                  <div className="w-10 h-10 rounded-full border border-red-900/40 flex items-center justify-center bg-red-950/20">
                    <span className="text-red-500 font-sans font-bold text-base">!</span>
                  </div>
                ) : type === 'confirm' ? (
                  <div className="w-10 h-10 rounded-full border border-[#C5A059]/40 flex items-center justify-center bg-[#C5A059]/10">
                    <span className="text-[#C5A059] font-serif font-bold text-base">?</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full border border-[#C5A059]/30 flex items-center justify-center bg-[#C5A059]/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#C5A059]/80 shadow-[0_0_8px_rgba(197,160,89,1)]" />
                  </div>
                )}
              </div>

              {/* Title & message */}
              <div className="text-center mb-8">
                <Heading
                  level={3}
                  variant={type === 'error' ? 'default' : 'gold'}
                  className={`italic text-[17px] ${type === 'error' ? 'text-red-500' : ''}`}
                >
                  {title}
                </Heading>
                <Text
                  variant="serif"
                  style={{
                    color: '#EFEBE4',
                    opacity: 0.8,
                    fontSize: '13px',
                    lineHeight: '1.7',
                    marginTop: '16px',
                    display: 'block'
                  }}
                >
                  {message}
                </Text>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                {type === 'confirm' && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    style={{
                      border: '1px solid rgba(197, 160, 89, 0.2)',
                      color: 'rgba(239, 235, 228, 0.6)',
                      padding: '12px 0',
                      fontSize: '9px',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  onClick={type === 'confirm' ? handleConfirm : onClose}
                  variant={type === 'error' ? 'outline' : 'default'}
                  className="flex-1 cursor-pointer"
                  style={{
                    backgroundColor: type === 'error' ? 'transparent' : '#C5A059',
                    color: type === 'error' ? '#EF4444' : '#141210',
                    border: type === 'error' ? '1px solid rgba(239, 68, 68, 0.4)' : 'none',
                    fontWeight: 'bold',
                    padding: '12px 0',
                    fontSize: '9px',
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase'
                  }}
                >
                  {confirmText}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default Modal;
