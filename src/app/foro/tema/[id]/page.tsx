import Link from "next/link";
import { notFound } from "next/navigation";
import Avisos from "@/components/foro/Avisos";
import { Etiquetas } from "@/components/foro/ListaTemas";
import { Bloquear, Denunciar, Moderar } from "@/components/foro/Moderacion";
import { Responder } from "@/components/foro/Publicar";
import { obtenerBanda } from "@/lib/datos";
import { fechaForo, obtenerTema, puedeModerar, rutaForo, sesionForo, type Autor } from "@/lib/foro";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; ok?: string }> };

export async function generateMetadata({ params }: Props) {
  const r = await obtenerTema(Number((await params).id));
  return { title: r ? `${r.tema.titulo} · Foro` : "Tema no encontrado" };
}

function Firma({ autor, fecha }: { autor: Autor | null; fecha: string }) {
  return (
    <p className="firma">
      <strong>{autor?.apodo ?? "Usuario"}</strong>
      {autor?.es_moderador && <span className="etiqueta oro">Moderador</span>}
      <span>{fechaForo(fecha)}</span>
    </p>
  );
}

export default async function TemaForo({ params, searchParams }: Props) {
  const id = Number((await params).id);
  const r = await obtenerTema(id);
  if (!r) notFound();
  const { tema, mensajes } = r;
  const [{ error, ok }, sesion, moderador, banda] = await Promise.all([
    searchParams, sesionForo(), puedeModerar(tema.banda_slug),
    tema.banda_slug ? obtenerBanda(tema.banda_slug) : null,
  ]);
  const aqui = `/foro/tema/${id}`;
  const esModeradorGeneral = sesion.perfil?.es_moderador === true;
  const puedeDenunciar = !!sesion.perfil && !sesion.perfil.bloqueado;

  const herramientas = (tipo: "tema" | "mensaje", item: { id: number; autor_id: string; oculto: boolean }) => (
    <div className="pie-mensaje">
      {puedeDenunciar && item.autor_id !== sesion.userId && <Denunciar tipo={tipo} id={item.id} volver={aqui} />}
      {moderador && (
        <Moderar tipo={tipo} id={item.id} oculto={item.oculto} volver={aqui}
          cerrado={tipo === "tema" ? tema.cerrado : undefined} fijado={tipo === "tema" ? tema.fijado : undefined} />
      )}
      {esModeradorGeneral && item.autor_id !== sesion.userId && <Bloquear usuario={item.autor_id} bloquear volver={aqui} />}
    </div>
  );

  return (
    <div className="wrap pagina tema-pagina">
      <div>
        <Link className="volver-oscuro" href={rutaForo(tema.banda_slug)}>
          ← {banda ? `Foro de ${banda.banda.nombre}` : "Foro general"}
        </Link>
        <h1><Etiquetas tema={tema} />{tema.titulo}</h1>
      </div>
      <Avisos error={error} ok={ok} />

      <article className={`caja mensaje${tema.oculto ? " oculto" : ""}`}>
        <Firma autor={tema.autor} fecha={tema.creado_en} />
        {tema.oculto && <p className="nota">Tema oculto: solo lo ven su autor y los moderadores.</p>}
        <p className="cuerpo">{tema.cuerpo}</p>
        {herramientas("tema", tema)}
      </article>

      {mensajes.map((m) => (
        <article key={m.id} id={`m${m.id}`} className={`caja mensaje${m.oculto ? " oculto" : ""}`}>
          <Firma autor={m.autor} fecha={m.creado_en} />
          {m.oculto && <p className="nota">Respuesta oculta: solo la ven su autor y los moderadores.</p>}
          <p className="cuerpo">{m.cuerpo}</p>
          {herramientas("mensaje", m)}
        </article>
      ))}

      <Responder sesion={sesion} temaId={id} cerrado={tema.cerrado} />
    </div>
  );
}
