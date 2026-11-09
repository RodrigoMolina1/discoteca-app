import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

import {
  CompraBarra,
  ProductoBarra,
  crearCompraBarra,
  obtenerProductosBarra,
} from "../../lib/barra";

const GOLD = "#D4AF37";
const BACKGROUND = "#090909";
const CARD = "#141414";
const MUTED = "#999999";

export default function BarraScreen() {
  const [productos, setProductos] = useState<ProductoBarra[]>([]);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [compra, setCompra] = useState<CompraBarra | null>(null);
  const [cargando, setCargando] = useState(true);
  const [comprando, setComprando] = useState(false);

  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      const datos = await obtenerProductosBarra();
      setProductos(datos.filter((producto) => producto.activo));
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar las bebidas.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [cargarProductos]),
  );

  const cambiarCantidad = (id: string, cambio: number) => {
    setCantidades((actuales) => {
      const nuevaCantidad = Math.max(0, (actuales[id] || 0) + cambio);

      return {
        ...actuales,
        [id]: nuevaCantidad,
      };
    });
  };

  const productosSeleccionados = productos.filter(
    (producto) => (cantidades[producto._id] || 0) > 0,
  );

  const total = productosSeleccionados.reduce(
    (acumulado, producto) =>
      acumulado + producto.precio * cantidades[producto._id],
    0,
  );

  const confirmarCompra = async () => {
    if (productosSeleccionados.length === 0) {
      Alert.alert("Atención", "Seleccioná al menos una bebida.");
      return;
    }

    try {
      setComprando(true);

      const items = productosSeleccionados.map((producto) => ({
        productoId: producto._id,
        cantidad: cantidades[producto._id],
      }));

      const nuevaCompra = await crearCompraBarra(items);

      setCompra(nuevaCompra);
      setCantidades({});

      Alert.alert(
        "¡Compra registrada!",
        "Tu compra fue registrada correctamente. Presentá el QR en la barra.",
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "No se pudo realizar la compra.");
    } finally {
      setComprando(false);
    }
  };

  const formatearPrecio = (precio: number) =>
    `$${precio.toLocaleString("es-AR")}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.contenido}>
        <Pressable onPress={() => router.back()} style={styles.volver}>
          <Text style={styles.volverTexto}>‹ Volver</Text>
        </Pressable>

        <Text style={styles.marca}>BOLICHE</Text>
        <Text style={styles.subtitulo}>NIGHTLIFE EXPERIENCE</Text>

        <View style={styles.separador} />

        <Text style={styles.titulo}>LA BARRA</Text>
        <Text style={styles.descripcion}>
          Elegí tus bebidas y realizá tu pedido.
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={GOLD} style={styles.loader} />
        ) : productos.length === 0 ? (
          <Text style={styles.vacio}>
            No hay bebidas disponibles por el momento.
          </Text>
        ) : (
          productos.map((producto) => (
            <View key={producto._id} style={styles.producto}>
              <View style={styles.productoInfo}>
                <Text style={styles.productoNombre}>{producto.nombre}</Text>

                {!!producto.descripcion && (
                  <Text style={styles.productoDescripcion}>
                    {producto.descripcion}
                  </Text>
                )}

                <Text style={styles.precio}>
                  {formatearPrecio(producto.precio)}
                </Text>
              </View>

              <View style={styles.controles}>
                <Pressable
                  style={styles.botonCantidad}
                  onPress={() => cambiarCantidad(producto._id, -1)}
                >
                  <Text style={styles.botonCantidadTexto}>−</Text>
                </Pressable>

                <Text style={styles.cantidad}>
                  {cantidades[producto._id] || 0}
                </Text>

                <Pressable
                  style={styles.botonCantidad}
                  onPress={() => cambiarCantidad(producto._id, 1)}
                >
                  <Text style={styles.botonCantidadTexto}>+</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}

        {!cargando && (
          <View style={styles.resumen}>
            <Text style={styles.resumenTitulo}>RESUMEN DEL PEDIDO</Text>

            {productosSeleccionados.map((producto) => (
              <View key={producto._id} style={styles.lineaResumen}>
                <Text style={styles.resumenTexto}>
                  {cantidades[producto._id]}x {producto.nombre}
                </Text>
                <Text style={styles.resumenTexto}>
                  {formatearPrecio(producto.precio * cantidades[producto._id])}
                </Text>
              </View>
            ))}

            <View style={styles.separador} />

            <View style={styles.totalFila}>
              <Text style={styles.totalTexto}>TOTAL</Text>
              <Text style={styles.totalPrecio}>{formatearPrecio(total)}</Text>
            </View>

            <Pressable
              style={[
                styles.botonComprar,
                (total === 0 || comprando) && styles.botonDeshabilitado,
              ]}
              onPress={confirmarCompra}
              disabled={total === 0 || comprando}
            >
              {comprando ? (
                <ActivityIndicator color="#090909" />
              ) : (
                <Text style={styles.botonComprarTexto}>CONFIRMAR COMPRA</Text>
              )}
            </Pressable>

            <Text style={styles.aclaracion}>
              Por el momento, el pedido se registra sin pago online.
            </Text>
          </View>
        )}

        {compra && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitulo}>TU CÓDIGO QR</Text>
            <Text style={styles.qrDescripcion}>
              Presentá este código en la barra para retirar tu pedido.
            </Text>

            <View style={styles.qr}>
              <QRCode
                value={compra.codigoQR}
                size={190}
                backgroundColor="#FFFFFF"
                color="#000000"
              />
            </View>

            <Text style={styles.qrTotal}>
              Total: {formatearPrecio(compra.total)}
            </Text>

            <Text style={styles.qrEstado}>
              {compra.utilizada ? "QR UTILIZADO" : "QR PENDIENTE DE USO"}
            </Text>

            <Text style={styles.nuevoPedido}>
              Podés realizar otra compra cuando quieras.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  contenido: {
    padding: 22,
    paddingTop: 55,
    paddingBottom: 50,
  },
  volver: {
    marginBottom: 25,
  },
  volverTexto: {
    color: GOLD,
    fontSize: 17,
  },
  marca: {
    color: GOLD,
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: 6,
    textAlign: "center",
  },
  subtitulo: {
    color: MUTED,
    fontSize: 10,
    letterSpacing: 4,
    textAlign: "center",
    marginTop: 5,
  },
  separador: {
    height: 1,
    backgroundColor: "#333333",
    marginVertical: 25,
  },
  titulo: {
    color: GOLD,
    fontSize: 27,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  descripcion: {
    color: MUTED,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 22,
  },
  loader: {
    marginTop: 40,
  },
  vacio: {
    color: MUTED,
    textAlign: "center",
    marginTop: 30,
  },
  producto: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 17,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productoInfo: {
    flex: 1,
    paddingRight: 10,
  },
  productoNombre: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  productoDescripcion: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  precio: {
    color: GOLD,
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 9,
  },
  controles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  botonCantidad: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#252525",
    alignItems: "center",
    justifyContent: "center",
  },
  botonCantidadTexto: {
    color: GOLD,
    fontSize: 22,
    fontWeight: "bold",
  },
  cantidad: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 15,
    textAlign: "center",
  },
  resumen: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 18,
    marginTop: 18,
  },
  resumenTitulo: {
    color: GOLD,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 17,
  },
  lineaResumen: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  resumenTexto: {
    color: "#DDDDDD",
    fontSize: 13,
  },
  totalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  totalPrecio: {
    color: GOLD,
    fontSize: 22,
    fontWeight: "bold",
  },
  botonComprar: {
    backgroundColor: GOLD,
    borderRadius: 9,
    padding: 16,
    alignItems: "center",
    marginTop: 22,
  },
  botonDeshabilitado: {
    opacity: 0.4,
  },
  botonComprarTexto: {
    color: BACKGROUND,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  aclaracion: {
    color: MUTED,
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
  qrContainer: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 22,
    alignItems: "center",
    marginTop: 25,
  },
  qrTitulo: {
    color: GOLD,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  qrDescripcion: {
    color: MUTED,
    textAlign: "center",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 20,
  },
  qr: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
  },
  qrTotal: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  qrEstado: {
    color: GOLD,
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 10,
  },
  nuevoPedido: {
    color: MUTED,
    fontSize: 12,
    marginTop: 15,
    textAlign: "center",
  },
});
