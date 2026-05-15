// ===================== LOGIN.TSX COMPLETO CORREGIDO =====================

import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
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

  const colorScheme =
    useColorScheme();

  const colors =
    Colors[colorScheme ?? 'light'];

  /* ===================== AUTH ===================== */

  const {
    signIn,
    signUp,
    loading,
  } = useAuth();

  /* ===================== STATES ===================== */

  const [isRegister, setIsRegister] =
    useState(false);

  const [name, setName] =
    useState('');

  const [carnet, setCarnet] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  /* ===================== LOGIN ===================== */

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        'Error',
        'Completa todos los campos'
      );

      return;
    }

    try {
      await signIn(
        email.trim(),
        password
      );

      router.replace(
        '/(tabs)/productos'
      );
    } catch (error: any) {
      console.log(
        'LOGIN ERROR:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'Credenciales incorrectas'
      );
    }
  };

  /* ===================== REGISTER ===================== */

  const handleRegister = async () => {
    if (
      !name ||
      !carnet ||
      !email ||
      !password
    ) {
      Alert.alert(
        'Error',
        'Completa todos los campos'
      );

      return;
    }

    if (carnet.length < 5) {
      Alert.alert(
        'Error',
        'Carnet inválido'
      );

      return;
    }

    try {
      await signUp(
        name.trim(),
        email.trim(),
        password,
        carnet.trim()
      );

      Alert.alert(
        'Éxito',
        'Cuenta creada correctamente'
      );

      setName('');
      setCarnet('');
      setEmail('');
      setPassword('');

      setIsRegister(false);
    } catch (error: any) {
      console.log(
        'REGISTER ERROR:',
        error
      );

      Alert.alert(
        'Error',
        error?.message ||
          'No se pudo crear la cuenta'
      );
    }
  };

  /* ===================== UI ===================== */

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
      >
        <View style={styles.box}>
          {/* ===================== TITULO ===================== */}

          <ThemedText
            type="title"
            style={styles.title}
          >
            🛒 Tienda de Barrio
          </ThemedText>

          <ThemedText
            style={styles.subtitle}
          >
            {isRegister
              ? 'Crear cuenta'
              : 'Iniciar sesión'}
          </ThemedText>

          {/* ===================== NOMBRE ===================== */}

          {isRegister && (
            <TextInput
              placeholder="Nombre completo"
              placeholderTextColor="#fff"
              style={[
                styles.input,
                { color: '#fff' },
              ]}
              value={name}
              onChangeText={setName}
            />
          )}

          {/* ===================== CARNET ===================== */}

          {isRegister && (
            <TextInput
              placeholder="Carnet de identidad"
              placeholderTextColor="#fff"
              style={[
                styles.input,
                { color: '#fff' },
              ]}
              value={carnet}
              onChangeText={setCarnet}
              keyboardType="numeric"
            />
          )}

          {/* ===================== EMAIL ===================== */}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#fff"
            style={[
              styles.input,
              { color: '#fff' },
            ]}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* ===================== PASSWORD ===================== */}

          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#fff"
            style={[
              styles.input,
              { color: '#fff' },
            ]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* ===================== BOTON ===================== */}

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  colors.tint,
              },
            ]}
            onPress={
              isRegister
                ? handleRegister
                : handleLogin
            }
            disabled={loading}
          >
            <ThemedText
              style={styles.buttonText}
            >
              {loading
                ? 'Cargando...'
                : isRegister
                ? 'Registrarse'
                : 'Iniciar sesión'}
            </ThemedText>
          </TouchableOpacity>

          {/* ===================== SWITCH ===================== */}

          <TouchableOpacity
            onPress={() =>
              setIsRegister(
                !isRegister
              )
            }
            style={styles.switch}
          >
            <ThemedText
              style={{
                color: colors.tint,
              }}
            >
              {isRegister
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },

  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },

  box: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
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
    borderColor: '#374151',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#1f2937',
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