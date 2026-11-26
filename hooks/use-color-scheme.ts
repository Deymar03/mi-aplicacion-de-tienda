import { useTheme } from '@/context/ThemeContext';

/** Devuelve 'light' o 'dark' según el tema activo de la app. */
export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}
