import { obtenerTokenCliente } from "./auth";

const API_URL = "http://10.0.2.2:3000";

export interface ProductoBarra {
  _id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  activo: boolean;
}

export interface ItemCompraBarra {
  productoId: string;
  cantidad: number;
}

export interface CompraBarra {
  _id: string;
  usuarioId: string;
  items: {
    productoId: string;
    nombre: string;
    precioUnitario: number;
    cantidad: number;
    subtotal: number;
  }[];
  total: number;
  codigoQR: string;
  utilizada: boolean;
  fechaUtilizacion: string | null;
  createdAt: string;
}

async function obtenerMensajeError(respuesta: Response) {
  const datos = await respuesta.json().catch(() => ({}));

  return Array.isArray(datos.message)
    ? datos.message.join("\n")
    : datos.message || "Ocurrió un error al comunicarse con el servidor";
}

export async function obtenerProductosBarra(): Promise<ProductoBarra[]> {
  const respuesta = await fetch(`${API_URL}/barra/productos`);

  if (!respuesta.ok) {
    throw new Error(await obtenerMensajeError(respuesta));
  }

  return respuesta.json();
}

export async function crearCompraBarra(
  items: ItemCompraBarra[],
): Promise<CompraBarra> {
  const token = await obtenerTokenCliente();

  if (!token) {
    throw new Error("Debés iniciar sesión para realizar una compra");
  }

  const respuesta = await fetch(`${API_URL}/barra/compras`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!respuesta.ok) {
    throw new Error(await obtenerMensajeError(respuesta));
  }

  return respuesta.json();
}

export async function obtenerMisComprasBarra(): Promise<CompraBarra[]> {
  const token = await obtenerTokenCliente();

  if (!token) {
    throw new Error("Debés iniciar sesión para consultar tus compras");
  }

  const respuesta = await fetch(`${API_URL}/barra/mis-compras`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    throw new Error(await obtenerMensajeError(respuesta));
  }

  return respuesta.json();
}
