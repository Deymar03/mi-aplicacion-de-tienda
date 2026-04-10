import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

const CATEGORIAS = ['Alimentos', 'Bebidas', 'Limpieza', 'Higiene', 'Electrónica', 'Ropa'];

export default function ExplorarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const { productos, agregarProducto } = useProducts();
  const { agregarAlCarrito } = useCart();
  const isAdmin = user?.role === 'admin';

  // Estado para formulario admin
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [precioCompra, setPrecioCompra] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [stock, setStock] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleAgregarProducto = async () => {
    if (!nombre || !precioCompra || !precioVenta || !stock) {
      Alert.alert('Error', 'Complete todos los campos');
      return;
    }

    try {
      await agregarProducto({
        nombre,
        categoria,
        precioCompra: parseFloat(precioCompra),
        precioVenta: parseFloat(precioVenta),
        stock: parseInt(stock),
      });
      setNombre('');
      setPrecioCompra('');
      setPrecioVenta('');
      setStock('');
      Alert.alert('Éxito', 'Producto agregado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el producto');
    }
  };

  if (isAdmin) {
    // Vista ADMIN - Registro de productos
    return (
      <ThemedView style={styles.container}>
        <TabHeader title="Registrar Productos" />
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={[styles.formSection, { backgroundColor: colors.tint + '10' }]}>
            <ThemedText type="subtitle" style={styles.formTitle}>➕ Agregar Nuevo Producto</ThemedText>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Nombre del Producto</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Ej: Arroz Premium"
                value={nombre}
                onChangeText={setNombre}
                placeholderTextColor={colors.text + '80'}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Categoría</ThemedText>
              <View style={styles.categoryPicker}>
                {CATEGORIAS.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      {
                        backgroundColor: categoria === cat ? colors.tint : colors.tint + '30',
                      },
                    ]}
                    onPress={() => setCategoria(cat)}>
                    <ThemedText
                      style={[
                        styles.categoryText,
                        { color: categoria === cat ? '#fff' : colors.text },
                      ]}>
                      {cat}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>Precio Compra ($)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="0.00"
                  value={precioCompra}
                  onChangeText={setPrecioCompra}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.text + '80'}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                <ThemedText style={styles.label}>Precio Venta ($)</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="0.00"
                  value={precioVenta}
                  onChangeText={setPrecioVenta}
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.text + '80'}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Stock</ThemedText>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholder="Cantidad"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
                placeholderTextColor={colors.text + '80'}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleAgregarProducto}>
              <ThemedText style={styles.submitText}>Agregar Producto</ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText type="subtitle" style={styles.listTitle}>Productos en Stock</ThemedText>
          {productos.map((prod) => (
            <View key={prod.id} style={[styles.productCard, { borderLeftColor: colors.tint }]}>
              <View style={styles.productInfo}>
                <ThemedText style={styles.productName}>{prod.nombre}</ThemedText>
                <ThemedText style={styles.productCategory}>{prod.categoria}</ThemedText>
              </View>
              <View style={styles.productStats}>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Compra</ThemedText>
                  <ThemedText style={styles.statValue}>Bs. {prod.precioCompra}</ThemedText>
                </View>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Venta</ThemedText>
                  <ThemedText style={[styles.statValue, { color: colors.tint }]}>
                    Bs. {prod.precioVenta}
                  </ThemedText>
                </View>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Stock</ThemedText>
                  <ThemedText style={styles.statValue}>{prod.stock}</ThemedText>
                </View>
                <View style={styles.stat}>
                  <ThemedText style={styles.statLabel}>Ganancia/u</ThemedText>
                  <ThemedText
                    style={[
                      styles.statValue,
                      { color: prod.precioVenta > prod.precioCompra ? colors.tint : '#e74c3c' },
                    ]}>
                    Bs. {(prod.precioVenta - prod.precioCompra).toFixed(2)}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </ThemedView>
    );
  }

  // Vista CLIENTE - Tienda de productos
  const productosDisponibles = productos.filter(
    (p) => p.stock > 0 && (!selectedCategory || p.categoria === selectedCategory)
  );

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Tienda" />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Filtro por categoría */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: !selectedCategory ? colors.tint : colors.tint + '30',
              },
            ]}
            onPress={() => setSelectedCategory('')}>
            <ThemedText
              style={[
                styles.filterText,
                { color: !selectedCategory ? '#fff' : colors.text },
              ]}>
              Todos
            </ThemedText>
          </TouchableOpacity>
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterButton,
                {
                  backgroundColor: selectedCategory === cat ? colors.tint : colors.tint + '30',
                },
              ]}
              onPress={() => setSelectedCategory(cat)}>
              <ThemedText
                style={[
                  styles.filterText,
                  { color: selectedCategory === cat ? '#fff' : colors.text },
                ]}>
                {cat}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid de productos */}
        <View style={styles.productGrid}>
          {productosDisponibles.map((prod) => (
            <View key={prod.id} style={styles.productGridItem}>
              <View
                style={[
                  styles.productGridCard,
                  { borderColor: colors.tint, backgroundColor: colors.tint + '10' },
                ]}>
                <ThemedText style={styles.gridProductName}>{prod.nombre}</ThemedText>
                <ThemedText style={styles.gridCategory}>{prod.categoria}</ThemedText>

                <View style={styles.priceSection}>
                  <ThemedText style={styles.price}>Bs. {prod.precioVenta}</ThemedText>
                  <ThemedText style={styles.stock}>Stock: {prod.stock}</ThemedText>
                </View>

                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.tint }]}
                  onPress={() => {
                    agregarAlCarrito(prod, 1);
                    Alert.alert('Agregado', `${prod.nombre} añadido al carrito`);
                  }}>
                  <ThemedText style={styles.addButtonText}>+ Agregar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {productosDisponibles.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No hay productos disponibles</ThemedText>
          </View>
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
  formSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
  },
  listTitle: {
    marginTop: 20,
    marginBottom: 12,
  },
  productCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    opacity: 0.6,
  },
  productStats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.6,
  },
  statValue: {
    fontWeight: '600',
    fontSize: 12,
  },
  // Cliente styles
  filterScroll: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontWeight: '600',
    fontSize: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productGridItem: {
    width: '48%',
  },
  productGridCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  gridProductName: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 4,
  },
  gridCategory: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 8,
  },
  priceSection: {
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  stock: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  addButton: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    opacity: 0.5,
  },
});
