import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert, Image } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { useTransactions } from '@/context/TransactionContext';
import { useState } from 'react';

export default function GananciasScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user, agregarPuntos } = useAuth();
  const { items, calcularTotal, vaciarCarrito, removerDelCarrito, actualizarCantidad } = useCart();
  const { reducirStock } = useProducts();
  const { registrarTransaccion } = useTransactions();

  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  const total = calcularTotal();

  const confirmarCompra = async (metodo: string) => {
    try {
      for (const item of items) {
        await reducirStock(item.producto.id, item.cantidad);
      }

      await registrarTransaccion(user?.id || '', user?.name || 'Cliente', items, total);

      const puntosGanados = Math.floor(total / 10);
      agregarPuntos(puntosGanados);

      vaciarCarrito();
      setMostrarPago(false);
      setMostrarQR(false);

      Alert.alert('Compra exitosa', `Ganaste ${puntosGanados} puntos`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo completar la compra');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Carrito" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {items.length === 0 ? (
          <ThemedText style={{ textAlign: 'center', marginTop: 40 }}>
            🛒 Carrito vacío
          </ThemedText>
        ) : (
          <>
            {items.map((item) => (
              <View key={item.producto.id} style={[styles.item, { borderLeftColor: colors.tint }]}>
                <ThemedText>{item.producto.nombre}</ThemedText>

                <View style={styles.controls}>
                  <TouchableOpacity onPress={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}>
                    <ThemedText>−</ThemedText>
                  </TouchableOpacity>

                  <ThemedText>{item.cantidad}</ThemedText>

                  <TouchableOpacity onPress={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}>
                    <ThemedText>+</ThemedText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => removerDelCarrito(item.producto.id)}>
                  <ThemedText style={{ color: 'red' }}>✕</ThemedText>
                </TouchableOpacity>
              </View>
            ))}

            <View style={[styles.total, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText>Total</ThemedText>
              <ThemedText style={{ color: colors.tint }}>
                Bs. {total}
              </ThemedText>
            </View>

            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.tint }]} onPress={() => setMostrarPago(true)}>
              <ThemedText style={{ color: '#fff' }}>Finalizar compra</ThemedText>
            </TouchableOpacity>

            {mostrarPago && !mostrarQR && (
              <View style={styles.box}>
                <TouchableOpacity onPress={() => setMostrarQR(true)}>
                  <ThemedText>📱 QR</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => confirmarCompra('Efectivo')}>
                  <ThemedText>💵 Efectivo</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {mostrarQR && (
              <View style={styles.box}>
                <Image source={require('../../assets/images/qr.jpg')} style={{ width: 200, height: 200 }} />
                <TouchableOpacity onPress={() => confirmarCompra('QR')}>
                  <ThemedText>Confirmar pago</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={vaciarCarrito}>
              <ThemedText style={{ color: colors.tint }}>Vaciar carrito</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 16 },

  item: {
    borderLeftWidth: 4,
    padding: 10,
    marginBottom: 10,
  },

  controls: {
    flexDirection: 'row',
    gap: 10,
  },

  total: {
    padding: 12,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  btn: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  box: {
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
});