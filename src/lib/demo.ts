import type { Banda, Disponibilidad, Franja } from "./tipos";

// Bandas inventadas para el modo demostración. No son bandas reales.
type Base = Pick<Banda, "slug" | "nombre" | "tipo" | "localidad" | "provincia" | "musicos" | "precio_min" | "precio_max" | "telefono" | "repertorio" | "ano_fundacion"> & Partial<Banda>;
const base: Base[] = [
  { slug: "bct-esperanza-ejemplo", nombre: "BCT Esperanza", tipo: "cornetas_tambores", localidad: "Salobreña", provincia: "Granada", musicos: 55, precio_min: 1800, precio_max: 2500, telefono: "600000101", repertorio: "Marchas clásicas de cornetas", ano_fundacion: 1994, instagram: "ejemplo" },
  { slug: "am-san-juan-ejemplo", nombre: "AM San Juan", tipo: "agrupacion_musical", localidad: "Almuñécar", provincia: "Granada", musicos: 70, precio_min: 3000, precio_max: 4000, telefono: "600000102", repertorio: "Marchas de agrupación, repertorio propio", ano_fundacion: 2003, instagram: "ejemplo", youtube: "ejemplo" },
  { slug: "banda-municipal-valle-ejemplo", nombre: "Banda Municipal del Valle", tipo: "banda_musica", localidad: "Vélez-Málaga", provincia: "Málaga", musicos: 62, precio_min: 4500, precio_max: 5500, telefono: "600000103", repertorio: "Marchas de palio", ano_fundacion: 1921, facebook: "ejemplo" },
  { slug: "bct-cristo-fe-ejemplo", nombre: "BCT Cristo de la Fe", tipo: "cornetas_tambores", localidad: "Nerja", provincia: "Málaga", musicos: 48, precio_min: 1500, precio_max: 2200, telefono: "600000104", repertorio: "Cornetas, estilo malagueño", ano_fundacion: 1988 },
  { slug: "am-virgen-mar-ejemplo", nombre: "AM Virgen del Mar", tipo: "agrupacion_musical", localidad: "Adra", provincia: "Almería", musicos: 65, precio_min: 2800, precio_max: 3600, telefono: "600000105", repertorio: "Repertorio clásico y moderno", ano_fundacion: 2009, instagram: "ejemplo" },
  { slug: "bct-humildad-ejemplo", nombre: "BCT Humildad", tipo: "cornetas_tambores", localidad: "Motril", provincia: "Granada", musicos: 42, precio_min: 1400, precio_max: 2000, telefono: "600000107", repertorio: "Marchas clásicas", ano_fundacion: 2011 },
  { slug: "filarmonica-accitana-ejemplo", nombre: "Filarmónica Accitana", tipo: "banda_musica", localidad: "Guadix", provincia: "Granada", musicos: 58, precio_min: 4000, precio_max: 5000, telefono: "600000106", repertorio: "Palio y conciertos de marchas", ano_fundacion: 1897, youtube: "ejemplo" },
  { slug: "banda-juvenil-roquetas-ejemplo", nombre: "Banda Juvenil de Roquetas", tipo: "banda_musica", localidad: "Roquetas de Mar", provincia: "Almería", musicos: 40, precio_min: 2500, precio_max: 3200, telefono: "600000108", repertorio: "Palio, repertorio sencillo", ano_fundacion: 2015 },
  { slug: "am-santa-cruz-ejemplo", nombre: "AM Santa Cruz", tipo: "agrupacion_musical", localidad: "Écija", provincia: "Sevilla", musicos: 80, precio_min: 3500, precio_max: 4500, telefono: "600000109", repertorio: "Agrupación, estilo sevillano", ano_fundacion: 1999, instagram: "ejemplo", facebook: "ejemplo" },
  { slug: "bct-tres-caminos-ejemplo", nombre: "BCT Tres Caminos", tipo: "cornetas_tambores", localidad: "Lucena", provincia: "Córdoba", musicos: 60, precio_min: 2000, precio_max: 2800, telefono: "600000110", repertorio: "Cornetas, marchas de nueva creación", ano_fundacion: 1985 },
  { slug: "banda-santa-cecilia-ejemplo", nombre: "Banda Santa Cecilia", tipo: "banda_musica", localidad: "Andújar", provincia: "Jaén", musicos: 66, precio_min: 4200, precio_max: 5200, telefono: "600000111", repertorio: "Palio, repertorio clásico", ano_fundacion: 1932 },
  { slug: "am-la-salud-ejemplo", nombre: "AM La Salud", tipo: "agrupacion_musical", localidad: "Lepe", provincia: "Huelva", musicos: 54, precio_min: 2600, precio_max: 3400, telefono: "600000112", repertorio: "Agrupación, marchas propias", ano_fundacion: 2006 },
];

export const demoBandas: Banda[] = base.map((b, i) => ({
  email: null, descripcion: null, web: null, instagram: null, facebook: null, youtube: null,
  ...b, nombre: `${b.nombre} (ejemplo)`, id: `demo-${i + 1}`,
}));

const marcar = (banda: number, fecha: string, franja: Franja, estado: "libre" | "ocupado"): Disponibilidad =>
  ({ banda_id: `demo-${banda}`, fecha, franja, estado });

export const demoDisponibilidad: Disponibilidad[] = [
  marcar(1, "2027-03-25", "noche", "ocupado"), marcar(1, "2027-03-25", "tarde", "libre"),
  marcar(2, "2027-03-25", "noche", "libre"), marcar(2, "2027-03-26", "tarde", "ocupado"),
  marcar(3, "2027-03-25", "noche", "libre"), marcar(3, "2027-03-26", "noche", "ocupado"),
  marcar(6, "2027-03-25", "noche", "libre"), marcar(6, "2027-03-26", "noche", "ocupado"),
];
