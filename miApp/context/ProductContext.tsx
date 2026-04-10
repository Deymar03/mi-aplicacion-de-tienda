import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precioCompra: number; // Solo visible para admin
  precioVenta: number;
  stock: number;
  imagen?: string;
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

  // Cargar productos al iniciar
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const savedProductos = await AsyncStorage.getItem('productos');
        if (savedProductos) {
          setProductos(JSON.parse(savedProductos));
        } else {
          // Productos de ejemplo
          const productosDemo: Product[] = [
            {
              id: '1',
              nombre: 'Arroz Premium',
              categoria: 'Alimentos',
              precioCompra: 15,
              precioVenta: 20,
              stock: 50,
            },
            {
              id: '2',
              nombre: 'Frijoles Negros',
              categoria: 'Alimentos',
              precioCompra: 12,
              precioVenta: 18,
              stock: 35,
            },
            {
              id: '3',
              nombre: 'Leche Descremada',
              categoria: 'Bebidas',
              precioCompra: 8,
              precioVenta: 12,
              stock: 40,
            },
            {
              id: '4',
              nombre: 'Jugo Natural',
              categoria: 'Bebidas',
              precioCompra: 10,
              precioVenta: 15,
              stock: 25,
            },
            {
              id: '5',
              nombre: 'Detergente Polvo',
              categoria: 'Limpieza',
              precioCompra: 20,
              precioVenta: 28,
              stock: 20,
            },
            {
              id: '6',
              nombre: 'Shampoo',
              categoria: 'Higiene',
              precioCompra: 18,
              precioVenta: 25,
              stock: 15,
            },
          ];
          setProductos(productosDemo);
          await AsyncStorage.setItem('productos', JSON.stringify(productosDemo));
        }
      } catch (error) {
        console.error('Error cargando productos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductos();
  }, []);

  const agregarProducto = async (producto: Omit<Product, 'id'>) => {
    try {
      const nuevoProducto: Product = {
        ...producto,
        id: Math.random().toString(36).substr(2, 9),
      };
      const productosActualizados = [...productos, nuevoProducto];
      setProductos(productosActualizados);
      await AsyncStorage.setItem('productos', JSON.stringify(productosActualizados));
    } catch (error) {
      console.error('Error agregando producto:', error);
      throw error;
    }
  };

  const actualizarProducto = async (id: string, productoActualizado: Partial<Product>) => {
    try {
      const productosActualizados = productos.map((p) =>
        p.id === id ? { ...p, ...productoActualizado } : p
      );
      setProductos(productosActualizados);
      await AsyncStorage.setItem('productos', JSON.stringify(productosActualizados));
    } catch (error) {
      console.error('Error actualizando producto:', error);
      throw error;
    }
  };

  const eliminarProducto = async (id: string) => {
    try {
      const productosActualizados = productos.filter((p) => p.id !== id);
      setProductos(productosActualizados);
      await AsyncStorage.setItem('productos', JSON.stringify(productosActualizados));
    } catch (error) {
      console.error('Error eliminando producto:', error);
      throw error;
    }
  };

  const obtenerProducto = (id: string) => {
    return productos.find((p) => p.id === id);
  };

  const reducirStock = async (id: string, cantidad: number) => {
    const producto = productos.find((p) => p.id === id);
    if (producto && producto.stock >= cantidad) {
      await actualizarProducto(id, { stock: producto.stock - cantidad });
    }
  };

  const value: ProductContextType = {
    productos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProducto,
    reducirStock,
    isLoading,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts debe usarse dentro de ProductProvider');
  }
  return context;
};
