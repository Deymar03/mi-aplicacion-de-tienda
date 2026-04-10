import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SelectRoleScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.title}>
            🛒 Tienda de Barrio
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            ¿Qué tipo de usuario eres?
          </ThemedText>
        </View>

        <View style={styles.buttonsSection}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/login-user')}
          >
            <ThemedText style={styles.buttonEmoji}>👤</ThemedText>
            <ThemedText style={styles.buttonText}>Cliente</ThemedText>
            <ThemedText style={styles.buttonSubtext}>Compra productos</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/login-admin')}
          >
            <ThemedText style={styles.buttonEmoji}>🔐</ThemedText>
            <ThemedText style={styles.buttonText}>Administrador</ThemedText>
            <ThemedText style={styles.buttonSubtext}>Gestiona la tienda</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 50,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  buttonsSection: {
    width: '100%',
    gap: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
  },
});
