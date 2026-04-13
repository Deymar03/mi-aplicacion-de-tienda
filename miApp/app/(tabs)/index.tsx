import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

/* ================= ENTRY ================= */
export default function Index() {
  const { user } = useAuth();

  return user?.role === 'admin'
    ? <AdminDashboard />
    : <ClienteDashboard />;
}

/* ================= ADMIN ================= */
function AdminDashboard() {
  const { productos } = useProducts();

  const safeProducts = productos || [];

  const sinStock = safeProducts.filter(p => p.stock <= 0);
  const bajoStock = safeProducts.filter(p => p.stock > 0 && p.stock <= 5);

  const gananciaTotal = safeProducts.reduce(
    (acc, p) => acc + (p.precioVenta - p.precioCompra) * p.stock,
    0
  );

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#111827' }}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>

        <ThemedText style={{ color: '#fff', fontSize: 20 }}>
          Panel Admin
        </ThemedText>

        <ThemedText style={{ color: '#22c55e', marginTop: 10 }}>
          💰 Ganancia total: {gananciaTotal}
        </ThemedText>

        <ThemedText style={{ color: '#fbbf24', marginTop: 10 }}>
          ⚠️ Bajo stock: {bajoStock.length}
        </ThemedText>

        <ThemedText style={{ color: '#ef4444', marginTop: 10 }}>
          ❌ Sin stock: {sinStock.length}
        </ThemedText>

      </ScrollView>
    </ThemedView>
  );
}

/* ================= CLIENTE ================= */
function ClienteDashboard() {
  const { productos, actualizarProducto } = useProducts();
  const { user } = useAuth();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const puntosUsuario = user?.puntos || 0;

  const productosPorPuntos = productos.filter(
    (p) => p.esCanjeable === true && (p.puntosRequeridos || 0) > 0 && p.stock > 0
  );

  const comprarConPuntos = async (prod: any) => {
    const puntosReq = prod.puntosRequeridos || 0;

    if (puntosUsuario < puntosReq) {
      Alert.alert('Error', 'No tienes suficientes puntos');
      return;
    }

    if (prod.stock <= 0) {
      Alert.alert('Error', 'Sin stock');
      return;
    }

    setLoadingId(prod.id);

    try {
      // 🔥 actualizar stock
      await actualizarProducto(prod.id, {
        stock: prod.stock - 1,
      });

      // 🔥 actualizar puntos local (simulado visual)
      const restante = puntosUsuario - puntosReq;

      // 🔥 comprobante
      const comprobante = {
        id: Math.random().toString(36).substring(2, 10),
        producto: prod.nombre,
        puntosUsados: puntosReq,
        puntosRestantes: restante,
        fecha: new Date().toLocaleString(),
      };

      Alert.alert(
        '🎉 CANJE EXITOSO',
        `Producto: ${comprobante.producto}\n` +
        `Puntos usados: ${comprobante.puntosUsados}\n` +
        `Restantes: ${comprobante.puntosRestantes}\n` +
        `ID: ${comprobante.id}\n` +
        `Fecha: ${comprobante.fecha}`
      );

    } catch (e) {
      Alert.alert('Error', 'No se pudo completar el canje');
    }

    setLoadingId(null);
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: '#111827' }}>
      <ScrollView contentContainerStyle={{ padding: 12 }}>

        <ThemedText style={{ color: '#fff', fontSize: 20 }}>
          👤 Mis Puntos: {puntosUsuario}
        </ThemedText>

        {productosPorPuntos.map((prod) => {
          const puntosReq = prod.puntosRequeridos || 0;

          return (
            <View
              key={prod.id}
              style={{
                backgroundColor: '#1f2937',
                padding: 12,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <ThemedText style={{ color: '#fff' }}>
                {prod.nombre}
              </ThemedText>

              <ThemedText style={{ color: '#fbbf24' }}>
                🎁 {puntosReq} puntos
              </ThemedText>

              <TouchableOpacity
                onPress={() => comprarConPuntos(prod)}
                disabled={loadingId === prod.id}
                style={{
                  marginTop: 8,
                  backgroundColor:
                    puntosUsuario >= puntosReq ? '#22c55e' : '#374151',
                  padding: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <ThemedText style={{ color: '#fff' }}>
                  {loadingId === prod.id ? 'Procesando...' : 'Canjear'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          );
        })}

        {productosPorPuntos.length === 0 && (
          <ThemedText style={{ color: '#9ca3af', marginTop: 20 }}>
            No hay productos por puntos
          </ThemedText>
        )}

      </ScrollView>
    </ThemedView>
  );
}