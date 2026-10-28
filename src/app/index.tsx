import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { obtenerEventos, type Evento } from "../lib/api";

const GOLD = "#D4AF37";
const BACKGROUND = "#090909";
const CARD = "#141414";

export default function HomeScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarEventos = useCallback(async () => {
    try {
      setError("");
      setCargando(true);
      const datos = await obtenerEventos();
      setEventos(datos.filter((evento) => evento.activo));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar los eventos.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarEventos();
    }, [cargarEventos]),
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={BACKGROUND} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BOLICHE</Text>
            <Text style={styles.logoSubtitle}>NIGHTLIFE EXPERIENCE</Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>EXPERIENCIA PREMIUM</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>BIENVENIDO A OTRA NOCHE</Text>

          <Text style={styles.heroTitle}>
            LA NOCHE{"\n"}
            <Text style={styles.goldText}>ES TUYA.</Text>
          </Text>

          <Text style={styles.heroDescription}>
            Descubrí los próximos eventos y preparate para vivir una experiencia
            única.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              if (eventos.length > 0) {
                router.push(`/evento/${eventos[0]._id}`);
              }
            }}
            disabled={eventos.length === 0}
          >
            <Text style={styles.primaryButtonText}>DESCUBRIR EVENTO</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </Pressable>

          <View style={styles.heroDecoration}>
            <View style={styles.decorationLine} />
            <Text style={styles.decorationText}>
              MÚSICA · LUCES · EXPERIENCIA
            </Text>
            <View style={styles.decorationLine} />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.reservasButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/mis-reservas")}
        >
          <View style={styles.reservasIcon}>
            <Text style={styles.ticketIcon}>▤</Text>
          </View>

          <View style={styles.reservasInfo}>
            <Text style={styles.reservasTitle}>MIS RESERVAS</Text>
            <Text style={styles.reservasDescription}>
              Consultá tus entradas reservadas
            </Text>
          </View>

          <Text style={styles.reservasArrow}>›</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>NO TE LO PIERDAS</Text>
            <Text style={styles.sectionTitle}>PRÓXIMOS EVENTOS</Text>
          </View>

          <View style={styles.eventCount}>
            <Text style={styles.eventCountText}>
              {String(eventos.length).padStart(2, "0")}
            </Text>
          </View>
        </View>

        {cargando ? (
          <View style={styles.messageContainer}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.messageText}>Cargando eventos...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={cargarEventos}>
              <Text style={styles.retryText}>REINTENTAR</Text>
            </Pressable>
          </View>
        ) : eventos.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              No hay eventos disponibles por el momento.
            </Text>
          </View>
        ) : (
          eventos.map((evento, index) => (
            <Pressable
              key={evento._id}
              style={({ pressed }) => [
                styles.eventCard,
                pressed && styles.eventCardPressed,
              ]}
              onPress={() => router.push(`/evento/${evento._id}`)}
            >
              <View style={styles.eventNumberContainer}>
                <Text style={styles.eventNumber}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>

              <View style={styles.eventInfo}>
                <Text style={styles.eventCategory}>NOCHE PREMIUM</Text>
                <Text style={styles.eventName}>{evento.nombre}</Text>

                <View style={styles.eventDetails}>
                  <Text style={styles.eventDay}>{evento.fecha}</Text>
                  <Text style={styles.detailSeparator}>•</Text>
                  <Text style={styles.eventTime}>{evento.horario} HS</Text>
                </View>

                <Text style={styles.eventDescription}>
                  {evento.descripcion}
                </Text>
              </View>

              <View style={styles.eventArrowContainer}>
                <Text style={styles.eventArrow}>↗</Text>
              </View>
            </Pressable>
          ))
        )}

        {/* Acceso al panel de administración */}
        <Pressable
          style={({ pressed }) => [
            styles.adminButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push("/admin/login" as any)}
        >
          <Text style={styles.adminIcon}>⚙</Text>

          <View style={styles.adminInfo}>
            <Text style={styles.adminTitle}>PANEL DE ADMINISTRACIÓN</Text>
            <Text style={styles.adminDescription}>
              Gestioná eventos y reservas
            </Text>
          </View>

          <Text style={styles.adminArrow}>›</Text>
        </Pressable>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerLogo}>BOLICHE</Text>
          <Text style={styles.footerText}>CADA NOCHE TIENE SU HISTORIA.</Text>
          <Text style={styles.footerCopyright}>
            © 2026 BOLICHE · NIGHTLIFE EXPERIENCE
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BACKGROUND },
  scrollContent: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 35 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 42,
  },
  logo: { color: GOLD, fontSize: 24, fontWeight: "900", letterSpacing: 4 },
  logoSubtitle: {
    color: "#777777",
    fontSize: 8,
    letterSpacing: 2,
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#37301B",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GOLD,
    marginRight: 6,
  },
  statusText: {
    color: GOLD,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  hero: {
    backgroundColor: "#11100D",
    borderWidth: 1,
    borderColor: "#302819",
    borderRadius: 12,
    padding: 22,
    paddingTop: 28,
    marginBottom: 22,
  },
  heroEyebrow: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 17,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 43,
    lineHeight: 47,
    fontWeight: "900",
    letterSpacing: 1,
  },
  goldText: { color: GOLD },
  heroDescription: {
    color: "#A6A6A6",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 18,
    marginBottom: 24,
  },
  primaryButton: {
    minHeight: 52,
    backgroundColor: GOLD,
    borderRadius: 6,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryButtonText: {
    color: "#090909",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  buttonArrow: { color: "#090909", fontSize: 23, fontWeight: "600" },
  buttonPressed: { opacity: 0.75 },
  heroDecoration: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },
  decorationLine: { flex: 1, height: 1, backgroundColor: "#393124" },
  decorationText: { color: "#777064", fontSize: 8, letterSpacing: 1 },
  reservasButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#38301D",
    borderRadius: 8,
    padding: 16,
    marginBottom: 37,
  },
  reservasIcon: {
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: "#292315",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  ticketIcon: { color: GOLD, fontSize: 23 },
  reservasInfo: { flex: 1 },
  reservasTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1,
  },
  reservasDescription: { color: "#888888", fontSize: 11, marginTop: 5 },
  reservasArrow: { color: GOLD, fontSize: 28, marginLeft: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  sectionEyebrow: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 7,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  eventCount: {
    borderWidth: 1,
    borderColor: "#40351F",
    borderRadius: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  eventCountText: { color: GOLD, fontSize: 12, fontWeight: "800" },
  eventCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#262626",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  eventCardPressed: { opacity: 0.7, borderColor: GOLD },
  eventNumberContainer: {
    width: 34,
    height: 34,
    backgroundColor: "#292315",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 3,
  },
  eventNumber: { color: GOLD, fontSize: 12, fontWeight: "800" },
  eventInfo: { flex: 1 },
  eventCategory: {
    color: GOLD,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  eventName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  eventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },
  eventDay: { color: "#D0D0D0", fontSize: 10, fontWeight: "700" },
  detailSeparator: { color: GOLD, fontSize: 11, marginHorizontal: 7 },
  eventTime: { color: "#A0A0A0", fontSize: 10 },
  eventDescription: {
    color: "#858585",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
  },
  eventArrowContainer: { paddingLeft: 8, paddingTop: 1 },
  eventArrow: { color: GOLD, fontSize: 22 },
  messageContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: CARD,
    borderRadius: 8,
    gap: 12,
    marginBottom: 12,
  },
  messageText: { color: "#A6A6A6", fontSize: 13, textAlign: "center" },
  errorText: { color: "#FF7777", fontSize: 13, textAlign: "center" },
  retryButton: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 6,
    padding: 12,
  },
  retryText: { color: GOLD, fontWeight: "800", fontSize: 11 },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#11100D",
    borderWidth: 1,
    borderColor: "#80691E",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  adminIcon: {
    color: GOLD,
    fontSize: 25,
    marginRight: 13,
  },
  adminInfo: { flex: 1 },
  adminTitle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  adminDescription: {
    color: "#888888",
    fontSize: 11,
    marginTop: 5,
  },
  adminArrow: {
    color: GOLD,
    fontSize: 27,
    marginLeft: 8,
  },
  footer: { alignItems: "center", marginTop: 30, paddingTop: 22 },
  footerLine: {
    height: 1,
    width: 55,
    backgroundColor: GOLD,
    marginBottom: 18,
  },
  footerLogo: {
    color: GOLD,
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 5,
  },
  footerText: {
    color: "#8A8A8A",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 9,
  },
  footerCopyright: {
    color: "#555555",
    fontSize: 8,
    marginTop: 20,
    letterSpacing: 0.5,
  },
});
