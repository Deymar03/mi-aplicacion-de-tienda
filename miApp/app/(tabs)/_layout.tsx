import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderTopColor: colors.border || '#e0e0e0',
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
      }}>
      {isAdmin ? (
        // Tabs para ADMIN
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="chart.bar" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="explorar"
            options={{
              title: 'Productos',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="plus.circle.fill" color={color} />
              ),
              href: '/explorar',
            }}
          />
          <Tabs.Screen
            name="ganancias"
            options={{
              title: 'Ganancias',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="dollarsign.circle.fill" color={color} />
              ),
              href: '/ganancias',
            }}
          />
        </>
      ) : (
        // Tabs para CLIENTE
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Tienda',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="house.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="explorar"
            options={{
              title: 'Productos',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="magnifyingglass" color={color} />
              ),
              href: '/explorar',
            }}
          />
          <Tabs.Screen
            name="ganancias"
            options={{
              title: 'Carrito',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="cart.fill" color={color} />
              ),
              href: '/ganancias',
            }}
          />
        </>
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
  },
});
