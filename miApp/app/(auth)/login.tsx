import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuth } from '@/context/AuthContext';


export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { login, register, isLoading } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /* ================= LOGIN ================= */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      const user = await login(email, password);

      // 🔥 redirección principal (explorar)
      router.replace('/(tabs)/explorar');
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };

  /* ================= REGISTER ================= */
  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      await register(name, email, password);

      Alert.alert(
        'Éxito',
        'Cuenta creada correctamente (rol: cliente por defecto)'
      );

      setIsRegister(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cuenta');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.box}>
        {/* TITULO */}
        <ThemedText type="title" style={styles.title}>
          🛒 Tienda de Barrio
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
        </ThemedText>

        {/* NOMBRE (solo registro) */}
        {isRegister && (
          <TextInput
            placeholder="Nombre completo"
            placeholderTextColor="#fff"
            style={[styles.input, { color: '#fff' }]}
            value={name}
            onChangeText={setName}
           
          />
        )}

        {/* EMAIL */}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#fff"
          style={[styles.input, { color: '#fff' }]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          
        />

        {/* PASSWORD */}
        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#fff"
          style={[styles.input, { color: '#fff' }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry

        />

        {/* BOTÓN PRINCIPAL */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={isRegister ? handleRegister : handleLogin}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isRegister ? 'Registrarse' : 'Iniciar sesión'}
          </ThemedText>
        </TouchableOpacity>

        {/* CAMBIO LOGIN / REGISTER */}
        <TouchableOpacity
          onPress={() => setIsRegister(!isRegister)}
          style={styles.switch}
        >
          <ThemedText style={{ color: colors.tint }}>
            {isRegister
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  box: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },

  title: {
    textAlign: 'center',
    marginBottom: 10,
  },

  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
  },

  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  switch: {
    marginTop: 10,
    alignItems: 'center',
  },
});