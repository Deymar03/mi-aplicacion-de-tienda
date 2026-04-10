import React, { createContext, useContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from './ProductContext';

export interface CartItem {
  producto: Product;
  cantidad: number;
  precioUnitario: number; // Precio al que se agregó
}

export interface CartContextType {
  items: CartItem[];
  agregarAlCarrito: (producto: Product, cantidad: number) => void;
  removerDelCarrito: (productoId: string) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  calcularTotal: () => number;
  vaciarCarrito: () => void;
  obtenerResumenCompra: () => { items: CartItem[]; total: number; fecha: string };
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const agregarAlCarrito = (producto: Product, cantidad: number) => {
    setItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.producto.id === producto.id);
      
      if (itemExistente) {
        return prevItems.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      }
      
      return [...prevItems, { producto, cantidad, precioUnitario: producto.precioVenta }];
    });
  };

  const removerDelCarrito = (productoId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.producto.id !== productoId));
  };

  const actualizarCantidad = (productoId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removerDelCarrito(productoId);
      return;
    }
    
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.producto.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0);
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const obtenerResumenCompra = () => {
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      items,
      total: calcularTotal(),
      fecha,
    };
  };

  const value: CartContextType = {
    items,
    agregarAlCarrito,
    removerDelCarrito,
    actualizarCantidad,
    calcularTotal,
    vaciarCarrito,
    obtenerResumenCompra,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};
