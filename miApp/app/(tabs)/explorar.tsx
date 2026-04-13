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

const gananciaTotal = (p: any) => {
  const costoUnidad = p.precioCompra;
  return (p.precioVenta - costoUnidad) * p.stock;
};

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

  /* ---------- EDIT ---------- */
  const [editVisible, setEditVisible] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const [editCompra, setEditCompra] = useState('');
  const [editVenta, setEditVenta] = useState('');
  const [editStock, setEditStock] = useState('');

  /* ===================== FILTRO ===================== */

  const productosFiltrados = productos.filter((p) => {
    const matchCategoria = !selectedCategory || p.categoria === selectedCategory;

    // 👇 CLAVE: CLIENTE NO VE STOCK 0
    if (user?.role === 'admin') return matchCategoria;
    return p.stock > 0 && matchCategoria;
  });

  /* ===================== AGREGAR ===================== */

  const handleAgregar = async () => {
    if (!nombre || !categoria || !precioCompra || !precioVenta || !stock) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    await agregarProducto({
      nombre,
      categoria,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      stock: Number(stock),
    });

    setNombre('');
    setCategoria('');
    setPrecioCompra('');
    setPrecioVenta('');
    setStock('');

    Alert.alert('OK', 'Producto agregado');
  };

  /* ===================== EDIT ===================== */

  const handleEditar = (prod: any) => {
    setEditProduct(prod);
    setEditCompra(String(prod.precioCompra));
    setEditVenta(String(prod.precioVenta));
    setEditStock(String(prod.stock));
    setEditVisible(true);
  };

  const guardarEdicion = async () => {
    if (!editProduct) return;

    await actualizarProducto(editProduct.id, {
      precioCompra: Number(editCompra),
      precioVenta: Number(editVenta),
      stock: Number(editStock),
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
                  style={[styles.catBtn, categoria === cat && { backgroundColor: colors.tint }]}
                  onPress={() => setCategoria(cat)}
                >
                  <ThemedText style={{ color: '#fff' }}>{cat}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="Precio compra"
              value={precioCompra}
              onChangeText={setPrecioCompra}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Precio venta"
              value={precioVenta}
              onChangeText={setPrecioVenta}
              style={styles.input}
              keyboardType="numeric"
            />

            <TextInput
              placeholder="Stock"
              value={stock}
              onChangeText={setStock}
              style={styles.input}
              keyboardType="numeric"
            />

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

              <ThemedText style={styles.name}>{prod.nombre}</ThemedText>
              <ThemedText style={styles.subText}>{prod.categoria}</ThemedText>

              <ThemedText style={styles.detail}>Compra: {prod.precioCompra}</ThemedText>
              <ThemedText style={styles.detail}>Venta: {prod.precioVenta}</ThemedText>
              <ThemedText style={styles.detail}>Stock: {prod.stock}</ThemedText>

              {user?.role === 'admin' && (
                <ThemedText style={styles.detailGanancia}>
                  Ganancia: {gananciaTotal(prod)}
                </ThemedText>
              )}

              <TouchableOpacity
                style={styles.btn}
                onPress={() => {
                  agregarAlCarrito(prod, 1);
                  Alert.alert('✔ Agregado al carrito');
                }}
              >
                <ThemedText style={{ color: '#fff' }}>Agregar</ThemedText>
              </TouchableOpacity>

              {user?.role === 'admin' && (
                <View style={styles.adminRow}>
                  <TouchableOpacity onPress={() => handleEditar(prod)}>
                    <ThemedText style={{ color: '#ffa500' }}>Editar</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => eliminarProducto(prod.id)}>
                    <ThemedText style={{ color: '#ff4444' }}>Eliminar</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ================= EDIT MODAL ================= */}
        {editVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>

              <ThemedText style={styles.title}>Editar producto</ThemedText>

              <TextInput value={editCompra} onChangeText={setEditCompra} style={styles.input} />
              <TextInput value={editVenta} onChangeText={setEditVenta} style={styles.input} />
              <TextInput value={editStock} onChangeText={setEditStock} style={styles.input} />

              <TouchableOpacity style={styles.addBtn} onPress={guardarEdicion}>
                <ThemedText style={{ color: '#fff' }}>Guardar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <ThemedText style={{ color: '#ff4444' }}>Cancelar</ThemedText>
              </TouchableOpacity>

            </View>
          </View>
        )}

      </ScrollView>
    </ThemedView>
  );
}

/* ===================== STYLES (NO TOCADO VISUALMENTE) ===================== */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  contentContainer: { padding: 12 },
  form: { marginBottom: 15, padding: 12, borderRadius: 12, backgroundColor: '#1f2937' },
  title: { color: '#fff', fontWeight: '700', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#374151', padding: 8, borderRadius: 8, color: '#fff', marginBottom: 8 },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catBtn: { padding: 6, borderRadius: 8, borderWidth: 1, borderColor: '#374151' },
  addBtn: { backgroundColor: '#22c55e', padding: 10, borderRadius: 10, alignItems: 'center' },
  filter: { padding: 6, borderRadius: 20, borderWidth: 1, borderColor: '#374151', marginRight: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardRow: { width: '48%', backgroundColor: '#1f2937', borderRadius: 12, padding: 10, marginBottom: 10 },
  name: { color: '#fff', fontWeight: '700' },
  subText: { color: '#9ca3af', fontSize: 12 },
  detail: { color: '#22c55e', fontSize: 12 },
  detailGanancia: { color: '#fbbf24', fontWeight: '700' },
  btn: { marginTop: 8, backgroundColor: '#22c55e', padding: 6, borderRadius: 8, alignItems: 'center' },
  adminRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000aa', justifyContent: 'center', padding: 20 },
  modalBox: { backgroundColor: '#1f2937', padding: 15, borderRadius: 12 },
});