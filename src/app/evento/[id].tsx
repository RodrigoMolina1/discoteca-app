import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { obtenerEvento, type Evento } from "../../lib/api";

export default function DetalleEvento() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [evento, setEvento] = useState<Evento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarEvento() {
      try {
        setCargando(true);
        setError("");

        if (!id) {
          throw new Error("No se recibió el ID del evento");
        }

        const datos = await obtenerEvento(id);

        if (activo) {
          setEvento(datos);
        }
      } catch (e) {
        if (activo) {
          setError(
            e instanceof Error ? e.message : "No se pudo cargar el evento",
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

  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={styles.textoSecundario}>Cargando evento...</Text>
      </View>
    );
  }

  if (error || !evento) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.titulo}>EVENTO NO ENCONTRADO</Text>
        <Text style={styles.textoSecundario}>
          {error || "No se encontró el evento solicitado."}
        </Text>

        <Pressable style={styles.boton} onPress={() => router.back()}>
          <Text style={styles.textoBoton}>VOLVER</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor}>
      <Pressable onPress={() => router.back()} style={styles.volver}>
        <Text style={styles.dorado}>← VOLVER</Text>
      </Pressable>

      <View style={styles.contenido}>
        <Text style={styles.etiqueta}>BOLICHE · EVENTO EXCLUSIVO</Text>

        <Text style={styles.titulo}>{evento.nombre}</Text>

        <View style={styles.separador} />

        <Text style={styles.subtitulo}>FECHA</Text>
        <Text style={styles.texto}>{evento.fecha}</Text>

        <Text style={styles.subtitulo}>HORARIO</Text>
        <Text style={styles.texto}>{evento.horario}</Text>

        <Text style={styles.subtitulo}>DESCRIPCIÓN</Text>
        <Text style={styles.texto}>{evento.descripcion}</Text>

        <Text style={styles.subtitulo}>ENTRADA</Text>
        <Text style={styles.precio}>
          ${evento.precio.toLocaleString("es-AR")}
        </Text>

        <Pressable
          style={styles.boton}
          onPress={() => router.push(`/reserva/${evento._id}`)}
        >
          <Text style={styles.textoBoton}>RESERVAR ENTRADA</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#090909",
  },
  centrado: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  contenido: {
    padding: 24,
    paddingTop: 32,
  },
  volver: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  etiqueta: {
    color: "#D4AF37",
    fontSize: 11,
    letterSpacing: 2,
    marginBottom: 14,
  },
  titulo: {
    color: "#F5F5F5",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  separador: {
    height: 1,
    backgroundColor: "#5E4B18",
    marginBottom: 28,
  },
  subtitulo: {
    color: "#D4AF37",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
    marginTop: 22,
    marginBottom: 8,
  },
  texto: {
    color: "#E0E0E0",
    fontSize: 16,
    lineHeight: 25,
  },
  textoSecundario: {
    color: "#BDBDBD",
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
  precio: {
    color: "#D4AF37",
    fontSize: 28,
    fontWeight: "bold",
  },
  dorado: {
    color: "#D4AF37",
    fontSize: 14,
    fontWeight: "bold",
  },
  boton: {
    backgroundColor: "#D4AF37",
    padding: 18,
    alignItems: "center",
    borderRadius: 6,
    marginTop: 32,
    marginBottom: 40,
  },
  textoBoton: {
    color: "#090909",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
