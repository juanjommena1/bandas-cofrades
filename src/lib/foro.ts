import { modoDemo } from "./supabase/config";
import { crearClienteServidor } from "./supabase/server";

export interface Perfil {
  id: string;
  apodo: string;
  es_moderador: boolean;
  bloqueado: boolean;
}

export interface Autor {
  apodo: string;
  es_moderador: boolean;
}

export interface Tema {
  id: number;
  /** null = foro general */
  banda_slug: string | null;
  autor_id: string;
  titulo: string;
  cuerpo: string;
  oculto: boolean;
  cerrado: boolean;
  fijado: boolean;
  num_respuestas: number;
  ultima_actividad: string;
  creado_en: string;
  autor: Autor | null;
}

export interface Mensaje {
  id: number;
  tema_id: number;
  autor_id: string;
  cuerpo: string;
  oculto: boolean;
  creado_en: string;
  autor: Autor | null;
}

export interface Denuncia {
  id: number;
  motivo: string | null;
  creado_en: string;
  tema: { id: number; titulo: string; cuerpo: string; autor_id: string; oculto: boolean } | null;
  mensaje: { id: number; tema_id: number; cuerpo: string; autor_id: string; oculto: boolean } | null;
}

export interface SesionForo {
  userId: string | null;
  perfil: Perfil | null;
}

const AUTOR = "autor:perfiles(apodo, es_moderador)";

/** Usuario conectado y su perfil del foro (apodo, moderador, bloqueado). */
export async function sesionForo(): Promise<SesionForo> {
  if (modoDemo) return { userId: null, perfil: null };
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, perfil: null };
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle<Perfil>();
  return { userId: user.id, perfil: perfil ?? null };
}

/** Temas de un foro: el general (bandaSlug = null) o el de una banda. Fijados primero. */
export async function listarTemas(bandaSlug: string | null, limite = 50): Promise<Tema[]> {
  if (modoDemo) return [];
  const supabase = await crearClienteServidor();
  let q = supabase.from("foro_temas").select(`*, ${AUTOR}`)
    .order("fijado", { ascending: false })
    .order("ultima_actividad", { ascending: false })
    .limit(limite);
  q = bandaSlug ? q.eq("banda_slug", bandaSlug) : q.is("banda_slug", null);
  const { data, error } = await q;
  if (error) {
    console.error("Foro no disponible (¿falta la migración 0004_foro.sql?)", error.message);
    return [];
  }
  return (data ?? []) as Tema[];
}

/** Últimos temas abiertos en los foros de las bandas, con el nombre de cada banda. */
export async function ultimosTemasDeBandas(limite = 8): Promise<(Tema & { banda_nombre: string })[]> {
  if (modoDemo) return [];
  const supabase = await crearClienteServidor();
  const { data, error } = await supabase.from("foro_temas").select(`*, ${AUTOR}, banda:bandas(nombre)`)
    .not("banda_slug", "is", null)
    .order("ultima_actividad", { ascending: false })
    .limit(limite);
  if (error) return [];
  return (data ?? []).map((t) => ({ ...(t as Tema), banda_nombre: (t.banda as { nombre: string } | null)?.nombre ?? "" }));
}

export async function obtenerTema(id: number): Promise<{ tema: Tema; mensajes: Mensaje[] } | null> {
  if (modoDemo || !Number.isSafeInteger(id)) return null;
  const supabase = await crearClienteServidor();
  const { data: tema } = await supabase.from("foro_temas").select(`*, ${AUTOR}`).eq("id", id).maybeSingle();
  if (!tema) return null;
  const { data: mensajes } = await supabase.from("foro_mensajes").select(`*, ${AUTOR}`)
    .eq("tema_id", id).order("creado_en").limit(1000);
  return { tema: tema as Tema, mensajes: (mensajes ?? []) as Mensaje[] };
}

/** ¿Puede el usuario moderar este foro? (moderador general o dueño de la banda) */
export async function puedeModerar(bandaSlug: string | null): Promise<boolean> {
  if (modoDemo) return false;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.rpc("puede_moderar", { p_slug: bandaSlug });
  return data === true;
}

export async function listarDenunciasPendientes(): Promise<Denuncia[]> {
  if (modoDemo) return [];
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("foro_denuncias")
    .select("id, motivo, creado_en, tema:foro_temas(id, titulo, cuerpo, autor_id, oculto), mensaje:foro_mensajes(id, tema_id, cuerpo, autor_id, oculto)")
    .eq("resuelta", false)
    .order("creado_en", { ascending: false })
    .limit(200);
  return (data ?? []) as unknown as Denuncia[];
}

export async function listarBloqueados(): Promise<Perfil[]> {
  if (modoDemo) return [];
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("perfiles").select("*").eq("bloqueado", true).order("apodo");
  return (data ?? []) as Perfil[];
}

export async function apodosDe(ids: string[]): Promise<Record<string, string>> {
  if (modoDemo || ids.length === 0) return {};
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("perfiles").select("id, apodo").in("id", ids);
  return Object.fromEntries((data ?? []).map((p) => [p.id, p.apodo]));
}

const FORMATO_FECHA = new Intl.DateTimeFormat("es-ES", {
  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid",
});

export function fechaForo(iso: string): string {
  return FORMATO_FECHA.format(new Date(iso));
}

/** Ruta del foro donde vive un tema. */
export function rutaForo(bandaSlug: string | null): string {
  return bandaSlug ? `/bandas/${bandaSlug}/foro` : "/foro";
}

/** Solo rutas internas, para no redirigir fuera de la web tras entrar. */
export function rutaSegura(ruta: string | null | undefined, porDefecto = "/"): string {
  return ruta && ruta.startsWith("/") && !ruta.startsWith("//") && !ruta.includes("\\") ? ruta : porDefecto;
}
