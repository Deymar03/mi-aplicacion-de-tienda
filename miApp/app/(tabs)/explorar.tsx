import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

/* ===================== HELPERS ===================== */

const gananciaUnidad = (p: any) => p.precioVenta - p.precioCompra;
const gananciaTotal = (p: any) => (p.precioVenta - p.precioCompra) * p.stock;

const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpieza', 'Higiene'];

/* ===================== SCREEN ===================== */

export default function ProductosScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { user } = useAuth();
  const { productos, agregarProducto, actualizarProducto, eliminarProducto } =
    useProducts();
  const { agregarAlCarrito } = useCart();

  const [selectedCategory, setSelectedCategory] = useState('');

  /* ---------- FORM AGREGAR ---------- */
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stock, setStock] = useState('');

  const [esCanjeable, setEsCanjeable] = useState(false);
  const [puntosRequeridos, setPuntosRequeridos] = useState('');

  /* ---------- EDIT ---------- */
  const [editVisible, setEditVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const [editCompra, setEditCompra] = useState('');
  const [editVenta, setEditVenta] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editPuntos, setEditPuntos] = useState('');
  const [editCanje, setEditCanje] = useState(false);

  /* ---------- FILTER ---------- */
  const productosFiltrados = productos.filter(
    (p) => p.stock > 0 && (!selectedCategory || p.categoria === selectedCategory)
  );

  /* ===================== AGREGAR ===================== */
  const handleAgregar = async () => {
    if (!nombre || !categoria || !precioCompra || !precioVenta || !stock) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    try {
      await agregarProducto({
        nombre,
        categoria,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        stock: Number(stock),
        esCanjeable,
        puntosRequeridos: Number(puntosRequeridos || 0),
      });

      setNombre('');
      setCategoria('');
      setPrecioCompra('');
      setPrecioVenta('');
      setStock('');
      setEsCanjeable(false);
      setPuntosRequeridos('');

      Alert.alert('OK', 'Producto agregado');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo agregar');
    }
  };

  /* ===================== EDIT ===================== */
  const handleEditar = (prod: any) => {
    setEditProduct(prod);
    setEditCompra(String(prod.precioCompra));
    setEditVenta(String(prod.precioVenta));
    setEditStock(String(prod.stock));
    setEditPuntos(String(prod.puntosRequeridos || 0));
    setEditCanje(prod.esCanjeable || false);
    setEditVisible(true);
  };

  const guardarEdicion = async () => {
    if (!editProduct) return;

    await actualizarProducto(editProduct.id, {
      precioCompra: Number(editCompra),
      precioVenta: Number(editVenta),
      stock: Number(editStock),
      esCanjeable: editCanje,
      puntosRequeridos: Number(editPuntos || 0),
    });

    setEditVisible(false);
  };

  /* ===================== UI ===================== */

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Productos" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* ================= FORM ADMIN ================= */}
        {user?.role === 'admin' && (
          <View style={styles.form}>
            <ThemedText style={styles.title}>➕ Agregar Producto</ThemedText>

            <TextInput
              placeholder="Nombre producto"
              placeholderTextColor="#aaa"
              value={nombre}
              onChangeText={setNombre}
              style={styles.input}
            />

            <View style={styles.categorias}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catBtn,
                    categoria === cat && { backgroundColor: colors.tint },
                  ]}
                  onPress={() => setCategoria(cat)}
                >
                  <ThemedText style={{ color: '#fff' }}>{cat}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Precio compra"
              placeholderTextColor="#aaa"
              value={precioCompra}
              onChangeText={setPrecioCompra}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Precio venta"
              placeholderTextColor="#aaa"
              value={precioVenta}
              onChangeText={setPrecioVenta}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Stock"
              placeholderTextColor="#aaa"
              value={stock}
              onChangeText={setStock}
              style={styles.input}
              keyboardType="numeric"
            />

            {/* PUNTOS */}
            <TouchableOpacity
              onPress={() => setEsCanjeable(!esCanjeable)}
              style={styles.puntosBtn}
            >
              <ThemedText style={{ color: '#fff' }}>
                {esCanjeable ? '✔ Producto por puntos' : '🎁 Activar puntos'}
              </ThemedText>
            </TouchableOpacity>

            {esCanjeable && (
              <TextInput
                placeholder="Puntos requeridos"
                placeholderTextColor="#aaa"
                value={puntosRequeridos}
                onChangeText={setPuntosRequeridos}
                style={styles.input}
                keyboardType="numeric"
              />
            )}

            <TouchableOpacity style={styles.addBtn} onPress={handleAgregar}>
              <ThemedText style={{ color: '#fff' }}>
                Agregar producto
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* ================= FILTER ================= */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setSelectedCategory('')}
            style={styles.filter}
          >
            <ThemedText>Todos</ThemedText>
          </TouchableOpacity>

          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={styles.filter}
            >
              <ThemedText>{cat}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ================= PRODUCTOS ================= */}
        <View style={styles.grid}>
          {productosFiltrados.map((prod) => (
            <View key={prod.id} style={styles.cardRow}>

              {/* IZQUIERDA */}
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.name}>{prod.nombre}</ThemedText>
                <ThemedText style={styles.subText}>{prod.categoria}</ThemedText>

                {prod.esCanjeable ? (
                  <ThemedText style={styles.points}>
                    🎁 {prod.puntosRequeridos} puntos
                  </ThemedText>
                ) : (
                  <ThemedText style={styles.subText}>
                    💰 Venta normal
                  </ThemedText>
                )}
              </View>

              {/* DERECHA */}
              <View style={styles.detailsRow}>
                <ThemedText style={styles.detail}>
                  Compra: {prod.precioCompra}
                </ThemedText>
                <ThemedText style={styles.detail}>
                  Venta: {prod.precioVenta}
                </ThemedText>
                <ThemedText style={styles.detail}>
                  Stock: {prod.stock}
                </ThemedText>
                <ThemedText style={styles.detail}>
                  puntos: {prod.puntosRequeridos}
                </ThemedText>
                <ThemedText style={styles.detailGanancia}>
                  Ganancia: {gananciaTotal(prod)}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => agregarAlCarrito(prod, 1)}
              >
                <ThemedText style={{ color: '#fff' }}>Agregar</ThemedText>
              </TouchableOpacity>

              {user?.role === 'admin' && (
                <View style={styles.adminRow}>
                  <TouchableOpacity onPress={() => handleEditar(prod)}>
                    <ThemedText style={{ color: '#ffa500' }}>
                      Editar
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => eliminarProducto(prod.id)}
                  >
                    <ThemedText style={{ color: '#ff4444' }}>
                      Eliminar
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ================= MODAL EDIT ================= */}
     {/* ================= MODAL EDIT MEJORADO ================= */}
{editVisible && (
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>

      {/* TÍTULO CLARO */}
      <ThemedText style={styles.title}>
        ✏️ Editando producto
      </ThemedText>

      {/* NOMBRE DEL PRODUCTO (solo lectura) */}
      <View style={styles.infoBox}>
        <ThemedText style={styles.infoLabel}>Producto:</ThemedText>
        <ThemedText style={styles.infoValue}>
          {editProduct?.nombre}
        </ThemedText>
      </View>

      <View style={styles.infoBox}>
        <ThemedText style={styles.infoLabel}>Categoría:</ThemedText>
        <ThemedText style={styles.infoValue}>
          {editProduct?.categoria}
        </ThemedText>
      </View>

      <View style={styles.infoBox}>
        <ThemedText style={styles.infoLabel}>Tipo:</ThemedText>
        <ThemedText style={styles.infoValue}>
          {editProduct?.esCanjeable ? '🎁 Por puntos' : '💰 Venta normal'}
        </ThemedText>
      </View>

      {/* CAMPOS EDITABLES CON ETIQUETAS CLARAS */}

      <ThemedText style={styles.modalLabel}>Precio compra</ThemedText>
      <TextInput
        value={editCompra}
        onChangeText={setEditCompra}
        style={styles.input}
        keyboardType="numeric"
      />

      <ThemedText style={styles.modalLabel}>Precio venta</ThemedText>
      <TextInput
        value={editVenta}
        onChangeText={setEditVenta}
        style={styles.input}
        keyboardType="numeric"
      />

      <ThemedText style={styles.modalLabel}>Stock</ThemedText>
      <TextInput
        value={editStock}
        onChangeText={setEditStock}
        style={styles.input}
        keyboardType="numeric"
      />

      <ThemedText style={styles.modalLabel}>Puntos</ThemedText>
      <TextInput
        value={editPuntos}
        onChangeText={setEditPuntos}
        style={styles.input}
        keyboardType="numeric"
      />

      {/* BOTONES */}
      <TouchableOpacity style={styles.addBtn} onPress={guardarEdicion}>
        <ThemedText style={{ color: '#fff' }}>Guardar cambios</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setEditVisible(false)}>
        <ThemedText style={{ color: '#ff4444', marginTop: 10 }}>
          Cancelar
        </ThemedText>
      </TouchableOpacity>

    </View>
  </View>
)}
    </ThemedView>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  contentContainer: { padding: 12 },

  form: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1f2937',
  },

  title: { color: '#fff', fontWeight: '700', marginBottom: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#374151',
    padding: 8,
    borderRadius: 8,
    color: '#fff',
    marginBottom: 8,
  },

  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  catBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },

  puntosBtn: {
    marginVertical: 6,
    padding: 8,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    alignItems: 'center',
  },

  addBtn: {
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  filter: {
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 6,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardRow: {
    width: '48%',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },

  name: { color: '#fff', fontWeight: '700' },
  subText: { color: '#9ca3af', fontSize: 12 },

  points: { color: '#fbbf24', fontSize: 12, marginTop: 2 },

  detailsRow: { marginTop: 6 },

  detail: { color: '#22c55e', fontSize: 12 },

  detailGanancia: { color: '#22c55e', fontWeight: '700' },

  btn: {
    marginTop: 8,
    backgroundColor: '#22c55e',
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
  },

  adminRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    backgroundColor: '#1f2937',
    padding: 15,
    borderRadius: 12,
  },
  infoBox: {
  marginBottom: 6,
},

infoLabel: {
  color: '#9ca3af',
  fontSize: 12,
},

infoValue: {
  color: '#fff',
  fontWeight: '600',
  marginBottom: 4,
},

modalLabel: {
  color: '#9ca3af',
  fontSize: 12,
  marginTop: 6,
  marginBottom: 2,
},
});