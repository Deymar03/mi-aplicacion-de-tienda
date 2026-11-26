// Control del tema claro/oscuro.
// Por defecto sigue la preferencia del teléfono y recuerda la elección manual del usuario.

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'tema-preferido';

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemColorScheme();
  const [override, setOverride] = useState<ThemeType | null>(null);

  // Cargar la preferencia guardada (si existe).
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark') setOverride(saved);
      })
      .catch(() => {});
  }, []);

  const theme: ThemeType = override ?? (system === 'dark' ? 'dark' : 'light');

  const toggleTheme = useCallback(() => {
    const next: ThemeType = theme === 'dark' ? 'light' : 'dark';
    setOverride(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
