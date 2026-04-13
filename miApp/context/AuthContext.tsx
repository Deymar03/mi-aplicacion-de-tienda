import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// =============================
// 👤 INTERFACES
// =============================
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  puntos: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSignedIn: boolean;

  // ⭐ SISTEMA DE PUNTOS
  agregarPuntos: (monto: number) => void;
  actualizarPuntos: (puntos: number) => void;
}

// =============================
// 🔐 ADMIN
// =============================
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: '1234',
  name: 'Admin',
};

// =============================
// 🌐 CONTEXTO
// =============================
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================
// 🚀 PROVIDER
// =============================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState<User[]>([]);

  // =============================
  // 🔄 RESTAURAR SESIÓN
  // =============================
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedUsuarios = await AsyncStorage.getItem('usuariosRegistrados');
        if (savedUsuarios) {
          setUsuariosRegistrados(JSON.parse(savedUsuarios));
        }

        const savedUser = await AsyncStorage.getItem('user');

        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);

          // 🔥 asegurar puntos siempre
          if (parsedUser.puntos === undefined) {
            parsedUser.puntos = 0;
          }

          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('❌ Error al restaurar sesión:', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // =============================
  // 🔐 LOGIN
  // =============================
  const login = async (email: string, password: string, role: 'user' | 'admin') => {
    setIsLoading(true);
    try {
      // ADMIN
      if (role === 'admin') {
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          const adminUser: User = {
            id: 'admin-001',
            email: ADMIN_CREDENTIALS.email,
            name: ADMIN_CREDENTIALS.name,
            role: 'admin',
            puntos: 0,
          };

          setUser(adminUser);
          await AsyncStorage.setItem('user', JSON.stringify(adminUser));
          return;
        } else {
          throw new Error('Credenciales de admin inválidas');
        }
      }

      // CLIENTE
      const usuario = usuariosRegistrados.find((u) => u.email === email);

      if (usuario) {
        const pass = await AsyncStorage.getItem(`pass_${email}`);

        if (pass === password) {
          const userConPuntos = {
            ...usuario,
            puntos: usuario.puntos || 0,
          };

          setUser(userConPuntos);
          await AsyncStorage.setItem('user', JSON.stringify(userConPuntos));
          return;
        }
      }

      throw new Error('Credenciales inválidas');
    } catch (error) {
      console.error('❌ Error login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  // 📝 REGISTER
  // =============================
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (usuariosRegistrados.find((u) => u.email === email)) {
        throw new Error('El email ya está registrado');
      }

      const nuevoUsuario: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'user',
        puntos: 0, // ⭐ INICIALIZA PUNTOS
      };

      const nuevosUsuarios = [...usuariosRegistrados, nuevoUsuario];

      setUsuariosRegistrados(nuevosUsuarios);
      await AsyncStorage.setItem('usuariosRegistrados', JSON.stringify(nuevosUsuarios));
      await AsyncStorage.setItem(`pass_${email}`, password);

      setUser(nuevoUsuario);
      await AsyncStorage.setItem('user', JSON.stringify(nuevoUsuario));

    } catch (error) {
      console.error('❌ Error register:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  // 🚪 LOGOUT
  // =============================
  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('❌ Error logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // =============================
  // ⭐ AGREGAR PUNTOS AUTOMÁTICOS
  // =============================
  const agregarPuntos = (monto: number) => {
    if (!user) return;

    const nuevos = Math.floor(monto / 10);

    const actualizado = {
      ...user,
      puntos: (user.puntos || 0) + nuevos,
    };

    setUser(actualizado);
    AsyncStorage.setItem('user', JSON.stringify(actualizado));
  };

  // =============================
  // ⭐ ACTUALIZAR PUNTOS (CANJE)
  // =============================
  const actualizarPuntos = (puntos: number) => {
    if (!user) return;

    const actualizado = {
      ...user,
      puntos,
    };

    setUser(actualizado);
    AsyncStorage.setItem('user', JSON.stringify(actualizado));
  };

  // =============================
  // 📦 VALUE
  // =============================
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isSignedIn: !!user,
    agregarPuntos,
    actualizarPuntos,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =============================
// 🎯 HOOK
// =============================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};