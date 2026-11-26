import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mensajeDeError } from '@/utils/errores';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const { signIn, signUp, loading } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [carnet, setCarnet] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPassword, setVerPassword] = useState(false);

  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
  ];
  const placeholderColor = colorScheme === 'dark' ? '#9CA3AF' : '#6B7280';

  /** Valida los campos comunes. Devuelve el mensaje de error o null si todo está bien. */
  const validar = (): string | null => {
    if (!email.trim() || !password) return 'Completa todos los campos.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Ingresa un correo electrónico válido.';
    if (isRegister) {
      if (!name.trim() || !carnet.trim()) return 'Completa todos los campos.';
      if (name.trim().length < 3) return 'Ingresa tu nombre completo.';
      if (!/^\d{5,12}$/.test(carnet.trim())) return 'El carnet debe tener entre 5 y 12 dígitos.';
      if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return null;
  };

  // Si el login es correcto, el layout raíz detecta la sesión y navega automáticamente.
  const handleLogin = async () => {
    const problema = validar();
    if (problema) return Alert.alert('Revisa tus datos', problema);

    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('No se pudo iniciar sesión', mensajeDeError(error, 'Credenciales incorrectas'));
    }
  };

  const handleRegister = async () => {
    const problema = validar();
    if (problema) return Alert.alert('Revisa tus datos', problema);

    try {
      const { needsConfirmation } = await signUp(name, email, password, carnet);

      if (needsConfirmation) {
        Alert.alert(
          'Cuenta creada',
          'Te enviamos un correo para confirmar tu cuenta. Confírmalo y luego inicia sesión.'
        );
        setPassword('');
        setIsRegister(false);
      }
      // Si no requiere confirmación, la sesión ya está activa y la app entra sola.
    } catch (error) {
      Alert.alert('No se pudo crear la cuenta', mensajeDeError(error, 'Inténtalo nuevamente.'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.box}>
            <ThemedText type="title" style={styles.title}>
              🛒 Tienda de Barrio
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </ThemedText>

            {isRegister && (
              <>
                <TextInput
                  placeholder="Nombre completo"
                  placeholderTextColor={placeholderColor}
                  style={inputStyle}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />

                <TextInput
                  placeholder="Carnet de identidad"
                  placeholderTextColor={placeholderColor}
                  style={inputStyle}
                  value={carnet}
                  onChangeText={(t) => setCarnet(t.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  maxLength={12}
                />
              </>
            )}

            <TextInput
              placeholder="Correo electrónico"
              placeholderTextColor={placeholderColor}
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
            />

            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={placeholderColor}
                style={[inputStyle, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!verPassword}
                autoCapitalize="none"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                onSubmitEditing={isRegister ? handleRegister : handleLogin}
              />
              <TouchableOpacity
                onPress={() => setVerPassword((v) => !v)}
                style={[styles.eyeButton, { borderColor: colors.border, backgroundColor: colors.card }]}
                accessibilityLabel={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <ThemedText>{verPassword ? '🙈' : '👁️'}</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint, opacity: loading ? 0.7 : 1 }]}
              onPress={isRegister ? handleRegister : handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {isRegister ? 'Registrarse' : 'Iniciar sesión'}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsRegister((v) => !v)}
              style={styles.switch}
              disabled={loading}
            >
              <ThemedText style={{ color: colors.tint }}>
                {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
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
