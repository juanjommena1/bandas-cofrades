"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rutaForo, rutaSegura } from "@/lib/foro";
import { crearClienteServidor } from "@/lib/supabase/server";

const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();

/** Añade ?error=... (o ?ok=...) a una ruta interna. */
function conAviso(ruta: string, clave: "error" | "ok", valor: string) {
  const [base] = ruta.split(/[?#]/);
  return `${base}?${clave}=${valor}`;
}

async function usuario(volverA: string) {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(volverA)}`);
  return { supabase, user };
}

/** Errores de la base de datos traducidos a un código corto para la URL. */
function codigoError(error: { code?: string; hint?: string; message?: string }) {
  if (error.hint === "ritmo") return "ritmo";
  if (error.code === "23505") return "repetido";
  if (error.code === "42501") return "permiso";
  return "guardar";
}

export async function guardarApodo(formData: FormData) {
  const next = rutaSegura(txt(formData.get("next")), "/foro");
  const { supabase, user } = await usuario(`/cuenta?next=${encodeURIComponent(next)}`);
  const apodo = txt(formData.get("apodo")).replace(/\s+/g, " ");
  const volver = `/cuenta?next=${encodeURIComponent(next)}`;
  if (!/^[A-Za-zÀ-ÿ0-9 _.-]{3,30}$/.test(apodo)) redirect(`${volver}&error=apodo`);

  const { data: existente } = await supabase.from("perfiles").select("id").eq("id", user.id).maybeSingle();
  const { error } = existente
    ? await supabase.from("perfiles").update({ apodo }).eq("id", user.id)
    : await supabase.from("perfiles").insert({ id: user.id, apodo });
  if (error) redirect(`${volver}&error=${error.code === "23505" ? "ocupado" : "guardar"}`);
  redirect(next);
}

export async function crearTema(formData: FormData) {
  const bandaSlug = txt(formData.get("banda_slug")) || null;
  const foro = rutaForo(bandaSlug);
  const { supabase, user } = await usuario(foro);
  const titulo = txt(formData.get("titulo"));
  const cuerpo = txt(formData.get("cuerpo"));
  if (titulo.length < 3 || titulo.length > 120 || !cuerpo || cuerpo.length > 5000) {
    redirect(conAviso(foro, "error", "datos"));
  }
  const { data, error } = await supabase.from("foro_temas")
    .insert({ banda_slug: bandaSlug, autor_id: user.id, titulo, cuerpo })
    .select("id").single();
  if (error || !data) redirect(conAviso(foro, "error", error ? codigoError(error) : "guardar"));
  revalidatePath(foro);
  redirect(`/foro/tema/${data.id}`);
}

export async function responder(formData: FormData) {
  const temaId = Number(formData.get("tema_id"));
  const ruta = `/foro/tema/${temaId}`;
  const { supabase, user } = await usuario(ruta);
  const cuerpo = txt(formData.get("cuerpo"));
  if (!Number.isSafeInteger(temaId)) redirect("/foro");
  if (!cuerpo || cuerpo.length > 5000) redirect(conAviso(ruta, "error", "datos"));
  const { error } = await supabase.from("foro_mensajes").insert({ tema_id: temaId, autor_id: user.id, cuerpo });
  if (error) redirect(conAviso(ruta, "error", codigoError(error)));
  revalidatePath(ruta);
  redirect(`${ruta}#final`);
}

export async function denunciar(formData: FormData) {
  const tipo = txt(formData.get("tipo"));
  const id = Number(formData.get("id"));
  const ruta = rutaSegura(txt(formData.get("volver")), "/foro");
  const { supabase, user } = await usuario(ruta);
  if (!Number.isSafeInteger(id) || (tipo !== "tema" && tipo !== "mensaje")) redirect(ruta);
  const motivo = txt(formData.get("motivo")).slice(0, 300) || null;
  const { error } = await supabase.from("foro_denuncias").insert({
    [tipo === "tema" ? "tema_id" : "mensaje_id"]: id, denunciante_id: user.id, motivo,
  });
  // Denunciar dos veces lo mismo no es un error para el usuario.
  if (error && error.code !== "23505") redirect(conAviso(ruta, "error", codigoError(error)));
  redirect(conAviso(ruta, "ok", "denuncia"));
}

const ACCIONES = ["ocultar", "mostrar", "cerrar", "abrir", "fijar", "desfijar"];

export async function moderar(formData: FormData) {
  const tipo = txt(formData.get("tipo"));
  const id = Number(formData.get("id"));
  const accion = txt(formData.get("accion"));
  const ruta = rutaSegura(txt(formData.get("volver")), "/foro");
  const { supabase } = await usuario(ruta);
  if (!Number.isSafeInteger(id) || !ACCIONES.includes(accion)) redirect(ruta);
  const { error } = await supabase.rpc("foro_moderar", { p_tipo: tipo, p_id: id, p_accion: accion });
  if (error) redirect(conAviso(ruta, "error", "permiso"));
  revalidatePath(ruta);
  redirect(ruta);
}

export async function resolverDenuncia(formData: FormData) {
  const { supabase } = await usuario("/foro/moderacion");
  const id = Number(formData.get("id"));
  if (Number.isSafeInteger(id)) await supabase.rpc("foro_resolver_denuncia", { p_id: id });
  revalidatePath("/foro/moderacion");
  redirect("/foro/moderacion");
}

export async function bloquearUsuario(formData: FormData) {
  const ruta = rutaSegura(txt(formData.get("volver")), "/foro/moderacion");
  const { supabase } = await usuario(ruta);
  const usuarioId = txt(formData.get("usuario"));
  const bloquear = txt(formData.get("bloquear")) === "1";
  const { error } = await supabase.rpc("foro_bloquear_usuario", { p_usuario: usuarioId, p_bloquear: bloquear });
  if (error) redirect(conAviso(ruta, "error", "permiso"));
  revalidatePath(ruta);
  redirect(conAviso(ruta, "ok", bloquear ? "bloqueado" : "desbloqueado"));
}
