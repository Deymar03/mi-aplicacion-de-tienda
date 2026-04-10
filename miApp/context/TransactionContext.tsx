import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem } from './CartContext';

export interface Transaction {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  items: CartItem[];
  total: number;
  fecha: string;
  estado: 'completada' | 'pendiente';
}

interface TransactionContextType {
  transacciones: Transaction[];
  registrarTransaccion: (usuarioId: string, usuarioNombre: string, items: CartItem[], total: number) => Promise<void>;
  obtenerTransaccionesUsuario: (usuarioId: string) => Transaction[];
  obtenerTodasTransacciones: () => Transaction[];
  isLoading: boolean;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar transacciones al iniciar
  useEffect(() => {
    const loadTransacciones = async () => {
      try {
        const savedTransacciones = await AsyncStorage.getItem('transacciones');
        if (savedTransacciones) {
          setTransacciones(JSON.parse(savedTransacciones));
        }
      } catch (error) {
        console.error('Error cargando transacciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransacciones();
  }, []);

  const registrarTransaccion = async (
    usuarioId: string,
    usuarioNombre: string,
    items: CartItem[],
    total: number
  ) => {
    try {
      const nuevaTransaccion: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        usuarioId,
        usuarioNombre,
        items,
        total,
        fecha: new Date().toLocaleDateString('es-BO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        estado: 'completada',
      };

      const transaccionesActualizadas = [...transacciones, nuevaTransaccion];
      setTransacciones(transaccionesActualizadas);
      await AsyncStorage.setItem('transacciones', JSON.stringify(transaccionesActualizadas));
      console.log('✅ Transacción registrada:', nuevaTransaccion.id);
    } catch (error) {
      console.error('Error registrando transacción:', error);
      throw error;
    }
  };

  const obtenerTransaccionesUsuario = (usuarioId: string) => {
    return transacciones.filter((t) => t.usuarioId === usuarioId);
  };

  const obtenerTodasTransacciones = () => {
    return transacciones;
  };

  const value: TransactionContextType = {
    transacciones,
    registrarTransaccion,
    obtenerTransaccionesUsuario,
    obtenerTodasTransacciones,
    isLoading,
  };

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions debe usarse dentro de TransactionProvider');
  }
  return context;
};
