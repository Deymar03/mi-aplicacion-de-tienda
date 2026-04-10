import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import { TransactionProvider } from '@/context/TransactionContext';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { isSignedIn, isLoading } = useAuth();

  // Mostrar pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {/* Loading screen */}
        </View>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={isSignedIn ? '(tabs)' : '(auth)'}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <TransactionProvider>
            <RootLayoutContent />
          </TransactionProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}
