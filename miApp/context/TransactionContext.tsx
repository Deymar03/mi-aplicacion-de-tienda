import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { CartItem } from './CartContext';

export interface Transaction {
  id: string;
  user_id: string;
  usuario_nombre: string;
  items: CartItem[];
  total: number;
  created_at: string;
}

interface TransactionContextType {
  registrarTransaccion: (
    userId: string,
    usuarioNombre: string,
    items: CartItem[],
    total: number,
    metodo?: string
  ) => Promise<void>;

  obtenerTodasTransacciones: () => Transaction[];
  obtenerTransaccionesUsuario: (userId: string) => Transaction[];
}

export const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const TransactionProvider = ({ children }: any) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /* ===================== LOAD ===================== */
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
  };

  /* ===================== REALTIME ===================== */
  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
        },
        () => {
          fetchTransactions(); // 🔥 auto refresh
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ===================== INSERT ===================== */
  const registrarTransaccion = async (
    userId: string,
    usuarioNombre: string,
    items: CartItem[],
    total: number,
    metodo: string = 'Efectivo'
  ) => {
    const { error } = await supabase.from('transactions').insert([
      {
        user_id: userId,
        usuario_nombre: usuarioNombre,
        items,
        total,
        metodo_pago: metodo,
      },
    ]);

    if (error) throw error;
  };

  /* ===================== GETTERS ===================== */
  const obtenerTodasTransacciones = () => transactions;

  const obtenerTransaccionesUsuario = (userId: string) =>
    transactions.filter((t) => t.user_id === userId);

  return (
    <TransactionContext.Provider
      value={{
        registrarTransaccion,
        obtenerTodasTransacciones,
        obtenerTransaccionesUsuario,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
};