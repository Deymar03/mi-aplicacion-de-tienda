// Convierte errores técnicos (Supabase / red) en mensajes claros en español para el usuario.

export function mensajeDeError(error: unknown, porDefecto = 'Ocurrió un error inesperado.'): string {
  const raw =
    typeof error === 'string'
      ? error
      : (error as { message?: string } | null)?.message ?? '';
  const msg = raw.toLowerCase();

  if (!msg) return porDefecto;

  if (msg.includes('invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('email not confirmed'))
    return 'Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.';
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'Ya existe una cuenta con ese correo.';
  if (msg.includes('password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.';
  if (msg.includes('unable to validate email') || msg.includes('invalid email'))
    return 'El correo electrónico no es válido.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
  if (msg.includes('network request failed') || msg.includes('failed to fetch'))
    return 'Sin conexión con el servidor. Revisa tu internet.';
  if (msg.includes('stock insuficiente')) return raw;
  if (msg.includes('row-level security') || msg.includes('permission denied'))
    return 'No tienes permisos para realizar esta acción.';
  if (msg.includes('duplicate key')) return 'Ya existe un registro con esos datos.';

  return raw || porDefecto;
}
