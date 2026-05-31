'use client';

import React from 'react';
import { Text } from '@gruand-co/core';
import { type FooterProps } from '@/types/Props';

const Footer: React.FC<FooterProps> = ({ className = "", textContent = "" }) => {
  return (
    <footer className={`${className} py-8 text-center`}>
      <Text variant="small" style={{ letterSpacing: '0.6em', textTransform: 'uppercase', color: '#C5A059', opacity: 0.6 }}>
        {textContent}
      </Text>
    </footer>
  );
};

export default Footer;
