// Contexto de autenticación: sesión de Supabase + perfil del usuario (tabla `profiles`).
//
// - `initializing`: true mientras se recupera la sesión guardada al abrir la app.
// - `loading`: true mientras se ejecuta un login / registro / cierre de sesión.
// - `user`: perfil (nombre, carnet, rol). `isAdmin` es un atajo para user.role === 'admin'.

import type { Session } from '@supabase/supabase-js';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { supabase } from '@/supabase';
import { mensajeDeError } from '@/utils/errores';

export interface Profile {
  id: string;
  name: string;
  carnet: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: Profile | null;
  session: Session | null;
  initializing: boolean;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    carnet: string
  ) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function cargarPerfil(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('No se pudo cargar el perfil:', error.message);
    return null;
  }
  return (data as Profile | null) ?? null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // Id del perfil ya cargado, para no repetir la consulta en cada evento de Supabase.
  const perfilCargadoId = useRef<string | null>(null);

  const aplicarSesion = useCallback(async (nueva: Session | null) => {
    setSession(nueva);

    if (!nueva?.user) {
      perfilCargadoId.current = null;
      setUser(null);
      return;
    }

    if (perfilCargadoId.current === nueva.user.id) return;

    const perfil = await cargarPerfil(nueva.user.id);
    perfilCargadoId.current = perfil ? nueva.user.id : null;
    setUser(perfil);
  }, []);

  useEffect(() => {
    let activo = true;

    supabase.auth
      .getSession()
      .then(({ data }) => aplicarSesion(data.session))
      .catch((e) => console.warn('Error al recuperar la sesión:', e))
      .finally(() => {
        if (activo) setInitializing(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((evento, nueva) => {
      if (evento === 'INITIAL_SESSION') return; // ya lo maneja getSession()
      if (evento === 'TOKEN_REFRESHED') {
        setSession(nueva);
        return;
      }
      // Supabase recomienda NO hacer llamadas async a su API dentro de este callback.
      setTimeout(() => {
        if (activo) aplicarSesion(nueva);
      }, 0);
    });

    return () => {
      activo = false;
      listener.subscription.unsubscribe();
    };
  }, [aplicarSesion]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw new Error(mensajeDeError(error));

        // Esperamos al perfil para que la app entre ya con el rol correcto (admin / cliente).
        const perfil = await cargarPerfil(data.user.id);
        if (!perfil) {
          await supabase.auth.signOut();
          throw new Error('Tu cuenta no tiene un perfil asignado. Contacta al administrador.');
        }
        perfilCargadoId.current = data.user.id;
        setUser(perfil);
        setSession(data.session);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string, carnet: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            // El rol NO se envía: el servidor (trigger) siempre asigna 'user'.
            data: { name: name.trim(), carnet: carnet.trim() },
          },
        });
        if (error) throw new Error(mensajeDeError(error));

        return { needsConfirmation: !data.session };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Error al cerrar sesión:', error.message);
    } finally {
      perfilCargadoId.current = null;
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      initializing,
      loading,
      isAdmin: user?.role === 'admin',
      signIn,
      signUp,
      signOut,
    }),
    [user, session, initializing, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
