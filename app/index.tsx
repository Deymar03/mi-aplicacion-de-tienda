import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

// Punto de entrada: envía al usuario a la app o al login según tenga sesión.
export default function Index() {
  const { session, user } = useAuth();

  return <Redirect href={session && user ? '/(tabs)/productos' : '/(auth)/login'} />;
}
