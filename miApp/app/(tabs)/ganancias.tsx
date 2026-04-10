import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
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
  const { productos, reducirStock } = useProducts();
  const { registrarTransaccion, obtenerTodasTransacciones, obtenerTransaccionesUsuario } = useTransactions();
  const [facturaVisible, setFacturaVisible] = useState(false);
  const [ultimaFactura, setUltimaFactura] = useState<any>(null);
  
  const isAdmin = user?.role === 'admin';

  // Para Admin: ver todas las transacciones
  const transacciones = isAdmin ? obtenerTodasTransacciones() : obtenerTransaccionesUsuario(user?.id || '');

  // Calcular ganancias para admin
  const gananciaPorProducto = productos.map((p) => ({
    nombre: p.nombre,
    gananciaUnitaria: p.precioVenta - p.precioCompra,
    stock: p.stock,
    gananciaTotal: (p.precioVenta - p.precioCompra) * p.stock,
  }));

  const gananciaTotal = gananciaPorProducto.reduce((sum, p) => sum + p.gananciaTotal, 0);

  // Calcular ganancias realizadas (de transacciones completadas)
  const gananciasRealizadas = transacciones.reduce((sum, t) => {
    const ganancia = t.items.reduce((itemSum, item) => {
      const producto = productos.find((p) => p.id === item.producto.id);
      if (producto) {
        const margen = producto.precioVenta - producto.precioCompra;
        return itemSum + margen * item.cantidad;
      }
      return itemSum;
    }, 0);
    return sum + ganancia;
  }, 0);

  const handleCompra = async () => {
    if (items.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de comprar');
      return;
    }

    try {
      // Reducir stock de los productos
      for (const item of items) {
        await reducirStock(item.producto.id, item.cantidad);
      }

      // Registrar la transacción
      const total = calcularTotal();
      await registrarTransaccion(user?.id || '', user?.name || 'Cliente', items, total);

      // Preparar factura
      const factura = {
        fecha: new Date().toLocaleDateString('es-BO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        items: [...items],
        total: total,
        cliente: user?.name || 'Cliente',
      };

      setUltimaFactura(factura);
      setFacturaVisible(true);
      vaciarCarrito();
    } catch (error) {
      console.error('Error en la compra:', error);
      Alert.alert('Error', 'No se pudo procesar la compra');
    }
  };

  if (isAdmin) {
    // Vista ADMIN - Ganancias y transacciones
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Ganancias y Transacciones" />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.primaryCard, { backgroundColor: colors.tint }]}>
            <ThemedText style={styles.label}>Ganancias Realizadas</ThemedText>
            <ThemedText style={[styles.amount, { color: '#fff' }]}>
              Bs. {gananciasRealizadas.toFixed(2)}
            </ThemedText>
          </View>

          <View style={styles.metricsContainer}>
            <View style={[styles.metricCard, { borderLeftColor: colors.tint, borderLeftWidth: 4 }]}>
              <ThemedText style={styles.metricLabel}>Ganancia Potencial</ThemedText>
              <ThemedText type="subtitle" style={styles.metricValue}>
                Bs. {gananciaTotal.toFixed(2)}
              </ThemedText>
            </View>
            <View style={[styles.metricCard, { borderLeftColor: colors.tint, borderLeftWidth: 4 }]}>
              <ThemedText style={styles.metricLabel}>Transacciones</ThemedText>
              <ThemedText type="subtitle" style={styles.metricValue}>
                {transacciones.length}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="subtitle" style={styles.transactionTitle}>Compras de Clientes</ThemedText>
          
          {transacciones.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>Sin transacciones aún</ThemedText>
            </View>
          ) : (
            transacciones.map((transaccion, idx) => (
              <View key={idx} style={[styles.transactionCard, { borderLeftColor: colors.tint }]}>
                <View style={styles.transactionHeader}>
                  <ThemedText style={styles.clienteName}>{transaccion.usuarioNombre}</ThemedText>
                  <ThemedText style={styles.transactionDate}>{transaccion.fecha}</ThemedText>
                </View>

                <View style={styles.transactionItems}>
                  {transaccion.items.map((item, itemIdx) => (
                    <ThemedText key={itemIdx} style={styles.itemLine}>
                      {item.cantidad}x {item.producto.nombre} = Bs. {(item.cantidad * item.precioUnitario).toFixed(2)}
                    </ThemedText>
                  ))}
                </View>

                <View style={styles.transactionFooter}>
                  <ThemedText style={styles.totalLabel}>Total:</ThemedText>
                  <ThemedText style={[styles.totalValue, { color: colors.tint }]}>
                    Bs. {transaccion.total.toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  // Vista CLIENTE - Carrito
  if (facturaVisible && ultimaFactura) {
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Factura de Compra" />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.facturaContainer, { borderColor: colors.tint }]}>
            <ThemedText type="title" style={styles.facturaTitulo}>✅ COMPRA EXITOSA</ThemedText>

            <View style={styles.facturaSection}>
              <ThemedText style={styles.facturaLabel}>Cliente:</ThemedText>
              <ThemedText style={styles.facturaValue}>{ultimaFactura.cliente}</ThemedText>
            </View>

            <View style={styles.facturaSection}>
              <ThemedText style={styles.facturaLabel}>Fecha y Hora:</ThemedText>
              <ThemedText style={styles.facturaValue}>{ultimaFactura.fecha}</ThemedText>
            </View>

            <View style={[styles.facturaItemsContainer, { borderTopColor: colors.border }]}>
              <ThemedText style={styles.facturaSectionTitle}>Productos:</ThemedText>
              {ultimaFactura.items.map((item: any, idx: number) => (
                <View key={idx} style={styles.facturaItem}>
                  <ThemedText style={styles.facturaItemName}>
                    {item.cantidad}x {item.producto.nombre}
                  </ThemedText>
                  <ThemedText style={styles.facturaItemPrice}>
                    Bs. {(item.cantidad * item.precioUnitario).toFixed(2)}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={[styles.facturaTotalSection, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText style={styles.facturaTotalLabel}>TOTAL:</ThemedText>
              <ThemedText style={[styles.facturaTotalValue, { color: colors.tint, fontSize: 28 }]}>
                Bs. {ultimaFactura.total.toFixed(2)}
              </ThemedText>
            </View>

            <ThemedText style={styles.facturaFooter}>
              ¡Gracias por tu compra! Vuelve pronto a nuestra tienda 🛒
            </ThemedText>

            <TouchableOpacity
              style={[styles.facturaButton, { backgroundColor: colors.tint }]}
              onPress={() => setFacturaVisible(false)}>
              <ThemedText style={styles.facturaButtonText}>Cerrar Factura</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const total = calcularTotal();

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Carrito de Compras" />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyEmoji}>🛒</ThemedText>
            <ThemedText style={styles.emptyText}>Tu carrito está vacío</ThemedText>
            <ThemedText style={styles.emptySubtext}>Agrega productos desde la tienda</ThemedText>
          </View>
        ) : (
          <>
            <ThemedText type="subtitle" style={styles.listTitle}>Productos en el Carrito</ThemedText>
            {items.map((item, idx) => (
              <View key={idx} style={[styles.cartItem, { borderLeftColor: colors.tint }]}>
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.producto.nombre}</ThemedText>
                  <ThemedText style={styles.itemPrice}>
                    Bs. {item.precioUnitario} c/u
                  </ThemedText>
                </View>

                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderColor: colors.tint }]}
                    onPress={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}>
                    <ThemedText>−</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={styles.quantityText}>{item.cantidad}</ThemedText>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderColor: colors.tint }]}
                    onPress={() => actualizarCantidad(item.producto.id, item.cantidad + 1)}>
                    <ThemedText>+</ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemTotal}>
                  <ThemedText style={styles.itemTotalPrice}>
                    Bs. {(item.cantidad * item.precioUnitario).toFixed(2)}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => removerDelCarrito(item.producto.id)}>
                    <ThemedText style={styles.removeButton}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={[styles.totalCard, { backgroundColor: colors.tint + '20' }]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText type="subtitle" style={[styles.totalAmount, { color: colors.tint }]}>
                Bs. {total.toFixed(2)}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.tint }]}
              onPress={handleCompra}>
              <ThemedText style={styles.checkoutText}>💳 Finalizar Compra</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.clearButton, { borderColor: colors.tint }]}
              onPress={() => {
                Alert.alert('Vaciar carrito', '¿Deseas vaciar el carrito?', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Vaciar',
                    style: 'destructive',
                    onPress: vaciarCarrito,
                  },
                ]);
              }}>
              <ThemedText style={{ color: colors.tint }}>Vaciar Carrito</ThemedText>
            </TouchableOpacity>
          </>
        )}
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
  // Admin styles
  primaryCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    paddingVertical: 20,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  transactionTitle: {
    marginBottom: 12,
  },
  productGanancia: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  prodInfo: {
    flex: 1,
  },
  prodName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  prodDetails: {
    fontSize: 12,
    opacity: 0.6,
  },
  prodGanancias: {
    flexDirection: 'row',
    gap: 12,
  },
  gananciaItem: {
    alignItems: 'flex-end',
  },
  gananciaLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  gananciaValue: {
    fontWeight: '700',
    fontSize: 13,
  },
  // Cliente styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    opacity: 0.6,
    marginBottom: 16,
  },
  listTitle: {
    marginBottom: 12,
  },
  cartItem: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 12,
    opacity: 0.6,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalPrice: {
    fontWeight: '700',
  },
  removeButton: {
    color: '#e74c3c',
    fontSize: 16,
    marginTop: 4,
  },
  totalCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
  },
  checkoutButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyResult: {
    opacity: 0.5,
  },
  // Factura styles
  facturaContainer: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    backgroundColor: 'rgba(46, 204, 113, 0.05)',
  },
  facturaTitulo: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 20,
  },
  facturaSection: {
    marginBottom: 12,
  },
  facturaLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  facturaValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  facturaItemsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
    paddingTop: 16,
  },
  facturaSectionTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  facturaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  facturaItemName: {
    flex: 1,
    fontSize: 13,
  },
  facturaItemPrice: {
    fontWeight: '600',
    fontSize: 13,
  },
  facturaTotalSection: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  facturaTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  facturaTotalValue: {
    fontWeight: '700',
  },
  facturaFooter: {
    textAlign: 'center',
    marginVertical: 16,
    opacity: 0.7,
    fontSize: 13,
  },
  facturaButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  facturaButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  // Admin transaction styles
  transactionCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  clienteName: {
    fontWeight: '700',
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionItems: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  itemLine: {
    fontSize: 12,
    marginBottom: 4,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
  },
  totalValue: {
    fontWeight: '700',
    fontSize: 14,
  },
});
