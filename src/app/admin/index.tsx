import { router, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://10.0.2.2:3000";
const TOKEN_KEY = "boliche_admin_token";

type Evento = {
  _id: string;
  nombre: string;
  fecha: string;
  horario: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  activo: boolean;
};

type Reserva = {
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

const formularioVacio = {
  nombre: "",
  fecha: "",
  horario: "",
  descripcion: "",
  precio: "",
  imagen: "",
};

export default function AdminScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [eventoEditando, setEventoEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [seccion, setSeccion] = useState<"eventos" | "reservas">("eventos");

  async function obtenerToken(): Promise<string> {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);

    if (!token) {
      router.replace("/admin/login" as any);
      throw new Error("sesion_no_iniciada");
    }

    return token;
  }

  async function manejarRespuestaNoAutorizada(
    respuesta: Response,
  ): Promise<void> {
    if (respuesta.status === 401 || respuesta.status === 403) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      router.replace("/admin/login" as any);
      throw new Error("sesion_vencida");
    }
  }

  function mostrarError(error: unknown, mensajePredeterminado: string) {
    if (
      error instanceof Error &&
      (error.message === "sesion_no_iniciada" ||
        error.message === "sesion_vencida")
    ) {
      return;
    }

    Alert.alert(
      "Error",
      error instanceof Error ? error.message : mensajePredeterminado,
    );
  }

  const cargarDatos = useCallback(async (esActualizacion = false) => {
    if (esActualizacion) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    try {
      const token = await obtenerToken();

      const [respuestaEventos, respuestaReservas] = await Promise.all([
        fetch(`${API_URL}/eventos`),
        fetch(`${API_URL}/reservas`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      await manejarRespuestaNoAutorizada(respuestaReservas);

      if (!respuestaEventos.ok || !respuestaReservas.ok) {
        throw new Error("No se pudieron cargar los datos del servidor.");
      }

      const datosEventos: Evento[] = await respuestaEventos.json();
      const datosReservas: Reserva[] = await respuestaReservas.json();

      setEventos(datosEventos);
      setReservas(datosReservas);
    } catch (error) {
      mostrarError(
        error,
        "No se pudieron cargar los datos. Verificá que NestJS esté funcionando.",
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  function cambiarCampo(campo: keyof typeof formulario, valor: string) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  function limpiarFormulario() {
    setFormulario(formularioVacio);
    setEventoEditando(null);
  }

  function editarEvento(evento: Evento) {
    setEventoEditando(evento._id);

    setFormulario({
      nombre: evento.nombre,
      fecha: evento.fecha.slice(0, 10),
      horario: evento.horario,
      descripcion: evento.descripcion,
      precio: String(evento.precio),
      imagen: evento.imagen ?? "",
    });

    setSeccion("eventos");
  }

  async function guardarEvento() {
    const nombre = formulario.nombre.trim();
    const fecha = formulario.fecha.trim();
    const horario = formulario.horario.trim();
    const descripcion = formulario.descripcion.trim();
    const precio = Number(formulario.precio);

    if (
      !nombre ||
      !fecha ||
      !horario ||
      !descripcion ||
      !formulario.precio.trim()
    ) {
      Alert.alert(
        "Datos incompletos",
        "Completá todos los campos obligatorios.",
      );
      return;
    }

    if (!Number.isFinite(precio) || precio < 0) {
      Alert.alert("Precio inválido", "Ingresá un precio válido.");
      return;
    }

    const datos = {
      nombre,
      fecha,
      horario,
      descripcion,
      precio,
      imagen: formulario.imagen.trim(),
    };

    setGuardando(true);

    try {
      const token = await obtenerToken();
      const url = eventoEditando
        ? `${API_URL}/eventos/${eventoEditando}`
        : `${API_URL}/eventos`;

      const respuesta = await fetch(url, {
        method: eventoEditando ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      });

      await manejarRespuestaNoAutorizada(respuesta);

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        const mensaje = resultado?.message;
        throw new Error(
          Array.isArray(mensaje)
            ? mensaje.join("\n")
            : (mensaje ?? "No se pudo guardar el evento."),
        );
      }

      Alert.alert(
        "Operación exitosa",
        eventoEditando ? "Evento actualizado." : "Evento creado.",
      );

      limpiarFormulario();
      await cargarDatos(true);
    } catch (error) {
      mostrarError(error, "No se pudo guardar el evento.");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstadoEvento(evento: Evento, activo: boolean) {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${API_URL}/eventos/${evento._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo }),
      });

      await manejarRespuestaNoAutorizada(respuesta);

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          resultado?.message ?? "No se pudo cambiar el estado del evento.",
        );
      }

      setEventos((anteriores) =>
        anteriores.map((item) =>
          item._id === evento._id ? { ...item, activo } : item,
        ),
      );
    } catch (error) {
      mostrarError(error, "No se pudo actualizar el evento.");
    }
  }

  function confirmarCancelarReserva(reserva: Reserva) {
    if (reserva.utilizada) {
      Alert.alert(
        "Reserva utilizada",
        "Esta reserva ya fue utilizada y no se puede cancelar desde el panel.",
      );
      return;
    }

    Alert.alert(
      "Cancelar reserva",
      `¿Querés cancelar la reserva de ${reserva.nombreCliente}?`,
      [
        { text: "Volver", style: "cancel" },
        {
          text: "Cancelar reserva",
          style: "destructive",
          onPress: () => cancelarReserva(reserva),
        },
      ],
    );
  }

  async function cancelarReserva(reserva: Reserva) {
    try {
      const token = await obtenerToken();

      const respuesta = await fetch(`${API_URL}/reservas/${reserva._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await manejarRespuestaNoAutorizada(respuesta);

      const resultado = await respuesta.json().catch(() => null);

      if (!respuesta.ok) {
        throw new Error(
          resultado?.message ?? "No se pudo cancelar la reserva.",
        );
      }

      setReservas((anteriores) =>
        anteriores.filter((item) => item._id !== reserva._id),
      );

      Alert.alert("Reserva cancelada", "La reserva fue eliminada.");
    } catch (error) {
      mostrarError(error, "No se pudo cancelar la reserva.");
    }
  }

  async function cerrarSesion() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    router.replace("/admin/login" as any);
  }

  if (cargando) {
    return (
      <>
        <Stack.Screen options={{ title: "Administración" }} />
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.textoSecundario}>Cargando administración...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Administración" }} />

      <ScrollView
        style={styles.pantalla}
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarDatos(true)}
            tintColor="#D4AF37"
          />
        }
      >
        <View style={styles.encabezado}>
          <View style={styles.flex}>
            <Text style={styles.etiqueta}>BOLICHE · CONTROL CENTRAL</Text>
            <Text style={styles.titulo}>Administración</Text>
          </View>

          <TouchableOpacity onPress={cerrarSesion} style={styles.botonSalir}>
            <Text style={styles.textoSalir}>SALIR</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitulo}>
          Gestioná eventos y reservas desde la aplicación.
        </Text>

        <View style={styles.resumen}>
          <View style={styles.resumenItem}>
            <Text style={styles.numero}>{eventos.length}</Text>
            <Text style={styles.resumenTexto}>Eventos</Text>
          </View>

          <View style={styles.resumenItem}>
            <Text style={styles.numero}>
              {eventos.filter((evento) => evento.activo).length}
            </Text>
            <Text style={styles.resumenTexto}>Activos</Text>
          </View>

          <View style={styles.resumenItem}>
            <Text style={styles.numero}>{reservas.length}</Text>
            <Text style={styles.resumenTexto}>Reservas</Text>
          </View>
        </View>

        <View style={styles.pestanas}>
          <TouchableOpacity
            style={[
              styles.pestana,
              seccion === "eventos" && styles.pestanaActiva,
            ]}
            onPress={() => setSeccion("eventos")}
          >
            <Text
              style={[
                styles.pestanaTexto,
                seccion === "eventos" && styles.pestanaTextoActiva,
              ]}
            >
              EVENTOS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.pestana,
              seccion === "reservas" && styles.pestanaActiva,
            ]}
            onPress={() => setSeccion("reservas")}
          >
            <Text
              style={[
                styles.pestanaTexto,
                seccion === "reservas" && styles.pestanaTextoActiva,
              ]}
            >
              RESERVAS
            </Text>
          </TouchableOpacity>
        </View>

        {seccion === "eventos" ? (
          <>
            <View style={styles.tarjeta}>
              <Text style={styles.tituloTarjeta}>
                {eventoEditando ? "Editar evento" : "Crear evento"}
              </Text>

              <Text style={styles.etiquetaCampo}>NOMBRE</Text>
              <TextInput
                style={styles.input}
                value={formulario.nombre}
                onChangeText={(v) => cambiarCampo("nombre", v)}
                placeholder="Ej. GOLDEN NIGHT"
                placeholderTextColor="#777"
                autoCapitalize="characters"
              />

              <Text style={styles.etiquetaCampo}>FECHA (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={formulario.fecha}
                onChangeText={(v) => cambiarCampo("fecha", v)}
                placeholder="2026-10-31"
                placeholderTextColor="#777"
              />

              <Text style={styles.etiquetaCampo}>HORARIO</Text>
              <TextInput
                style={styles.input}
                value={formulario.horario}
                onChangeText={(v) => cambiarCampo("horario", v)}
                placeholder="23:00"
                placeholderTextColor="#777"
              />

              <Text style={styles.etiquetaCampo}>DESCRIPCIÓN</Text>
              <TextInput
                style={[styles.input, styles.inputMultilinea]}
                value={formulario.descripcion}
                onChangeText={(v) => cambiarCampo("descripcion", v)}
                placeholder="Descripción del evento..."
                placeholderTextColor="#777"
                multiline
              />

              <Text style={styles.etiquetaCampo}>PRECIO</Text>
              <TextInput
                style={styles.input}
                value={formulario.precio}
                onChangeText={(v) => cambiarCampo("precio", v)}
                placeholder="10000"
                placeholderTextColor="#777"
                keyboardType="decimal-pad"
              />

              <Text style={styles.etiquetaCampo}>URL DE IMAGEN (OPCIONAL)</Text>
              <TextInput
                style={styles.input}
                value={formulario.imagen}
                onChangeText={(v) => cambiarCampo("imagen", v)}
                placeholder="https://..."
                placeholderTextColor="#777"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.boton, guardando && styles.botonDeshabilitado]}
                onPress={guardarEvento}
                disabled={guardando}
              >
                <Text style={styles.botonTexto}>
                  {guardando
                    ? "GUARDANDO..."
                    : eventoEditando
                      ? "GUARDAR CAMBIOS"
                      : "CREAR EVENTO"}
                </Text>
              </TouchableOpacity>

              {eventoEditando && (
                <TouchableOpacity
                  style={styles.botonSecundario}
                  onPress={limpiarFormulario}
                >
                  <Text style={styles.botonSecundarioTexto}>
                    DEJAR DE EDITAR
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.seccionTitulo}>Eventos registrados</Text>

            {eventos.length === 0 ? (
              <Text style={styles.vacio}>
                Todavía no hay eventos registrados.
              </Text>
            ) : (
              eventos.map((evento) => (
                <View key={evento._id} style={styles.tarjeta}>
                  <View style={styles.filaEntre}>
                    <View style={styles.flex}>
                      <Text style={styles.nombreEvento}>{evento.nombre}</Text>
                      <Text style={styles.detalle}>
                        {evento.fecha.slice(0, 10)} · {evento.horario}
                      </Text>
                      <Text style={styles.precio}>
                        ${evento.precio.toLocaleString("es-AR")}
                      </Text>
                    </View>

                    <View style={styles.estado}>
                      <Text style={styles.estadoTexto}>
                        {evento.activo ? "ACTIVO" : "INACTIVO"}
                      </Text>
                      <Switch
                        value={evento.activo}
                        onValueChange={(valor) =>
                          cambiarEstadoEvento(evento, valor)
                        }
                        trackColor={{ false: "#444", true: "#80691E" }}
                        thumbColor={evento.activo ? "#D4AF37" : "#AAA"}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.botonSecundario}
                    onPress={() => editarEvento(evento)}
                  >
                    <Text style={styles.botonSecundarioTexto}>
                      EDITAR EVENTO
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            <Text style={styles.seccionTitulo}>Reservas registradas</Text>

            {reservas.length === 0 ? (
              <Text style={styles.vacio}>
                Todavía no hay reservas registradas.
              </Text>
            ) : (
              reservas.map((reserva) => (
                <View key={reserva._id} style={styles.tarjeta}>
                  <Text style={styles.nombreEvento}>
                    {reserva.nombreCliente}
                  </Text>
                  <Text style={styles.detalle}>
                    Evento: {reserva.eventoNombre}
                  </Text>
                  <Text style={styles.detalle}>
                    Entradas: {reserva.cantidad}
                  </Text>
                  <Text style={styles.precio}>
                    Total: ${reserva.total.toLocaleString("es-AR")}
                  </Text>
                  <Text style={styles.detalle}>
                    Estado: {reserva.utilizada ? "UTILIZADA" : "PENDIENTE"}
                  </Text>

                  {reserva.codigoQR ? (
                    <Text style={styles.codigoQR}>
                      Código QR: {reserva.codigoQR}
                    </Text>
                  ) : null}

                  {reserva.createdAt ? (
                    <Text style={styles.detalle}>
                      Creada:{" "}
                      {new Date(reserva.createdAt).toLocaleString("es-AR")}
                    </Text>
                  ) : null}

                  {!reserva.utilizada && (
                    <TouchableOpacity
                      style={styles.botonPeligro}
                      onPress={() => confirmarCancelarReserva(reserva)}
                    >
                      <Text style={styles.botonTexto}>CANCELAR RESERVA</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={() => cargarDatos(true)}
          disabled={actualizando}
        >
          <Text style={styles.botonSecundarioTexto}>
            {actualizando ? "ACTUALIZANDO..." : "ACTUALIZAR DATOS"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.pie}>
          Panel de administración · Datos conectados al backend.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#090909",
  },
  contenido: {
    padding: 20,
    paddingTop: 35,
    paddingBottom: 50,
  },
  centrado: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
    alignItems: "center",
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  etiqueta: {
    color: "#D4AF37",
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "700",
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    marginTop: 10,
  },
  subtitulo: {
    color: "#AAA",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 22,
  },
  botonSalir: {
    borderWidth: 1,
    borderColor: "#80691E",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textoSalir: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "800",
  },
  resumen: {
    flexDirection: "row",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 22,
  },
  resumenItem: {
    flex: 1,
    alignItems: "center",
  },
  numero: {
    color: "#D4AF37",
    fontSize: 25,
    fontWeight: "800",
  },
  resumenTexto: {
    color: "#AAA",
    fontSize: 12,
    marginTop: 5,
  },
  pestanas: {
    flexDirection: "row",
    backgroundColor: "#151515",
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  pestana: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  pestanaActiva: {
    backgroundColor: "#D4AF37",
  },
  pestanaTexto: {
    color: "#AAA",
    fontWeight: "700",
    fontSize: 12,
  },
  pestanaTextoActiva: {
    color: "#090909",
  },
  tarjeta: {
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 14,
    padding: 16,
    marginBottom: 15,
  },
  tituloTarjeta: {
    color: "#D4AF37",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 18,
  },
  etiquetaCampo: {
    color: "#D4AF37",
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: "#0D0D0D",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 9,
    color: "#FFF",
    paddingHorizontal: 13,
    paddingVertical: 13,
    fontSize: 14,
  },
  inputMultilinea: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  boton: {
    backgroundColor: "#D4AF37",
    borderRadius: 9,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 22,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: "#090909",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  botonSecundario: {
    borderWidth: 1,
    borderColor: "#80691E",
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 12,
  },
  botonSecundarioTexto: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  seccionTitulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 15,
  },
  nombreEvento: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  detalle: {
    color: "#AAA",
    fontSize: 13,
    marginTop: 5,
  },
  precio: {
    color: "#D4AF37",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 10,
  },
  filaEntre: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  estado: {
    alignItems: "center",
    gap: 5,
  },
  estadoTexto: {
    color: "#D4AF37",
    fontSize: 10,
    fontWeight: "800",
  },
  vacio: {
    color: "#999",
    fontSize: 14,
    marginBottom: 20,
  },
  codigoQR: {
    color: "#D4AF37",
    fontSize: 12,
    marginTop: 10,
  },
  botonPeligro: {
    backgroundColor: "#521C1C",
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  textoSecundario: {
    color: "#AAA",
    marginTop: 12,
  },
  pie: {
    color: "#666",
    fontSize: 11,
    textAlign: "center",
    marginTop: 25,
  },
});
