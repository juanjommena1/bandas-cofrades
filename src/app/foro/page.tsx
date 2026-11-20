import Link from "next/link";
import Avisos from "@/components/foro/Avisos";
import ListaTemas from "@/components/foro/ListaTemas";
import { BarraSesion, NuevoTema } from "@/components/foro/Publicar";
import { listarTemas, sesionForo, ultimosTemasDeBandas } from "@/lib/foro";

export const dynamic = "force-dynamic";
export const metadata = { title: "Foro · Bandas Cofrades" };

type Props = { searchParams: Promise<{ error?: string; ok?: string }> };

export default async function ForoGeneral({ searchParams }: Props) {
  const [{ error, ok }, sesion, temas, deBandas] = await Promise.all([
    searchParams, sesionForo(), listarTemas(null), ultimosTemasDeBandas(),
  ]);

  return (
    <div className="wrap pagina">
      <div className="barra">
        <div>
          <h1>Foro</h1>
          <p className="lead">Un sitio para hablar de bandas, marchas, salidas y todo lo cofrade. Cada banda tiene además su propio foro en su perfil.</p>
          <BarraSesion sesion={sesion} volverA="/foro" />
        </div>
        {sesion.perfil?.es_moderador && <Link className="boton sec" href="/foro/moderacion">Moderación</Link>}
      </div>
      <Avisos error={error} ok={ok} />
      <div className="perfil-cuerpo" style={{ paddingBlock: 0 }}>
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <section className="caja">
            <h2>Foro general</h2>
            <ListaTemas temas={temas} vacio="Todavía no hay temas. ¡Abre el primero!" />
          </section>
          <NuevoTema sesion={sesion} bandaSlug={null} />
        </div>
        <aside className="caja">
          <h2>Última actividad en las bandas</h2>
          <ListaTemas temas={deBandas} conBanda vacio="Aún no hay temas en los foros de las bandas. Entra en el perfil de una banda para abrir uno." />
        </aside>
      </div>
    </div>
  );
}
