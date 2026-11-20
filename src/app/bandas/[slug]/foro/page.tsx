import Link from "next/link";
import { notFound } from "next/navigation";
import Avisos from "@/components/foro/Avisos";
import ListaTemas from "@/components/foro/ListaTemas";
import { NuevoTema } from "@/components/foro/Publicar";
import { obtenerBanda } from "@/lib/datos";
import { listarTemas, sesionForo } from "@/lib/foro";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ error?: string; ok?: string }> };

export async function generateMetadata({ params }: Props) {
  const r = await obtenerBanda((await params).slug);
  return { title: r ? `Foro de ${r.banda.nombre} · Bandas Cofrades` : "Banda no encontrada" };
}

export default async function ForoBanda({ params, searchParams }: Props) {
  const { slug } = await params;
  const r = await obtenerBanda(slug);
  if (!r) notFound();
  const [{ error, ok }, sesion, temas] = await Promise.all([searchParams, sesionForo(), listarTemas(slug)]);

  return (
    <div className="wrap pagina">
      <div>
        <Link className="volver-oscuro" href={`/bandas/${slug}`}>← {r.banda.nombre}</Link>
        <h1>Foro de {r.banda.nombre}</h1>
        <p className="lead">Pregunta, comenta o comparte sobre esta banda. Para hablar de otros temas, usa el <Link href="/foro">foro general</Link>.</p>
      </div>
      <Avisos error={error} ok={ok} />
      <section className="caja">
        <ListaTemas temas={temas} vacio="Todavía no hay temas sobre esta banda. ¡Abre el primero!" />
      </section>
      <NuevoTema sesion={sesion} bandaSlug={slug} />
    </div>
  );
}
