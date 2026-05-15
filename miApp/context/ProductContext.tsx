import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { supabase } from '@/supabase';

export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  descripcion?: string;
  codigoProducto?: string;
  marca?: string;
  unidadMedida?: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  activo?: boolean;
}

interface ProductContextType {
  productos: Product[];

  agregarProducto: (
    producto: Omit<Product, 'id'>
  ) => Promise<void>;

  actualizarProducto: (
    id: string,
    producto: Partial<Product>
  ) => Promise<void>;

  eliminarProducto: (
    id: string
  ) => Promise<void>;

  obtenerProducto: (
    id: string
  ) => Product | undefined;

  reducirStock: (
    id: string,
    cantidad: number
  ) => Promise<void>;

  buscarProductoExistente: (
    nombre: string
  ) => Product | undefined;

  isLoading: boolean;

  recargarProductos: () => Promise<void>;
}

export const ProductContext =
  createContext<
    ProductContextType | undefined
  >(undefined);

export const ProductProvider = ({
  children,
}: any) => {
  const [productos, setProductos] =
    useState<Product[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  /* ================= FETCH ================= */

  const fetchProductos = async () => {
    try {
      setIsLoading(true);

      const { data, error } =
        await supabase
          .from('products')
          .select('*')
          .order('created_at', {
            ascending: false,
          });

      if (error) {
        throw error;
      }

      if (!data) {
        setProductos([]);
        return;
      }

      const productosMapeados =
        data.map((p: any) => ({
          id: p.id,

          nombre: p.nombre || '',

          categoria:
            p.categoria || '',

          descripcion:
            p.descripcion || '',

          codigoProducto:
            p.codigo_producto || '',

          marca: p.marca || '',

          unidadMedida:
            p.unidad_medida ||
            'Unidad',

          precioCompra:
            Number(
              p.precio_compra
            ) || 0,

          precioVenta:
            Number(
              p.precio_venta
            ) || 0,

          stock:
            Number(p.stock) || 0,

          activo:
            p.activo ?? true,
        }));

      setProductos(productosMapeados);
    } catch (error) {
      console.log(
        'FETCH PRODUCTOS ERROR:',
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchProductos();

    const channel = supabase
      .channel('products-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProductos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= GENERAR CODIGO ================= */

  const generarCodigoProducto =
    async (
      categoria: string
    ) => {
      const prefijo =
        categoria
          .trim()
          .substring(0, 3)
          .toUpperCase();

      const { data } =
        await supabase
          .from('products')
          .select('id')
          .ilike(
            'codigo_producto',
            `PROD-${prefijo}-%`
          );

      const numero =
        (data?.length || 0) + 1;

      return `PROD-${prefijo}-${String(
        numero
      ).padStart(3, '0')}`;
    };

  /* ================= AGREGAR ================= */

  const agregarProducto =
    async (
      producto: Omit<
        Product,
        'id'
      >
    ) => {
      try {
        const codigo =
          producto.codigoProducto ||
          (await generarCodigoProducto(
            producto.categoria
          ));

        const { error } =
          await supabase
            .from('products')
            .insert([
              {
                nombre:
                  producto.nombre,

                categoria:
                  producto.categoria,

                descripcion:
                  producto.descripcion,

                codigo_producto:
                  codigo,

                marca:
                  producto.marca,

                unidad_medida:
                  producto.unidadMedida,

                precio_compra:
                  producto.precioCompra,

                precio_venta:
                  producto.precioVenta,

                stock:
                  producto.stock,

                activo: true,
              },
            ]);

        if (error) {
          throw error;
        }

        await fetchProductos();
      } catch (error) {
        console.log(
          'AGREGAR PRODUCTO ERROR:',
          error
        );

        throw error;
      }
    };

  /* ================= ACTUALIZAR ================= */

  const actualizarProducto =
    async (
      id: string,
      producto: Partial<Product>
    ) => {
      try {
        console.log(
          'ACTUALIZANDO PRODUCTO:',
          id,
          producto
        );

        const { error } =
          await supabase
            .from('products')
            .update({
              nombre:
                producto.nombre,

              categoria:
                producto.categoria,

              descripcion:
                producto.descripcion,

              codigo_producto:
                producto.codigoProducto,

              marca:
                producto.marca,

              unidad_medida:
                producto.unidadMedida,

              precio_compra:
                producto.precioCompra,

              precio_venta:
                producto.precioVenta,

              stock:
                producto.stock,
            })
            .eq('id', id);

        if (error) {
          console.log(
            'UPDATE ERROR:',
            error
          );

          throw error;
        }

        await fetchProductos();
      } catch (error) {
        console.log(
          'ACTUALIZAR PRODUCTO ERROR:',
          error
        );

        throw error;
      }
    };

  /* ================= ELIMINAR ================= */

  const eliminarProducto =
    async (id: string) => {
      try {
        const { error } =
          await supabase
            .from('products')
            .update({
              activo: false,
            })
            .eq('id', id);

        if (error) {
          throw error;
        }

        await fetchProductos();
      } catch (error) {
        console.log(
          'ELIMINAR PRODUCTO ERROR:',
          error
        );

        throw error;
      }
    };

  /* ================= STOCK ================= */

  const reducirStock =
    async (
      id: string,
      cantidad: number
    ) => {
      const producto =
        productos.find(
          (p) => p.id === id
        );

      if (!producto) return;

      const nuevoStock =
        producto.stock - cantidad;

      if (nuevoStock < 0) {
        throw new Error(
          'Stock insuficiente'
        );
      }

      const { error } =
        await supabase
          .from('products')
          .update({
            stock: nuevoStock,
          })
          .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchProductos();
    };

  /* ================= BUSCAR ================= */

  const buscarProductoExistente =
    (nombre: string) => {
      return productos.find((p) =>
        p.nombre
          .toLowerCase()
          .includes(
            nombre.toLowerCase()
          )
      );
    };

  return (
    <ProductContext.Provider
      value={{
        productos:
          productos.filter(
            (p) =>
              p.activo !== false
          ),

        agregarProducto,

        actualizarProducto,

        eliminarProducto,

        reducirStock,

        buscarProductoExistente,

        obtenerProducto: (
          id
        ) =>
          productos.find(
            (p) => p.id === id
          ),

        isLoading,

        recargarProductos:
          fetchProductos,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context =
    useContext(ProductContext);

  if (!context) {
    throw new Error(
      'useProducts debe estar dentro de ProductProvider'
    );
  }

  return context;
};