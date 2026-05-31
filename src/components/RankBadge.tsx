'use client';

import React from 'react';
import { Badge } from '@gruand-co/core';

export type RankType = 'FOUNDER' | 'CO-FOUNDER' | 'HEIR' | 'POSTULANT';

interface RankBadgeProps {
  rank: RankType;
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, className = '' }) => {
  const getBadgeVariant = () => {
    switch (rank) {
      case 'FOUNDER':
      case 'CO-FOUNDER':
        return 'accent';
      case 'HEIR':
        return 'primary';
      case 'POSTULANT':
        return 'outline';
      default:
        return 'surface';
    }
  };

  const getRankLabel = () => {
    switch (rank) {
      case 'FOUNDER': return 'Fundador';
      case 'CO-FOUNDER': return 'Co-Fundador';
      case 'HEIR': return 'Heredero';
      case 'POSTULANT': return 'Postulante';
      default: return 'Miembro';
    }
  };

  return (
    <Badge
      variant={getBadgeVariant()}
      className={className}
      style={{ letterSpacing: '0.3em', fontSize: '9px', fontWeight: 'bold', color: '#FFD700' }}
    >
      {getRankLabel()}
    </Badge>
  );
};
