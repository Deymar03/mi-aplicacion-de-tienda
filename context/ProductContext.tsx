// Contexto de productos: lectura, creación, edición y baja lógica de productos en Supabase.
// Mantiene la lista sincronizada en tiempo real (Supabase Realtime).

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

/** Fila tal como viene de la tabla `products` (nombres de columnas en la BD). */
interface ProductRow {
  id: string;
  nombre: string | null;
  categoria: string | null;
  descripcion: string | null;
  codigo_producto: string | null;
  marca: string | null;
  unidad_medida: string | null;
  imagen_url: string | null;
  precio_compra: number | string | null;
  precio_venta: number | string | null;
  stock: number | string | null;
  activo: boolean | null;
}

const mapearProducto = (p: ProductRow): Product => ({
  id: p.id,
  nombre: p.nombre ?? '',
  categoria: p.categoria ?? '',
  descripcion: p.descripcion ?? '',
  codigoProducto: p.codigo_producto ?? '',
  marca: p.marca ?? '',
  unidadMedida: p.unidad_medida || 'Unidad',
  imagenUrl: p.imagen_url ?? '',
  precioCompra: Number(p.precio_compra) || 0,
  precioVenta: Number(p.precio_venta) || 0,
  stock: Number(p.stock) || 0,
  activo: p.activo ?? true,
});

/** Prefijo de código según la categoría: "Bebidas" -> "BEB". */
export const prefijoCategoria = (categoria: string) =>
  categoria.trim().substring(0, 3).toUpperCase();

/** Dado un listado de códigos existentes, calcula el siguiente PROD-XXX-NNN. */
const siguienteCodigoDesde = (categoria: string, codigos: (string | null | undefined)[]) => {
  const prefijo = prefijoCategoria(categoria);
  const base = `PROD-${prefijo}-`;
  const maximo = codigos.reduce((max, codigo) => {
    if (!codigo || !codigo.startsWith(base)) return max;
    const n = parseInt(codigo.slice(base.length), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return `${base}${String(maximo + 1).padStart(3, '0')}`;
};

interface ProductContextType {
  /** Productos activos (los dados de baja no aparecen). */
  productos: Product[];
  agregarProducto: (producto: Omit<Product, 'id'>) => Promise<void>;
  actualizarProducto: (id: string, producto: Partial<Product>) => Promise<void>;
  eliminarProducto: (id: string) => Promise<void>;
  obtenerProducto: (id: string) => Product | undefined;
  /** Solo para el flujo de compra "clásico" (sin función SQL). Prefiere TransactionContext.registrarCompra. */
  reducirStock: (id: string, cantidad: number) => Promise<void>;
  buscarProductoExistente: (nombre: string) => Product | undefined;
  /** Vista previa del siguiente código para una categoría (incluye productos dados de baja). */
  siguienteCodigo: (categoria: string) => string;
  isLoading: boolean;
  errorCarga: string | null;
  recargarProductos: () => Promise<void>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [todos, setTodos] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const fetchProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorCarga(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTodos((data as ProductRow[]).map(mapearProducto));
    } catch (error) {
      console.warn('Error al cargar productos:', error);
      setErrorCarga('No se pudieron cargar los productos. Revisa tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar y escuchar cambios solo cuando hay una sesión iniciada.
  useEffect(() => {
    if (!userId) {
      setTodos([]);
      return;
    }

    fetchProductos();

    const upsert = (row: ProductRow) => {
      const producto = mapearProducto(row);
      setTodos((prev) =>
        prev.some((p) => p.id === producto.id)
          ? prev.map((p) => (p.id === producto.id ? producto : p))
          : [producto, ...prev]
      );
    };

    const channel = supabase
      .channel(`products-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' }, (payload) =>
        upsert(payload.new as ProductRow)
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, (payload) =>
        upsert(payload.new as ProductRow)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchProductos]);

  const productos = useMemo(() => todos.filter((p) => p.activo !== false), [todos]);

  const siguienteCodigo = useCallback(
    (categoria: string) =>
      siguienteCodigoDesde(
        categoria,
        todos.map((p) => p.codigoProducto)
      ),
    [todos]
  );

  /** Código único calculado contra la BD (incluye productos dados de baja). */
  const generarCodigoProducto = async (categoria: string) => {
    const { data } = await supabase
      .from('products')
      .select('codigo_producto')
      .ilike('codigo_producto', `PROD-${prefijoCategoria(categoria)}-%`);

    return siguienteCodigoDesde(
      categoria,
      (data ?? []).map((r: { codigo_producto: string | null }) => r.codigo_producto)
    );
  };

  const agregarProducto = async (producto: Omit<Product, 'id'>) => {
    const insertar = async (codigo: string) =>
      supabase.from('products').insert([
        {
          nombre: producto.nombre.trim(),
          categoria: producto.categoria,
          descripcion: producto.descripcion,
          codigo_producto: codigo,
          marca: producto.marca,
          unidad_medida: producto.unidadMedida,
          precio_compra: producto.precioCompra,
          precio_venta: producto.precioVenta,
          stock: producto.stock,
          imagen_url: producto.imagenUrl,
          activo: true,
        },
      ]);

    let { error } = await insertar(await generarCodigoProducto(producto.categoria));

    // Si dos administradores crean un producto a la vez, el código puede repetirse: reintentamos una vez.
    if (error?.code === '23505') {
      ({ error } = await insertar(await generarCodigoProducto(producto.categoria)));
    }
    if (error) throw error;
  };

  const actualizarProducto = async (id: string, producto: Partial<Product>) => {
    const { error } = await supabase
      .from('products')
      .update({
        nombre: producto.nombre?.trim(),
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        codigo_producto: producto.codigoProducto,
        marca: producto.marca,
        unidad_medida: producto.unidadMedida,
        precio_compra: producto.precioCompra,
        precio_venta: producto.precioVenta,
        stock: producto.stock,
        imagen_url: producto.imagenUrl,
      })
      .eq('id', id);

    if (error) throw error;
  };

  /** Baja lógica: el producto se oculta pero se conserva el historial de ventas. */
  const eliminarProducto = async (id: string) => {
    const { error } = await supabase.from('products').update({ activo: false }).eq('id', id);
    if (error) throw error;
  };

  const reducirStock = async (id: string, cantidad: number) => {
    const producto = todos.find((p) => p.id === id);
    if (!producto) return;

    const nuevoStock = producto.stock - cantidad;
    if (nuevoStock < 0) {
      throw new Error(`Stock insuficiente de "${producto.nombre}"`);
    }

    // `.eq('stock', producto.stock)` evita pisar un cambio hecho por otro usuario al mismo tiempo.
    const { data, error } = await supabase
      .from('products')
      .update({ stock: nuevoStock })
      .eq('id', id)
      .eq('stock', producto.stock)
      .select('id');

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`Stock insuficiente de "${producto.nombre}" (cambió mientras comprabas)`);
    }
  };

  const obtenerProducto = useCallback((id: string) => todos.find((p) => p.id === id), [todos]);

  const buscarProductoExistente = useCallback(
    (nombre: string) =>
      productos.find((p) => p.nombre.toLowerCase().includes(nombre.toLowerCase())),
    [productos]
  );

  const value = useMemo<ProductContextType>(
    () => ({
      productos,
      agregarProducto,
      actualizarProducto,
      eliminarProducto,
      reducirStock,
      buscarProductoExistente,
      obtenerProducto,
      siguienteCodigo,
      isLoading,
      errorCarga,
      recargarProductos: fetchProductos,
    }),
    // Las funciones de escritura leen `todos` a través del closure; se recrean con él.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productos, todos, isLoading, errorCarga, siguienteCodigo, obtenerProducto, buscarProductoExistente, fetchProductos]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts debe estar dentro de ProductProvider');
  }
  return context;
};
