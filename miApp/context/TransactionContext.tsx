//*este es el transaction context es para manejar las transacciones en la aplicacion
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { CartItem } from './CartContext';

export interface Transaction {
  id: string;

  user_id: string;

  usuario_nombre: string;

  items: CartItem[];

  total: number;

  metodo_pago?: string;

  receipt_id?: string;

  subtotal?: number;

  total_items?: number;

  status?: string;

  created_at: string;

  profiles?: {
    carnet: string;
    name: string;
    role: string;
  };
}

interface TransactionContextType {
  registrarTransaccion: (
    userId: string,
    usuarioNombre: string,
    items: CartItem[],
    total: number,
    metodo?: string
  ) => Promise<Transaction>;

  obtenerTodasTransacciones: () => Transaction[];

  obtenerTransaccionesUsuario: (
    userId: string
  ) => Transaction[];
}

export const TransactionContext =
  createContext<TransactionContextType | undefined>(
    undefined
  );

export const TransactionProvider = ({
  children,
}: any) => {
  const [transactions, setTransactions] = useState<
    Transaction[]
  >([]);

  /*  */

const fetchTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles:user_id (
        carnet,
        name,
        role
      )
    `)
    .order('created_at', {
      ascending: false,
    });

  if (!error && data) {
    setTransactions(data as Transaction[]);
  }
};

//*este apartado permite que tengamos actualizado los datos de las transacciones

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
        },
(payload) => {
  setTransactions((prev) => [
    payload.new as Transaction,
    ...prev,
  ]);
}
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

//* esto registra que usuario hizo una compra 

const registrarTransaccion = async (
  userId: string,
  usuarioNombre: string,
  items: CartItem[],
  total: number,
  metodo: string = 'Efectivo'
): Promise<Transaction> => {

  const receiptId =
    'REC-' +
    Date.now().toString().slice(-8);

  const { data, error } = await supabase
    .from('transactions')
    .insert([
      {
        user_id: userId,

        usuario_nombre: usuarioNombre,

        items,

        total,

        metodo_pago: metodo,

        subtotal: total,

        total_items: items.length,

        status: 'completado',

        receipt_id: receiptId,
      },
    ])
    .select(`
      *,
      profiles:user_id (
        carnet,
        name,
        role
      )
    `)
    .single();

  if (error) throw error;

  return data as Transaction;
};

//* recolecta los datos pertinentes para su posterior reporte

  const obtenerTodasTransacciones = () =>
    transactions;

  const obtenerTransaccionesUsuario = (
    userId: string
  ) =>
    transactions.filter(
      (t) => t.user_id === userId
    );

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

  if (!ctx)
    throw new Error(
      'useTransactions must be used within TransactionProvider'
    );

  return ctx;
};