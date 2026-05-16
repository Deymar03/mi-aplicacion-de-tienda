// ========================= VENTAS.TSX COMPLETO =========================

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
  TextInput,
  Platform,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductContext';
import { useTransactions } from '@/context/TransactionContext';

import {
  useState,
  useMemo,
} from 'react';

/* ===================== HELPERS ===================== */

const calcularGananciaProducto = (
  item: any
) => {
  return (
    (item.precioVenta -
      item.precioCompra) *
    item.cantidad
  );
};

const formatFecha = (
  fecha: string
) => {
  return new Date(
    fecha
  ).toLocaleString('es-BO');
};

export default function VentasScreen() {
  const colorScheme =
    useColorScheme();

  const colors =
    Colors[colorScheme ?? 'light'];

  const { user } = useAuth();

  const {
    items,
    calcularTotal,
    vaciarCarrito,
    removerDelCarrito,
    actualizarCantidad,
  } = useCart();

  const { reducirStock } =
    useProducts();

  const {
    registrarTransaccion,
    obtenerTransaccionesUsuario,
    obtenerTodasTransacciones,
  } = useTransactions();

  /* ===================== STATES ===================== */

  const [
    facturaVisible,
    setFacturaVisible,
  ] = useState(false);

  const [
    ultimaFactura,
    setUltimaFactura,
  ] = useState<any>(null);

  const [
    mostrarPago,
    setMostrarPago,
  ] = useState(false);

  const [mostrarQR, setMostrarQR] =
    useState(false);

  const [
    buscarCarnet,
    setBuscarCarnet,
  ] = useState('');

  const [
    buscarRecibo,
    setBuscarRecibo,
  ] = useState('');

  const [
    fechaInicio,
    setFechaInicio,
  ] = useState<Date | null>(
    null
  );

  const [fechaFin, setFechaFin] =
    useState<Date | null>(null);

  const [
    showInicioPicker,
    setShowInicioPicker,
  ] = useState(false);

  const [
    showFinPicker,
    setShowFinPicker,
  ] = useState(false);

  const total = calcularTotal();

  /* ===================== VENTAS ===================== */

  const ventas =
    user?.role === 'admin'
      ? obtenerTodasTransacciones()
      : obtenerTransaccionesUsuario(
          user?.id || ''
        );

  const ventasOrdenadas =
    useMemo(() => {
      const filtradas =
        ventas.filter((v: any) => {
          const carnetMatch =
            !buscarCarnet ||
            v.profiles?.carnet
              ?.toLowerCase()
              .includes(
                buscarCarnet.toLowerCase()
              );

          const reciboMatch =
            !buscarRecibo ||
            v.receipt_id
              ?.toLowerCase()
              .includes(
                buscarRecibo.toLowerCase()
              );

          const fechaVenta =
            new Date(v.created_at);

          let fechaMatch = true;

          if (fechaInicio) {
            fechaMatch =
              fechaVenta >=
              fechaInicio;
          }

          if (
            fechaFin &&
            fechaMatch
          ) {
            const fin =
              new Date(fechaFin);

            fin.setHours(
              23,
              59,
              59,
              999
            );

            fechaMatch =
              fechaVenta <= fin;
          }

          return (
            carnetMatch &&
            reciboMatch &&
            fechaMatch
          );
        });

      return [...filtradas].sort(
        (a, b) =>
          new Date(
            b.created_at
          ).getTime() -
          new Date(
            a.created_at
          ).getTime()
      );
    }, [
      ventas,
      buscarCarnet,
      buscarRecibo,
      fechaInicio,
      fechaFin,
    ]);

  const totalVentas =
    useMemo(() => {
      return ventasOrdenadas.reduce(
        (acc, t) =>
          acc + Number(t.total),
        0
      );
    }, [ventasOrdenadas]);

  /* ===================== COMPRA ===================== */

  const confirmarCompra =
    async (metodo: string) => {
      try {
        for (const item of items) {
          await reducirStock(
            item.producto.id,
            item.cantidad
          );
        }

        const transaccion =
          await registrarTransaccion(
            user?.id || '',
            user?.name ||
              'Cliente',
            items,
            total,
            metodo
          );

        setUltimaFactura({
          receipt_id:
            transaccion.receipt_id,

          fecha:
            transaccion.created_at,

          items: [...items],

          total,

          cliente:
            user?.name,

          metodoPago: metodo,
        });

        setFacturaVisible(true);

        setMostrarPago(false);

        setMostrarQR(false);

        vaciarCarrito();

        Alert.alert(
          'Compra realizada ✔'
        );
      } catch (error) {
        Alert.alert(
          'Error',
          'No se pudo completar'
        );
      }
    };

  /* ===================== UI FACTURA ===================== */

  if (
    facturaVisible &&
    ultimaFactura
  ) {
    return (
      <ThemedView
        style={styles.container}
      >
        <TabHeader title="RECIBO DIGITAL" />

        <ScrollView
          contentContainerStyle={
            styles.contentContainer
          }
        >
          <View style={styles.factura}>
            <ThemedText type="title">
              Compra exitosa ✔
            </ThemedText>

            <ThemedText
              style={styles.receiptId}
            >
              ID:
              {
                ultimaFactura.receipt_id
              }
            </ThemedText>

            <ThemedText>
              Cliente:
              {
                ultimaFactura.cliente
              }
            </ThemedText>

            <ThemedText>
              Método:
              {
                ultimaFactura.metodoPago
              }
            </ThemedText>

            <ThemedText>
              Fecha:
              {formatFecha(
                ultimaFactura.fecha
              )}
            </ThemedText>

            {ultimaFactura.items.map(
              (
                item: any,
                i: number
              ) => (
                <View
                  key={i}
                  style={
                    styles.receiptItem
                  }
                >
                  <ThemedText>
                    {
                      item.producto
                        .nombre
                    }
                  </ThemedText>

                  <ThemedText>
                    x
                    {item.cantidad}
                  </ThemedText>
                </View>
              )
            )}

            <ThemedText
              style={styles.total}
            >
              Total:
              Bs.
              {ultimaFactura.total}
            </ThemedText>

            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor:
                    colors.tint,
                },
              ]}
              onPress={() =>
                setFacturaVisible(
                  false
                )
              }
            >
              <ThemedText
                style={{
                  color: '#fff',
                }}
              >
                Cerrar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  /* ===================== UI ===================== */

  return (
    <ThemedView
      style={styles.container}
    >
      <TabHeader
        title={
          user?.role === 'admin'
            ? 'Panel Admin'
            : 'Carrito'
        }
      />

      <ScrollView
        contentContainerStyle={
          styles.contentContainer
        }
      >
        {user?.role === 'admin' && (
          <View>
            <ThemedText
              style={styles.bigTitle}
            >
              Reportes de ventas
            </ThemedText>

            <TextInput
              placeholder="Buscar carnet"
              placeholderTextColor="#aaa"
              value={buscarCarnet}
              onChangeText={
                setBuscarCarnet
              }
              style={styles.input}
            />

            <TextInput
              placeholder="Buscar recibo"
              placeholderTextColor="#aaa"
              value={buscarRecibo}
              onChangeText={
                setBuscarRecibo
              }
              style={styles.input}
            />

            {ventasOrdenadas.map(
              (v: any) => (
                <View
                  key={v.id}
                  style={styles.ticket}
                >
                  <ThemedText>
                    👤
                    {
                      v.usuario_nombre
                    }
                  </ThemedText>

                  <ThemedText>
                    {
                      v.receipt_id
                    }
                  </ThemedText>

                  <ThemedText>
                    Carnet:
                    {
                      v.profiles
                        ?.carnet
                    }
                  </ThemedText>

                  <ThemedText>{formatFecha(v.created_at)}</ThemedText>

                  <ThemedText
                    style={
                      styles.ticketTotal
                    }
                  >
                    Total:
                    Bs.
                    {v.total}
                  </ThemedText>
                </View>
              )
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#374151',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: '#fff',
  },

  dateBtn: {
    borderWidth: 1,
    borderColor: '#374151',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  bigTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },

  btn: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  factura: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
  },

  receiptId: {
    fontWeight: '700',
    marginVertical: 10,
  },

  receiptItem: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    marginVertical: 4,
  },

  total: {
    fontWeight: '700',
    marginTop: 10,
  },

  ticket: {
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: '#1f2937',
  },

  ticketTotal: {
    fontWeight: '700',
    marginTop: 8,
  },
});