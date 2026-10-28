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
import { obtenerEventos, type Evento } from "../lib/api";

const API_URL = "http://10.0.2.2:3000";
const GOLD = "#D4AF37";
const BACKGROUND = "#090909";

type ReservaBackend = {
  _id: string;
  nombreCliente: string;
  eventoId: string | { _id: string };
  eventoNombre: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  codigoQR: string;
  utilizada: boolean;
  createdAt?: string;
};

type ReservaMostrada = ReservaBackend & {
  fecha: string;
  horario: string;
};

export default function MisReservasScreen() {
  const [reservas, setReservas] = useState<ReservaMostrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarReservas = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const [respuestaReservas, eventos] = await Promise.all([
        fetch(`${API_URL}/reservas`),
        obtenerEventos(),
      ]);

      if (!respuestaReservas.ok) {
        throw new Error("No se pudieron obtener las reservas.");
      }

      const datos: ReservaBackend[] = await respuestaReservas.json();

      const reservasCompletas: ReservaMostrada[] = datos.map((reserva) => {
        const eventoId =
          typeof reserva.eventoId === "string"
            ? reserva.eventoId
            : reserva.eventoId?._id;

        const evento = eventos.find((item: Evento) => item._id === eventoId);

        return {
          ...reserva,
          fecha: evento?.fecha ?? "Fecha no disponible",
          horario: evento?.horario ?? "Horario no disponible",
        };
      });

      setReservas(reservasCompletas);
    } catch (e) {
      console.error("Error al cargar reservas:", e);
      setError(
        "No pudimos conectar con el servidor. Verificá que NestJS esté funcionando e intentá nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarReservas();
    }, [cargarReservas]),
  );

  async function cancelarReserva(id: string) {
    try {
      const respuesta = await fetch(`${API_URL}/reservas/${id}`, {
        method: "DELETE",
      });

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        const mensaje = Array.isArray(datos.message)
          ? datos.message.join(", ")
          : datos.message;

        throw new Error(mensaje || "No se pudo cancelar la reserva.");
      }

      setReservas((actuales) =>
        actuales.filter((reserva) => reserva._id !== id),
      );

      Alert.alert("Reserva cancelada", "La reserva se eliminó correctamente.");
    } catch (e) {
      console.error("Error al cancelar reserva:", e);

      Alert.alert(
        "Error",
        e instanceof Error
          ? e.message
          : "No se pudo cancelar la reserva. Intentá nuevamente.",
      );
    }
  }

  function confirmarCancelacion(id: string, eventoNombre: string) {
    Alert.alert(
      "Cancelar reserva",
      `¿Querés cancelar tu reserva para ${eventoNombre}? Esta acción no se puede deshacer.`,
      [
        {
          text: "Volver",
          style: "cancel",
        },
        {
          text: "Cancelar reserva",
          style: "destructive",
          onPress: () => {
            void cancelarReserva(id);
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← VOLVER</Text>
        </Pressable>

        <Text style={styles.logo}>BOLICHE</Text>
        <Text style={styles.eyebrow}>TUS NOCHES, TUS ENTRADAS</Text>
        <Text style={styles.title}>MIS RESERVAS</Text>
        <Text style={styles.description}>
          Consultá tus reservas y mostrá su código QR cuando corresponda.
        </Text>

        {cargando ? (
          <ActivityIndicator size="large" color={GOLD} style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>NO SE PUDIERON CARGAR</Text>
            <Text style={styles.emptyDescription}>{error}</Text>

            <Pressable style={styles.button} onPress={cargarReservas}>
              <Text style={styles.buttonText}>REINTENTAR</Text>
            </Pressable>
          </View>
        ) : reservas.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>▤</Text>
            <Text style={styles.emptyTitle}>TODAVÍA NO HAY RESERVAS</Text>
            <Text style={styles.emptyDescription}>
              Cuando se registre una reserva en el servidor, aparecerá acá con
              su código QR.
            </Text>

            <Pressable
              style={styles.button}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.buttonText}>EXPLORAR EVENTOS</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.counter}>
              {reservas.length} {reservas.length === 1 ? "RESERVA" : "RESERVAS"}
            </Text>

            {reservas.map((reserva) => (
              <View key={reserva._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.eventName}>{reserva.eventoNombre}</Text>
                    <Text style={styles.eventDate}>{reserva.fecha}</Text>
                    <Text style={styles.eventTime}>{reserva.horario}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      reserva.utilizada && styles.usedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        reserva.utilizada && styles.usedText,
                      ]}
                    >
                      {reserva.utilizada ? "UTILIZADA" : "REGISTRADA"}
                    </Text>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.qrContainer}>
                  <QRCode
                    value={reserva.codigoQR}
                    size={190}
                    color="#090909"
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <Text style={styles.qrLabel}>CÓDIGO DE RESERVA</Text>
                <Text selectable style={styles.bookingCode}>
                  {reserva.codigoQR}
                </Text>

                <View style={styles.separator} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Titular</Text>
                  <Text style={styles.detailValue}>
                    {reserva.nombreCliente}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cantidad de entradas</Text>
                  <Text style={styles.detailValue}>{reserva.cantidad}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Precio por entrada</Text>
                  <Text style={styles.detailValue}>
                    ${reserva.precioUnitario.toLocaleString("es-AR")}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
                  <Text style={styles.totalValue}>
                    ${reserva.total.toLocaleString("es-AR")}
                  </Text>
                </View>

                <Text style={styles.notice}>
                  {reserva.utilizada
                    ? "Esta reserva ya fue validada."
                    : "Reserva registrada en el servidor. El pago todavía no está integrado."}
                </Text>

                {!reserva.utilizada && (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() =>
                      confirmarCancelacion(reserva._id, reserva.eventoNombre)
                    }
                  >
                    <Text style={styles.deleteButtonText}>
                      CANCELAR RESERVA
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>BOLICHE · NIGHTLIFE EXPERIENCE</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 28,
  },
  backText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  logo: {
    color: GOLD,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 5,
    textAlign: "center",
  },
  eyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 22,
    marginBottom: 9,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 25,
  },
  loader: {
    marginTop: 45,
  },
  emptyCard: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#38301D",
    borderRadius: 10,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
  },
  emptyIcon: {
    color: GOLD,
    fontSize: 38,
    marginBottom: 15,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyDescription: {
    color: "#999999",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 22,
  },
  button: {
    backgroundColor: GOLD,
    borderRadius: 6,
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  buttonText: {
    color: "#090909",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  counter: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#40351F",
    borderRadius: 10,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  eventName: {
    color: GOLD,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  eventDate: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
  },
  eventTime: {
    color: "#999999",
    fontSize: 11,
    marginTop: 5,
  },
  statusBadge: {
    borderWidth: 1,
    borderColor: "#514323",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  statusText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: "800",
  },
  usedBadge: {
    borderColor: "#555555",
  },
  usedText: {
    color: "#AAAAAA",
  },
  separator: {
    height: 1,
    backgroundColor: "#383022",
    marginVertical: 18,
  },
  qrContainer: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  qrLabel: {
    color: "#999999",
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  bookingCode: {
    color: GOLD,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 13,
  },
  detailLabel: {
    color: "#999999",
    fontSize: 11,
    flexShrink: 1,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
  totalLabel: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "800",
    flexShrink: 1,
  },
  totalValue: {
    color: GOLD,
    fontSize: 18,
    fontWeight: "900",
  },
  notice: {
    color: "#888888",
    fontSize: 10,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 12,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: "#663333",
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  deleteButtonText: {
    color: "#E58A8A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#555555",
    fontSize: 9,
    letterSpacing: 1,
  },
});
