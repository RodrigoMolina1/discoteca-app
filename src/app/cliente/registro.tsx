import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { registrarCliente } from "../../lib/auth";

const GOLD = "#D4AF37";
const BACKGROUND = "#090909";
const CARD = "#141414";

export default function RegistroCliente() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleRegistro = async () => {
    if (!nombre.trim() || !email.trim() || !password || !confirmarPassword) {
      Alert.alert("Atención", "Completá todos los campos.");
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 8 caracteres.",
      );
      return;
    }

    if (password !== confirmarPassword) {
      Alert.alert("Atención", "Las contraseñas no coinciden.");
      return;
    }

    try {
      setCargando(true);

      await registrarCliente(nombre, email, password);

      Alert.alert(
        "¡Cuenta creada!",
        "Tu cuenta se creó correctamente. Ahora podés iniciar sesión.",
        [
          {
            text: "Continuar",
            onPress: () => router.replace("/cliente/login" as any),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Error al crear la cuenta",
        error.message || "Ocurrió un problema. Intentá nuevamente.",
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.volver} onPress={() => router.back()}>
          <Text style={styles.volverTexto}>‹ Volver</Text>
        </TouchableOpacity>

        <View style={styles.contenido}>
          <Text style={styles.logo}>BOLICHE</Text>
          <Text style={styles.subtitulo}>NIGHTLIFE EXPERIENCE</Text>

          <View style={styles.linea} />

          <Text style={styles.titulo}>CREAR CUENTA</Text>

          <Text style={styles.descripcion}>
            Registrate para gestionar tus reservas y disfrutar de nuestros
            eventos.
          </Text>

          <View style={styles.formulario}>
            <Text style={styles.label}>NOMBRE COMPLETO</Text>

            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor="#777"
              value={nombre}
              onChangeText={setNombre}
              autoCapitalize="words"
            />

            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>

            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#777"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>CONTRASEÑA</Text>

            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#777"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <Text style={styles.label}>CONFIRMAR CONTRASEÑA</Text>

            <TextInput
              style={styles.input}
              placeholder="Repetí tu contraseña"
              placeholderTextColor="#777"
              value={confirmarPassword}
              onChangeText={setConfirmarPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.boton, cargando && styles.botonDeshabilitado]}
              onPress={handleRegistro}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color={BACKGROUND} />
              ) : (
                <Text style={styles.botonTexto}>REGISTRARME</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.pie}>¿Ya tenés una cuenta?</Text>

          <TouchableOpacity
            onPress={() => router.replace("/cliente/login" as any)}
          >
            <Text style={styles.registro}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 25,
  },
  volver: {
    position: "absolute",
    top: 55,
    left: 25,
    zIndex: 1,
  },
  volverTexto: {
    color: GOLD,
    fontSize: 16,
  },
  contenido: {
    width: "100%",
    alignItems: "center",
    marginTop: 65,
    paddingBottom: 30,
  },
  logo: {
    color: GOLD,
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: 6,
  },
  subtitulo: {
    color: "#999",
    fontSize: 10,
    letterSpacing: 4,
    marginTop: 8,
  },
  linea: {
    width: 55,
    height: 2,
    backgroundColor: GOLD,
    marginVertical: 30,
  },
  titulo: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  descripcion: {
    color: "#999",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 20,
    lineHeight: 20,
  },
  formulario: {
    width: "100%",
  },
  label: {
    color: GOLD,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 15,
  },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 16,
    color: "#fff",
    fontSize: 15,
  },
  boton: {
    backgroundColor: GOLD,
    padding: 17,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonTexto: {
    color: BACKGROUND,
    fontWeight: "bold",
    letterSpacing: 2,
    fontSize: 14,
  },
  pie: {
    color: "#999",
    fontSize: 13,
    marginTop: 30,
  },
  registro: {
    color: GOLD,
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 12,
  },
});
