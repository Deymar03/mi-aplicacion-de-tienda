import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TabHeader } from '@/components/tab-header';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useTransactions } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { productos } = useProducts();
  const { agregarAlCarrito } = useCart();
  const { obtenerTransaccionesUsuario } = useTransactions();
  const { user } = useAuth();

  const [puntos, setPuntos] = useState(0);

  // 🔥 Calcular puntos automáticamente
  useEffect(() => {
    const transacciones = obtenerTransaccionesUsuario(user?.id || '');

    let totalGastado = 0;
    transacciones.forEach((t) => {
      totalGastado += t.total;
    });

    setPuntos(Math.floor(totalGastado / 10)); // 10 Bs = 1 punto
  }, []);

  // 🔥 Productos canjeables
  const productosPuntos = productos.filter(p => p.puntos && p.puntos > 0);

  const canjearProducto = (prod: any) => {
    if (puntos < prod.puntos) {
      Alert.alert('Sin puntos', 'No tienes suficientes puntos');
      return;
    }

    agregarAlCarrito(prod, 1);

    Alert.alert('Canje exitoso', `Canjeaste ${prod.nombre}`);
  };

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Recompensas 🎁" />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* PUNTOS */}
        <View style={[styles.pointsCard, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.pointsLabel}>Tus Puntos</ThemedText>
          <ThemedText style={styles.pointsValue}>{puntos}</ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>
          Canjear Productos
        </ThemedText>

        {productosPuntos.map((prod) => (
          <View key={prod.id} style={styles.rewardCard}>
            <ThemedText>{prod.nombre}</ThemedText>
            <ThemedText>{prod.puntos} puntos</ThemedText>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={() => canjearProducto(prod)}
            >
              <ThemedText style={{ color: '#fff' }}>
                Canjear
              </ThemedText>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentContainer: { padding: 16 },

  pointsCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },

  pointsLabel: {
    color: '#fff',
  },

  pointsValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },

  sectionTitle: {
    marginBottom: 10,
    fontWeight: '600',
  },

  rewardCard: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
});