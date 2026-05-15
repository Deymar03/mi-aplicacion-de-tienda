// ========================= PRODUCTOS.TSX COMPLETO =========================

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

import { useEffect, useState } from 'react';

/* ===================== HELPERS ===================== */

const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Limpieza',
  'Higiene',
  'Varios',
];

const generarPrefijo = (
  categoria: string
) => {
  return categoria
    .substring(0, 3)
    .toUpperCase();
};

/* ===================== SCREEN ===================== */

export default function ProductosScreen() {
  const colorScheme =
    useColorScheme();

  const colors =
    Colors[colorScheme ?? 'light'];

  const { user } = useAuth();

  const {
    productos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  } = useProducts();

  const { agregarAlCarrito } =
    useCart();
    const [marca, setMarca] =
  useState('');

const [
  unidadMedida,
  setUnidadMedida,
] = useState('Unidad');

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState('');

  const [search, setSearch] =
    useState('');

  /* ===================== FORM ===================== */

  const [showForm, setShowForm] =
    useState(false);

  const [nombre, setNombre] =
    useState('');

  const [
    descripcion,
    setDescripcion,
  ] = useState('');

  const [
    codigoProducto,
    setCodigoProducto,
  ] = useState('');

  const [categoria, setCategoria] =
    useState('');

  const [
    precioCompra,
    setPrecioCompra,
  ] = useState('');

  const [
    precioVenta,
    setPrecioVenta,
  ] = useState('');

  const [stock, setStock] =
    useState('');

  /* ===================== EDIT ===================== */

  const [editVisible, setEditVisible] =
    useState(false);

  const [editProduct, setEditProduct] =
    useState<any>(null);

  const [editNombre, setEditNombre] =
    useState('');

  const [
    editDescripcion,
    setEditDescripcion,
  ] = useState('');

  const [
    editCategoria,
    setEditCategoria,
  ] = useState('');

  const [editCodigo, setEditCodigo] =
    useState('');

  const [editCompra, setEditCompra] =
    useState('');

  const [editVenta, setEditVenta] =
    useState('');

  const [editStock, setEditStock] =
    useState('');

    const [editMarca, setEditMarca] =
  useState('');

const [
  editUnidadMedida,
  setEditUnidadMedida,
] = useState('Unidad');

  /* ===================== AUTOCOMPLETADO ===================== */

  useEffect(() => {
    if (!nombre || !categoria) return;

    const existentes =
      productos.filter(
        (p) =>
          p.categoria === categoria
      );

    const numero =
      existentes.length + 1;

    const prefijo =
      generarPrefijo(categoria);

    const codigo =
      `PROD-${prefijo}-${String(
        numero
      ).padStart(3, '0')}`;

    setCodigoProducto(codigo);

    const productoExistente =
      productos.find(
        (p) =>
          p.nombre
            .toLowerCase()
            .trim() ===
          nombre
            .toLowerCase()
            .trim()
      );

    if (productoExistente) {
      setDescripcion(
        productoExistente.descripcion ||
          ''
      );

      setCategoria(
        productoExistente.categoria
      );

      setPrecioCompra(
        String(
          productoExistente.precioCompra
        )
      );

      setPrecioVenta(
        String(
          productoExistente.precioVenta
        )
      );
    }
  }, [nombre, categoria]);

  /* ===================== FILTRO ===================== */

  const productosFiltrados =
    productos.filter((p: any) => {
      const matchCategoria =
        !selectedCategory ||
        p.categoria === selectedCategory;

      const matchBusqueda =
        p.nombre
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        p.codigoProducto
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      if (user?.role === 'admin') {
        return (
          matchCategoria &&
          matchBusqueda &&
          p.activo !== false
        );
      }

      return (
        p.stock > 0 &&
        p.activo !== false &&
        matchCategoria &&
        matchBusqueda
      );
    });

  /* ===================== AGREGAR ===================== */

const handleAgregar = async () => {
  if (
    !nombre ||
    !categoria ||
    !precioCompra ||
    !precioVenta ||
    !stock
  ) {
    Alert.alert(
      'Error',
      'Completa todos los campos'
    );

    return;
  }

  try {
    await agregarProducto({
      nombre,
      categoria,
      descripcion,
      codigoProducto,

      marca,
      unidadMedida,

      precioCompra:
        Number(precioCompra),

      precioVenta:
        Number(precioVenta),

      stock: Number(stock),

      activo: true,
    });

    setNombre('');
    setDescripcion('');
    setCodigoProducto('');
    setCategoria('');
    setMarca('');
    setUnidadMedida('Unidad');
    setPrecioCompra('');
    setPrecioVenta('');
    setStock('');

    Alert.alert(
      'Éxito',
      'Producto agregado'
    );
  } catch (error) {
    console.log(
      'ERROR AGREGAR:',
      error
    );

    Alert.alert(
      'Error',
      'No se pudo agregar'
    );
  }
};

  /* ===================== EDIT ===================== */

const handleEditar = (prod: any) => {
  setEditProduct(prod);

  setEditNombre(prod.nombre || '');

  setEditDescripcion(
    prod.descripcion || ''
  );

  setEditCategoria(
    prod.categoria || ''
  );

  setEditCodigo(
    prod.codigoProducto || ''
  );

  setEditCompra(
    String(prod.precioCompra || 0)
  );

  setEditVenta(
    String(prod.precioVenta || 0)
  );

  setEditStock(
    String(prod.stock || 0)
  );

  setEditMarca(
    prod.marca || ''
  );

  setEditUnidadMedida(
    prod.unidadMedida || 'Unidad'
  );

  setEditVisible(true);
};

 /* ===================== GUARDAR EDICION ===================== */

const guardarEdicion = async () => {
  try {
    if (!editProduct?.id) {
      Alert.alert(
        'Error',
        'Producto inválido'
      );

      return;
    }

    const datosActualizados = {
      nombre: editNombre,
      descripcion: editDescripcion,
      categoria: editCategoria,

      codigoProducto: editCodigo,

      marca: editMarca,

      unidadMedida:
        editUnidadMedida,

      precioCompra:
        Number(editCompra),

      precioVenta:
        Number(editVenta),

      stock: Number(editStock),
    };

    console.log(
      'DATOS UPDATE:',
      datosActualizados
    );

    await actualizarProducto(
      editProduct.id,
      datosActualizados
    );

    setEditVisible(false);

    Alert.alert(
      'Éxito',
      'Producto actualizado'
    );
  } catch (error) {
    console.log(
      'ERROR UPDATE:',
      error
    );

    Alert.alert(
      'Error',
      'No se pudo actualizar'
    );
  }
};

/* ===================== ELIMINAR ===================== */

const confirmarEliminar = (
  id: string
) => {
  Alert.alert(
    'Eliminar producto',
    '¿Deseas eliminar este producto?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',

        onPress: async () => {
          try {
            await eliminarProducto(id);

            Alert.alert(
              'Éxito',
              'Producto eliminado'
            );
          } catch (error) {
            console.log(
              'ERROR ELIMINAR:',
              error
            );

            Alert.alert(
              'Error',
              'No se pudo eliminar'
            );
          }
        },
      },
    ]
  );
};

  /* ===================== UI ===================== */

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Productos" />

      <ScrollView
        contentContainerStyle={
          styles.contentContainer
        }
      >
        {/* ===================== BUSCADOR ===================== */}

        <TextInput
          placeholder="Buscar producto..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          style={styles.input}
        />

        {/* ===================== CATEGORIAS ===================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={{ marginBottom: 15 }}
        >
          <TouchableOpacity
            style={[
              styles.catBtn,
              !selectedCategory && {
                backgroundColor:
                  colors.tint,
              },
            ]}
            onPress={() =>
              setSelectedCategory('')
            }
          >
            <ThemedText
              style={{ color: '#fff' }}
            >
              Todos
            </ThemedText>
          </TouchableOpacity>

          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catBtn,
                selectedCategory ===
                  cat && {
                  backgroundColor:
                    colors.tint,
                },
              ]}
              onPress={() =>
                setSelectedCategory(cat)
              }
            >
              <ThemedText
                style={{ color: '#fff' }}
              >
                {cat}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===================== FORM ADMIN ===================== */}

        {user?.role === 'admin' && (
          <View
            style={styles.formContainer}
          >
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() =>
                setShowForm(!showForm)
              }
            >
              <ThemedText
                style={styles.toggleText}
              >
                {showForm
                  ? '➖ Ocultar formulario'
                  : '➕ Agregar producto'}
              </ThemedText>
            </TouchableOpacity>

            {showForm && (
              <View style={styles.form}>
                <TextInput
                  placeholder="Nombre producto"
                  placeholderTextColor="#aaa"
                  value={nombre}
                  onChangeText={setNombre}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Código automático"
                  placeholderTextColor="#aaa"
                  value={codigoProducto}
                  editable={false}
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        '#374151',
                    },
                  ]}
                />
<TextInput
  placeholder="Marca"
  placeholderTextColor="#aaa"
  value={marca}
  onChangeText={setMarca}
  style={styles.input}
/>

<TextInput
  placeholder="Unidad medida"
  placeholderTextColor="#aaa"
  value={unidadMedida}
  onChangeText={
    setUnidadMedida
  }
  style={styles.input}
/>
                <TextInput
                  placeholder="Descripción"
                  placeholderTextColor="#aaa"
                  value={descripcion}
                  onChangeText={
                    setDescripcion
                  }
                  style={[
                    styles.input,
                    { height: 90 },
                  ]}
                  multiline
                />

                <View
                  style={
                    styles.categorias
                  }
                >
                  {CATEGORIAS.map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catBtn,
                          categoria ===
                            cat && {
                            backgroundColor:
                              colors.tint,
                          },
                        ]}
                        onPress={() =>
                          setCategoria(
                            cat
                          )
                        }
                      >
                        <ThemedText
                          style={{
                            color:
                              '#fff',
                          }}
                        >
                          {cat}
                        </ThemedText>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <TextInput
                  placeholder="Precio compra"
                  placeholderTextColor="#aaa"
                  value={precioCompra}
                  onChangeText={
                    setPrecioCompra
                  }
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TextInput
                  placeholder="Precio venta"
                  placeholderTextColor="#aaa"
                  value={precioVenta}
                  onChangeText={
                    setPrecioVenta
                  }
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TextInput
                  placeholder="Cantidad"
                  placeholderTextColor="#aaa"
                  value={stock}
                  onChangeText={
                    setStock
                  }
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={
                    handleAgregar
                  }
                >
                  <ThemedText
                    style={{
                      color:
                        '#fff',
                    }}
                  >
                    Guardar producto
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ===================== LISTA PRODUCTOS ===================== */}

        {productosFiltrados.map(
          (producto: any) => (
            <View
              key={producto.id}
              style={
                styles.productCard
              }
            >
              <View style={{ flex: 1 }}>
                <ThemedText
                  style={
                    styles.productName
                  }
                >
                  {producto.nombre}
                </ThemedText>

                <ThemedText
                  style={
                    styles.productInfo
                  }
                >
                  Categoría:{' '}
                  {producto.categoria}
                </ThemedText>

                <ThemedText
                  style={
                    styles.productInfo
                  }
                >
                  Código:{' '}
                  {producto.codigoProducto ||
                    'N/A'}
                </ThemedText>

                <ThemedText
                  style={
                    styles.productInfo
                  }
                >
                  Stock:{' '}
                  {producto.stock}
                </ThemedText>

                <ThemedText
                  style={styles.price}
                >
                  Bs.{' '}
                  {producto.precioVenta}
                </ThemedText>
              </View>

              {user?.role ===
              'admin' ? (
                <View
                  style={{
                    gap: 8,
                  }}
                >
                  <TouchableOpacity
                    style={
                      styles.editBtn
                    }
                    onPress={() =>
                      handleEditar(
                        producto
                      )
                    }
                  >
                    <ThemedText
                      style={{
                        color:
                          '#fff',
                      }}
                    >
                      Editar
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={
                      styles.deleteBtn
                    }
                    onPress={() =>
                      confirmarEliminar(
                        producto.id
                      )
                    }
                  >
                    <ThemedText
                      style={{
                        color:
                          '#fff',
                      }}
                    >
                      Eliminar
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addBtn}
onPress={() =>
  agregarAlCarrito(
    producto,
    1
  )
}
                >
                  <ThemedText
                    style={{
                      color:
                        '#fff',
                    }}
                  >
                    Agregar
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )
        )}

        {/* ===================== MODAL EDITAR ===================== */}

        {editVisible && (
          <View
            style={
              styles.modalOverlay
            }
          >
            <View
              style={
                styles.modalContent
              }
            >
              <ThemedText
                style={
                  styles.modalTitle
                }
              >
                ✏️ Editar producto
              </ThemedText>

              <TextInput
                placeholder="Nombre"
                placeholderTextColor="#aaa"
                value={editNombre}
                onChangeText={
                  setEditNombre
                }
                style={styles.input}
              />

              <TextInput
                placeholder="Descripción"
                placeholderTextColor="#aaa"
                value={
                  editDescripcion
                }
                onChangeText={
                  setEditDescripcion
                }
                style={[
                  styles.input,
                  {
                    height: 80,
                  },
                ]}
                multiline
              />

              <TextInput
                placeholder="Código"
                placeholderTextColor="#aaa"
                value={editCodigo}
                onChangeText={
                  setEditCodigo
                }
                style={styles.input}
              />

              <TextInput
                placeholder="Precio compra"
                placeholderTextColor="#aaa"
                value={editCompra}
                onChangeText={
                  setEditCompra
                }
                style={styles.input}
                keyboardType="numeric"
              />

              <TextInput
                placeholder="Precio venta"
                placeholderTextColor="#aaa"
                value={editVenta}
                onChangeText={
                  setEditVenta
                }
                style={styles.input}
                keyboardType="numeric"
              />
<TextInput
  placeholder="Marca"
  placeholderTextColor="#aaa"
  value={editMarca}
  onChangeText={
    setEditMarca
  }
  style={styles.input}
/>

<TextInput
  placeholder="Unidad medida"
  placeholderTextColor="#aaa"
  value={editUnidadMedida}
  onChangeText={
    setEditUnidadMedida
  }
  style={styles.input}
/>
              <TextInput
                placeholder="Stock"
                placeholderTextColor="#aaa"
                value={editStock}
                onChangeText={
                  setEditStock
                }
                style={styles.input}
                keyboardType="numeric"
              />

              <View
                style={
                  styles.modalButtons
                }
              >
                <TouchableOpacity
                  style={
                    styles.saveBtn
                  }
                  onPress={
                    guardarEdicion
                  }
                >
                  <ThemedText
                    style={{
                      color:
                        '#fff',
                    }}
                  >
                    Guardar
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.cancelBtn
                  }
                  onPress={() =>
                    setEditVisible(
                      false
                    )
                  }
                >
                  <ThemedText
                    style={{
                      color:
                        '#fff',
                    }}
                  >
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },

  contentContainer: {
    padding: 12,
  },

  formContainer: {
    marginBottom: 15,
  },

  form: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1f2937',
  },

  input: {
    borderWidth: 1,
    borderColor: '#374151',
    padding: 8,
    borderRadius: 8,
    color: '#fff',
    marginBottom: 8,
  },

  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },

  catBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 6,
  },

  addBtn: {
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  toggleBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  toggleText: {
    color: '#fff',
    fontWeight: '700',
  },

  productCard: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  productName: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  productInfo: {
    color: '#d1d5db',
    marginTop: 2,
  },

  price: {
    color: '#22c55e',
    fontWeight: '700',
    marginTop: 5,
  },

  editBtn: {
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteBtn: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1f2937',
    padding: 20,
    borderRadius: 14,
  },

  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#22c55e',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
});