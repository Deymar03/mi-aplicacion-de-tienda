import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function TabHeader({ title }: { title: string }) {
  const { signOut, user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // Al cerrar sesión, las rutas protegidas del layout raíz llevan solas al login.
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <ThemedView style={[styles.container, { borderBottomColor: colors.tint }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title} numberOfLines={1}>
          {title}
        </ThemedText>
        <View style={{ flex: 1 }} />
        <View style={styles.infoContainer}>
          <ThemedText style={styles.userInfo} numberOfLines={1}>
            👤 {user?.name}
          </ThemedText>

          <TouchableOpacity
            onPress={toggleTheme}
            accessibilityLabel="Cambiar tema claro u oscuro"
            style={[styles.themeButton, { borderColor: colors.border }]}
          >
            <ThemedText style={styles.themeText}>{theme === 'dark' ? '☀️' : '🌙'}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.actionSuccess, opacity: loading ? 0.6 : 1 }]}
            onPress={handleLogout}
            disabled={loading}
          >
            <ThemedText style={styles.logoutText}>Salir</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    flexShrink: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  userInfo: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
    flexShrink: 1,
  },
  themeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  themeText: {
    fontSize: 14,
    lineHeight: 18,
  },
  logoutButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
});
