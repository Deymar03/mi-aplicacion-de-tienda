import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { ResumenReportes } from '@/components/reportes-resumen';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import {  StyleSheet,  ScrollView,  View,  TouchableOpacity,  Alert,  Image,  TextInput,  Platform,} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useTransactions } from '@/context/TransactionContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useMemo } from 'react';
import { escapeHtml, formatBs, formatFecha } from '@/utils/formato';
import { mensajeDeError } from '@/utils/errores';


export default function VentasScreen() {
  
    const [
    reciboDetalle,
    setReciboDetalle,
  ] = useState<any>(null);

  const [
  historialVisible,
  setHistorialVisible,
] = useState(true);

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

  const {
    registrarCompra,
    obtenerTransaccionesUsuario,
    obtenerTodasTransacciones,
  } = useTransactions();

  //* estados de formularios o desplegables

  const [
    facturaVisible,
    setFacturaVisible,
  ] = useState(false);

const [
  factura,
  setFactura,
] = useState<any>(null);

  const [
    mostrarPago,
    setMostrarPago,
  ] = useState(false);

  //? imagen qr estatica y fija en el archivo el qr no cambia con el tiempo
const qrImage = require(
  '../../assets/images/qr.jpg'
);
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

  const [procesando, setProcesando] = useState(false);

  const total = calcularTotal();

  /** Cambia la cantidad de un producto del carrito y avisa si supera el stock. */
  const cambiarCantidad = (id: string, cantidad: number) => {
    const resultado = actualizarCantidad(id, cantidad);
    if (!resultado.ok && resultado.mensaje) {
      Alert.alert('Stock limitado', resultado.mensaje);
    }
  };

 
const imprimirRecibo = async (
  recibo: any
) => {

    const cliente =
      recibo.cliente ||
      recibo.usuario_nombre;

    const metodo =
      recibo.metodoPago ||
      recibo.metodo_pago;

    const fecha =
      recibo.fecha ||
      recibo.created_at;

      //! esta funcion es codigo netamente HTML para el recibo,
      //! cualquier cambio en el recibo debe hacerce en este apartado no tocar otro
  const html = `
  <html>

  <head>
  <meta charset="UTF-8" />
  <style>
  @media print {

    body{
      padding:0;
      margin:0;
    }

    .print-container{
      width:100%;
      padding:20px;
    }

  }

  body{
    font-family: Arial;
    padding: 25px;
    color:#111827;
  }

  .title{
    text-align:center;
    font-size:28px;
    font-weight:bold;
    margin-bottom:25px;
  }

  .info-table{
    width:100%;
    border-collapse:collapse;
    margin-bottom:25px;
  }

  .info-table td{
    border:1px solid #d1d5db;
    padding:10px;
    font-size:14px;
  }

  .product-table{
    width:100%;
    border-collapse:collapse;
  }

  .product-table th{
    background:#111827;
    color:white;
    padding:12px;
    border:1px solid #374151;
    font-size:14px;
  }

  .product-table td{
    border:1px solid #d1d5db;
    padding:10px;
    font-size:13px;
    text-align:center;
  }

  .total-box{
    margin-top:25px;
    text-align:right;
    font-size:22px;
    font-weight:bold;
  }

  .footer{
    margin-top:40px;
    text-align:center;
    color:#6b7280;
    font-size:12px;
  }

  </style>
  </head>

  <body>

    <div class="title">RECIBO DIGITAL</div>

    <table class="info-table">
      <tr>
        <td><strong>ID RECIBO</strong></td>
        <td>${escapeHtml(recibo.receipt_id)}</td>
        <td><strong>MÉTODO</strong></td>
        <td>${escapeHtml(metodo)}</td>
      </tr>
      <tr>
        <td><strong>CLIENTE</strong></td>
        <td>${escapeHtml(cliente)}</td>
        <td><strong>CARNET</strong></td>
        <td>${escapeHtml(recibo.carnet || 'N/A')}</td>
      </tr>
      <tr>
        <td><strong>FECHA</strong></td>
        <td colspan="3">${escapeHtml(formatFecha(fecha))}</td>
      </tr>
    </table>

    <table class="product-table">
      <tr>
        <th>PRODUCTO</th>
        <th>DESCRIPCIÓN</th>
        <th>CÓDIGO</th>
        <th>CANTIDAD</th>
        <th>P. UNITARIO</th>
        <th>SUBTOTAL</th>
      </tr>
      ${(recibo.items ?? [])
        .map(
          (item: any) => `
      <tr>
        <td>${escapeHtml(item.producto.nombre)}</td>
        <td>${escapeHtml(item.producto.descripcion || 'Sin descripción')}</td>
        <td>${escapeHtml(item.producto.codigoProducto || 'N/A')}</td>
        <td>${escapeHtml(item.cantidad)}</td>
        <td>${escapeHtml(formatBs(item.producto.precioVenta))}</td>
        <td>${escapeHtml(formatBs(item.cantidad * item.producto.precioVenta))}</td>
      </tr>`
        )
        .join('')}
    </table>

    <div class="total-box">TOTAL: ${escapeHtml(formatBs(recibo.total))}</div>

    <div class="footer">Gracias por su compra</div>

  </body>
  </html>
  `;

try {

if (Platform.OS === 'web') {

  const ventana =
    window.open(
      '',
      '_blank'
    );

  if (ventana) {

    ventana.document.write(html);

    ventana.document.close();

    ventana.focus();

    setTimeout(() => {
      ventana.print();
    }, 500);
  }

} else {

  const { uri } =
    await Print.printToFileAsync({
      html,
    });

  await Sharing.shareAsync(
    uri
  );
}

} catch (error) {
  Alert.alert('Error', 'No se pudo generar el recibo.');
}

};
  //todo esto es nuestra seccion de reportes para admin

  const ventas = useMemo(
    () =>
      user?.role === 'admin'
        ? obtenerTodasTransacciones()
        : obtenerTransaccionesUsuario(user?.id || ''),
    [user, obtenerTodasTransacciones, obtenerTransaccionesUsuario]
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
    
    const gananciaReal = useMemo(() => {
  return ventasOrdenadas.reduce(
    (totalGanancia: number, venta: any) => {

      const gananciaVenta =
        venta.items?.reduce(
          (subtotal: number, item: any) => {

            const precioVenta =
              Number(item.producto.precioVenta || 0);

            const precioCompra =
              Number(item.producto.precioCompra || 0);

            const cantidad =
              Number(item.cantidad || 0);

            return (
              subtotal + (precioVenta - precioCompra) * cantidad
            );
          },
          0
        ) || 0;

      return totalGanancia + gananciaVenta;
    },
    0
  );
}, [ventasOrdenadas]);
    
//* carrito usuario

  const confirmarCompra = async (metodo: string) => {
    if (procesando || items.length === 0) return;

    setProcesando(true);
    try {
      const itemsCompra = [...items];

      // Una sola operación atómica: valida stock, descuenta inventario y crea el recibo.
      const transaccion = await registrarCompra(itemsCompra, metodo);

      setFactura({
        receipt_id: transaccion.receipt_id,
        fecha: transaccion.created_at,
        items: transaccion.items?.length ? transaccion.items : itemsCompra,
        total: Number(transaccion.total ?? total),
        cliente: user?.name,
        carnet: user?.carnet || 'N/A',
        metodoPago: metodo,
      });

      setFacturaVisible(true);
      setMostrarPago(false);
      setMostrarQR(false);
      vaciarCarrito();
    } catch (error) {
      Alert.alert(
        'No se pudo completar la compra',
        mensajeDeError(error, 'Inténtalo nuevamente.')
      );
    } finally {
      setProcesando(false);
    }
  };

//*esto es los detalles de un recibo que puede ver el admind e sus clientes

if (reciboDetalle) {
  return (
    <ThemedView
      style={styles.container}
    >
      <TabHeader title="Detalle recibo" />

      <ScrollView
          style={{ flex: 1 }}
  contentContainerStyle={{
    padding: 12,
    paddingBottom: items.length > 0 ? 300 : 30,
  }}
  showsVerticalScrollIndicator={false}
      >
        <View style={styles.factura}>
          <ThemedText type="title">
            RECIBO
          </ThemedText>

          <ThemedText>
            ID:
            {reciboDetalle.receipt_id}
          </ThemedText>

          <ThemedText>
            Cliente:
            {reciboDetalle.usuario_nombre}
          </ThemedText>

          <ThemedText>
            Fecha:{formatFecha(reciboDetalle.created_at)}
          </ThemedText>

          <ThemedText>
            Método:{reciboDetalle.metodo_pago}</ThemedText>

          {reciboDetalle.items?.map(
            (
              item: any,
              i: number
            ) => (
              <View
                key={i}
                style={styles.receiptCard}
              >
                <ThemedText
                  style={
                    styles.receiptProduct
                  }
                >
                  {
                    item.producto
                      .nombre
                  }
                </ThemedText>

                <View
                  style={
                    styles.receiptRow
                  }
                >
                  <ThemedText>
                    Cantidad:
                  </ThemedText>

                  <ThemedText>
                    {item.cantidad}
                  </ThemedText>
                </View>

                <View
                  style={
                    styles.receiptRow
                  }
                >
                  <ThemedText>
                    Unitario:
                  </ThemedText>

                  <ThemedText>
                    Bs.
                    {
                      item.producto
                        .precioVenta
                    }
                  </ThemedText>
                </View>

                <View
                  style={
                    styles.receiptRow
                  }
                >
                  <ThemedText>
                    Subtotal:
                  </ThemedText>

                  <ThemedText>
                    Bs.
                    {item.cantidad *
                      item.producto
                        .precioVenta}
                  </ThemedText>
                </View>
              </View>
            )
          )}

          <ThemedText
            style={styles.total}
          >
            TOTAL:
            Bs.
            {reciboDetalle.total}
          </ThemedText>

{/* imprimir recibo */}
          <TouchableOpacity
            style={[
              styles.btn,{
                backgroundColor:colors.actionSuccess,
                marginTop: 15,
                
              },
            ]}
onPress={() =>
  imprimirRecibo({
    ...reciboDetalle,
    cliente:
      reciboDetalle.usuario_nombre,
    carnet:
      reciboDetalle.profiles
        ?.carnet || 'N/A',
    metodoPago:
      reciboDetalle.metodo_pago,
    fecha:
      reciboDetalle.created_at,
  })
}
          >
            <ThemedText
              style={{color: colors.primaryText,}}
            >
              Imprimir PDF
            </ThemedText>
          </TouchableOpacity>

{/* cerrar ventana */}
          <TouchableOpacity
            style={[
              styles.btn,
              {
                backgroundColor: colors.actionDanger,
                marginTop: 10,
              },
            ]}
            onPress={() =>
              setReciboDetalle(null)
            }
          >
            <ThemedText
              style={{
                color: colors.primaryText,
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

//* esta es otra vista desplegable sobre los recibos

  if (
    facturaVisible &&
    factura
  ) {
    return (
      <ThemedView
        style={styles.container}
      >
        <TabHeader title="RECIBO DIGITAL" />

        <ScrollView   style={{ flex: 1 }}
  contentContainerStyle={{
    padding: 12,
    paddingBottom: items.length > 0 ? 300 : 30,
  }}
  showsVerticalScrollIndicator={false}
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
                factura.receipt_id
              }
            </ThemedText>

            <ThemedText>
              Cliente:
              {
                factura.cliente
              }
            </ThemedText>

            <ThemedText>
              Método:
              {
                factura.metodoPago
              }
            </ThemedText>

            <ThemedText>
              Fecha:
              {formatFecha(
                factura.fecha
              )}
            </ThemedText>

{factura.items.map(
  (
    item: any,
    i: number
  ) => (
    <View
      key={i}
      style={styles.receiptCard}
    >
      <ThemedText
        style={styles.receiptProduct}
      >
        {item.producto.nombre}
      </ThemedText>

      <View
        style={styles.receiptRow}
      >
        <ThemedText>
          Cantidad:
        </ThemedText>

        <ThemedText>
          {item.cantidad}
        </ThemedText>
      </View>

      <View
        style={styles.receiptRow}
      >
        <ThemedText>
          Precio unitario:
        </ThemedText>

        <ThemedText>
          Bs.{' '}
          {
            item.producto
              .precioVenta
          }
        </ThemedText>
      </View>

      <View
        style={styles.receiptRow}
      >
        <ThemedText>
          Subtotal:
        </ThemedText>

        <ThemedText>
          Bs.{' '}
          {item.cantidad *
            item.producto
              .precioVenta}
        </ThemedText>
      </View>
    </View>
  )
)}

            <ThemedText
              style={styles.total}
            >
              Total: {formatBs(factura.total)}
            </ThemedText>

            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor:colors.actionDanger,
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
                  color: colors.primaryText,
                }}
              >
                Cerrar
              </ThemedText>
            </TouchableOpacity>
<TouchableOpacity
  style={[
    styles.btn,
    {
      backgroundColor:colors.actionSuccess,
      marginTop: 10,
    },
  ]}
  onPress={() =>imprimirRecibo(factura)}
>
  <ThemedText
    style={{
      color: colors.primaryText,
    }}
  >
    Imprimir / Compartir PDF
  </ThemedText>
</TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

//! coloca diferente nombre a la cabecera segun el rol

return (
  <ThemedView style={styles.container}>
    <TabHeader
      title={
        user?.role === 'admin'
          ? 'Panel Admin'
          : 'Carrito'
      }
    />

{/* esto es lo que ve el cliente */}

{/* esto es lo que ve el cliente */}
{user?.role !== 'admin' ? (
  <>
    <ScrollView
      style={[
        { flex: 1, minHeight: 0 },
        Platform.OS === 'web' && ({
          overflowY: 'auto',
          touchAction: 'pan-y',
          overscrollBehaviorY: 'contain',
        } as any),
      ]}
      contentContainerStyle={{
        padding: 12,
        paddingBottom: items.length > 0 ? 320 : 30,
        flexGrow: 1,
      }}
      showsVerticalScrollIndicator={true}
    >
      <ThemedText
        style={[
          styles.bigTitle,
          { color: colors.text },
        ]}
      >
        Mi carrito
      </ThemedText>

      {items.length === 0 ? (
        <ThemedText>
          No tienes productos reservados
        </ThemedText>
      ) : (
        <View style={styles.clientGrid}>
          {items.map((item: any) => (
            <View
              key={item.producto.id}
              style={[
                styles.ticket,
                styles.clientGridItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <ThemedText style={{ color: colors.text }}>
                {item.producto.nombre}
              </ThemedText>

              <ThemedText style={{ color: colors.text }}>
                Precio: Bs. {item.producto.precioVenta}
              </ThemedText>

              <ThemedText style={{ color: colors.secondaryText }}>
                Cantidad disponible: {item.producto.stock}
              </ThemedText>

              {/* Cantidad de productos */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 10,
                  gap: 10,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.btnCantidad,
                    {
                      backgroundColor: colors.buttonSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    cambiarCantidad(
                      item.producto.id,
                      item.cantidad - 1
                    )
                  }
                >
                  <ThemedText style={{ color: colors.text }}>
                    -
                  </ThemedText>
                </TouchableOpacity>

                <TextInput
                  value={String(item.cantidad)}
                  onChangeText={(text) => {
                    const cantidad = Number(text);

                    if (text.trim() !== '' && !isNaN(cantidad)) {
                      cambiarCantidad(
                        item.producto.id,
                        cantidad
                      );
                    }
                  }}
                  keyboardType="numeric"
                  style={[
                    styles.inputCantidad,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />

                <TouchableOpacity
                  style={[
                    styles.btnCantidad,
                    {
                      backgroundColor: colors.buttonSecondary,
                      borderWidth: 1,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    cambiarCantidad(
                      item.producto.id,
                      item.cantidad + 1
                    )
                  }
                >
                  <ThemedText style={{ color: colors.text }}>
                    +
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <ThemedText
                style={{
                  marginTop: 10,
                  fontWeight: '700',
                  color: colors.price,
                }}
              >
                Subtotal: Bs.{' '}
                {(item.producto.precioVenta * item.cantidad).toFixed(2)}
              </ThemedText>

              <TouchableOpacity
                style={[
                  styles.btn,
                  {
                    backgroundColor: colors.actionDanger,
                    marginTop: 10,
                  },
                ]}
                onPress={() =>
                  removerDelCarrito(item.producto.id)
                }
              >
                <ThemedText style={{ color: colors.primaryText }}>
                  Quitar
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Historial de compras del cliente */}
      <View
        style={{
          marginTop: 15,
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          style={[
            styles.accordionBtn,
            {
              backgroundColor: colors.tableHeader,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setHistorialVisible(!historialVisible)}
        >
          <ThemedText
            style={[
              styles.accordionText,
              { color: colors.text },
            ]}
          >
            {historialVisible ? '▼' : '▶'} Mi historial de compras
          </ThemedText>
        </TouchableOpacity>

        {historialVisible && (
          <>
            {ventasOrdenadas.length === 0 ? (
              <ThemedText
                style={{
                  color: colors.secondaryText,
                  textAlign: 'center',
                  marginTop: 15,
                }}
              >
                Todavía no tienes compras registradas.
              </ThemedText>
            ) : (
              <View style={styles.clientGrid}>
                {ventasOrdenadas.map((v: any) => (
                  <View
                    key={v.id}
                    style={[
                      styles.ticket,
                      styles.clientGridItem,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <ThemedText style={{ color: colors.text }}>
                      {v.receipt_id}
                    </ThemedText>

                    <ThemedText style={{ color: colors.secondaryText }}>
                      {formatFecha(v.created_at)}
                    </ThemedText>

                    <ThemedText style={{ color: colors.text }}>
                      Método: {v.metodo_pago}
                    </ThemedText>

                    <ThemedText
                      style={[
                        styles.ticketTotal,
                        { color: colors.price },
                      ]}
                    >
                      Total: Bs. {Number(v.total).toFixed(2)}
                    </ThemedText>

                    <TouchableOpacity
                      style={[
                        styles.btn,
                        {
                          backgroundColor: colors.primary,
                          marginTop: 10,
                        },
                      ]}
                      onPress={() => setReciboDetalle(v)}
                    >
                      <ThemedText style={{ color: colors.primaryText }}>
                        Ver recibo
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.btn,
                        {
                          backgroundColor: colors.actionSuccess,
                          marginTop: 10,
                        },
                      ]}
                      onPress={() =>
                        imprimirRecibo({
                          ...v,
                          cliente: v.usuario_nombre,
                          carnet: v.profiles?.carnet || 'N/A',
                          metodoPago: v.metodo_pago,
                          fecha: v.created_at,
                        })
                      }
                    >
                      <ThemedText style={{ color: colors.primaryText }}>
                        Imprimir PDF
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>

    {/* Footer fijo de pago */}
    {items.length > 0 && (
      <View
        style={[
          styles.footerPago,
          {
            backgroundColor: colors.footer,
            borderTopColor: colors.border,
          },
        ]}
      >
        <ThemedText style={styles.total}>
          TOTAL: Bs. {Number(total).toFixed(2)}
        </ThemedText>

        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: colors.primary,
              marginTop: 60,
              bottom: 50,
            },
          ]}
          disabled={procesando}
          onPress={() => confirmarCompra('Efectivo')}
        >
          <ThemedText style={{ color: colors.primaryText }}>
            Comprar en efectivo
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.btn,
            {
              backgroundColor: colors.primary,
              marginTop: 10,
              bottom: 50,
            },
          ]}
          onPress={() => setMostrarQR(true)}
        >
          <ThemedText style={{ color: colors.primaryText }}>
            Pagar con QR
          </ThemedText>
        </TouchableOpacity>

        {mostrarQR && (
          <View style={styles.qrContainer}>
            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.actionSuccess,
                  marginTop: 'auto',
                },
              ]}
              disabled={procesando}
              onPress={() => confirmarCompra('QR')}
            >
              <ThemedText style={{ color: colors.primaryText }}>
                Confirmar pago QR
              </ThemedText>
            </TouchableOpacity>

            <Image
              source={qrImage}
              style={styles.qrImage}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={[
                styles.btn,
                {
                  backgroundColor: colors.danger,
                  marginTop: -20,
                },
              ]}
              onPress={() => setMostrarQR(false)}
            >
              <ThemedText style={{ color: colors.primaryText }}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )}
  </>
) : (

//*esto nos genera una vista de los reportes de ventas en tablas todo el sistema de reporte se encuentra aqui

      <ScrollView
  style={[
    {
      flex: 1,
      minHeight: 0,
    },
    Platform.OS === 'web' && ({
      overflowY: 'auto',
      touchAction: 'pan-y',
      overscrollBehavior: 'contain',
    } as any),
  ]}
  contentContainerStyle={{
    padding: 12,
    paddingBottom: items.length > 0 ? 320 : 30,
    flexGrow: 1,
  }}
  showsVerticalScrollIndicator={true}
>
        <View>
          <ResumenReportes
  ventas={ventasOrdenadas}
  totalIngresos={totalVentas}
  gananciaReal={gananciaReal}
  filtrado={!!(buscarCarnet || buscarRecibo || fechaInicio || fechaFin)}
/>

<View style={styles.searchRow}>

  <TextInput
    placeholder="Buscar carnet"
    placeholderTextColor={colors.mutedText}
    value={buscarCarnet}
    onChangeText={setBuscarCarnet}
    style={[
            styles.searchInput,
            {
              backgroundColor: colors.input,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
  />

  <TextInput
    placeholder="Buscar recibo"
    placeholderTextColor={colors.mutedText}
    value={buscarRecibo}
    onChangeText={setBuscarRecibo}
    style={[
              styles.searchInput,
              {
                backgroundColor: colors.input,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
  />

</View>

{/* filtro por rango de fechas (solo móvil) */}
{Platform.OS !== 'web' && (
  <View style={styles.searchRow}>
    <TouchableOpacity
      style={[styles.dateBtn, { flex: 1, borderColor: colors.border }]}
      onPress={() => setShowInicioPicker(true)}
    >
      <ThemedText>
        Desde: {fechaInicio ? fechaInicio.toLocaleDateString('es-BO') : 'Todas'}
      </ThemedText>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.dateBtn, { flex: 1, borderColor: colors.border }]}
      onPress={() => setShowFinPicker(true)}
    >
      <ThemedText>
        Hasta: {fechaFin ? fechaFin.toLocaleDateString('es-BO') : 'Todas'}
      </ThemedText>
    </TouchableOpacity>
  </View>
)}

{(fechaInicio || fechaFin) && (
  <TouchableOpacity
    onPress={() => {
      setFechaInicio(null);
      setFechaFin(null);
    }}
  >
    <ThemedText style={{ color: colors.tint, marginBottom: 10 }}>
      Limpiar fechas
    </ThemedText>
  </TouchableOpacity>
)}

{showInicioPicker && (
  <DateTimePicker
    value={fechaInicio ?? new Date()}
    mode="date"
    maximumDate={new Date()}
    onChange={(_evento, fecha) => {
      setShowInicioPicker(Platform.OS === 'ios');
      if (fecha) {
        const inicio = new Date(fecha);
        inicio.setHours(0, 0, 0, 0);
        setFechaInicio(inicio);
      }
    }}
  />
)}

{showFinPicker && (
  <DateTimePicker
    value={fechaFin ?? new Date()}
    mode="date"
    maximumDate={new Date()}
    onChange={(_evento, fecha) => {
      setShowFinPicker(Platform.OS === 'ios');
      if (fecha) setFechaFin(fecha);
    }}
  />
)}

<TouchableOpacity
  style={[
  styles.accordionBtn,
  { backgroundColor: colors.tableHeader },
]}
  onPress={() =>
    setHistorialVisible(
      !historialVisible
    )
  }
>
  <ThemedText
    style={styles.accordionText}
  >
    {historialVisible
      ? '▼'
      : '▶'} Historial de ventas
  </ThemedText>
</TouchableOpacity>

{historialVisible && (

<View>

{/* cabecera de la tabla de vista admin */}
  <View style={[styles.tableHeader,{ backgroundColor: colors.tableHeader },]}>

    <ThemedText style={styles.headerCell}>
      Cliente
    </ThemedText>

    <ThemedText style={styles.headerCell}>
      Recibo
    </ThemedText>

    <ThemedText style={styles.headerCell}>
      Total
    </ThemedText>

    <ThemedText style={styles.headerCell}>
      Acción
    </ThemedText>

  </View>

  {ventasOrdenadas.map(
    (v: any) => (

      <View
        key={v.id}
        style={[styles.tableRow,{ backgroundColor: colors.card },]}>

        <ThemedText
          style={styles.tableCell}
          numberOfLines={1}
        >
          {v.usuario_nombre}
        </ThemedText>

        <ThemedText
          style={styles.tableCell}
          numberOfLines={1}
        >
          {v.receipt_id}
        </ThemedText>

        <ThemedText
          style={styles.tableCell}
        >
          {formatBs(v.total)}
        </ThemedText>

        <TouchableOpacity
          style={[  styles.miniBtn,  { backgroundColor: colors.primary },]}
          onPress={() =>
            setReciboDetalle(v)
          }
        >
          <ThemedText
            style={{
              color: colors.primaryText,
              fontSize: 12,
            }}
          >
            Ver
          </ThemedText>
        </TouchableOpacity>

      </View>

    )
  )}

</View>

)}
        </View>
      </ScrollView>
    )}
  </ThemedView>
);
}

//todo esto son los estilos del tab ventas


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    padding: 12,
    paddingBottom: 140,
    flexGrow: 1,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  dateBtn: {
    borderWidth: 1,
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
    justifyContent: 'space-between',
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
  },

  ticketTotal: {
    fontWeight: '700',
    marginTop: 8,
  },

  btnCantidad: {
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputCantidad: {
    borderWidth: 1,
    width: 60,
    height: 40,
    textAlign: 'center',
    borderRadius: 8,
  },

  footerPago: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    borderTopWidth: 1,
  },

  receiptCard: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
  },

  receiptProduct: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },

  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  dashboardCard: {
    flex: 1,
    padding: 20,
    borderRadius: 14,
  },

  dashboardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 15,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },

  dashboardTitle: {
    fontSize: 16,
  },

  dashboardAmount: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 10,
  },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 6,
    alignItems: 'center',
  },

  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '800',
  },

  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 4,
  },

  miniBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },

  chartContainer: {
    padding: 15,
    borderRadius: 14,
    marginBottom: 20,
    alignItems: 'center',
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  accordionBtn: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  accordionText: {
    fontSize: 16,
    fontWeight: '700',
  },

  qrContainer: {
    marginTop: 25,
    alignItems: 'center',
    bottom: 60,
  },

  qrImage: {
    width: 310,
    height: 250,
    borderRadius: 25,
    marginTop: 40,
    bottom: 35,
  },
   // Cuadrícula de dos columnas para la vista del cliente
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },

  clientGridItem: {
    width: '48%',
    marginTop: 10,
    padding: 10,
  },
});
