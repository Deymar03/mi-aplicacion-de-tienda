// Subida de imágenes de productos a Supabase Storage (bucket público `product-images`).
// Antes se guardaba la ruta local del celular (file://...), que solo funcionaba en ese teléfono.

import { supabase } from '@/supabase';

const BUCKET = 'product-images';

/** true si la imagen ya está en internet (no hace falta volver a subirla). */
export const esUrlRemota = (uri: string) => /^https?:\/\//i.test(uri);

/** Sube una imagen local y devuelve su URL pública. */
export async function subirImagenProducto(uri: string): Promise<string> {
  const respuesta = await fetch(uri);
  const buffer = await respuesta.arrayBuffer();

  const extensionOriginal = (uri.split('?')[0].split('.').pop() ?? '').toLowerCase();
  const extension = ['jpg', 'jpeg', 'png', 'webp'].includes(extensionOriginal)
    ? extensionOriginal
    : 'jpg';
  const contentType =
    extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg';

  const ruta = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(ruta, buffer, {
    contentType,
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
}
