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
import { useState } from 'react';

export default function GananciasScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user, agregarPuntos } = useAuth();
  const {
    items,
    calcularTotal,
    vaciarCarrito,
    removerDelCarrito,
    actualizarCantidad,
  } = useCart();
  const { reducirStock } = useProducts();
  const { registrarTransaccion } = useTransactions();

  const [facturaVisible, setFacturaVisible] = useState(false);
  const [ultimaFactura, setUltimaFactura] = useState<any>(null);
  const [mostrarPago, setMostrarPago] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  const total = calcularTotal();

  // ==========================
  // 🧾 CONFIRMAR COMPRA
  // ==========================
  const confirmarCompra = async (metodo: string) => {
    try {
      for (const item of items) {
        await reducirStock(item.producto.id, item.cantidad);
      }

      await registrarTransaccion(
        user?.id || '',
        user?.name || 'Cliente',
        items,
        total
      );

      // ⭐ PUNTOS AQUÍ (CORRECTO)
      agregarPuntos(total);

      const factura = {
        fecha: new Date().toLocaleString(),
        items: [...items],
        total,
        cliente: user?.name,
        metodoPago: metodo,
      };

      setUltimaFactura(factura);
      setFacturaVisible(true);
      setMostrarPago(false);
      setMostrarQR(false);
      vaciarCarrito();
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

  // ==========================
  // 🧾 FACTURA
  // ==========================
  if (facturaVisible && ultimaFactura) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Factura" />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.factura}>
            <ThemedText type="title">✅ Compra exitosa</ThemedText>

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

  // ==========================
  // 🛒 CARRITO
  // ==========================
  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Carrito" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {items.length === 0 ? (
          <ThemedText>🛒 Vacío</ThemedText>
        ) : (
          <>
            {items.map((item, i) => (
              <View key={i} style={styles.cartItem}>
                <View style={{ flex: 1 }}>
                  <ThemedText>{item.producto.nombre}</ThemedText>
                  <ThemedText>Bs. {item.precioUnitario}</ThemedText>
                </View>

                {/* 🔥 CONTROL DE CANTIDAD */}
                <View style={styles.qty}>
                  <TouchableOpacity
                    onPress={() =>
                      actualizarCantidad(item.producto.id, item.cantidad - 1)
                    }
                  >
                    <ThemedText>-</ThemedText>
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

                <TouchableOpacity
                  onPress={() => removerDelCarrito(item.producto.id)}
                >
                  <ThemedText style={{ color: 'red' }}>✕</ThemedText>
                </TouchableOpacity>
              </View>
            ))}

            {/* TOTAL */}
            <View style={styles.totalCard}>
              <ThemedText>Total</ThemedText>
              <ThemedText>Bs. {total}</ThemedText>
            </View>

            {/* BOTÓN */}
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.tint }]}
              onPress={handleCompra}
            >
              <ThemedText style={{ color: '#fff' }}>
                Finalizar compra
              </ThemedText>
            </TouchableOpacity>

            {/* MÉTODOS */}
            {mostrarPago && !mostrarQR && (
              <View style={styles.box}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint }]}
                  onPress={() => setMostrarQR(true)}
                >
                  <ThemedText style={{ color: '#fff' }}>QR</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.tint }]}
                  onPress={() => confirmarCompra('Efectivo')}
                >
                  <ThemedText style={{ color: '#fff' }}>Efectivo</ThemedText>
                </TouchableOpacity>
              </View>
            )}

            {/* QR */}
            {mostrarQR && (
              <View style={styles.qrBox}>
                <ThemedText>Escanea QR</ThemedText>

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

// ==========================
// 🎨 ESTILOS OPTIMIZADOS
// ==========================
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 12 },

 cartItem: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
  padding: 6,
  borderWidth: 1,
  borderRadius: 8,
},

qty: {
  flexDirection: 'row',
  alignItems: 'center',
  marginHorizontal: 10, // 🔥 separación real
  gap: 6,
},

deleteBtn: {
  marginLeft: 12, // 🔥 separa la X
},

  totalCard: {
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  btn: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },

  box: {
    marginTop: 10,
  },

  qrBox: {
    marginTop: 10,
    alignItems: 'center',
  },

  qr: {
    width: 150,
    height: 150,
    marginVertical: 10,
  },

  factura: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
  },

  total: {
    marginTop: 10,
    fontWeight: '700',
  },
});