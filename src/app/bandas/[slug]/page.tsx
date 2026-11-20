import Link from "next/link";
import { notFound } from "next/navigation";
import Calendario from "@/components/Calendario";
import { obtenerBanda } from "@/lib/datos";
import { TIPOS, nombreDia, precioTexto } from "@/lib/tipos";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ fecha?: string }> };

export async function generateMetadata({ params }: Props) {
  const r = await obtenerBanda((await params).slug);
  return { title: r ? `${r.banda.nombre} · Bandas Cofrades` : "Banda no encontrada" };
}

export default async function PerfilBanda({ params, searchParams }: Props) {
  const r = await obtenerBanda((await params).slug);
  if (!r) notFound();
  const { banda, disponibilidad } = r;
  const { fecha } = await searchParams;

  const tel = banda.telefono?.replace(/\D/g, "");
  const texto = `Hola, somos una hermandad y buscamos banda${fecha ? ` para el ${nombreDia(fecha)}` : ""}. ¿Tenéis disponibilidad?`;
  const whatsapp = tel ? `https://wa.me/${tel.startsWith("34") ? tel : "34" + tel}?text=${encodeURIComponent(texto)}` : null;

  return (
    <>
      <Link className="volver" href={fecha ? `/?fecha=${fecha}` : "/"}>← Volver a resultados</Link>
      <div className="perfil">
        <section className="caja">
          <div>
            <h1>{banda.nombre}</h1>
            <div className="meta">{TIPOS[banda.tipo]} · {banda.localidad} ({banda.provincia})</div>
          </div>
          {banda.descripcion && <p style={{ margin: 0 }}>{banda.descripcion}</p>}
          <h2>Disponibilidad Semana Santa 2027</h2>
          <Calendario disponibilidad={disponibilidad} />
        </section>
        <aside className="caja">
          <h2>Datos</h2>
          <dl>
            {banda.musicos && <><dt>Músicos</dt><dd>{banda.musicos}</dd></>}
            {precioTexto(banda) && <><dt>Precio orientativo</dt><dd>{precioTexto(banda)}</dd></>}
            {banda.repertorio && <><dt>Repertorio</dt><dd>{banda.repertorio}</dd></>}
          </dl>
          <h2>Contactar</h2>
          {whatsapp && <a className="boton" href={whatsapp} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>}
          {banda.telefono && <a className="boton sec" href={`tel:${banda.telefono}`}>Llamar: {banda.telefono}</a>}
          {banda.email && <a className="boton sec" href={`mailto:${banda.email}`}>{banda.email}</a>}
          {!banda.telefono && !banda.email && <p className="nota">Esta banda aún no ha añadido datos de contacto.</p>}
        </aside>
      </div>
    </>
  );
}
