import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import * as ImagePicker from 'expo-image-picker';
import {  ActivityIndicator,  StyleSheet,  ScrollView,  View,  TouchableOpacity,  TextInput,  Alert,  Image,} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { mensajeDeError } from '@/utils/errores';
import { esUrlRemota, subirImagenProducto } from '@/utils/imagenes';

//*funciones
const CATEGORIAS = [
  'Alimentos',
  'Bebidas',
  'Limpieza',
  'Higiene',
  'Varios',
];



  //* funciones productos vendidos pide datos del BD
const calcularGanancias = (
  producto: any
) => {

  const compra =
    Number(
      producto.precioCompra || 0
    );

  const venta =
    Number(
      producto.precioVenta || 0
    );

  const stock =
    Number(
      producto.stock || 0
    );


  const vendidos =
    Number(
      producto.vendidos || 0
    );
//? esto son los calculos de ingreso y ganancia
  const gananciaUnidad =
    venta - compra;

  const gananciaStock =
    gananciaUnidad * stock;

  const gananciaVendida =
    gananciaUnidad * vendidos;

  return {
    gananciaUnidad,
    gananciaStock,
    gananciaVendida,
  };
};

//* funciones de pantalla esto es lo que vemos (la funcion princiál contiene todas las demas no alterar sin realizar un commit en github antes)

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
    siguienteCodigo,
    isLoading,
    errorCarga,
    recargarProductos,
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

  //* funciones de las proformas para recibos y datos de productos

  const [showForm, setShowForm] =
    useState(false);

  const [guardando, setGuardando] = useState(false);

  /** Agrega 1 unidad al carrito respetando el stock disponible. */
  const handleAgregarCarrito = (producto: any): boolean => {
    const resultado = agregarAlCarrito(producto, 1);
    if (!resultado.ok) {
      Alert.alert('No disponible', resultado.mensaje);
    }
    return resultado.ok;
  };

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

  const [imagen, setImagen] =
  useState<string | null>(null);

  //* funciones para ver el card de productos

  const [editVisible, setEditVisible] =
      useState(false);
          const [
        detalleVisible,
        setDetalleVisible,
      ] = useState(false);

      const [
        productoDetalle,
        setProductoDetalle,
      ] = useState<any>(null);

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

  //! codigo de producto automatico no tocar mas

  useEffect(() => {
    if (!nombre || !categoria) return;

    // Vista previa del código (el definitivo se calcula contra la base de datos al guardar).
    setCodigoProducto(siguienteCodigo(categoria));

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nombre, categoria]);

  //todo filtrar productos por categoria

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


  //* if para agregar productos nuevos

const handleAgregar = async () => {
  if (guardando) return;

  const compra = Number(precioCompra);
  const venta = Number(precioVenta);
  const cantidad = Number(stock);

  if (!nombre.trim() || !categoria || precioCompra === '' || precioVenta === '' || stock === '') {
    Alert.alert('Faltan datos', 'Completa nombre, categoría, precios y cantidad.');
    return;
  }

  if (!Number.isFinite(compra) || !Number.isFinite(venta) || compra < 0 || venta <= 0) {
    Alert.alert('Precios inválidos', 'Ingresa precios numéricos (el precio de venta debe ser mayor a 0).');
    return;
  }

  if (!Number.isInteger(cantidad) || cantidad < 0) {
    Alert.alert('Cantidad inválida', 'La cantidad debe ser un número entero (0 o más).');
    return;
  }

  setGuardando(true);
  try {
    // La imagen se sube a Supabase Storage para que la vean todos los usuarios.
    let imagenUrl = '';
    if (imagen) {
      try {
        imagenUrl = esUrlRemota(imagen) ? imagen : await subirImagenProducto(imagen);
      } catch (e) {
        console.warn('No se pudo subir la imagen:', e);
        Alert.alert(
          'Imagen no subida',
          'El producto se guardará sin imagen. Verifica que el bucket "product-images" exista en Supabase.'
        );
      }
    }

    await agregarProducto({
      nombre: nombre.trim(),
      categoria,
      descripcion,
      codigoProducto,
      marca,
      unidadMedida,
      imagenUrl,
      precioCompra: compra,
      precioVenta: venta,
      stock: cantidad,
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
    setImagen(null);

    Alert.alert('Éxito', 'Producto agregado');
  } catch (error) {
    console.warn('ERROR AGREGAR:', error);
    Alert.alert('No se pudo agregar', mensajeDeError(error));
  } finally {
    setGuardando(false);
  }
};

//* con esto podemos cargar una imagen desde local al momento de registrarlo

const seleccionarImagen =
  async () => {

    const permiso =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {

      Alert.alert(
        'Permiso requerido',
        'Debes permitir acceso a la galería'
      );

      return;
    }

    const resultado =
      await ImagePicker.launchImageLibraryAsync({

        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (
      !resultado.canceled
    ) {
      setImagen(
        resultado.assets[0].uri
      );
    }
};

  //! variables para la edicion (conecta con la base de datos)

const handleEditar = (prod: any) => {
  setEditProduct(prod);

  setEditNombre(prod.nombre || '');

  setEditDescripcion(prod.descripcion || '');

  setEditCategoria(prod.categoria || '');

  setEditCodigo(prod.codigoProducto || '');

  setEditCompra(String(prod.precioCompra || 0));

  setEditVenta(String(prod.precioVenta || 0));

  setEditStock(String(prod.stock || 0));

  setEditMarca(prod.marca || '');

  setEditUnidadMedida(prod.unidadMedida || 'Unidad');

  setEditVisible(true);
};

//* esto es la cart desplegable para poder ver los detalles del producto

const verProducto = (
  producto: any
) => {
  setProductoDetalle(producto);
  setDetalleVisible(true);
};
 //* funcion para guardar editados
 
 //! proximamente debemos quitar la edicion para poder hacer un historial de registro al momento de añadir mas productos recomendacion de ing miguel

const guardarEdicion = async () => {
  try {
    if (!editProduct?.id) {
      Alert.alert(
        'Error',
        'Producto inválido'
      );

      return;
    }

    const compra = Number(editCompra);
    const venta = Number(editVenta);
    const cantidad = Number(editStock);

    if (!editNombre.trim()) {
      Alert.alert('Faltan datos', 'El nombre no puede estar vacío.');
      return;
    }
    if (!Number.isFinite(compra) || !Number.isFinite(venta) || compra < 0 || venta <= 0) {
      Alert.alert('Precios inválidos', 'Ingresa precios numéricos (el precio de venta debe ser mayor a 0).');
      return;
    }
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      Alert.alert('Cantidad inválida', 'La cantidad debe ser un número entero (0 o más).');
      return;
    }

    const datosActualizados = {
      nombre: editNombre,
      descripcion: editDescripcion,
      categoria: editCategoria,
      codigoProducto: editCodigo,
      marca: editMarca,
      unidadMedida:editUnidadMedida,
      precioCompra: compra,
      precioVenta: venta,
      stock: cantidad,
    };


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
    console.warn('ERROR UPDATE:', error);

    Alert.alert('No se pudo actualizar', mensajeDeError(error));
  }
};

//* esto sirve para eliminar productos o en caso esconderlos del usuario

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
            console.warn('ERROR ELIMINAR:', error);

            Alert.alert('No se pudo eliminar', mensajeDeError(error));
          }
        },
      },
    ]
  );
};

//* disposicion de los producos en pantalla

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Productos" />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
      >
        {/* label de buscar productos */}
        <TextInput
          placeholder="Buscar producto..."
          placeholderTextColor={colors.mutedText          }
          value={search}
          onChangeText={setSearch}
          style={[styles.input,{
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card ,
              },
            ]}
        />

        {/* botones de filtro cateoria */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 15 }}
        >
          <TouchableOpacity
            style={[styles.catBtn,
              !selectedCategory && {
                backgroundColor:colors.border,
              },
            ]}

            onPress={() =>setSelectedCategory('')}
          >
            <ThemedText
              style={{ color:colors.text}}
            >
              Todos
            </ThemedText>
          </TouchableOpacity>

          {CATEGORIAS.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catBtn,
                selectedCategory === cat && {backgroundColor:colors.border,},
               ]}
              onPress={() =>
                setSelectedCategory(cat)
              }
            >
              <ThemedText
                style={{ color: colors.text }}
              >
                {cat}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* vista de administrador en el tab productos */}
        {user?.role === 'admin' && (
          <View
            style={styles.formContainer}
          >
            <TouchableOpacity
              style={[styles.toggleBtn,{ backgroundColor: colors.primary },]}
              onPress={() =>
                setShowForm(!showForm)
              }
            >
              <ThemedText
                style={[styles.toggleText,{color: colors.actionText}]}
              >
                {showForm
                  ? '➖ Ocultar formulario'
                  : '➕ Agregar producto'}
              </ThemedText>
            </TouchableOpacity>

            {showForm && (
              <View  style={[styles.form,{
                  backgroundColor: colors.card,
                },
              ]}>

                <TextInput
                  placeholder="Nombre producto"
                  placeholderTextColor={colors.mutedText}
                  value={nombre}
                  onChangeText={setNombre}
                   style={[styles.input,{
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor:colors.card,
                        },
                      ]}
                />

                <TextInput
                  placeholder="Código automático"
                  placeholderTextColor={colors.mutedText}
                  value={codigoProducto}
                  editable={false}
                   style={[styles.input,{
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor:colors.card,
                    },
                  ]}
                />

          <TextInput
            placeholder="Marca"
            placeholderTextColor={colors.mutedText}
            value={marca}
            onChangeText={setMarca}
            style={[styles.input,{
              color: colors.text,
              borderColor: colors.border,
              backgroundColor:colors.card,
            },
            ]}
           />

          <TextInput
            placeholder="Unidad medida"
            placeholderTextColor={colors.mutedText}
            value={unidadMedida}
            onChangeText={
              setUnidadMedida
            }
            style={[styles.input,{
              color: colors.text,
              borderColor: colors.border,
              backgroundColor:colors.card,
            },
            ]}
            />

            <TouchableOpacity
              style={[styles.addBtn,{ backgroundColor: colors.actionSuccess },]}
              onPress={seleccionarImagen}
            >
              <ThemedText
                style={{color: colors.actionText,}}
              >
                Seleccionar imagen
              </ThemedText>
            </TouchableOpacity>
            { imagen && (
                <Image
                  source={{
                    uri: imagen,
                  }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 12,
                    alignSelf: 'center',
                    marginVertical: 10,
                  }}
                />
              )
            }
                <TextInput
                  placeholder="Descripción"
                  placeholderTextColor={colors.mutedText}
                  value={descripcion}
                  onChangeText={
                    setDescripcion
                  }
                  style={[ styles.input, {
                      height:90,
                      color: colors.text,
                      marginTop:8,
                      borderColor: colors.border,
                      backgroundColor:colors.card,
                    },
                  ]}
                  multiline
                />

                <View style={styles.categorias}
                >
                  {CATEGORIAS.map(
                    (cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.catBtn, categoria === cat && {backgroundColor:colors.border,
                          },
                        ]}
                        onPress={() => setCategoria(cat)}
                      >
                        <ThemedText
                          style={{color:colors.text,}}
                        >
                          {cat}
                        </ThemedText>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <TextInput
                  placeholder="Precio compra"
                  placeholderTextColor={colors.mutedText}
                  value={precioCompra}
                  onChangeText={
                    setPrecioCompra
                  }
                   style={[styles.input, {
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor:colors.card,
                      },
                    ]}
                  keyboardType="numeric"
                />

                <TextInput
                  placeholder="Precio venta"
                  placeholderTextColor={colors.mutedText}
                  value={precioVenta}
                  onChangeText={
                    setPrecioVenta
                  }
                   style={[styles.input,{
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor:
                          colors.card,
                      },
                    ]}
                  keyboardType="numeric"
                />

                <TextInput
                  placeholder="Cantidad"
                  placeholderTextColor={colors.mutedText}
                  value={stock}
                  onChangeText={
                    setStock
                  }
                   style={[styles.input,{
                        color: colors.text,
                        borderColor: colors.border,
                        backgroundColor:colors.card,
                      },
                    ]}
                  keyboardType="numeric"
                />

                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    { backgroundColor: colors.actionSuccess },
                  ]}
                  disabled={guardando}
                  onPress={handleAgregar}
                >
                  <ThemedText
                    style={{ color: colors.actionText }}
                  >
                    {guardando ? 'Guardando...' : 'Guardar producto'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

{/* lista de productos */}
  {errorCarga && (
    <TouchableOpacity onPress={recargarProductos} style={{ paddingVertical: 10 }}>
      <ThemedText style={{ color: colors.danger }}>⚠️ {errorCarga} Toca para reintentar.</ThemedText>
    </TouchableOpacity>
  )}

  {isLoading && productos.length === 0 && (
    <ActivityIndicator size="large" color={colors.tint} style={{ marginVertical: 20 }} />
  )}

  {!isLoading && !errorCarga && productosFiltrados.length === 0 && (
    <ThemedText style={{ textAlign: 'center', opacity: 0.7, marginVertical: 20 }}>
      No hay productos para mostrar.
    </ThemedText>
  )}

  <View style={styles.productGrid}>
          {productosFiltrados.map(
            (producto: any) => (

              <View
                key={producto.id}
                style={[styles.productCard,{backgroundColor:colors.card,},]}

              > {producto.imagenUrl && (
                    <Image
                      source={{
                        uri:
                          producto.imagenUrl,
                      }}
                      style={{
                        width: '100%',
                        height: 120,
                        borderRadius: 12,
                        marginBottom: 10,
                      }}
                      resizeMode="cover"
                    />
                  )
                }
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={styles.productName}>
                    {producto.nombre} 
                  </ThemedText> 

       {user?.role === 'admin' && (

          <View style={{ marginTop: 6 }}>

            <ThemedText
               style={[styles.ganancia,{ color: colors.profit },]}
            >
              Ganancia/unidad: Bs.{' '}
              {
                calcularGanancias(
                  producto
                ).gananciaUnidad.toFixed(2)
              }
            </ThemedText>

              <ThemedText
                style={styles.gananciaVendida}
              >
                Ganancia total: Bs.{' '}
                {
                  calcularGanancias(
                    producto
                  ).gananciaStock.toFixed(2)
                }
              </ThemedText>
          
                <ThemedText
              style={[styles.price,{ color: colors.price },]}
            >
              precio de Compra: Bs.{' '}
              {Number(producto.precioCompra).toFixed(2)}
            </ThemedText>
        </View>
      )}

                <ThemedText style={styles.price}>
                   precio de venta Bs.{' '}
                  {Number(producto.precioVenta).toFixed(2)}
                </ThemedText>

               <View
                    style={{
                      marginTop: 6,
                      alignSelf: 'flex-start',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      backgroundColor:
                        producto.stock <= 5
                          ? colors.stockLowBackground
                          : colors.tableHeader,
                    }}
                  >
                  <ThemedText
                    style={{
                      fontSize: 13,
                      fontWeight: producto.stock <= 5 ? '700' : '400',
                      color:
                        producto.stock <= 5
                          ? colors.stockLow
                          : colors.secondaryText,
                    }}
                  >
                    Stock: {producto.stock}
                    {producto.stock <= 10 ? ' · Stock bajo' : ''}
                  </ThemedText>
                </View>
        </View>


              {user?.role ===
              'admin' ? (
                <View style={{gap: 15,}} >
                  <TouchableOpacity
                    style={[
                      styles.editBtn,
                      { backgroundColor: colors.actionInfo },
                    ]}
                    onPress={() => handleEditar(producto)}
                  >
                    <ThemedText style={{ color: colors.actionText }}>
                      Editar
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.deleteBtn,
                      { backgroundColor: colors.actionDanger },
                    ]}
                    onPress={() => confirmarEliminar(producto.id)}
                  >
                    <ThemedText style={{ color: colors.actionText }}>
                      Eliminar
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (

    <View
      style={{gap: 8,}}
    >
      <TouchableOpacity
        style={styles.viewBtn}
        onPress={() =>verProducto(producto)}
      >
        <ThemedText
          style={{color: colors.text,}}
        >
          Ver producto
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => handleAgregarCarrito(producto)}
      >
        <ThemedText
          style={{color: colors.text,}}
        >
          Agregar
        </ThemedText>
      </TouchableOpacity>
    </View>

              )}
            </View>
          )
        )}
</View>
     
      {editVisible && editProduct && (
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContent,{backgroundColor:colors.card}]}>

      <ThemedText style={styles.modalTitle}>
        Editar producto
      </ThemedText>

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        nombre producto
      </ThemedText>
      <TextInput
         style={[styles.input,{
                color: colors.text,
                borderColor: colors.border,
                backgroundColor:colors.card,},
               ]}
          value={editNombre}
          onChangeText={setEditNombre}
          placeholder="Nombre"
          placeholderTextColor={colors.mutedText}
        />

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        descripcion
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:
                      colors.card,
                  },
                ]}
          value={editDescripcion}
          onChangeText={setEditDescripcion}
          placeholder="Descripción"
          placeholderTextColor={colors.mutedText}
          multiline
        />

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        categoria
      </ThemedText>
      <View style={styles.categorias}>
        {CATEGORIAS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catBtn,
              editCategoria === cat && { backgroundColor: colors.border },
            ]}
            onPress={() => setEditCategoria(cat)}
          >
            <ThemedText style={{ color: colors.text }}>{cat}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        codigo producto
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card,
                  },
                ]}
        value={editCodigo}
        editable={false}
        placeholder="Código"
        placeholderTextColor={colors.mutedText}
      />

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        Marca
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card,
                  },
                ]}
          value={editMarca}
          onChangeText={setEditMarca}
          placeholder="Marca"
          placeholderTextColor={colors.mutedText}
        />
      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        unidad de medida
      </ThemedText>
      <TextInput
         style={[styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card,
                  },
                ]}
            value={editUnidadMedida}
            onChangeText={setEditUnidadMedida}
            placeholder="Unidad de medida"
            placeholderTextColor={colors.mutedText}
          />


      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        precio de Compra
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card,
                  },
                ]}
          value={editCompra}
          onChangeText={setEditCompra}
          keyboardType="numeric"
          placeholder="Precio compra"
          placeholderTextColor={colors.mutedText}
        />

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        precio de venta
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card,
                  },
                ]}
          value={editVenta}
          onChangeText={setEditVenta}
          keyboardType="numeric"
          placeholder="Precio venta"
          placeholderTextColor={colors.mutedText}
        />

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        cantidad disponible
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card ,
                  },
                ]}
          value={editStock}
          onChangeText={setEditStock}
          keyboardType="numeric"
          placeholder="cantidad"
          placeholderTextColor={colors.mutedText}
        />

      <View style={styles.modalButtons}>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.actionSuccess },
          ]}
          onPress={guardarEdicion}
        >
          <ThemedText style={{ color: colors.actionText }}>
            Guardar
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() =>setEditVisible(false)}
        >
          <ThemedText
            style={{ color: colors.text }}
          >
            Cancelar
          </ThemedText>
        </TouchableOpacity>

      </View>

    </View>
  </View>
)}


    {detalleVisible && productoDetalle && (
    <View style={styles.modalOverlay}
    >
      <View
        style={[styles.modalContent,{backgroundColor:colors.card}]}>
        <ThemedText style={styles.modalTitle}
        >
          Información del producto
        </ThemedText>

        {productoDetalle.imagenUrl && (
          <Image
            source={{
              uri:productoDetalle.imagenUrl,
            }}
            style={{
              width: '100%',
              height: 220,
              borderRadius: 12,
              marginBottom: 15,
            }}
            resizeMode="cover"
          />
        )}

        <ThemedText style={styles.productName}>
          { productoDetalle.nombre }
        </ThemedText>

        <ThemedText style={[styles.productInfo,{color: colors.secondaryText, },]}>
          Categoría:{' '}
          {productoDetalle.categoria}
        </ThemedText>

        <ThemedText style={[styles.productInfo,{color: colors.secondaryText, },]}>
          Marca:{' '}
          {productoDetalle.marca ||'Sin marca'}
        </ThemedText>

        <ThemedText style={[styles.productInfo,{color: colors.secondaryText, },]}>
          Unidad:{' '}
          {productoDetalle.unidadMedida}
        </ThemedText>

        <ThemedText style={[styles.productInfo,{color: colors.secondaryText, },]} >
          codigo producto:{' '}
          { productoDetalle.codigoProducto }
        </ThemedText>

        <ThemedText style={[styles.productInfo,{color: colors.secondaryText, },]} >
          cantidad disponible:{' '}
          { productoDetalle.stock }
        </ThemedText>

        <ThemedText style={[styles.productInfo,{color: colors.secondaryText,marginTop:10 },]}>
          Descripción:
        </ThemedText>

        <ThemedText style={styles.productInfo}>
          {productoDetalle.descripcion ||'Sin descripción'}
        </ThemedText>

        <ThemedText style={styles.price}>
          Bs.{' '}
          {Number(productoDetalle.precioVenta).toFixed(2)}
        </ThemedText>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginTop: 15,
          }}
        >
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              if (handleAgregarCarrito(productoDetalle)) setDetalleVisible(false);
            }}
          >
            <ThemedText style={{color: colors.text,}}>
              Agregar al carrito
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() =>setDetalleVisible(false)}
          >
            <ThemedText
              style={{
                color: colors.text,
              }}
            >
              Cerrar
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
  },

  input: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  categorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },

  catBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },

  addBtn: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  toggleBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    
  },

  toggleText: {
    fontWeight: '700',
  },

  productCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  productName: {
    fontWeight: '700',
    fontSize: 16,
  },

  productInfo: {
    marginTop: 2,
  },

  productCompra: {
    fontWeight: '700',
    marginTop: 5,
  },

  price: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },

  editBtn: {
    padding: 15,
    marginTop: 8,
    borderRadius: 15,
    alignItems: 'center',
  },

  deleteBtn: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
    paddingHorizontal: 15,
  },

  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    padding: 20,
    maxHeight: '85%',
  },

  modalTitle: {
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
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },

  ganancia: {
    fontWeight: '700',
    marginTop: 4,
  },

  gananciaVendida: {
    fontWeight: '700',
    marginTop: 4,
  },

  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  viewBtn: {
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});
