//! con esto manejamos el control de la preferencia del dispositivo 
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

type ThemeType = 'light' | 'dark';

interface ThemeContextProps {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext =
  createContext<ThemeContextProps>(
    {} as ThemeContextProps
  );

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] =
    useState<ThemeType>('dark');

  const toggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark'
        ? 'light'
        : 'dark'
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme =
  () => useContext(ThemeContext);