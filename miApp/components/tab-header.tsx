import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function TabHeader({ title }: { title: string }) {
  const router = useRouter();
  const { logout, user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedView style={[styles.container, { borderBottomColor: colors.tint }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        <View style={{ flex: 1 }} />
        <View style={styles.infoContainer}>
          <ThemedText style={styles.userInfo}>👤 {user?.name}</ThemedText>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.tint }]}
            onPress={handleLogout}
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
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.8,
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
