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

import { CompraBarra, obtenerMisComprasBarra } from "../lib/barra";

const GOLD = "#D4AF37";
const BACKGROUND = "#090909";
const CARD = "#141414";

export default function MisComprasScreen() {
  const [compras, setCompras] = useState<CompraBarra[]>([]);
  const [cargando, setCargando] = useState(true);
  const [qrVisibleId, setQrVisibleId] = useState<string | null>(null);

  const cargarCompras = useCallback(async () => {
    try {
      setCargando(true);

      const datos = await obtenerMisComprasBarra();

      setCompras(datos);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "No se pudieron cargar tus compras.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarCompras();
    }, [cargarCompras]),
  );

  function formatearFecha(fecha: string) {
    const fechaConvertida = new Date(fecha);

    if (isNaN(fechaConvertida.getTime())) {
      return "Fecha no disponible";
    }

    return fechaConvertida.toLocaleString("es-AR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatearPrecio(precio: number) {
    return precio.toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    });
  }

  function alternarQR(compraId: string) {
    setQrVisibleId((actual) => (actual === compraId ? null : compraId));
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Pressable style={styles.volver} onPress={() => router.back()}>
          <Text style={styles.volverTexto}>‹ Volver</Text>
        </Pressable>

        <Text style={styles.titulo}>MIS COMPRAS</Text>
        <Text style={styles.subtitulo}>HISTORIAL DE LA BARRA</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezadoLista}>
          <Text style={styles.seccionTitulo}>Tus consumiciones</Text>

          <Pressable onPress={cargarCompras}>
            <Text style={styles.actualizar}>Actualizar</Text>
          </Pressable>
        </View>

        {cargando ? (
          <View style={styles.centrado}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.textoCargando}>Cargando tus compras...</Text>
          </View>
        ) : compras.length === 0 ? (
          <View style={styles.vacio}>
            <Text style={styles.vacioTitulo}>Todavía no tenés compras</Text>

            <Text style={styles.vacioTexto}>
              Cuando compres algo en la barra, aparecerá aquí.
            </Text>

            <Pressable
              style={styles.botonBarra}
              onPress={() => router.push("/barra")}
            >
              <Text style={styles.botonBarraTexto}>IR A LA BARRA</Text>
            </Pressable>
          </View>
        ) : (
          compras.map((compra) => (
            <View key={compra._id} style={styles.compraCard}>
              <View style={styles.compraHeader}>
                <View>
                  <Text style={styles.compraTitulo}>COMPRA</Text>

                  <Text style={styles.fecha}>
                    {formatearFecha(compra.createdAt)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.estado,
                    compra.utilizada
                      ? styles.estadoUtilizado
                      : styles.estadoPendiente,
                  ]}
                >
                  <Text
                    style={[
                      styles.estadoTexto,
                      compra.utilizada
                        ? styles.textoUtilizado
                        : styles.textoPendiente,
                    ]}
                  >
                    {compra.utilizada ? "UTILIZADO" : "PENDIENTE"}
                  </Text>
                </View>
              </View>

              <View style={styles.divisor} />

              <Text style={styles.productosTitulo}>PRODUCTOS</Text>

              {compra.items.map((item, index) => (
                <View
                  key={`${item.productoId}-${index}`}
                  style={styles.productoFila}
                >
                  <View style={styles.productoInfo}>
                    <Text style={styles.productoNombre}>{item.nombre}</Text>

                    <Text style={styles.productoCantidad}>
                      {item.cantidad} x {formatearPrecio(item.precioUnitario)}
                    </Text>
                  </View>

                  <Text style={styles.productoSubtotal}>
                    {formatearPrecio(item.subtotal)}
                  </Text>
                </View>
              ))}

              <View style={styles.divisor} />

              <View style={styles.totalFila}>
                <Text style={styles.totalTexto}>TOTAL</Text>

                <Text style={styles.totalPrecio}>
                  {formatearPrecio(compra.total)}
                </Text>
              </View>

              {!compra.utilizada ? (
                <View style={styles.qrSeccion}>
                  <Pressable
                    style={styles.botonQR}
                    onPress={() => alternarQR(compra._id)}
                  >
                    <Text style={styles.botonQRTexto}>
                      {qrVisibleId === compra._id
                        ? "OCULTAR CÓDIGO QR"
                        : "MOSTRAR CÓDIGO QR"}
                    </Text>
                  </Pressable>

                  {qrVisibleId === compra._id && (
                    <View style={styles.qrContainer}>
                      <Text style={styles.qrTitulo}>
                        PRESENTÁ ESTE CÓDIGO EN LA BARRA
                      </Text>

                      <View style={styles.qrFondo}>
                        <QRCode value={compra.codigoQR} size={190} />
                      </View>

                      <Text style={styles.qrDescripcion}>
                        Este código puede utilizarse una sola vez.
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.mensajeUtilizado}>
                  <Text style={styles.mensajeUtilizadoTexto}>
                    Esta compra ya fue validada.
                  </Text>
                </View>
              )}
            </View>
          ))
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
  header: {
    paddingTop: 55,
    paddingHorizontal: 22,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#292929",
    alignItems: "center",
  },
  volver: {
    position: "absolute",
    left: 22,
    top: 58,
  },
  volverTexto: {
    color: GOLD,
    fontSize: 16,
  },
  titulo: {
    color: GOLD,
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 3,
  },
  subtitulo: {
    color: "#888",
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 5,
  },
  contenido: {
    padding: 20,
    paddingBottom: 50,
  },
  encabezadoLista: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  seccionTitulo: {
    color: "#FFF",
    fontSize: 19,
    fontWeight: "bold",
  },
  actualizar: {
    color: GOLD,
    fontSize: 13,
  },
  centrado: {
    alignItems: "center",
    marginTop: 70,
  },
  textoCargando: {
    color: "#888",
    marginTop: 15,
  },
  vacio: {
    alignItems: "center",
    marginTop: 70,
    padding: 25,
    backgroundColor: CARD,
    borderRadius: 15,
  },
  vacioTitulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  vacioTexto: {
    color: "#888",
    textAlign: "center",
    lineHeight: 21,
  },
  botonBarra: {
    backgroundColor: GOLD,
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 22,
  },
  botonBarraTexto: {
    color: "#090909",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  compraCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#292929",
  },
  compraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compraTitulo: {
    color: GOLD,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  fecha: {
    color: "#888",
    fontSize: 12,
    marginTop: 5,
  },
  estado: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
  },
  estadoPendiente: {
    backgroundColor: "#332B12",
  },
  estadoUtilizado: {
    backgroundColor: "#252525",
  },
  estadoTexto: {
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  textoPendiente: {
    color: GOLD,
  },
  textoUtilizado: {
    color: "#999",
  },
  divisor: {
    height: 1,
    backgroundColor: "#303030",
    marginVertical: 15,
  },
  productosTitulo: {
    color: "#888",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 12,
  },
  productoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  productoInfo: {
    flex: 1,
  },
  productoNombre: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  productoCantidad: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
  productoSubtotal: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  totalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalTexto: {
    color: "#FFF",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  totalPrecio: {
    color: GOLD,
    fontSize: 19,
    fontWeight: "bold",
  },
  qrSeccion: {
    marginTop: 20,
  },
  botonQR: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
  },
  botonQRTexto: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    backgroundColor: "#1C1C1C",
    borderRadius: 10,
  },
  qrTitulo: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  qrFondo: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 8,
  },
  qrDescripcion: {
    color: "#999",
    fontSize: 11,
    textAlign: "center",
    marginTop: 15,
  },
  mensajeUtilizado: {
    marginTop: 18,
    padding: 12,
    backgroundColor: "#222",
    borderRadius: 8,
  },
  mensajeUtilizadoTexto: {
    color: "#999",
    textAlign: "center",
    fontSize: 12,
  },
});
