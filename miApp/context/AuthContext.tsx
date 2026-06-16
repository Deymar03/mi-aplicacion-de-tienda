//! esto es nuestra conexion de autentificacion con la base de datos

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '@/supabase';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;

  signIn: (
    email: string,
    password: string
  ) => Promise<void>;

  signUp: (
    name: string,
    email: string,
    password: string,
    carnet: string
  ) => Promise<void>;

  signOut: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export const AuthProvider = ({
  children,
}: any) => {
  const [user, setUser] =
    useState<any>(null);

  const [session, setSession] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

useEffect(() => {
  let mounted = true;

  const initializeAuth =
    async () => {
      try {
        setLoading(true);

        const {
          data: { session },
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          console.log(
            'GET SESSION ERROR:',
            error
          );
        }

        if (!mounted) return;

        setSession(session);

if (
  session?.user &&
  session.user.id !== user?.id
) {
  await fetchProfile(
    session.user.id
  );
}

if (!session?.user) {
  setUser(null);
}
      } catch (error) {
        console.log(
          'INIT AUTH ERROR:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

  initializeAuth();

const {
  data: authListener,
} =
  supabase.auth.onAuthStateChange(
    async (_event, session) => {
      try {
        if (!mounted) return;

        setSession(session);

if (
  session?.user &&
  session.user.id !== user?.id
) {
  await fetchProfile(
    session.user.id
  );
}

if (!session?.user) {
  setUser(null);
}
      } catch (error) {
        console.log(
          'AUTH STATE ERROR:',
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
  );


  return () => {
    mounted = false;

    authListener.subscription.unsubscribe();
  };
}, [user?.id]);

  const fetchProfile =
    async (id: string) => {
      try {
        const { data, error } =
          await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .maybeSingle();

if (error) {
  console.log(
    'PROFILE ERROR:',
    error
  );

  setUser(null);

  return;
}

        setUser(data);
        console.log(
  'PROFILE CARGADO:',
  data
);
      } catch (error) {
        console.log(
          'FETCH PROFILE ERROR:',
          error
        );
      }
    };

const signIn = async (
  email: string,
  password: string
) => {
  try {
    setLoading(true);

    const { error } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.log(
      'LOGIN ERROR:',
      error
    );

    throw error;
  } finally {
    setLoading(false);
  }
};

const signUp = async (
  name: string,
  email: string,
  password: string,
  carnet: string
) => {
  try {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          carnet: carnet.trim(),
          role: 'user',
        },
      },
    });

    if (error) {
      console.log(
        'SIGNUP ERROR:',
        error
      );

      throw error;
    }

    console.log(
      'Usuario registrado:',
      data.user?.id
    );
  } catch (error) {
    console.log(
      'REGISTER ERROR:',
      error
    );

    throw error;
  } finally {
    setLoading(false);
  }
};

const signOut = async () => {
  try {
    setLoading(true);

    await supabase.auth.signOut();

    setUser(null);

    setSession(null);
  } catch (error) {
    console.log(
      'SIGNOUT ERROR:',
      error
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);