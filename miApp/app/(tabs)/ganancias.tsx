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

  const { user } = useAuth();
  const { items, calcularTotal, vaciarCarrito, removerDelCarrito, actualizarCantidad } = useCart();
  const { reducirStock } = useProducts();
  const { registrarTransaccion, obtenerTodasTransacciones, obtenerTransaccionesUsuario } = useTransactions();

  const [facturaVisible, setFacturaVisible] = useState(false);
  const [ultimaFactura, setUltimaFactura] = useState<any>(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  const isAdmin = user?.role === 'admin';

  const transacciones = isAdmin
    ? obtenerTodasTransacciones()
    : obtenerTransaccionesUsuario(user?.id || '');

  // ==========================
  // 🧾 CONFIRMAR COMPRA
  // ==========================
  const { agregarPuntos } = useAuth();
  const confirmarCompra = async (metodo: string) => {
    try {
      for (const item of items) {
        await reducirStock(item.producto.id, item.cantidad);
      }

      const total = calcularTotal();

      await registrarTransaccion(
        user?.id || '',
        user?.name || 'Cliente',
        items,
        total
      );

      const factura = {
        fecha: new Date().toLocaleString(),
        items: [...items],
        total,
        cliente: user?.name || 'Cliente',
        metodoPago: metodo,
      };

      setUltimaFactura(factura);
      setFacturaVisible(true);
      setMostrarPago(false);
      setMostrarQR(false);
      vaciarCarrito();

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo completar la compra');
    }
  };

  // ==========================
  // 💳 INICIAR COMPRA
  // ==========================
  const handleCompra = () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes');
      return;
    }

    setMostrarPago(true);
  };

  // ==========================
  // 🧾 ADMIN
  // ==========================
  if (isAdmin) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Ganancias y Transacciones" />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {transacciones.map((t, i) => (
            <View key={i} style={[styles.transactionCard, { borderLeftColor: colors.tint }]}>
              <ThemedText>{t.usuarioNombre}</ThemedText>
              <ThemedText>Bs. {t.total}</ThemedText>
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    );
  }

  // ==========================
  // 🧾 FACTURA
  // ==========================
  if (facturaVisible && ultimaFactura) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Factura de Compra" />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.facturaContainer, { borderColor: colors.tint }]}>
            <ThemedText type="title" style={styles.facturaTitulo}>
              ✅ COMPRA EXITOSA
            </ThemedText>

            <ThemedText>Cliente: {ultimaFactura.cliente}</ThemedText>
            <ThemedText>Fecha: {ultimaFactura.fecha}</ThemedText>
            <ThemedText>Método: {ultimaFactura.metodoPago}</ThemedText>

            {ultimaFactura.items.map((item: any, idx: number) => (
              <ThemedText key={idx}>
                {item.cantidad}x {item.producto.nombre}
              </ThemedText>
            ))}

            <ThemedText style={{ marginTop: 10 }}>
              Total: Bs. {ultimaFactura.total}
            </ThemedText>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.tint }]}
              onPress={() => setFacturaVisible(false)}
            >
              <ThemedText style={{ color: '#fff' }}>Cerrar</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const total = calcularTotal();
  agregarPuntos(total);

  // ==========================
  // 🛒 CLIENTE
  // ==========================
  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Carrito de Compras" />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText>🛒 Carrito vacío</ThemedText>
          </View>
        ) : (
          <>
            {items.map((item, i) => (
              <View key={i} style={[styles.cartItem, { borderLeftColor: colors.tint }]}>
                <View style={styles.itemInfo}>
                  <ThemedText>{item.producto.nombre}</ThemedText>
                  <ThemedText>Bs. {item.precioUnitario}</ThemedText>
                </View>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    onPress={() =>
                      actualizarCantidad(item.producto.id, Math.max(1, item.cantidad - 1))
                    }
                  >
                    <ThemedText>−</ThemedText>
                  </TouchableOpacity>

                  <ThemedText>{item.cantidad}</ThemedText>

                  <TouchableOpacity
                    onPress={() =>
                      actualizarCantidad(item.producto.id, item.cantidad + 1)
                    }
                  >
                    <ThemedText>+</ThemedText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => removerDelCarrito(item.producto.id)}>
                  <ThemedText style={{ color: 'red' }}>✕</ThemedText>
                </TouchableOpacity>
              </View>
            ))}

            <View style={[styles.totalCard, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText>Total:</ThemedText>
              <ThemedText style={{ color: colors.tint }}>
                Bs. {total}
              </ThemedText>
            </View>

            {/* FINALIZAR */}
            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.tint }]}
              onPress={handleCompra}
            >
              <ThemedText style={{ color: '#fff' }}>
                💳 Finalizar Compra
              </ThemedText>
            </TouchableOpacity>

            {/* MÉTODOS DE PAGO */}
            {mostrarPago && !mostrarQR && (
              <View style={[styles.paymentContainer, { borderColor: colors.tint }]}>
                <ThemedText style={styles.paymentTitle}>
                  Selecciona método de pago
                </ThemedText>

                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: colors.tint }]}
                  onPress={() => setMostrarQR(true)}
                >
                  <ThemedText style={styles.paymentText}>📱 QR</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: colors.tint }]}
                  onPress={() => confirmarCompra('Efectivo')}
                >
                  <ThemedText style={styles.paymentText}>💵 Efectivo</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMostrarPago(false)}>
                  <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* QR */}
            {mostrarQR && (
              <View style={[styles.qrContainer, { borderColor: colors.tint }]}>
                <ThemedText style={styles.paymentTitle}>
                  Escanea este QR
                </ThemedText>

                <Image
                  source={require('../../assets/images/qr.jpg')}
                  style={styles.qrImage}
                  resizeMode="contain"
                />

                <TouchableOpacity
                  style={[styles.paymentButton, { backgroundColor: colors.tint }]}
                  onPress={() => confirmarCompra('QR')}
                >
                  <ThemedText style={styles.paymentText}>
                    ✅ Confirmar Pago
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setMostrarQR(false)}>
                  <ThemedText style={{ textAlign: 'center', marginTop: 10 }}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* VACIAR */}
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.tint }]}
              onPress={() => vaciarCarrito()}
            >
              <ThemedText style={{ color: colors.tint }}>
                Vaciar carrito
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  contentContainer: { padding: 16 },

  cartItem: {
    borderLeftWidth: 4,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  itemInfo: { flex: 1 },

  quantityControl: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  totalCard: {
    padding: 12,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
  },

  checkoutButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  clearButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },

  paymentContainer: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
  },

  paymentTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },

  paymentButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },

  paymentText: {
    color: '#fff',
    fontWeight: '600',
  },

  qrContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: 'center',
  },

  qrImage: {
    width: 200,
    height: 200,
    marginVertical: 16,
  },

  facturaContainer: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
  },

  facturaTitulo: {
    textAlign: 'center',
    marginBottom: 10,
  },

  transactionCard: {
    borderLeftWidth: 4,
    padding: 10,
    marginBottom: 10,
  },
});