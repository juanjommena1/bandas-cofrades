"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";
import { FRANJAS, PROVINCIAS, TIPOS, type EstadoFranja, type Franja } from "@/lib/tipos";

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
}

const num = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim() || null;

async function usuario() {
  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function guardarPerfil(formData: FormData) {
  const { supabase, user } = await usuario();
  const nombre = txt(formData.get("nombre"));
  const tipo = String(formData.get("tipo"));
  const provincia = String(formData.get("provincia"));
  const localidad = txt(formData.get("localidad"));
  if (!nombre || !localidad || !(tipo in TIPOS) || !PROVINCIAS.includes(provincia)) {
    redirect("/panel?error=datos");
  }
  const datos = {
    nombre, tipo, provincia, localidad,
    musicos: num(formData.get("musicos")),
    precio_min: num(formData.get("precio_min")),
    precio_max: num(formData.get("precio_max")),
    telefono: txt(formData.get("telefono")),
    email: txt(formData.get("email")),
    repertorio: txt(formData.get("repertorio")),
    descripcion: txt(formData.get("descripcion")),
    ano_fundacion: num(formData.get("ano_fundacion")),
    web: txt(formData.get("web")),
    instagram: txt(formData.get("instagram")),
    facebook: txt(formData.get("facebook")),
    youtube: txt(formData.get("youtube")),
    actualizado_en: new Date().toISOString(),
  };
  const { data: existente } = await supabase.from("bandas").select("id").eq("owner_id", user.id).maybeSingle();
  const { error } = existente
    ? await supabase.from("bandas").update(datos).eq("id", existente.id)
    : await supabase.from("bandas").insert({
        ...datos, owner_id: user.id, slug: `${slugify(nombre)}-${user.id.slice(0, 6)}`,
      });
  if (error) redirect("/panel?error=guardar");
  revalidatePath("/panel");
  redirect("/panel?guardado=1");
}

/** Cambia una franja: libre → ocupada → sin confirmar → libre. */
export async function cambiarFranja(fecha: string, franja: Franja, estado: EstadoFranja | null) {
  const { supabase, user } = await usuario();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !(franja in FRANJAS)) throw new Error("Datos no válidos");
  const { data: banda } = await supabase.from("bandas").select("id").eq("owner_id", user.id).single();
  if (!banda) throw new Error("Primero crea el perfil de tu banda");
  const { error } = estado
    ? await supabase.from("disponibilidad").upsert({
        banda_id: banda.id, fecha, franja, estado, actualizado_en: new Date().toISOString(),
      })
    : await supabase.from("disponibilidad").delete().match({ banda_id: banda.id, fecha, franja });
  if (error) throw new Error("No se pudo guardar el cambio");
  revalidatePath("/panel");
}

export async function salir() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}
