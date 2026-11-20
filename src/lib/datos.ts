import bandasImportadas from "@/data/bandas.json";
import { modoDemo } from "./supabase/config";
import { crearClienteServidor } from "./supabase/server";
import type { Banda, Disponibilidad, EstadoFranja, Franja, TipoBanda } from "./tipos";

export interface FiltrosBusqueda {
  fecha: string;
  franja?: Franja;
  provincia?: string;
  tipo?: TipoBanda;
}

export type EstadoBusqueda = EstadoFranja | "sin_confirmar";

export interface ResultadoBusqueda {
  banda: Banda;
  estado: EstadoBusqueda;
}

/** Sin Supabase, el catálogo usa las bandas importadas en src/data/bandas.json. */
const bandasLocales = bandasImportadas as Banda[];

const ORDEN: Record<EstadoBusqueda, number> = { libre: 0, sin_confirmar: 1, ocupado: 2 };

/** Estado de una banda para una fecha (y franja, si se indica). */
export function estadoPara(disp: Disponibilidad[], fecha: string, franja?: Franja): EstadoBusqueda {
  const delDia = disp.filter((d) => d.fecha === fecha && (!franja || d.franja === franja));
  if (franja) return delDia[0]?.estado ?? "sin_confirmar";
  // Sin franja: libre si alguna franja está libre; ocupada si las tres están ocupadas.
  if (delDia.some((d) => d.estado === "libre")) return "libre";
  if (delDia.filter((d) => d.estado === "ocupado").length === 3) return "ocupado";
  return "sin_confirmar";
}

export async function buscarBandas(f: FiltrosBusqueda): Promise<ResultadoBusqueda[]> {
  let bandas: Banda[];
  let disp: Disponibilidad[];

  if (modoDemo) {
    bandas = bandasLocales;
    disp = [];
  } else {
    const supabase = await crearClienteServidor();
    let q = supabase.from("bandas").select("*").order("nombre");
    if (f.provincia) q = q.eq("provincia", f.provincia);
    if (f.tipo) q = q.eq("tipo", f.tipo);
    const { data: b, error } = await q;
    if (error) throw error;
    bandas = b ?? [];
    const ids = bandas.map((x) => x.id);
    if (ids.length === 0) return [];
    const { data: d, error: e2 } = await supabase
      .from("disponibilidad").select("*").eq("fecha", f.fecha).in("banda_id", ids);
    if (e2) throw e2;
    disp = d ?? [];
  }

  return bandas
    .filter((b) => (!f.provincia || b.provincia === f.provincia) && (!f.tipo || b.tipo === f.tipo))
    .map((banda) => ({
      banda,
      estado: estadoPara(disp.filter((d) => d.banda_id === banda.id), f.fecha, f.franja),
    }))
    .sort((a, b) => ORDEN[a.estado] - ORDEN[b.estado] || a.banda.nombre.localeCompare(b.banda.nombre, "es"));
}

export async function obtenerBanda(slug: string): Promise<{ banda: Banda; disponibilidad: Disponibilidad[] } | null> {
  if (modoDemo) {
    const banda = bandasLocales.find((b) => b.slug === slug);
    if (!banda) return null;
    return { banda, disponibilidad: [] };
  }
  const supabase = await crearClienteServidor();
  const { data: banda } = await supabase.from("bandas").select("*").eq("slug", slug).maybeSingle();
  if (!banda) return null;
  const { data: disponibilidad } = await supabase.from("disponibilidad").select("*").eq("banda_id", banda.id);
  return { banda, disponibilidad: disponibilidad ?? [] };
}

export interface FiltrosCatalogo {
  q?: string;
  provincia?: string;
  tipo?: TipoBanda;
  /** Incluir bandas marcadas como extintas. */
  extintas?: boolean;
}

const normalizar = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Catálogo de bandas con búsqueda por texto, provincia y tipo. */
export async function listarBandas(f: FiltrosCatalogo): Promise<Banda[]> {
  let bandas: Banda[];
  if (modoDemo) {
    bandas = bandasLocales;
  } else {
    const supabase = await crearClienteServidor();
    let q = supabase.from("bandas").select("*").order("nombre").limit(5000);
    if (f.provincia) q = q.eq("provincia", f.provincia);
    if (f.tipo) q = q.eq("tipo", f.tipo);
    if (!f.extintas) q = q.neq("estado", "Extinta");
    if (f.q) q = q.or(`nombre.ilike.%${f.q.replace(/[%,()]/g, "")}%,localidad.ilike.%${f.q.replace(/[%,()]/g, "")}%`);
    const { data, error } = await q;
    if (error) throw error;
    bandas = data ?? [];
  }
  const texto = f.q ? normalizar(f.q) : "";
  return bandas
    .filter((b) => (!f.provincia || b.provincia === f.provincia) && (!f.tipo || b.tipo === f.tipo))
    .filter((b) => f.extintas || b.estado !== "Extinta")
    .filter((b) => !texto || normalizar(`${b.nombre} ${b.localidad}`).includes(texto))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
