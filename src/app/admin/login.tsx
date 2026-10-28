import { Stack, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const API_URL = "http://10.0.2.2:3000";

export default function AdminLoginScreen() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion() {
    if (!usuario.trim() || !password) {
      Alert.alert("Datos incompletos", "Ingresá el usuario y la contraseña.");
      return;
    }

    try {
      setCargando(true);

      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: usuario.trim(),
          password,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.message || "No se pudo iniciar sesión.");
      }

      if (!datos.access_token) {
        throw new Error("El servidor no devolvió el token.");
      }

      await SecureStore.setItemAsync("boliche_admin_token", datos.access_token);

      router.replace("/admin" as any);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Ocurrió un error inesperado.";

      Alert.alert("Error de acceso", mensaje);
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerShown: false,
        }}
      />

      <KeyboardAvoidingView
        style={styles.contenedor}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.contenido}>
          <Text style={styles.marca}>BOLICHE</Text>
          <View style={styles.lineaDorada} />

          <Text style={styles.titulo}>ADMINISTRACIÓN</Text>
          <Text style={styles.subtitulo}>
            Ingresá tus credenciales para continuar
          </Text>

          <View style={styles.formulario}>
            <Text style={styles.etiqueta}>USUARIO</Text>
            <TextInput
              style={styles.input}
              value={usuario}
              onChangeText={setUsuario}
              placeholder="Usuario administrador"
              placeholderTextColor="#777"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!cargando}
            />

            <Text style={styles.etiqueta}>CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              placeholderTextColor="#777"
              secureTextEntry
              autoCapitalize="none"
              editable={!cargando}
              onSubmitEditing={iniciarSesion}
              returnKeyType="go"
            />

            <TouchableOpacity
              style={[styles.boton, cargando && styles.botonDeshabilitado]}
              onPress={iniciarSesion}
              disabled={cargando}
              activeOpacity={0.8}
            >
              {cargando ? (
                <ActivityIndicator color="#090909" />
              ) : (
                <Text style={styles.textoBoton}>INICIAR SESIÓN</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonVolver}
              onPress={() => router.replace("/" as any)}
              disabled={cargando}
            >
              <Text style={styles.textoVolver}>VOLVER AL INICIO</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#090909",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  contenido: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  marca: {
    color: "#D4AF37",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 7,
    textAlign: "center",
  },
  lineaDorada: {
    width: 58,
    height: 2,
    backgroundColor: "#D4AF37",
    alignSelf: "center",
    marginTop: 18,
    marginBottom: 34,
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitulo: {
    color: "#999999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 34,
  },
  formulario: {
    width: "100%",
  },
  etiqueta: {
    color: "#D4AF37",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 9,
    marginTop: 18,
  },
  input: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
    color: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 15,
  },
  boton: {
    backgroundColor: "#D4AF37",
    borderRadius: 10,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  textoBoton: {
    color: "#090909",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  botonVolver: {
    alignItems: "center",
    paddingVertical: 20,
  },
  textoVolver: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
