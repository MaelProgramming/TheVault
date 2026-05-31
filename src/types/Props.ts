export interface GridProps {
  members: Member[];
  className?: string;
  onSwipeSuccess?: (id: string) => void;
}

export interface Member {
  id: string;
  name: string;
  major: string;
  gender: 'M' | 'F';
  year: number;
  avatar_url: string;
  bio: string;
  full_name: string;
  graduation_year: number;
  is_verified: boolean;
  elite_score?: number;
}

export interface MemberProps {
  id: string;
  name: string;
  major: string;
  year: number;
  avatar_url: string;
  bio: string;
  gender: 'M' | 'F';
  is_verified?: boolean;
  elite_score?: number;
}

export interface ExtendedProps extends MemberProps {
  isTopCard?: boolean;
  onSwiped?: (direction: 'left' | 'right') => void;
}

export interface FooterProps {
  className?: string;
  textContent?: string;
}

export interface HeaderProps {
  className?: string;
  textContent: string;
  titleContent: string;
}

export type { Member as M };
export type { MemberProps as MProps };
