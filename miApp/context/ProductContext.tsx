import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/supabase';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
}

interface ProductContextType {
  productos: Product[];
  agregarProducto: (producto: Omit<Product, 'id'>) => Promise<void>;
  actualizarProducto: (id: string, producto: Partial<Product>) => Promise<void>;
  eliminarProducto: (id: string) => Promise<void>;
  obtenerProducto: (id: string) => Product | undefined;
  reducirStock: (id: string, cantidad: number) => Promise<void>;
  isLoading: boolean;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // =========================
  // 🔄 CARGAR PRODUCTOS
  // =========================
  const fetchProductos = async () => {
    const { data, error } = await supabase
      .from('products') // 👈 SOLO UNA TABLA
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProductos(
        data.map((p: any) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria,
          precioCompra: p.precio_compra,
          precioVenta: p.precio_venta,
          stock: p.stock,
        }))
      );
    }
  };

  useEffect(() => {
    fetchProductos();

    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProductos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // =========================
  // ➕ AGREGAR
  // =========================
  const agregarProducto = async (producto: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert([
      {
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio_compra: producto.precioCompra,
        precio_venta: producto.precioVenta,
        stock: producto.stock,
      },
    ]);

    if (error) throw error;
  };

  // =========================
  // ✏️ ACTUALIZAR
  // =========================
  const actualizarProducto = async (id: string, producto: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update({
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio_compra: producto.precioCompra,
        precio_venta: producto.precioVenta,
        stock: producto.stock,
      })
      .eq('id', id);

    if (error) throw error;
  };

  // =========================
  // ❌ ELIMINAR
  // =========================
  const eliminarProducto = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  // =========================
  // 📉 STOCK
  // =========================
  const reducirStock = async (id: string, cantidad: number) => {
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    const nuevoStock = producto.stock - cantidad;

    const { error } = await supabase
      .from('products')
      .update({ stock: nuevoStock })
      .eq('id', id);

    if (error) throw error;
  };

  return (
    <ProductContext.Provider
      value={{
        productos,
        agregarProducto,
        actualizarProducto,
        eliminarProducto,
        obtenerProducto: (id) => productos.find(p => p.id === id),
        reducirStock,
        isLoading,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProducts must be used within ProductProvider');
  return ctx;
};