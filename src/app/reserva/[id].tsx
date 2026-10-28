import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { obtenerEvento, type Evento } from "../../lib/api";
import { guardarReserva } from "../../lib/reservas";

const GOLD = "#D4AF37";
const BACKGROUND = "#090909";
const API_URL = "http://10.0.2.2:3000";

export default function ReservaScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [confirmada, setConfirmada] = useState(false);
  const [numeroReserva, setNumeroReserva] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarEvento() {
      try {
        setCargando(true);

        if (!id) {
          throw new Error("No se recibió el ID del evento.");
        }

        const datos = await obtenerEvento(id);

        if (activo) {
          setEvento(datos);
        }
      } catch (error) {
        if (activo) {
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "No se pudo cargar el evento.",
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarEvento();

    return () => {
      activo = false;
    };
  }, [id]);

  const cantidadNumerica = /^\d+$/.test(cantidad) ? Number(cantidad) : 0;

  const cantidadValida =
    Number.isInteger(cantidadNumerica) &&
    cantidadNumerica >= 1 &&
    cantidadNumerica <= 10;

  const total = cantidadValida ? cantidadNumerica * (evento?.precio ?? 0) : 0;

  async function confirmarReserva() {
    Keyboard.dismiss();

    if (!evento || !id) {
      Alert.alert("Error", "No se encontró el evento seleccionado.");
      return;
    }

    if (!nombre.trim()) {
      Alert.alert("Datos incompletos", "Ingresá tu nombre completo.");
      return;
    }

    if (!cantidadValida) {
      Alert.alert("Cantidad inválida", "Podés reservar entre 1 y 10 entradas.");
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombreCliente: nombre.trim(),
          eventoId: evento._id,
          cantidad: cantidadNumerica,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        const mensaje = Array.isArray(datos.message)
          ? datos.message.join("\n")
          : datos.message;

        throw new Error(mensaje || "El backend no pudo registrar la reserva.");
      }

      if (!datos.codigoQR) {
        throw new Error(
          "La reserva fue recibida, pero el backend no devolvió el código QR esperado.",
        );
      }

      const codigo = String(datos.codigoQR);

      // Conservamos la reserva en el dispositivo para que
      // siga apareciendo en la pantalla "Mis reservas".
      await guardarReserva({
        id: codigo,
        eventoId: evento._id,
        eventoNombre: evento.nombre,
        fecha: evento.fecha,
        horario: evento.horario,
        cantidad: cantidadNumerica,
        precioUnitario: evento.precio,
        total: Number(datos.total ?? total),
        fechaCreacion: new Date().toISOString(),
      });

      setNumeroReserva(codigo);
      setConfirmada(true);
    } catch (error) {
      console.error("Error al crear la reserva:", error);

      Alert.alert(
        "No se pudo completar la reserva",
        error instanceof Error
          ? error.message
          : "Revisá que el backend esté funcionando e intentá nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={GOLD} />
        <Text style={styles.description}>Cargando evento...</Text>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>EVENTO NO ENCONTRADO</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/")}>
          <Text style={styles.buttonText}>VOLVER AL INICIO</Text>
        </Pressable>
      </View>
    );
  }

  if (confirmada) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

        <ScrollView contentContainerStyle={styles.confirmationContent}>
          <Text style={styles.logo}>BOLICHE</Text>
          <Text style={styles.eyebrow}>RESERVA REGISTRADA</Text>
          <Text style={styles.title}>¡ESTÁS EN LA LISTA!</Text>

          <Text style={styles.description}>
            Tu reserva fue registrada en el backend.
          </Text>

          <View style={styles.ticket}>
            <Text style={styles.eventName}>{evento.nombre}</Text>
            <Text style={styles.eventDate}>{evento.fecha}</Text>
            <Text style={styles.eventTime}>{evento.horario}</Text>

            <View style={styles.qrContainer}>
              <QRCode
                value={numeroReserva}
                size={210}
                color="#090909"
                backgroundColor="#FFFFFF"
              />
            </View>

            <Text style={styles.qrTitle}>TU CÓDIGO DE RESERVA</Text>
            <Text style={styles.bookingCode}>{numeroReserva}</Text>

            <View style={styles.ticketDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Nombre</Text>
              <Text style={styles.summaryValue}>{nombre.trim()}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Entradas</Text>
              <Text style={styles.summaryValue}>{cantidadNumerica}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${Number(total).toLocaleString("es-AR")}
              </Text>
            </View>
          </View>

          <Text style={styles.warning}>
            La reserva está registrada, pero esto no procesa un pago. La
            validación del QR debe realizarse en el establecimiento.
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.replace("/mis-reservas")}
          >
            <Text style={styles.buttonText}>VER MIS RESERVAS</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.secondaryButtonText}>VOLVER AL INICIO</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formContent}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← VOLVER AL EVENTO</Text>
        </Pressable>

        <Text style={styles.logo}>BOLICHE</Text>
        <Text style={styles.eyebrow}>ASEGURÁ TU LUGAR</Text>
        <Text style={styles.title}>RESERVAR ENTRADA</Text>

        <View style={styles.ticket}>
          <Text style={styles.eventName}>{evento.nombre}</Text>
          <Text style={styles.eventDate}>{evento.fecha}</Text>
          <Text style={styles.eventTime}>{evento.horario}</Text>

          <View style={styles.ticketDivider} />

          <Text style={styles.label}>NOMBRE COMPLETO</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            placeholder="Ingresá tu nombre"
            placeholderTextColor="#777777"
            autoCapitalize="words"
            style={styles.input}
            editable={!guardando}
          />

          <Text style={styles.label}>CANTIDAD DE ENTRADAS (1–10)</Text>
          <TextInput
            value={cantidad}
            onChangeText={setCantidad}
            placeholder="1"
            placeholderTextColor="#777777"
            keyboardType="number-pad"
            maxLength={2}
            style={styles.input}
            editable={!guardando}
          />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Precio por entrada</Text>
            <Text style={styles.summaryValue}>
              ${evento.precio.toLocaleString("es-AR")}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>TOTAL ESTIMADO</Text>
            <Text style={styles.totalValue}>
              ${total.toLocaleString("es-AR")}
            </Text>
          </View>
        </View>

        <Pressable
          style={[styles.button, guardando && styles.disabledButton]}
          onPress={confirmarReserva}
          disabled={guardando}
        >
          <Text style={styles.buttonText}>
            {guardando ? "REGISTRANDO..." : "CONFIRMAR RESERVA"}
          </Text>
        </Pressable>

        <Text style={styles.warning}>
          La reserva se registrará en el backend. No se realiza ningún cobro.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  centered: {
    flex: 1,
    backgroundColor: BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  formContent: {
    padding: 22,
    paddingTop: 28,
    paddingBottom: 45,
  },
  confirmationContent: {
    alignItems: "center",
    padding: 22,
    paddingTop: 35,
    paddingBottom: 45,
  },
  backButton: {
    marginBottom: 30,
    alignSelf: "flex-start",
  },
  backText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  logo: {
    color: GOLD,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 5,
    marginBottom: 30,
    textAlign: "center",
  },
  eyebrow: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 22,
  },
  description: {
    color: "#AAAAAA",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    marginTop: 12,
  },
  ticket: {
    width: "100%",
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#40351F",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  eventName: {
    color: GOLD,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 12,
  },
  eventDate: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  eventTime: {
    color: "#999999",
    fontSize: 12,
    textAlign: "center",
    marginTop: 7,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: "#383022",
    marginVertical: 22,
  },
  label: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 9,
    marginTop: 7,
  },
  input: {
    backgroundColor: "#090909",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#393939",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    marginBottom: 17,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  summaryLabel: {
    color: "#999999",
    fontSize: 12,
    flexShrink: 1,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  totalLabel: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "800",
    flexShrink: 1,
  },
  totalValue: {
    color: GOLD,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "right",
  },
  button: {
    width: "100%",
    minHeight: 52,
    backgroundColor: GOLD,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 12,
  },
  buttonText: {
    color: "#090909",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#514323",
    borderRadius: 6,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  qrContainer: {
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 18,
  },
  qrTitle: {
    color: "#999999",
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  bookingCode: {
    color: GOLD,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 8,
  },
  warning: {
    color: "#888888",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 20,
  },
});
