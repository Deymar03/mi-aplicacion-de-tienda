import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';

export default function LoginAdminScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      await login(email, password, 'admin');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar sesión');
    }
  };

  const inputBgColor = colorScheme === 'dark' ? '#263238' : '#FFFFFF';
  const inputBorderColor = colorScheme === 'dark' ? '#37474F' : '#E0E0E0';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.title}>
            🔐 Administrador
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Inicia sesión en tu cuenta
          </ThemedText>
          <View style={styles.credentialsBox}>
            <ThemedText style={styles.credentialsLabel}>📋 Credenciales:</ThemedText>
            <ThemedText style={styles.credentialsText}>Usuario: <ThemedText style={styles.credentialsCode}>admin</ThemedText></ThemedText>
            <ThemedText style={styles.credentialsText}>Contraseña: <ThemedText style={styles.credentialsCode}>1234</ThemedText></ThemedText>
          </View>
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: inputBorderColor,
                backgroundColor: inputBgColor,
              },
            ]}
            placeholder="📧 Correo electrónico"
            placeholderTextColor={colorScheme === 'dark' ? '#90A4AE' : '#BDBDBD'}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: inputBorderColor,
                backgroundColor: inputBgColor,
              },
            ]}
            placeholder="🔒 Contraseña"
            placeholderTextColor={colorScheme === 'dark' ? '#90A4AE' : '#BDBDBD'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? '⏳ Iniciando...' : '✓ Iniciar Sesión'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <ThemedText style={{ color: colors.tint }}>← Volver</ThemedText>
        </TouchableOpacity>
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
  },
  headerSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  formSection: {
    marginBottom: 24,
    gap: 16,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    padding: 12,
  },
  credentialsBox: {
    marginTop: 24,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#2ECC71',
  },
  credentialsLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    opacity: 0.8,
  },
  credentialsText: {
    fontSize: 13,
    marginBottom: 4,
  },
  credentialsCode: {
    fontWeight: '700',
    fontFamily: 'monospace',
  },
});
