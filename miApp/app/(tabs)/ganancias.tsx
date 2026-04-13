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

  const { user, actualizarPuntos } = useAuth();
  const { items, calcularTotal, vaciarCarrito, removerDelCarrito, actualizarCantidad } = useCart();
  const { reducirStock } = useProducts();
  const { registrarTransaccion, obtenerTodasTransacciones, obtenerTransaccionesUsuario } = useTransactions();

  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  const isAdmin = user?.role === 'admin';

  const transacciones = isAdmin
    ? obtenerTodasTransacciones()
    : obtenerTransaccionesUsuario(user?.id || '');

  // ✅ COMPRA
  const confirmarCompra = async (metodo: string) => {
    try {
      const total = calcularTotal();

      for (const item of items) {
        await reducirStock(item.producto.id, item.cantidad);
      }

      await registrarTransaccion(user?.id || '', user?.name || 'Cliente', items, total);

      // 🎯 PUNTOS: 1 punto cada 10 Bs
      const puntosGanados = Math.floor(total / 10);
      actualizarPuntos((user?.puntos || 0) + puntosGanados);

      vaciarCarrito();
      setMostrarPago(false);
      setMostrarQR(false);

      Alert.alert('Compra exitosa', `Ganaste ${puntosGanados} puntos ⭐`);

    } catch {
      Alert.alert('Error', 'No se pudo completar la compra');
    }
  };

  const handleCompra = () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío');
      return;
    }
    setMostrarPago(true);
  };

  if (isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Transacciones" />
        <ScrollView style={styles.content}>
          {transacciones.map((t, i) => (
            <View key={i} style={[styles.card, { borderColor: colors.tint }]}>
              <ThemedText>{t.usuarioNombre}</ThemedText>
              <ThemedText>Bs. {t.total}</ThemedText>
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    );
  }

  const total = calcularTotal();

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Carrito" />

      <ScrollView style={styles.content}>
        {items.map((item, i) => (
          <View key={i} style={[styles.cartItem, { borderLeftColor: colors.tint }]}>
            <ThemedText>{item.producto.nombre}</ThemedText>

            <View style={styles.row}>
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

        <ThemedText>Total: Bs. {total}</ThemedText>

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.tint }]} onPress={handleCompra}>
          <ThemedText style={{ color: '#fff' }}>Finalizar Compra</ThemedText>
        </TouchableOpacity>

        {mostrarPago && !mostrarQR && (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setMostrarQR(true)}>
              <ThemedText>📱 QR</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => confirmarCompra('Efectivo')}>
              <ThemedText>💵 Efectivo</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {mostrarQR && (
          <View style={styles.card}>
            <Image
              source={require('../../assets/images/qr.jpg')} // ✅ RUTA CORRECTA
              style={{ width: 200, height: 200 }}
            />

            <TouchableOpacity onPress={() => confirmarCompra('QR')}>
              <ThemedText>Confirmar Pago</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={vaciarCarrito}>
          <ThemedText>Vaciar carrito</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },

  cartItem: {
    borderLeftWidth: 4,
    padding: 10,
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },

  btn: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  card: {
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
  },
});