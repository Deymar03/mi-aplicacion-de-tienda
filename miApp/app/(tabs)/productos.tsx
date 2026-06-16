import { ThemedView } from '@/components/themed-view';
import { TabHeader } from '@/components/tab-header';
import { ThemedText } from '@/components/themed-text';
import * as ImagePicker from 'expo-image-picker';
import {  StyleSheet,  ScrollView,  View,  TouchableOpacity,  TextInput,  Alert,  Image,} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductContext';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

//*funciones
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

 imagenUrl: imagen || '',

  precioCompra:
    Number(precioCompra),

  precioVenta:
    Number(precioVenta),

  stock:
    Number(stock),

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

        mediaTypes:
        ImagePicker.MediaTypeOptions.Images,
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

    const datosActualizados = {
      nombre: editNombre,
      descripcion: editDescripcion,
      categoria: editCategoria,
      codigoProducto: editCodigo,
      marca: editMarca,
      unidadMedida:editUnidadMedida,
      precioCompra: Number(editCompra),
      precioVenta: Number(editVenta),
      stock: Number(editStock),
    };


    //todo los datos no se actualizan correctamente para verificar que el boton funciona colocaremos mensajes de cosola para poder ver donde fala
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
      'ERROR UPDATE:',//todo aqui
      error
    );

    Alert.alert(
      'Error',
      'No se pudo actualizar'
    );
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

//* disposicion de los producos en pantalla

  return (
    <ThemedView style={styles.container}>
      <TabHeader title="Productos" />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
      >
        //* label de buscar productos

        <TextInput
          placeholder="Buscar producto..."
          placeholderTextColor={
          colorScheme === 'dark'
          ? '#9CA3AF'
          : '#6B7280'
          }
          value={search}
          onChangeText={setSearch}
          style={[styles.input,{
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.card ,
              },
            ]}
        />

        //* botones de filtro cateoria

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

        //* vista de administrador en el tab productos

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
                style={[styles.toggleText,{color:colors.text}]}
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
                  placeholderTextColor="#aaa"
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
                  placeholderTextColor="#aaa"
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
            placeholderTextColor="#aaa"
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
            placeholderTextColor="#aaa"
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
              style={styles.addBtn}
              onPress={seleccionarImagen}
            >
              <ThemedText
                style={{color: colors.text,}}
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
                  placeholderTextColor="#aaa"
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
                  placeholderTextColor="#aaa"
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
                  placeholderTextColor="#aaa"
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
                  placeholderTextColor="#aaa"
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
                  style={styles.addBtn}
                  onPress={
                    handleAgregar
                  }
                >
                  <ThemedText
                    style={{color:colors.text,}}
                  >
                    Guardar producto
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

//*lista de productos

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
              style={styles.ganancia}
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
                Ganancia cantidad: Bs.{' '}
                {
                  calcularGanancias(
                    producto
                  ).gananciaStock.toFixed(2)
                }
              </ThemedText>
          
                <ThemedText
              style={styles.productCompra}
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
              </View>


              {user?.role ===
              'admin' ? (
                <View style={{gap: 15,}} >
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>handleEditar(producto)}>
                    <ThemedText style={{color:colors.text, }} >
                      Editar
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() =>confirmarEliminar(producto.id)}
                  >
                    <ThemedText
                      style={{color:colors.text,}}
                    >
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
        onPress={() =>agregarAlCarrito(producto,1)}
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
        //* tarjeta para editar productos solo para el admin
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
          placeholderTextColor="#aaa"
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
          placeholderTextColor="#aaa"
          multiline
        />

      <ThemedText style={[styles.toggleText,{color:colors.text}]}>
        categoria
      </ThemedText>
      <TextInput
         style={[styles.input,{
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor:colors.card,
                  },
                ]}
            value={editCategoria}
            onChangeText={setEditCategoria}
            placeholder="Categoría"
            placeholderTextColor="#aaa"
          />

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
        placeholderTextColor="#aaa"
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
          placeholderTextColor="#aaa"
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
            placeholderTextColor="#aaa"
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
          placeholderTextColor="#aaa"
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
          placeholderTextColor="#aaa"
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
          placeholderTextColor="#aaa"
        />

      <View style={styles.modalButtons}>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={guardarEdicion}
        >
          <ThemedText
            style={{ color: colors.text }}
          >
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

//*mirar detalles del producto recomendacionde la ing carmen integrar imagen del producto y un modal para ver mejor la descripcion
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
            onPress={() => {agregarAlCarrito(productoDetalle,1);
              setDetalleVisible(false);
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


//todo esto son los estilos colores disposiciones de los cards, botones (se puede experimentar pero recuerda que clase es)
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
    backgroundColor: '#22c55e',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop:5,
  },

  toggleBtn: {
    backgroundColor: '#2563eb',
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
productCompra:{
  color:'#e2e91e',
    fontWeight: '700',
    marginTop: 5,

},
  price: {
  color: '#22c55e',
  fontWeight: 'bold',
  fontSize: 18,
  marginTop: 8,
  gap:5,
  },

  editBtn: {
    backgroundColor: '#3b82f6',
    padding: 15,
    marginTop:8,
    borderRadius: 15,
    alignItems: 'center',
  },

  deleteBtn: {
    backgroundColor: '#ef4444',
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

  ganancia: {
  color: '#d63a1f',
  fontWeight: '700',
  marginTop: 4,
},

gananciaVendida: {
  color: '#dba40e',
  fontWeight: '700',
  marginTop: 4,
},
productGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
},
viewBtn: {
  backgroundColor: '#6366f1',
  padding: 10,
  borderRadius: 10,
  alignItems: 'center',
},
});