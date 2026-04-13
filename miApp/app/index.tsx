import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 50);

    return () => clearTimeout(t);
  }, []);

  return null;
}