// Panel de reportes del administrador: indicadores clave, productos más vendidos
// y un análisis de demanda calculado con las ventas reales (reglas simples, sin IA externa).

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useProducts } from '@/context/ProductContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatBs } from '@/utils/formato';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

interface Props {
  /** Ventas ya filtradas (por carnet, recibo y fechas) que se muestran en el historial. */
  ventas: any[];
  totalIngresos: number;
  gananciaReal: number;
  /** true si hay algún filtro activo (se indica en el subtítulo). */
  filtrado: boolean;
}

const STOCK_BAJO = 5;
const DIA_MS = 24 * 60 * 60 * 1000;

interface Insight {
  icono: IconName;
  tipo: 'ok' | 'alerta' | 'info';
  texto: string;
}

export function ResumenReportes({ ventas, totalIngresos, gananciaReal, filtrado }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { productos } = useProducts();

  const datos = useMemo(() => {
    const porProducto = new Map<string, { id: string; nombre: string; cantidad: number }>();
    const porMetodo = new Map<string, number>();
    let unidades = 0;

    ventas.forEach((venta) => {
      const metodo = venta.metodo_pago || 'Sin dato';
      porMetodo.set(metodo, (porMetodo.get(metodo) ?? 0) + 1);

      (venta.items ?? []).forEach((item: any) => {
        const id = String(item.producto?.id ?? item.producto?.nombre);
        const cantidad = Number(item.cantidad) || 0;
        unidades += cantidad;

        const actual = porProducto.get(id) ?? {
          id,
          nombre: item.producto?.nombre ?? 'Producto',
          cantidad: 0,
        };
        actual.cantidad += cantidad;
        porProducto.set(id, actual);
      });
    });

    const ranking = Array.from(porProducto.values()).sort((a, b) => b.cantidad - a.cantidad);

    // Tendencia: ingresos de los últimos 7 días contra los 7 días anteriores.
    const ahora = Date.now();
    let ultimos7 = 0;
    let anteriores7 = 0;
    ventas.forEach((venta) => {
      const antiguedad = ahora - new Date(venta.created_at).getTime();
      const total = Number(venta.total) || 0;
      if (antiguedad <= 7 * DIA_MS) ultimos7 += total;
      else if (antiguedad <= 14 * DIA_MS) anteriores7 += total;
    });

    return { ranking, unidades, porMetodo, ultimos7, anteriores7 };
  }, [ventas]);

  const insights = useMemo<Insight[]>(() => {
    const lista: Insight[] = [];
    const { ranking, unidades, porMetodo, ultimos7, anteriores7 } = datos;

    if (ranking.length === 0) return lista;

    // 1. Producto líder
    const lider = ranking[0];
    const porcentaje = unidades > 0 ? Math.round((lider.cantidad / unidades) * 100) : 0;
    lista.push({
      icono: 'emoji-events',
      tipo: 'ok',
      texto: `"${lider.nombre}" lidera la demanda: ${lider.cantidad} unidades (${porcentaje}% de lo vendido).`,
    });

    // 2. Tendencia semanal
    if (anteriores7 > 0) {
      const cambio = Math.round(((ultimos7 - anteriores7) / anteriores7) * 100);
      lista.push({
        icono: cambio >= 0 ? 'trending-up' : 'trending-down',
        tipo: cambio >= 0 ? 'ok' : 'alerta',
        texto:
          cambio === 0
            ? 'Las ventas de los últimos 7 días se mantienen igual que la semana anterior.'
            : `Las ventas de los últimos 7 días ${cambio > 0 ? 'subieron' : 'bajaron'} ${Math.abs(cambio)}% frente a la semana anterior.`,
      });
    } else if (ultimos7 > 0) {
      lista.push({
        icono: 'trending-up',
        tipo: 'info',
        texto: `Vendiste ${formatBs(ultimos7)} en los últimos 7 días. Aún no hay una semana anterior para comparar.`,
      });
    }

    // 3. Reposición: stock bajo, priorizando lo que más se vende
    const demanda = new Map(ranking.map((r) => [r.id, r.cantidad]));
    const bajos = productos
      .filter((p) => p.stock <= STOCK_BAJO)
      .sort(
        (a, b) => (demanda.get(b.id) ?? 0) - (demanda.get(a.id) ?? 0) || a.stock - b.stock
      )
      .slice(0, 3);

    if (bajos.length > 0) {
      lista.push({
        icono: 'warning',
        tipo: 'alerta',
        texto: `Conviene reponer: ${bajos
          .map((p) => `${p.nombre} (${p.stock === 0 ? 'agotado' : `quedan ${p.stock}`})`)
          .join(', ')}.`,
      });
    } else {
      lista.push({
        icono: 'check-circle',
        tipo: 'ok',
        texto: 'Ningún producto tiene stock bajo por ahora.',
      });
    }

    // 4. Método de pago más usado
    const metodos = Array.from(porMetodo.entries()).sort((a, b) => b[1] - a[1]);
    if (metodos.length > 0) {
      const totalVentas = metodos.reduce((acc, [, n]) => acc + n, 0);
      const [metodo, n] = metodos[0];
      lista.push({
        icono: 'payments',
        tipo: 'info',
        texto: `Pago más usado: ${metodo} (${Math.round((n / totalVentas) * 100)}% de las ventas).`,
      });
    }

    return lista;
  }, [datos, productos]);

  const colorInsight = (tipo: Insight['tipo']) =>
    tipo === 'ok' ? colors.success : tipo === 'alerta' ? colors.stockLow : colors.info;

  const top = datos.ranking.slice(0, 3);

  const kpis: { icono: IconName; etiqueta: string; valor: string; color?: string }[] = [
    { icono: 'account-balance-wallet', etiqueta: 'Ingresos totales', valor: formatBs(totalIngresos), color: colors.price },
    { icono: 'trending-up', etiqueta: 'Ganancia real', valor: formatBs(gananciaReal), color: colors.profit },
    { icono: 'shopping-bag', etiqueta: 'Ventas realizadas', valor: String(ventas.length) },
    { icono: 'shopping-basket', etiqueta: 'Productos vendidos', valor: String(datos.unidades) },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={styles.titulo}>Reportes de ventas</ThemedText>
      <ThemedText style={[styles.subtitulo, { color: colors.mutedText }]}>
        {filtrado ? 'Resultados según los filtros aplicados' : 'Todas las ventas registradas'}
      </ThemedText>

      {/* Indicadores */}
      <View style={styles.grid}>
        {kpis.map((kpi) => (
          <View key={kpi.etiqueta} style={styles.kpi}>
            <MaterialIcons name={kpi.icono} size={20} color={colors.secondaryText} />
            <ThemedText style={[styles.kpiEtiqueta, { color: colors.secondaryText }]}>
              {kpi.etiqueta}
            </ThemedText>
            <ThemedText style={[styles.kpiValor, kpi.color ? { color: kpi.color } : undefined]}>
              {kpi.valor}
            </ThemedText>
          </View>
        ))}
      </View>

      <View style={[styles.separador, { backgroundColor: colors.border }]} />

      {/* Productos más vendidos */}
      <ThemedText style={styles.seccion}>Productos más vendidos</ThemedText>
      {top.length === 0 ? (
        <ThemedText style={{ color: colors.mutedText }}>Aún no hay ventas para mostrar.</ThemedText>
      ) : (
        top.map((p, i) => (
          <View key={p.id} style={styles.filaTop}>
            <ThemedText style={styles.nombreTop} numberOfLines={1}>
              {i + 1}. {p.nombre}
            </ThemedText>
            <ThemedText style={[styles.cantidadTop, { color: colors.price }]}>
              {p.cantidad} {p.cantidad === 1 ? 'unidad' : 'unidades'}
            </ThemedText>
          </View>
        ))
      )}

      <View style={[styles.separador, { backgroundColor: colors.border }]} />

      {/* Análisis de demanda */}
      <ThemedText style={styles.seccion}>Análisis de demanda</ThemedText>
      {insights.length === 0 ? (
        <ThemedText style={{ color: colors.mutedText }}>
          Cuando registres ventas aquí verás los productos más comprados, la tendencia de ventas y
          qué conviene reponer.
        </ThemedText>
      ) : (
        insights.map((insight) => (
          <View key={insight.texto} style={styles.filaInsight}>
            <MaterialIcons name={insight.icono} size={20} color={colorInsight(insight.tipo)} />
            <ThemedText style={styles.textoInsight}>{insight.texto}</ThemedText>
          </View>
        ))
      )}

      <ThemedText style={[styles.nota, { color: colors.mutedText }]}>
        Calculado con tus ventas reales; se actualiza solo al registrarse una compra.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitulo: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 18,
  },
  kpi: {
    width: '50%',
    gap: 4,
    paddingRight: 8,
  },
  kpiEtiqueta: {
    fontSize: 14,
  },
  kpiValor: {
    fontSize: 20,
    fontWeight: '800',
  },
  separador: {
    height: 1,
    marginVertical: 18,
  },
  seccion: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  filaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  nombreTop: {
    flex: 1,
    fontSize: 15,
  },
  cantidadTop: {
    fontSize: 14,
    fontWeight: '700',
  },
  filaInsight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 6,
  },
  textoInsight: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  nota: {
    fontSize: 12,
    marginTop: 14,
  },
});
