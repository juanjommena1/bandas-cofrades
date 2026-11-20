import Link from "next/link";
import { redirect } from "next/navigation";
import Avisos from "@/components/foro/Avisos";
import { Bloquear, Moderar } from "@/components/foro/Moderacion";
import { apodosDe, fechaForo, listarBloqueados, listarDenunciasPendientes, sesionForo } from "@/lib/foro";
import { resolverDenuncia } from "../acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Moderación del foro · Bandas Cofrades" };

type Props = { searchParams: Promise<{ error?: string; ok?: string }> };

export default async function Moderacion({ searchParams }: Props) {
  const sesion = await sesionForo();
  if (!sesion.userId) redirect("/login?next=/foro/moderacion");
  if (!sesion.perfil?.es_moderador) redirect("/foro");

  const [{ error, ok }, denuncias, bloqueados] = await Promise.all([
    searchParams, listarDenunciasPendientes(), listarBloqueados(),
  ]);
  const autores = await apodosDe([...new Set(denuncias.map((d) => (d.tema ?? d.mensaje)?.autor_id).filter((x): x is string => !!x))]);
  const aqui = "/foro/moderacion";

  return (
    <div className="wrap pagina">
      <div>
        <Link className="volver-oscuro" href="/foro">← Foro</Link>
        <h1>Moderación del foro</h1>
        <p className="lead">Denuncias pendientes de revisar. Con 3 denuncias, un mensaje se oculta solo hasta que decidas.</p>
      </div>
      <Avisos error={error} ok={ok} />

      <section className="caja">
        <h2>Denuncias pendientes ({denuncias.length})</h2>
        {denuncias.length === 0 && <p className="nota">No hay nada pendiente.</p>}
        {denuncias.map((d) => {
          const item = d.tema ?? d.mensaje;
          if (!item) return null;
          const tipo = d.tema ? "tema" : "mensaje";
          const enlace = d.tema ? `/foro/tema/${d.tema.id}` : `/foro/tema/${d.mensaje!.tema_id}#m${d.mensaje!.id}`;
          return (
            <article key={d.id} className={`mensaje-mod${item.oculto ? " oculto" : ""}`}>
              <p className="firma">
                <strong>{autores[item.autor_id] ?? "Usuario"}</strong>
                <span>{tipo === "tema" ? "Tema" : "Respuesta"} denunciado el {fechaForo(d.creado_en)}</span>
                {item.oculto && <span className="etiqueta roja">Oculto</span>}
              </p>
              {d.tema && <p style={{ margin: 0, fontWeight: 600 }}>{d.tema.titulo}</p>}
              <p className="cuerpo recorte">{item.cuerpo}</p>
              {d.motivo && <p className="nota">Motivo: {d.motivo}</p>}
              <div className="pie-mensaje">
                <Link className="mini" href={enlace}>Ver en el foro</Link>
                <Moderar tipo={tipo} id={item.id} oculto={item.oculto} volver={aqui} />
                <form action={resolverDenuncia}>
                  <input type="hidden" name="id" value={d.id} />
                  <button className="mini" type="submit">Descartar denuncia</button>
                </form>
                <Bloquear usuario={item.autor_id} bloquear volver={aqui} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="caja">
        <h2>Usuarios bloqueados</h2>
        {bloqueados.length === 0 && <p className="nota">Ninguno.</p>}
        {bloqueados.map((p) => (
          <div key={p.id} className="pie-mensaje"><strong>{p.apodo}</strong><Bloquear usuario={p.id} bloquear={false} volver={aqui} /></div>
        ))}
      </section>
    </div>
  );
}
