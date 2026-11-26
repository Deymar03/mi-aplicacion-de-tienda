import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { session, user, initializing } = useAuth();

  // Mientras se recupera la sesión guardada mostramos una pantalla de carga.
  if (initializing) {
    return (
      <View style={[styles.splash, { backgroundColor: Colors[colorScheme].background }]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </View>
    );
  }

  const autenticado = !!session && !!user;

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />

        {/* Rutas protegidas: solo con sesión iniciada */}
        <Stack.Protected guard={autenticado}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        {/* Pantallas de acceso: solo sin sesión */}
        <Stack.Protected guard={!autenticado}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <TransactionProvider>
              <RootLayoutContent />
            </TransactionProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
