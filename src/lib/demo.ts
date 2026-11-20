import type { Banda, Disponibilidad, Franja } from "./tipos";

// Bandas inventadas para el modo demostración. No son bandas reales.
const base: Omit<Banda, "id" | "email" | "descripcion">[] = [
  { slug: "bct-esperanza-ejemplo", nombre: "BCT Esperanza (ejemplo)", tipo: "cornetas_tambores", localidad: "Salobreña", provincia: "Granada", musicos: 55, precio_min: 1800, precio_max: 2500, telefono: "600000101", repertorio: "Marchas clásicas de cornetas" },
  { slug: "am-san-juan-ejemplo", nombre: "AM San Juan (ejemplo)", tipo: "agrupacion_musical", localidad: "Almuñécar", provincia: "Granada", musicos: 70, precio_min: 3000, precio_max: 4000, telefono: "600000102", repertorio: "Marchas de agrupación, repertorio propio" },
  { slug: "banda-municipal-valle-ejemplo", nombre: "Banda Municipal del Valle (ejemplo)", tipo: "banda_musica", localidad: "Vélez-Málaga", provincia: "Málaga", musicos: 62, precio_min: 4500, precio_max: 5500, telefono: "600000103", repertorio: "Marchas de palio" },
  { slug: "bct-cristo-fe-ejemplo", nombre: "BCT Cristo de la Fe (ejemplo)", tipo: "cornetas_tambores", localidad: "Nerja", provincia: "Málaga", musicos: 48, precio_min: 1500, precio_max: 2200, telefono: "600000104", repertorio: "Cornetas, estilo malagueño" },
  { slug: "am-virgen-mar-ejemplo", nombre: "AM Virgen del Mar (ejemplo)", tipo: "agrupacion_musical", localidad: "Adra", provincia: "Almería", musicos: 65, precio_min: 2800, precio_max: 3600, telefono: "600000105", repertorio: "Repertorio clásico y moderno" },
  { slug: "bct-humildad-ejemplo", nombre: "BCT Humildad (ejemplo)", tipo: "cornetas_tambores", localidad: "Motril", provincia: "Granada", musicos: 42, precio_min: 1400, precio_max: 2000, telefono: "600000107", repertorio: "Marchas clásicas" },
];

export const demoBandas: Banda[] = base.map((b, i) => ({
  ...b, id: `demo-${i + 1}`, email: null, descripcion: "Banda de ejemplo para probar la web.",
}));

const marcar = (banda: number, fecha: string, franja: Franja, estado: "libre" | "ocupado"): Disponibilidad =>
  ({ banda_id: `demo-${banda}`, fecha, franja, estado });

export const demoDisponibilidad: Disponibilidad[] = [
  marcar(1, "2027-03-25", "noche", "ocupado"), marcar(1, "2027-03-25", "tarde", "libre"), marcar(1, "2027-03-26", "tarde", "ocupado"),
  marcar(2, "2027-03-25", "noche", "libre"), marcar(2, "2027-03-26", "tarde", "ocupado"), marcar(2, "2027-03-26", "noche", "ocupado"),
  marcar(3, "2027-03-25", "manana", "ocupado"), marcar(3, "2027-03-25", "noche", "libre"), marcar(3, "2027-03-26", "noche", "ocupado"),
  marcar(4, "2027-03-25", "manana", "ocupado"), marcar(4, "2027-03-25", "noche", "libre"),
  marcar(5, "2027-03-25", "noche", "ocupado"), marcar(5, "2027-03-26", "tarde", "ocupado"),
  marcar(6, "2027-03-25", "manana", "ocupado"), marcar(6, "2027-03-25", "noche", "libre"), marcar(6, "2027-03-26", "noche", "ocupado"),
];
