
import { useTheme } from '@/context/ThemeContext';

/**
 * Devuelve el tema activo de la aplicación.
 * Respeta la selección manual del usuario
 * tanto en web como en dispositivos móviles.
 */
export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}
