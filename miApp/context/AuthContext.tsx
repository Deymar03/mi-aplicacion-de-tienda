import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSignedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =========================
  // RESTORE SESSION
  // =========================
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.name || data.user.email || '',
          role: profile?.role || 'user',
        });
      }

      setIsLoading(false);
    };

    load();
  }, []);

  // =========================
  // REGISTER
  // =========================
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (data.user) {
      // 🔥 CREAR PROFILE AUTOMÁTICAMENTE
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        role: 'user',
      });

      setUser({
        id: data.user.id,
        email,
        name,
        role: 'user',
      });
    }

    setIsLoading(false);
  };

  // =========================
  // LOGIN
  // =========================
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // 🔥 TRAER PROFILE SIN ROMPER (SAFE)
      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      // 🔥 SI NO EXISTE PROFILE LO CREA
      if (!profile) {
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: data.user.email,
            role: 'user',
          })
          .select()
          .single();

        profile = newProfile;
      }

      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: profile?.name || '',
        role: profile?.role || 'user',
      });

    } finally {
      setIsLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isSignedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
