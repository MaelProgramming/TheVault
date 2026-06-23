'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/services/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  token: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  token: null,
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const fetchProfile = async (jwt: string) => {
    try {
      const res = await fetch('/api/members/me', {
        headers: { 'Authorization': `Bearer ${jwt}` },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        // Preserve invited flag if present
        if (data.invited_by_founder !== undefined) {
          data.invited_by_founder = Boolean(data.invited_by_founder);
        }
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    const jwt = token || localStorage.getItem('vault_token');
    if (jwt) {
      await fetchProfile(jwt);
    }
  };

  useEffect(() => {
    // Écouteur temps réel de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // On récupère le token frais pour le backend
        const jwt = await firebaseUser.getIdToken();
        localStorage.setItem('vault_token', jwt);
        document.cookie = `vault_token=${jwt}; path=/; max-age=3600; SameSite=Lax; Secure`;
        setToken(jwt);
        setUser(firebaseUser);
        await fetchProfile(jwt);
      } else {
        // Nettoyage si déconnexion
        localStorage.setItem('vault_token', '');
        document.cookie = "vault_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setToken(null);
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, token, refreshProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider. Un peu de rigueur.");
  }
  return context;
};
