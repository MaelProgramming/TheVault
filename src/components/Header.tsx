'use client';

import React from 'react';
import { Heading, Text, Divider } from '@gruand-co/core';
import { type HeaderProps } from '@/types/Props';

const Header: React.FC<HeaderProps> = ({ className = "", textContent = "", titleContent = "" }) => {
  return (
    <header className={`${className} flex flex-col items-center`}>
      <Heading level={1} variant="gold" className="text-center italic tracking-widest animate-text-shine">
        {titleContent}
      </Heading>
      <Divider ornament style={{ width: '120px', margin: '10px auto' }} />
      <Text variant="small" style={{ letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C5A059', opacity: 0.7 }} className="text-center">
        {textContent}
      </Text>
    </header>
  );
};

export default Header;
