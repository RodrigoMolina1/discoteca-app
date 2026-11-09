import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const API_URL = "http://10.0.2.2:3000";
const TOKEN_KEY = "boliche_admin_token";

const GOLD = "#D4AF37";
const BACKGROUND = "#090909";
const CARD = "#141414";

interface Producto {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  activo: boolean;
}

interface FormularioProducto {
  nombre: string;
  descripcion: string;
  precio: string;
  imagen: string;
}

const FORMULARIO_VACIO: FormularioProducto = {
  nombre: "",
  descripcion: "",
  precio: "",
  imagen: "",
};

async function obtenerError(respuesta: Response) {
  const datos = await respuesta.json().catch(() => ({}));

  return Array.isArray(datos.message)
    ? datos.message.join("\n")
    : datos.message || "Ocurrió un error al comunicarse con el servidor";
}

export default function ProductosAdminScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formulario, setFormulario] =
    useState<FormularioProducto>(FORMULARIO_VACIO);

  const [productoEditando, setProductoEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<string | null>(null);

  const cargarProductos = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const respuesta = await fetch(`${API_URL}/barra/admin/productos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (respuesta.status === 401 || respuesta.status === 403) {
        Alert.alert(
          "Sesión no válida",
          "Volvé a iniciar sesión como administrador.",
        );
        router.replace("/admin/login");
        return;
      }

      if (!respuesta.ok) {
        throw new Error(await obtenerError(respuesta));
      }

      const datos = await respuesta.json();
      setProductos(datos);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar los productos.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  function actualizarCampo(campo: keyof FormularioProducto, valor: string) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function editarProducto(producto: Producto) {
    setProductoEditando(producto._id);

    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: String(producto.precio),
      imagen: producto.imagen || "",
    });
  }

  function cancelarEdicion() {
    setProductoEditando(null);
    setFormulario(FORMULARIO_VACIO);
  }

  async function guardarProducto() {
    const nombre = formulario.nombre.trim();
    const descripcion = formulario.descripcion.trim();
    const precio = Number(formulario.precio);
    const imagen = formulario.imagen.trim();

    if (!nombre) {
      Alert.alert("Falta información", "Ingresá el nombre del trago.");
      return;
    }

    if (!formulario.precio.trim() || !Number.isFinite(precio) || precio < 0) {
      Alert.alert("Precio inválido", "Ingresá un precio válido.");
      return;
    }

    try {
      setGuardando(true);

      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const editando = productoEditando !== null;

      const url = editando
        ? `${API_URL}/barra/admin/productos/${productoEditando}`
        : `${API_URL}/barra/admin/productos`;

      const respuesta = await fetch(url, {
        method: editando ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          descripcion,
          precio,
          imagen,
        }),
      });

      if (!respuesta.ok) {
        throw new Error(await obtenerError(respuesta));
      }

      Alert.alert(
        "Operación exitosa",
        editando
          ? "El producto se actualizó correctamente."
          : "El producto se creó correctamente.",
      );

      cancelarEdicion();
      await cargarProductos();
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(producto: Producto) {
    const nuevoEstado = !producto.activo;

    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/barra/admin/productos/${producto._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            activo: nuevoEstado,
          }),
        },
      );

      if (!respuesta.ok) {
        throw new Error(await obtenerError(respuesta));
      }

      setProductos((anteriores) =>
        anteriores.map((item) =>
          item._id === producto._id ? { ...item, activo: nuevoEstado } : item,
        ),
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudo cambiar el estado del producto.",
      );
    }
  }

  function confirmarEliminacion(producto: Producto) {
    Alert.alert(
      "Eliminar producto",
      `¿Estás seguro de que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
      [
        {
          text: "CANCELAR",
          style: "cancel",
        },
        {
          text: "ELIMINAR",
          style: "destructive",
          onPress: () => eliminarProducto(producto),
        },
      ],
    );
  }

  async function eliminarProducto(producto: Producto) {
    try {
      setEliminando(producto._id);

      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/barra/admin/productos/${producto._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!respuesta.ok) {
        throw new Error(await obtenerError(respuesta));
      }

      setProductos((anteriores) =>
        anteriores.filter((item) => item._id !== producto._id),
      );

      if (productoEditando === producto._id) {
        cancelarEdicion();
      }

      Alert.alert(
        "Producto eliminado",
        `"${producto.nombre}" se eliminó correctamente.`,
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo eliminar el producto.");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <View style={styles.contenedor}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.botonVolver}>
          <Text style={styles.textoVolver}>← VOLVER AL PANEL</Text>
        </Pressable>

        <Text style={styles.titulo}>PRODUCTOS DE BARRA</Text>
        <Text style={styles.subtitulo}>ADMINISTRACIÓN DE TRAGOS Y PRECIOS</Text>

        <View style={styles.formulario}>
          <Text style={styles.tituloFormulario}>
            {productoEditando ? "EDITAR PRODUCTO" : "CREAR PRODUCTO"}
          </Text>

          <Text style={styles.etiqueta}>Nombre del trago</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Fernet con Coca"
            placeholderTextColor="#777"
            value={formulario.nombre}
            onChangeText={(valor) => actualizarCampo("nombre", valor)}
          />

          <Text style={styles.etiqueta}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.inputMultilinea]}
            placeholder="Descripción del producto"
            placeholderTextColor="#777"
            value={formulario.descripcion}
            onChangeText={(valor) => actualizarCampo("descripcion", valor)}
            multiline
          />

          <Text style={styles.etiqueta}>Precio</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 8000"
            placeholderTextColor="#777"
            value={formulario.precio}
            onChangeText={(valor) => actualizarCampo("precio", valor)}
            keyboardType="numeric"
          />

          <Text style={styles.etiqueta}>Imagen (URL)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor="#777"
            value={formulario.imagen}
            onChangeText={(valor) => actualizarCampo("imagen", valor)}
            autoCapitalize="none"
          />

          <Pressable
            style={[
              styles.botonPrincipal,
              guardando && styles.botonDeshabilitado,
            ]}
            onPress={guardarProducto}
            disabled={guardando}
          >
            {guardando ? (
              <ActivityIndicator color="#090909" />
            ) : (
              <Text style={styles.textoBotonPrincipal}>
                {productoEditando ? "GUARDAR CAMBIOS" : "CREAR PRODUCTO"}
              </Text>
            )}
          </Pressable>

          {productoEditando && (
            <Pressable style={styles.botonCancelar} onPress={cancelarEdicion}>
              <Text style={styles.textoBotonCancelar}>CANCELAR EDICIÓN</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.seccionProductos}>
          <Text style={styles.tituloLista}>PRODUCTOS REGISTRADOS</Text>

          {cargando ? (
            <ActivityIndicator color={GOLD} size="large" />
          ) : productos.length === 0 ? (
            <Text style={styles.textoVacio}>
              Todavía no hay productos registrados.
            </Text>
          ) : (
            productos.map((producto) => (
              <View key={producto._id} style={styles.tarjetaProducto}>
                <View style={styles.filaProducto}>
                  <View style={styles.infoProducto}>
                    <Text style={styles.nombreProducto}>{producto.nombre}</Text>

                    {!!producto.descripcion && (
                      <Text style={styles.descripcionProducto}>
                        {producto.descripcion}
                      </Text>
                    )}

                    <Text style={styles.precioProducto}>
                      ${producto.precio.toLocaleString("es-AR")}
                    </Text>
                  </View>

                  <View style={styles.estado}>
                    <Text
                      style={[
                        styles.textoEstado,
                        { color: producto.activo ? "#4CAF50" : "#E57373" },
                      ]}
                    >
                      {producto.activo ? "ACTIVO" : "INACTIVO"}
                    </Text>

                    <Switch
                      value={producto.activo}
                      onValueChange={() => cambiarEstado(producto)}
                      trackColor={{ false: "#555", true: "#80691F" }}
                      thumbColor={producto.activo ? GOLD : "#CCC"}
                    />
                  </View>
                </View>

                <Pressable
                  style={styles.botonEditar}
                  onPress={() => editarProducto(producto)}
                >
                  <Text style={styles.textoBotonEditar}>EDITAR PRODUCTO</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.botonEliminar,
                    eliminando === producto._id && styles.botonDeshabilitado,
                  ]}
                  onPress={() => confirmarEliminacion(producto)}
                  disabled={eliminando !== null}
                >
                  {eliminando === producto._id ? (
                    <ActivityIndicator color="#FF6B6B" />
                  ) : (
                    <Text style={styles.textoBotonEliminar}>
                      ELIMINAR PRODUCTO
                    </Text>
                  )}
                </Pressable>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  contenido: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 50,
  },
  botonVolver: {
    alignSelf: "flex-start",
    marginBottom: 28,
  },
  textoVolver: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "bold",
  },
  titulo: {
    color: GOLD,
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  subtitulo: {
    color: "#888",
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 30,
  },
  formulario: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 18,
  },
  tituloFormulario: {
    color: GOLD,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 22,
  },
  etiqueta: {
    color: "#CCC",
    fontSize: 12,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#202020",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 13,
    color: "#FFF",
    fontSize: 14,
  },
  inputMultilinea: {
    minHeight: 75,
    textAlignVertical: "top",
  },
  botonPrincipal: {
    backgroundColor: GOLD,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 25,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoBotonPrincipal: {
    color: BACKGROUND,
    fontWeight: "bold",
    fontSize: 13,
  },
  botonCancelar: {
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 8,
    padding: 13,
    alignItems: "center",
    marginTop: 10,
  },
  textoBotonCancelar: {
    color: "#CCC",
    fontWeight: "bold",
    fontSize: 12,
  },
  seccionProductos: {
    marginTop: 35,
  },
  tituloLista: {
    color: GOLD,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 18,
  },
  textoVacio: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
  tarjetaProducto: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#292929",
    padding: 15,
    marginBottom: 13,
  },
  filaProducto: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  infoProducto: {
    flex: 1,
  },
  nombreProducto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  descripcionProducto: {
    color: "#999",
    fontSize: 12,
    marginTop: 6,
  },
  precioProducto: {
    color: GOLD,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  estado: {
    alignItems: "center",
    gap: 5,
  },
  textoEstado: {
    fontSize: 10,
    fontWeight: "bold",
  },
  botonEditar: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 7,
    padding: 11,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotonEditar: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "bold",
  },
  botonEliminar: {
    borderWidth: 1,
    borderColor: "#A83232",
    backgroundColor: "#241313",
    borderRadius: 7,
    padding: 11,
    alignItems: "center",
    marginTop: 9,
  },
  textoBotonEliminar: {
    color: "#FF6B6B",
    fontSize: 11,
    fontWeight: "bold",
  },
});
