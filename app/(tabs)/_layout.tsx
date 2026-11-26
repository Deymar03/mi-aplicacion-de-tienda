import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { isAdmin } = useAuth();
  const { items } = useCart();

  // Cantidad de productos en el carrito (solo para clientes).
  const cantidadCarrito = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 5,
        },
      }}
    >
      {/* Los nombres deben coincidir con los archivos de app/(tabs)/ */}
      <Tabs.Screen
        name="productos"
        options={{
          title: isAdmin ? 'Inventario' : 'Productos',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={isAdmin ? 'cube.box.fill' : 'magnifyingglass'} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ventas"
        options={{
          title: isAdmin ? 'Reportes' : 'Carrito',
          tabBarBadge: !isAdmin && cantidadCarrito > 0 ? cantidadCarrito : undefined,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={isAdmin ? 'chart.bar.fill' : 'cart.fill'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
