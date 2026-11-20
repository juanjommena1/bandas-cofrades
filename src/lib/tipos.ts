export type TipoBanda = "cornetas_tambores" | "agrupacion_musical" | "banda_musica";
export type Franja = "manana" | "tarde" | "noche";
export type EstadoFranja = "libre" | "ocupado";

export interface Banda {
  id: string;
  slug: string;
  nombre: string;
  tipo: TipoBanda;
  localidad: string;
  provincia: string;
  musicos: number | null;
  precio_min: number | null;
  precio_max: number | null;
  telefono: string | null;
  email: string | null;
  repertorio: string | null;
  descripcion: string | null;
}

export interface Disponibilidad {
  banda_id: string;
  fecha: string; // YYYY-MM-DD
  franja: Franja;
  estado: EstadoFranja;
}

export const TIPOS: Record<TipoBanda, string> = {
  cornetas_tambores: "Cornetas y tambores",
  agrupacion_musical: "Agrupación musical",
  banda_musica: "Banda de música",
};

export const FRANJAS: Record<Franja, string> = {
  manana: "Mañana",
  tarde: "Tarde",
  noche: "Noche",
};

export const PROVINCIAS = [
  "Almería", "Cádiz", "Córdoba", "Granada", "Huelva", "Jaén", "Málaga", "Sevilla",
];

/** Días de Semana Santa 2027 (Domingo de Resurrección: 28 de marzo de 2027). */
export const SEMANA_SANTA_2027 = [
  { fecha: "2027-03-21", nombre: "Domingo de Ramos" },
  { fecha: "2027-03-22", nombre: "Lunes Santo" },
  { fecha: "2027-03-23", nombre: "Martes Santo" },
  { fecha: "2027-03-24", nombre: "Miércoles Santo" },
  { fecha: "2027-03-25", nombre: "Jueves Santo" },
  { fecha: "2027-03-26", nombre: "Viernes Santo" },
  { fecha: "2027-03-27", nombre: "Sábado Santo" },
  { fecha: "2027-03-28", nombre: "Domingo de Resurrección" },
];

export function nombreDia(fecha: string): string {
  const ss = SEMANA_SANTA_2027.find((d) => d.fecha === fecha);
  if (ss) return ss.nombre;
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long",
  });
}

export function precioTexto(b: Banda): string | null {
  const f = (n: number) => new Intl.NumberFormat("es-ES", { useGrouping: "always" }).format(n) + " €";
  if (b.precio_min != null && b.precio_max != null) return `${f(b.precio_min)} – ${f(b.precio_max)}`;
  if (b.precio_min != null) return `desde ${f(b.precio_min)}`;
  return null;
}
