import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isSignedIn: boolean;
}

// Credenciales predefinidas (ADMIN)
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: '1234',
  name: 'Admin',
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usuariosRegistrados, setUsuariosRegistrados] = useState<User[]>([]);

  // Verificar sesión al iniciar
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Cargar usuarios registrados
        const savedUsuarios = await AsyncStorage.getItem('usuariosRegistrados');
        if (savedUsuarios) {
          setUsuariosRegistrados(JSON.parse(savedUsuarios));
        }

        // Cargar usuario actual
        const savedUser = await AsyncStorage.getItem('user');
        console.log('🔍 Usuario guardado:', savedUser);

        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            console.log('✅ Usuario restaurado:', parsedUser.name);
          } catch (parseError) {
            console.error('❌ Error al parsear usuario:', parseError);
            await AsyncStorage.removeItem('user');
          }
        } else {
          console.log('📝 No hay usuario guardado - mostrando login');
          setUser(null);
        }
      } catch (e) {
        console.error('❌ Error al revisar sesión:', e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string, role: 'user' | 'admin') => {
    setIsLoading(true);
    try {
      // Si es admin
      if (role === 'admin') {
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
          const adminUser: User = {
            id: 'admin-001',
            email: ADMIN_CREDENTIALS.email,
            name: ADMIN_CREDENTIALS.name,
            role: 'admin',
          };
          setUser(adminUser);
          await AsyncStorage.setItem('user', JSON.stringify(adminUser));
          console.log('✅ Login admin exitoso');
          return;
        } else {
          throw new Error('Credenciales de admin inválidas');
        }
      }

      // Si es usuario (cliente)
      const usuarioEncontrado = usuariosRegistrados.find((u) => u.email === email);
      if (usuarioEncontrado) {
        // Verificar contraseña (por ahora solo verificamos email y contraseña simples)
        const contraseniaGuardada = await AsyncStorage.getItem(`pass_${email}`);
        if (contraseniaGuardada === password) {
          setUser(usuarioEncontrado);
          await AsyncStorage.setItem('user', JSON.stringify(usuarioEncontrado));
          console.log('✅ Login cliente exitoso:', usuarioEncontrado.name);
          return;
        }
      }

      throw new Error('Credenciales inválidas');
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Verificar si el email ya existe
      if (usuariosRegistrados.find((u) => u.email === email)) {
        throw new Error('El email ya está registrado');
      }

      // Crear nuevo usuario
      const nuevoUsuario: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'user',
      };

      // Guardar el usuario
      const usuariosActualizados = [...usuariosRegistrados, nuevoUsuario];
      setUsuariosRegistrados(usuariosActualizados);
      await AsyncStorage.setItem('usuariosRegistrados', JSON.stringify(usuariosActualizados));

      // Guardar contraseña (en una aplicación real, esto debería encriptarse)
      await AsyncStorage.setItem(`pass_${email}`, password);

      // Auto-login después del registro
      setUser(nuevoUsuario);
      await AsyncStorage.setItem('user', JSON.stringify(nuevoUsuario));

      console.log('✅ Registro exitoso:', nuevoUsuario.name);
    } catch (error) {
      console.error('❌ Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      await AsyncStorage.removeItem('user');
      console.log('👋 Logout realizado');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isSignedIn: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
