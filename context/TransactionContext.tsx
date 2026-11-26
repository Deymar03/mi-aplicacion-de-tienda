// Contexto de transacciones (ventas / recibos).
//
// La compra se registra con la función SQL `realizar_compra` (ver supabase/setup.sql), que en UNA sola
// operación atómica valida el stock, descuenta el inventario y crea el recibo con los precios reales
// de la base de datos. Si la función aún no existe, se usa el método clásico como respaldo.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { supabase } from '@/supabase';

import { useAuth } from './AuthContext';
import { CartItem } from './CartContext';
import { useProducts } from './ProductContext';

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
  /** Registra una compra completa (valida stock, descuenta inventario y crea el recibo). */
  registrarCompra: (items: CartItem[], metodo: string) => Promise<Transaction>;
  obtenerTodasTransacciones: () => Transaction[];
  obtenerTransaccionesUsuario: (userId: string) => Transaction[];
  recargarTransacciones: () => Promise<void>;
  isLoading: boolean;
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const SELECT_CON_PERFIL = `
  *,
  profiles:user_id (
    carnet,
    name,
    role
  )
`;

export const TransactionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin } = useAuth();
  const { reducirStock } = useProducts();
  const userId = user?.id ?? null;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);

    let consulta = supabase
      .from('transactions')
      .select(SELECT_CON_PERFIL)
      .order('created_at', { ascending: false });

    // El cliente solo ve sus compras (además de la protección RLS en el servidor).
    if (!isAdmin) consulta = consulta.eq('user_id', userId);

    const { data, error } = await consulta;
    if (error) console.warn('Error al cargar transacciones:', error.message);
    else setTransactions((data ?? []) as unknown as Transaction[]);

    setIsLoading(false);
  }, [userId, isAdmin]);

  // Cargar al iniciar sesión y mantener actualizado en tiempo real.
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      return;
    }

    fetchTransactions();

    const channel = supabase
      .channel(`transactions-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        async (payload) => {
          const nueva = payload.new as { id: string; user_id: string };
          if (!isAdmin && nueva.user_id !== userId) return;

          // El evento no trae el perfil del cliente (carnet), así que volvemos a pedir la fila completa.
          const { data } = await supabase
            .from('transactions')
            .select(SELECT_CON_PERFIL)
            .eq('id', nueva.id)
            .maybeSingle();

          if (data) {
            const fila = data as unknown as Transaction;
            setTransactions((prev) =>
              prev.some((t) => t.id === fila.id) ? prev : [fila, ...prev]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, isAdmin, fetchTransactions]);

  /** Método clásico (respaldo): descuenta stock desde la app y luego inserta el recibo. */
  const registrarCompraClasica = async (items: CartItem[], metodo: string) => {
    if (!user) throw new Error('Debes iniciar sesión para comprar.');

    for (const item of items) {
      await reducirStock(item.producto.id, item.cantidad);
    }

    const total = items.reduce((acc, i) => acc + i.cantidad * i.precioUnitario, 0);

    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: user.id,
          usuario_nombre: user.name,
          items,
          total,
          metodo_pago: metodo,
          subtotal: total,
          total_items: items.length,
          status: 'completado',
          receipt_id: 'REC-' + Date.now().toString().slice(-8),
        },
      ])
      .select(SELECT_CON_PERFIL)
      .single();

    if (error) throw error;
    return data as unknown as Transaction;
  };

  const registrarCompra = async (items: CartItem[], metodo: string): Promise<Transaction> => {
    if (items.length === 0) throw new Error('El carrito está vacío.');

    const { data, error } = await supabase.rpc('realizar_compra', {
      p_items: items.map((i) => ({ producto_id: i.producto.id, cantidad: i.cantidad })),
      p_metodo: metodo,
    });

    if (!error) return data as Transaction;

    // La función SQL todavía no fue creada en Supabase: usamos el método clásico.
    if (error.code === 'PGRST202' || /could not find the function/i.test(error.message)) {
      console.warn('Función realizar_compra no encontrada; usando el método clásico.');
      return registrarCompraClasica(items, metodo);
    }

    throw error;
  };

  const obtenerTodasTransacciones = useCallback(() => transactions, [transactions]);

  const obtenerTransaccionesUsuario = useCallback(
    (id: string) => transactions.filter((t) => t.user_id === id),
    [transactions]
  );

  const value = useMemo<TransactionContextType>(
    () => ({
      registrarCompra,
      obtenerTodasTransacciones,
      obtenerTransaccionesUsuario,
      recargarTransacciones: fetchTransactions,
      isLoading,
    }),
    // `registrarCompra` depende de `user` y de `reducirStock` (que se recrean junto con sus contextos).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transactions, isLoading, user, reducirStock, obtenerTodasTransacciones, obtenerTransaccionesUsuario, fetchTransactions]
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
};

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within TransactionProvider');
  return ctx;
};
