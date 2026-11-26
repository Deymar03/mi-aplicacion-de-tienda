// Carrito de compras del cliente.
// Valida contra el stock real (en vivo) para no permitir comprar más de lo disponible.

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { Product, useProducts } from './ProductContext';

export interface CartItem {
  producto: Product;
  cantidad: number;
  precioUnitario: number;
}

export interface ResultadoCarrito {
  ok: boolean;
  mensaje?: string;
}

export interface CartContextType {
  items: CartItem[];
  agregarAlCarrito: (producto: Product, cantidad: number) => ResultadoCarrito;
  removerDelCarrito: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => ResultadoCarrito;
  calcularTotal: () => number;
  vaciarCarrito: () => void;
  obtenerResumenCompra: () => { items: CartItem[]; total: number; fecha: string };
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { obtenerProducto } = useProducts();

  /** Stock disponible más reciente (si el producto cambió en la BD, usamos ese valor). */
  const stockDisponible = useCallback(
    (producto: Product) => obtenerProducto(producto.id)?.stock ?? producto.stock,
    [obtenerProducto]
  );

  const agregarAlCarrito = useCallback(
    (producto: Product, cantidad: number): ResultadoCarrito => {
      const stock = stockDisponible(producto);
      const enCarrito = items.find((i) => i.producto.id === producto.id)?.cantidad ?? 0;

      if (cantidad <= 0) return { ok: false, mensaje: 'La cantidad debe ser mayor a 0.' };
      if (enCarrito + cantidad > stock) {
        return {
          ok: false,
          mensaje:
            stock === 0
              ? 'Este producto está agotado.'
              : `Solo hay ${stock} unidades disponibles de "${producto.nombre}".`,
        };
      }

      setItems((prev) => {
        const existente = prev.find((i) => i.producto.id === producto.id);
        if (existente) {
          return prev.map((i) =>
            i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
          );
        }
        return [...prev, { producto, cantidad, precioUnitario: producto.precioVenta }];
      });
      return { ok: true };
    },
    [items, stockDisponible]
  );

  const removerDelCarrito = useCallback((productoId: string) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  }, []);

  const actualizarCantidad = useCallback(
    (productoId: string, cantidad: number): ResultadoCarrito => {
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        removerDelCarrito(productoId);
        return { ok: true };
      }

      const item = items.find((i) => i.producto.id === productoId);
      if (!item) return { ok: false };

      const entero = Math.floor(cantidad);
      const stock = stockDisponible(item.producto);
      if (entero > stock) {
        setItems((prev) =>
          prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad: stock } : i))
        );
        return { ok: false, mensaje: `Solo hay ${stock} unidades disponibles.` };
      }

      setItems((prev) =>
        prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad: entero } : i))
      );
      return { ok: true };
    },
    [items, removerDelCarrito, stockDisponible]
  );

  const calcularTotal = useCallback(
    () => items.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0),
    [items]
  );

  const vaciarCarrito = useCallback(() => setItems([]), []);

  const obtenerResumenCompra = useCallback(
    () => ({
      items,
      total: calcularTotal(),
      fecha: new Date().toLocaleString('es-BO'),
    }),
    [items, calcularTotal]
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      agregarAlCarrito,
      removerDelCarrito,
      actualizarCantidad,
      calcularTotal,
      vaciarCarrito,
      obtenerResumenCompra,
    }),
    [
      items,
      agregarAlCarrito,
      removerDelCarrito,
      actualizarCantidad,
      calcularTotal,
      vaciarCarrito,
      obtenerResumenCompra,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
