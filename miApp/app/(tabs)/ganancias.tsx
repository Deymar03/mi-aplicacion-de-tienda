import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { useTransactions } from '@/context/TransactionContext';
import { useState, useMemo } from 'react';

/* ===================== HELPERS ===================== */

const calcularGananciaProducto = (item: any) => {
  return (item.precioVenta - item.precioCompra) * item.cantidad;
};

const formatFecha = (fecha: string) => {
  return new Date(fecha).toLocaleString('es-BO');
};

/* ===================== SCREEN ===================== */

export default function GananciasScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user } = useAuth();

  const {
    items,
    calcularTotal,
    vaciarCarrito,
    removerDelCarrito,
    actualizarCantidad,
  } = useCart();

  const { reducirStock } = useProducts();

  const {
    registrarTransaccion,
    obtenerTransaccionesUsuario,
    obtenerTodasTransacciones,
  } = useTransactions();

  const [facturaVisible, setFacturaVisible] = useState(false);
  const [ultimaFactura, setUltimaFactura] = useState<any>(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  const total = calcularTotal();

  /* ===================== VENTAS ===================== */

  const ventas =
    user?.role === 'admin'
      ? obtenerTodasTransacciones()
      : obtenerTransaccionesUsuario(user?.id || '');

  const ventasOrdenadas = useMemo(() => {
    return [...ventas].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  }, [ventas]);

  const totalVentas = useMemo(() => {
    return ventas.reduce((acc, t) => acc + t.total, 0);
  }, [ventas]);

  /* ===================== COMPRA ===================== */

  const confirmarCompra = async (metodo: string) => {
    try {
      for (const item of items) {
        await reducirStock(item.producto.id, item.cantidad);
      }

      await registrarTransaccion(
        user?.id || '',
        user?.name || 'Cliente',
        items,
        total,
        metodo
      );

      setUltimaFactura({
        fecha: new Date().toLocaleString(),
        items: [...items],
        total,
        cliente: user?.name,
        metodoPago: metodo,
      });

      setFacturaVisible(true);
      setMostrarPago(false);
      setMostrarQR(false);
      vaciarCarrito();

      Alert.alert('Compra realizada correctamente ✔');
    } catch (error) {
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

  /* ===================== FACTURA ===================== */

  if (facturaVisible && ultimaFactura) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Factura" />

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.factura}>
            <ThemedText type="title">Compra exitosa ✔</ThemedText>

            <ThemedText>Cliente: {ultimaFactura.cliente}</ThemedText>
            <ThemedText>Fecha: {ultimaFactura.fecha}</ThemedText>
            <ThemedText>Método: {ultimaFactura.metodoPago}</ThemedText>

            {ultimaFactura.items.map((item: any, i: number) => (
              <ThemedText key={i}>
                {item.cantidad}x {item.producto.nombre}
              </ThemedText>
            ))}

            <ThemedText style={styles.total}>
              Total: Bs. {ultimaFactura.total}
            </ThemedText>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.tint }]}
              onPress={() => setFacturaVisible(false)}
            >
              <ThemedText style={{ color: '#fff' }}>Cerrar</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  /* ===================== UI PRINCIPAL ===================== */

  return (
    <ThemedView style={styles.container}>
      <TabHeader
        title={user?.role === 'admin' ? 'Panel Admin' : 'Carrito'}
      />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* ================= ADMIN ================= */}
        {user?.role === 'admin' && (
          <View style={styles.adminPanel}>
            <ThemedText style={styles.bigTitle}>
              📊 Panel de Ganancias
            </ThemedText>

            <View style={styles.summaryBox}>
              <ThemedText style={styles.summaryTitle}>
                Ventas totales
              </ThemedText>
              <ThemedText style={styles.summaryValue}>
                Bs {totalVentas.toFixed(2)}
              </ThemedText>
            </View>

            <View style={styles.summaryBox}>
              <ThemedText style={styles.summaryTitle}>
                Ganancia estimada real
              </ThemedText>

              <ThemedText style={styles.summaryValue}>
                {ventas
                  .reduce((acc, v) => {
                    return (
                      acc +
                      (v.items?.reduce((sum: number, i: any) => {
                        return sum + calcularGananciaProducto(i);
                      }, 0) || 0)
                    );
                  }, 0)
                  .toFixed(2)}{' '}
                Bs
              </ThemedText>
            </View>

            <ThemedText style={styles.sectionTitle}>
              Historial de ventas
            </ThemedText>

            {ventasOrdenadas.map((v: any) => (
              <View key={v.id} style={styles.ticket}>
                <ThemedText style={styles.ticketUser}>
                  👤 {v.usuario_nombre}
                </ThemedText>

                <ThemedText style={styles.ticketDate}>
                  {formatFecha(v.created_at)}
                </ThemedText>

                {v.items.map((item: any, i: number) => (
                  <ThemedText key={i} style={styles.ticketItem}>
                    {item.producto.nombre} x{item.cantidad}
                  </ThemedText>
                ))}

                <ThemedText style={styles.ticketTotal}>
                  Total: Bs {v.total}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* ================= CLIENTE ================= */}
        {items.length === 0 ? (
          <ThemedText>🛒 Carrito vacío</ThemedText>
        ) : (
          <>
            {items.map((item, i) => (
              <View key={i} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <ThemedText>{item.producto.nombre}</ThemedText>
                  <ThemedText>Bs {item.precioUnitario}</ThemedText>
                </View>

                <View style={styles.qty}>
                  <TouchableOpacity
                    onPress={() =>
                      actualizarCantidad(
                        item.producto.id,
                        item.cantidad - 1
                      )
                    }
                  >
                    <ThemedText>-</ThemedText>
                  </TouchableOpacity>

                  <ThemedText>{item.cantidad}</ThemedText>

                  <TouchableOpacity
                    onPress={() =>
                      actualizarCantidad(
                        item.producto.id,
                        item.cantidad + 1
                      )
                    }
                  >
                    <ThemedText>+</ThemedText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    removerDelCarrito(item.producto.id)
                  }
                >
                  <ThemedText style={{ color: 'red' }}>
                    ✕
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.totalCard}>
              <ThemedText>Total</ThemedText>
              <ThemedText>Bs {total}</ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.tint }]}
              onPress={handleCompra}
            >
              <ThemedText style={{ color: '#fff' }}>
                Finalizar compra
              </ThemedText>
            </TouchableOpacity>

            {mostrarPago && !mostrarQR && (
              <View style={styles.box}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint }]}
                  onPress={() => setMostrarQR(true)}
                >
                  <ThemedText style={{ color: '#fff' }}>
                    QR
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint }]}
                  onPress={() => confirmarCompra('Efectivo')}
                >
                  <ThemedText style={{ color: '#fff' }}>
                    Efectivo
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {mostrarQR && (
              <View style={styles.qrBox}>
                <Image
                  source={require('../../assets/images/qr.jpg')}
                  style={styles.qr}
                />

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint }]}
                  onPress={() => confirmarCompra('QR')}
                >
                  <ThemedText style={{ color: '#fff' }}>
                    Confirmar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 12 },
  cartItem: { flexDirection: 'row', marginBottom: 8 },
  qty: { flexDirection: 'row', gap: 6 },
  btn: { padding: 6, borderRadius: 6, alignItems: 'center' },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between' },
  box: { marginTop: 10 },
  qrBox: { marginTop: 10, alignItems: 'center' },
  qr: { width: 150, height: 150 },
  factura: { padding: 16 },
  total: { fontWeight: '700' },

  adminPanel: { marginBottom: 20 },
  bigTitle: { fontSize: 18, fontWeight: '800' },
  summaryBox: { padding: 10, borderRadius: 10, marginBottom: 8 },
  summaryTitle: { fontSize: 14 },
  summaryValue: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { marginTop: 10, fontWeight: '700' },
  ticket: { padding: 10, marginTop: 10, borderRadius: 10 },
  ticketUser: { fontWeight: '700' },
  ticketDate: { fontSize: 12 },
  ticketItem: { fontSize: 12 },
  ticketTotal: { fontWeight: '700' },
});