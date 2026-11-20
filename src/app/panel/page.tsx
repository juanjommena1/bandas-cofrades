import Link from "next/link";
import { redirect } from "next/navigation";
import { modoDemo } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";
import { PROVINCIAS, TIPOS, type Banda, type Disponibilidad } from "@/lib/tipos";
import { guardarPerfil, salir } from "./acciones";
import CalendarioEditable from "./CalendarioEditable";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ guardado?: string; error?: string }> };

export default async function Panel({ searchParams }: Props) {
  if (modoDemo) {
    return (
      <div className="wrap pagina">
        <section className="caja">
          <h1>Panel de tu banda</h1>
          <p>En modo demostración el panel está desactivado. Para probarlo, configura Supabase siguiendo el README.</p>
          <Link className="boton sec" href="/">Volver al catálogo</Link>
        </section>
      </div>
    );
  }

  const supabase = await crearClienteServidor();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: banda } = await supabase.from("bandas").select("*").eq("owner_id", user.id).maybeSingle<Banda>();
  const { data: disp } = banda
    ? await supabase.from("disponibilidad").select("*").eq("banda_id", banda.id)
    : { data: [] as Disponibilidad[] };
  const { guardado, error } = await searchParams;

  return (
    <div className="wrap pagina">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <div>
          <h1>Panel de tu banda</h1>
          <p className="lead">{banda ? "Mantén tu calendario al día para que las hermandades te encuentren." : "Crea el perfil de tu banda para aparecer en el buscador."}</p>
        </div>
        <form action={salir}><button className="boton sec" type="submit">Salir</button></form>
      </div>

      <div className="perfil-cuerpo" style={{ paddingBlock: 0 }}>
        {banda && (
          <section className="caja">
            <h2>Calendario Semana Santa 2027</h2>
            <CalendarioEditable bandaId={banda.id} disponibilidad={disp ?? []} />
            <Link className="boton sec" href={`/bandas/${banda.slug}`}>Ver mi perfil público →</Link>
          </section>
        )}
        <section className="caja">
          <h2>{banda ? "Datos de la banda" : "Nueva banda"}</h2>
          {guardado && <p style={{ color: "var(--libre)", fontWeight: 600, margin: 0 }}>Cambios guardados.</p>}
          {error && <p className="error">{error === "datos" ? "Revisa nombre, tipo, provincia y localidad." : "No se pudieron guardar los cambios."}</p>}
          <form action={guardarPerfil} style={{ display: "grid", gap: 12 }}>
            <label>Nombre<input name="nombre" required defaultValue={banda?.nombre ?? ""} /></label>
            <label>Tipo
              <select name="tipo" required defaultValue={banda?.tipo ?? "cornetas_tambores"}>
                {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <div className="campos">
              <label>Localidad<input name="localidad" required defaultValue={banda?.localidad ?? ""} /></label>
              <label>Provincia
                <select name="provincia" required defaultValue={banda?.provincia ?? "Granada"}>
                  {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </label>
            </div>
            <div className="campos">
              <label>Músicos<input name="musicos" type="number" min={1} defaultValue={banda?.musicos ?? ""} /></label>
              <label>Precio desde (€)<input name="precio_min" type="number" min={0} step={100} defaultValue={banda?.precio_min ?? ""} /></label>
              <label>Precio hasta (€)<input name="precio_max" type="number" min={0} step={100} defaultValue={banda?.precio_max ?? ""} /></label>
            </div>
            <div className="campos">
              <label>Teléfono / WhatsApp<input name="telefono" type="tel" defaultValue={banda?.telefono ?? ""} /></label>
              <label>Correo de contacto<input name="email" type="email" defaultValue={banda?.email ?? ""} /></label>
            </div>
            <div className="campos">
              <label>Año de fundación<input name="ano_fundacion" type="number" min={1500} max={2100} defaultValue={banda?.ano_fundacion ?? ""} /></label>
              <label>Página web<input name="web" defaultValue={banda?.web ?? ""} /></label>
              <label>Escudo (enlace a la imagen)<input name="escudo_url" type="url" placeholder="https://..." defaultValue={banda?.escudo_url ?? ""} /></label>
            </div>
            <div className="campos">
              <label>Instagram<input name="instagram" placeholder="@usuario" defaultValue={banda?.instagram ?? ""} /></label>
              <label>Facebook<input name="facebook" defaultValue={banda?.facebook ?? ""} /></label>
              <label>YouTube<input name="youtube" defaultValue={banda?.youtube ?? ""} /></label>
            </div>
            <label>Repertorio<input name="repertorio" defaultValue={banda?.repertorio ?? ""} placeholder="Marchas clásicas, estilo..." /></label>
            <label>Presentación<textarea name="descripcion" rows={3} defaultValue={banda?.descripcion ?? ""} /></label>
            <button className="boton" type="submit">{banda ? "Guardar cambios" : "Crear perfil"}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
