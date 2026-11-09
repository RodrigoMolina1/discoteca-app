const API_URL = "http://10.0.2.2:3000";

export interface UsuarioCliente {
  id: string;
  nombre: string;
  email: string;
}

interface RespuestaAuth {
  access_token: string;
  usuario: UsuarioCliente;
}

export async function iniciarSesionCliente(
  email: string,
  password: string,
): Promise<RespuestaAuth> {
  const respuesta = await fetch(`${API_URL}/auth/login-cliente`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      Array.isArray(datos.message)
        ? datos.message.join("\n")
        : datos.message || "No se pudo iniciar sesión",
    );
  }

  const SecureStore = await import("expo-secure-store");

  await SecureStore.setItemAsync("boliche_cliente_token", datos.access_token);
  await SecureStore.setItemAsync(
    "boliche_cliente_usuario",
    JSON.stringify(datos.usuario),
  );

  return datos;
}

export async function registrarCliente(
  nombre: string,
  email: string,
  password: string,
) {
  const respuesta = await fetch(`${API_URL}/auth/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      Array.isArray(datos.message)
        ? datos.message.join("\n")
        : datos.message || "No se pudo crear la cuenta",
    );
  }

  return datos;
}

export async function obtenerTokenCliente(): Promise<string | null> {
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync("boliche_cliente_token");
}

export async function obtenerUsuarioCliente(): Promise<UsuarioCliente | null> {
  const SecureStore = await import("expo-secure-store");
  const usuario = await SecureStore.getItemAsync("boliche_cliente_usuario");

  return usuario ? JSON.parse(usuario) : null;
}

export async function cerrarSesionCliente(): Promise<void> {
  const SecureStore = await import("expo-secure-store");

  await SecureStore.deleteItemAsync("boliche_cliente_token");
  await SecureStore.deleteItemAsync("boliche_cliente_usuario");
}
