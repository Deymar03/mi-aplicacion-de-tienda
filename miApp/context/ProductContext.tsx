import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;

  esCanjeable?: boolean;
  puntosRequeridos?: number;
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

  // ==========================
  // 🔄 CARGAR PRODUCTOS
  // ==========================
  useEffect(() => {
    const loadProductos = async () => {
      try {
        const savedProductos = await AsyncStorage.getItem('productos');
        if (savedProductos) {
          const parsed = JSON.parse(savedProductos);

          // ✅ asegurar compatibilidad con productos antiguos
          const productosNormalizados = parsed.map((p: Product) => ({
            ...p,
            esCanjeable: p.esCanjeable || false,
            puntosRequeridos: p.puntosRequeridos || 0,
          }));

          setProductos(productosNormalizados);
        } else {
          const productosDemo: Product[] = [
            {
              id: '1',
              nombre: 'Arroz Premium',
              categoria: 'Alimentos',
              precioCompra: 15,
              precioVenta: 20,
              stock: 50,
              esCanjeable: false,
            },
            {
              id: '2',
              nombre: 'Frijoles Negros',
              categoria: 'Alimentos',
              precioCompra: 12,
              precioVenta: 18,
              stock: 35,
              esCanjeable: false,
            },
            {
              id: '3',
              nombre: 'Leche Descremada',
              categoria: 'Bebidas',
              precioCompra: 8,
              precioVenta: 12,
              stock: 40,
              esCanjeable: true,
              puntosRequeridos: 15,
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

  // ==========================
  // ➕ AGREGAR PRODUCTO
  // ==========================
const agregarProducto = async (producto: Omit<Product, 'id'>) => {
  try {
    // 🔥 VALIDACIÓN
    const existe = productos.find(
      (p) => p.nombre.toLowerCase() === producto.nombre.toLowerCase()
    );

    if (existe) {
      throw new Error('El producto ya existe');
    }

    const nuevoProducto: Product = {
      ...producto,
      id: Math.random().toString(36).substr(2, 9),
      esCanjeable: producto.esCanjeable || false,
      puntosRequeridos: producto.puntosRequeridos || 0,
    };

    const productosActualizados = [...productos, nuevoProducto];

    setProductos(productosActualizados);
    await AsyncStorage.setItem('productos', JSON.stringify(productosActualizados));
  } catch (error) {
    console.error(error);
    throw error;
  }
};

  // ==========================
  // ✏️ ACTUALIZAR PRODUCTO
  // ==========================
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

  // ==========================
  // ❌ ELIMINAR
  // ==========================
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

  // ==========================
  // 🔍 OBTENER
  // ==========================
  const obtenerProducto = (id: string) => {
    return productos.find((p) => p.id === id);
  };

  // ==========================
  // 📉 STOCK
  // ==========================
  const reducirStock = async (id: string, cantidad: number) => {
    const producto = productos.find((p) => p.id === id);

    if (producto && producto.stock >= cantidad) {
      await actualizarProducto(id, {
        stock: producto.stock - cantidad,
      });
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
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductProvider');
  }
  return context;
};