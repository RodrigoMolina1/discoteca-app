const API_URL = "http://10.0.2.2:3000";

export type Evento = {
  _id: string;
  nombre: string;
  fecha: string;
  horario: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  activo: boolean;
};

export async function obtenerEventos(): Promise<Evento[]> {
  const respuesta = await fetch(`${API_URL}/eventos`);

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los eventos");
  }

  return respuesta.json();
}

export async function obtenerEvento(id: string): Promise<Evento> {
  const respuesta = await fetch(`${API_URL}/eventos`);

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los eventos");
  }

  const eventos: Evento[] = await respuesta.json();
  const evento = eventos.find((item) => item._id === id);

  if (!evento) {
    throw new Error("No se encontró el evento");
  }

  return evento;
}
