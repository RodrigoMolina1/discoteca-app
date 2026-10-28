import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@boliche/reservas";

export type Reserva = {
  id: string;
  eventoId: string;
  eventoNombre: string;
  fecha: string;
  horario: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fechaCreacion: string;
};

export async function obtenerReservas(): Promise<Reserva[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);

    if (!data) return [];

    const reservas: unknown = JSON.parse(data);

    return Array.isArray(reservas) ? (reservas as Reserva[]) : [];
  } catch (error) {
    console.error("Error al cargar las reservas:", error);
    return [];
  }
}

export async function guardarReserva(reserva: Reserva): Promise<void> {
  const reservas = await obtenerReservas();

  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([reserva, ...reservas]),
  );
}

export async function eliminarReserva(id: string): Promise<void> {
  const reservas = await obtenerReservas();
  const actualizadas = reservas.filter((reserva) => reserva.id !== id);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
}
