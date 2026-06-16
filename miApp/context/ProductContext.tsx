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
  imagenUrl?: string;
}

//*esto define nuestras variables de productos para su posterior insert en la BD
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

//*esto solicita datos de supabase para poder crear las tablas

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

          imagenUrl:
           p.imagen_url || '',

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

//* busca la base de datos para poder hacer cambios


useEffect(() => {
  fetchProductos();

  const channel = supabase
    .channel('products-channel')

    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'products',
      },
      (payload) => {
        setProductos((prev) => [
          {
            id: payload.new.id,
            nombre: payload.new.nombre || '',
            categoria:payload.new.categoria || '',
            descripcion:payload.new.descripcion || '',
            codigoProducto:payload.new.codigo_producto || '',
            marca:payload.new.marca || '',
            unidadMedida:payload.new.unidad_medida ||
              'Unidad',
            imagenUrl:payload.new.imagen_url || '',

            precioCompra:

              Number(
                payload.new.precio_compra
              ) || 0,
            precioVenta:
              Number(
                payload.new.precio_venta
              ) || 0,
            stock:
              Number(payload.new.stock) || 0,
            activo:
              payload.new.activo ?? true,
          },
          ...prev,
        ]);
      }
    )

    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'products',
      },
      (payload) => {
        setProductos((prev) =>
          prev.map((p) =>
            p.id === payload.new.id
              ? {
                  ...p,
                  nombre:
                    payload.new.nombre,
                  categoria:
                    payload.new.categoria,
                  descripcion:
                    payload.new.descripcion,
                  codigoProducto:
                    payload.new.codigo_producto,
                  marca:
                    payload.new.marca,
                  unidadMedida:
                    payload.new.unidad_medida,
                  imagenUrl:
                    payload.new.imagen_url,
                  precioCompra:
                  
                    Number(
                      payload.new
                        .precio_compra
                    ),
                  precioVenta:
                    Number(
                      payload.new
                        .precio_venta
                    ),
                  stock: Number(
                    payload.new.stock
                  ),
                  activo:
                    payload.new.activo,
                }
              : p
          )
        );
      }
    )

    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);



//* funcion que crea el codigo unico de producto

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

//* agregar nuevo producto 

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
                  
                imagen_url:
                  producto.imagenUrl,

                activo: true,
              },
            ]);

        if (error) {
          throw error;
        }
      } catch (error) {


        throw error;
      }
    };

//* actualizxar con el boton de edicion

  const actualizarProducto =
    async (
      id: string,
      producto: Partial<Product>
    ) => {
      try {
        //! para verificar si el producto se envia o no 
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

              imagen_url:
                producto.imagenUrl,
            })
            .eq('id', id);

        if (error) {
          console.log(
            'UPDATE ERROR:',
            error
          );

          throw error;
        }


      } catch (error) {
        console.log(
          'ACTUALIZAR PRODUCTO ERROR:',
          error
        );

        throw error;
      }
    };

//* eliminar u ocultar

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


      } catch (error) {
        console.log(
          'ELIMINAR PRODUCTO ERROR:',
          error
        );

        throw error;
      }
    };

//* cantidad

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


    };

//* busqueda de productos 

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