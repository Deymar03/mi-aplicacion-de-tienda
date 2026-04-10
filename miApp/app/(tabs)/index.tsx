import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { productos } = useProducts();
  const isAdmin = user?.role === 'admin';

  // Calcular estadísticas para admin
  const totalProductos = productos.length;
  const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);
  const gananciaTotal = productos.reduce((sum, p) => sum + (p.precioVenta - p.precioCompra) * (p.stock > 0 ? 1 : 0), 0);

  if (isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Dashboard Admin" />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.card, { backgroundColor: colors.tint + '20' }]}>
            <ThemedText type="subtitle" style={styles.cardTitle}>📊 Dashboard Administrativo</ThemedText>
            <ThemedText style={styles.cardText}>Gestiona tu tienda y analiza ganancias</ThemedText>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { borderLeftColor: colors.tint }]}>
              <ThemedText type="subtitle">{totalProductos}</ThemedText>
              <ThemedText style={styles.statLabel}>Productos</ThemedText>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.tint }]}>
              <ThemedText type="subtitle">{totalStock}</ThemedText>
              <ThemedText style={styles.statLabel}>Stock Total</ThemedText>
            </View>
            <View style={[styles.statCard, { borderLeftColor: colors.tint }]}>
              <ThemedText type="subtitle" style={{ color: colors.tint }}>+Bs. {gananciaTotal.toFixed(2)}</ThemedText>
              <ThemedText style={styles.statLabel}>Ganancia Potencial</ThemedText>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Vista para CLIENTE
  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Tienda de Barrio" />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.card, { backgroundColor: colors.tint + '20' }]}>
          <ThemedText type="subtitle" style={styles.cardTitle}>🛒 Bienvenido a la Tienda</ThemedText>
          <ThemedText style={styles.cardText}>Explora nuestros productos y realiza compras</ThemedText>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: colors.tint }]}>
            <ThemedText type="subtitle">{totalProductos}</ThemedText>
            <ThemedText style={styles.statLabel}>Productos Disponibles</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardText: {
    opacity: 0.7,
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
});
