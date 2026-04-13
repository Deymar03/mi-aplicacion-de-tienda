import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TabHeader } from '@/components/tab-header';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { productos, reducirStock } = useProducts();
  const { agregarAlCarrito } = useCart();
  const { user, actualizarPuntos } = useAuth();

  const puntos = user?.puntos ?? 0;

  // ✅ SOLO productos canjeables
  const productosPuntos = productos.filter(
    (p) => (p.esCanjeable ?? false) && (p.puntosRequeridos ?? 0) > 0
  );

  const canjearProducto = async (prod: any) => {
    if ((prod.stock ?? 0) <= 0) {
      Alert.alert('Sin stock');
      return;
    }

    if (puntos < (prod.puntosRequeridos ?? 0)) {
      Alert.alert('Sin puntos', 'No tienes suficientes puntos');
      return;
    }

    try {
      actualizarPuntos(puntos - (prod.puntosRequeridos ?? 0));
      await reducirStock(prod.id, 1);

      Alert.alert('Canje exitoso', `Canjeaste ${prod.nombre}`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo canjear');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Recompensas 🎁" />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        
        {/* ⭐ PUNTOS */}
        <View style={[styles.pointsCard, { backgroundColor: colors.tint }]}>
          <ThemedText style={styles.pointsLabel}>Tus Puntos</ThemedText>
          <ThemedText style={styles.pointsValue}>{puntos}</ThemedText>
        </View>

        <ThemedText style={styles.sectionTitle}>
          Canjear Productos
        </ThemedText>

        {productosPuntos.length === 0 ? (
          <ThemedText>No hay productos disponibles</ThemedText>
        ) : (
          productosPuntos.map((prod) => (
            <View key={prod.id} style={[styles.rewardCard, { borderColor: colors.tint }]}>
              <ThemedText>{prod.nombre}</ThemedText>
              <ThemedText>⭐ {prod.puntosRequeridos ?? 0} puntos</ThemedText>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.tint }]}
                onPress={() => canjearProducto(prod)}
              >
                <ThemedText style={{ color: '#fff' }}>
                  Canjear
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))
        )}
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
    color: '#ffffff',
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