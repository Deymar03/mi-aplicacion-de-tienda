import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpieza', 'Higiene', 'Electrónica', 'Ropa'];

export default function ProductosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user, actualizarPuntos } = useAuth();
  const { productos } = useProducts();
  const { agregarAlCarrito } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('');

  const productosDisponibles = productos.filter(
    (p) => !p.esCanjeable && p.stock > 0 && (!selectedCategory || p.categoria === selectedCategory)
  );

  const productosCanje = productos.filter((p) => p.esCanjeable);

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Productos" />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>

        {/* PUNTOS */}
        <View style={[styles.pointsCard, { backgroundColor: colors.tint + '20' }]}>
          <ThemedText>⭐ Tus puntos</ThemedText>
          <ThemedText style={{ color: colors.tint, fontWeight: '700' }}>
            {user?.puntos || 0}
          </ThemedText>
        </View>

        {/* FILTRO */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: !selectedCategory ? colors.tint : colors.tint + '30' }]}
            onPress={() => setSelectedCategory('')}>
            <ThemedText style={{ color: !selectedCategory ? '#fff' : colors.text }}>Todos</ThemedText>
          </TouchableOpacity>

          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterButton, { backgroundColor: selectedCategory === cat ? colors.tint : colors.tint + '30' }]}
              onPress={() => setSelectedCategory(cat)}>
              <ThemedText style={{ color: selectedCategory === cat ? '#fff' : colors.text }}>
                {cat}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* PRODUCTOS */}
        <View style={styles.grid}>
          {productosDisponibles.map((prod) => (
            <View key={prod.id} style={styles.item}>
              <View style={[styles.card, { borderColor: colors.tint }]}>
                <ThemedText style={styles.name}>{prod.nombre}</ThemedText>
                <ThemedText style={styles.cat}>{prod.categoria}</ThemedText>

                <ThemedText style={styles.price}>Bs. {prod.precioVenta}</ThemedText>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint }]}
                  onPress={() => {
                    agregarAlCarrito(prod, 1);
                    Alert.alert('Agregado', prod.nombre);
                  }}>
                  <ThemedText style={styles.btnText}>+ Agregar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* CANJE */}
        <ThemedText style={{ marginTop: 20 }}>🎁 Canjea con puntos</ThemedText>

        {productosCanje.map((prod) => (
          <TouchableOpacity
            key={prod.id}
            style={[styles.card, { marginTop: 10 }]}
            onPress={() => {
              if ((user?.puntos || 0) >= prod.puntosRequeridos) {
                actualizarPuntos((user?.puntos || 0) - prod.puntosRequeridos);
                Alert.alert('Canje exitoso', prod.nombre);
              } else {
                Alert.alert('Puntos insuficientes');
              }
            }}>
            <ThemedText>{prod.nombre}</ThemedText>
            <ThemedText>⭐ {prod.puntosRequeridos} puntos</ThemedText>
          </TouchableOpacity>
        ))} 
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentContainer: { padding: 10 },

  pointsCard: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  filterButton: {
    padding: 6,
    borderRadius: 20,
    marginRight: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },

  item: {
    width: '48%',
  },

  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6, // MÁS COMPACTO
  },

  name: {
    fontSize: 11,
    fontWeight: '600',
  },

  cat: {
    fontSize: 9,
    opacity: 0.6,
  },

  price: {
    fontSize: 13,
    fontWeight: '700',
    marginVertical: 3,
  },

  btn: {
    padding: 5,
    borderRadius: 6,
    alignItems: 'center',
  },

  btnText: {
    fontSize: 10,
    color: '#fff',
  },
});