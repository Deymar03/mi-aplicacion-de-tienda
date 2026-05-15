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
          backgroundColor: colorScheme === 'dark' ? '#202020' : '#ffffff',
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
      }}
    >
      {isAdmin ? (
        <>
          {/* ================= ADMIN ================= */}

          <Tabs.Screen
            name="index"
            options={{
              title: 'Dashboard',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="chart.bar.fill" color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="explorar"
            options={{
              title: 'Productos',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="cube.box.fill" color={color} />
              ),
              href: '/productos',
            }}
          />

          <Tabs.Screen
            name="ganancias"
            options={{
              title: 'Ventas',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="chart.line.uptrend.xyaxis" color={color} />
              ),
              href: '/ventas',
            }}
          />
        </>
      ) : (
        <>
          {/* ================= CLIENTE ================= */}

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
              href: '/productos',
            }}
          />

          <Tabs.Screen
            name="ganancias"
            options={{
              title: 'Carrito',
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="cart.fill" color={color} />
              ),
              href: '/ventas',
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