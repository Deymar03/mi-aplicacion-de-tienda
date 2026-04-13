import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function ExplorarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { productos } = useProducts();
  const { agregarAlCarrito } = useCart();

  const [cantidades, setCantidades] = useState<{ [key: string]: string }>({});

  const productosDisponibles = productos.filter((p) => p.stock > 0);

  const handleAgregar = (producto: any) => {
    const cantidad = parseInt(cantidades[producto.id] || '1');

    if (isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'Cantidad inválida');
      return;
    }

    if (cantidad > producto.stock) {
      Alert.alert('Stock insuficiente', `Solo hay ${producto.stock}`);
      return;
    }

    agregarAlCarrito(producto, cantidad);
    Alert.alert('Agregado', `${producto.nombre} x${cantidad}`);

    setCantidades((prev) => ({ ...prev, [producto.id]: '1' }));
  };

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Tienda" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {productosDisponibles.map((prod) => (
            <View key={prod.id} style={styles.card}>
              <ThemedText style={styles.nombre}>{prod.nombre}</ThemedText>
              <ThemedText style={styles.precio}>Bs. {prod.precioVenta}</ThemedText>
              <ThemedText style={styles.stock}>Stock: {prod.stock}</ThemedText>

              {/* INPUT CANTIDAD */}
              <TextInput
                style={[styles.input, { borderColor: colors.tint, color: colors.text }]}
                keyboardType="numeric"
                placeholder="Cantidad"
                value={cantidades[prod.id] || ''}
                onChangeText={(text) =>
                  setCantidades((prev) => ({ ...prev, [prod.id]: text }))
                }
              />

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.tint }]}
                onPress={() => handleAgregar(prod)}
              >
                <ThemedText style={styles.btnText}>Agregar</ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {productosDisponibles.length === 0 && (
          <ThemedText style={{ textAlign: 'center', marginTop: 40 }}>
            No hay productos disponibles
          </ThemedText>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  card: {
    width: '48%',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },

  nombre: {
    fontWeight: '700',
    marginBottom: 4,
  },

  precio: {
    fontSize: 16,
    fontWeight: '700',
  },

  stock: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
    marginVertical: 6,
    textAlign: 'center',
  },

  btn: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});