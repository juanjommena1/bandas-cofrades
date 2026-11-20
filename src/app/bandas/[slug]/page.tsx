import Link from "next/link";
import { notFound } from "next/navigation";
import Calendario from "@/components/Calendario";
import Icono from "@/components/Icono";
import { iniciales } from "@/components/TarjetaBanda";
import ListaTemas from "@/components/foro/ListaTemas";
import { obtenerBanda } from "@/lib/datos";
import { listarTemas } from "@/lib/foro";
import { TIPOS, precioTexto, type Banda } from "@/lib/tipos";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const r = await obtenerBanda((await params).slug);
  return { title: r ? `${r.banda.nombre} · Bandas Cofrades` : "Banda no encontrada" };
}

function enlaceRed(red: "instagram" | "facebook" | "youtube" | "web", valor: string) {
  if (/^https?:\/\//.test(valor)) return valor;
  const usuario = valor.replace(/^@/, "");
  return {
    instagram: `https://instagram.com/${usuario}`,
    facebook: `https://facebook.com/${usuario}`,
    youtube: usuario.startsWith("UC") ? `https://youtube.com/channel/${usuario}` : `https://youtube.com/@${usuario}`,
    web: `https://${valor}`,
  }[red];
}

const NOMBRE_RED = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", web: "Página web" };

export default async function PerfilBanda({ params }: Props) {
  const r = await obtenerBanda((await params).slug);
  if (!r) notFound();
  const { banda, disponibilidad } = r;
  const temasForo = await listarTemas(banda.slug, 5);

  const tel = banda.telefono?.replace(/\D/g, "");
  const texto = "Hola, somos una hermandad y nos gustaría pediros información para una salida procesional.";
  const whatsapp = tel ? `https://wa.me/${tel.startsWith("34") ? tel : "34" + tel}?text=${encodeURIComponent(texto)}` : null;
  const redes = (["instagram", "facebook", "youtube", "web"] as const).filter((x) => banda[x]);
  const stats: [string, string | number | null][] = [
    ["Fundada", banda.ano_fundacion],
    ["Estado", banda.estado ?? null],
    ["Músicos", banda.musicos],
    ["Precio orientativo", precioTexto(banda as Banda)],
  ];

  return (
    <>
      <section className={`perfil-portada tipo-${banda.tipo}`}>
        <div className="wrap">
          <Link className="volver" href="/">← Volver al catálogo</Link>
          <div className="perfil-cabeza">
            <span className="monograma">{iniciales(banda.nombre)}</span>
            <div>
              <h1>{banda.nombre}</h1>
              <p>{TIPOS[banda.tipo]} · <Icono nombre="pin" tam={15} />{banda.localidad}, {banda.provincia}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="wrap perfil-cuerpo">
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <section className="caja">
            <h2>Sobre la banda</h2>
            <div className="stats">
              {stats.filter(([, v]) => v != null).map(([k, v]) => (
                <div key={k} className="stat"><span>{k}</span><strong>{v}</strong></div>
              ))}
            </div>
            {banda.descripcion && <p style={{ margin: 0 }}>{banda.descripcion}</p>}
            {banda.hermandad && <p style={{ margin: 0 }}><strong>Hermandad:</strong> {banda.hermandad}</p>}
            {banda.repertorio && <p style={{ margin: 0 }}><strong>Repertorio:</strong> {banda.repertorio}</p>}
            {banda.fuente_url && (
              <p className="nota">
                Datos públicos tomados de <a href={banda.fuente_url} target="_blank" rel="noopener noreferrer">Musicofrades</a>.
                ¿Es tu banda? Entra en «Soy una banda» para completar o corregir el perfil.
              </p>
            )}
          </section>
          {disponibilidad.length > 0 && (
            <section className="caja">
              <h2>Disponibilidad Semana Santa 2027</h2>
              <Calendario disponibilidad={disponibilidad} />
            </section>
          )}
          <section className="caja">
            <div className="barra">
              <h2>Foro de la banda</h2>
              <Link className="boton sec" href={`/bandas/${banda.slug}/foro`}>Ir al foro →</Link>
            </div>
            <ListaTemas temas={temasForo} vacio="Nadie ha escrito todavía. Sé el primero en preguntar o comentar algo sobre esta banda." />
          </section>
        </div>

        <aside className="caja">
          <h2>Contactar</h2>
          {whatsapp && <a className="boton whatsapp" href={whatsapp} target="_blank" rel="noopener noreferrer"><Icono nombre="whatsapp" />Escribir por WhatsApp</a>}
          {banda.telefono && <a className="boton sec" href={`tel:${banda.telefono}`}><Icono nombre="telefono" />{banda.telefono}</a>}
          {banda.email && <a className="boton sec" href={`mailto:${banda.email}`}><Icono nombre="correo" />{banda.email}</a>}
          {!banda.telefono && !banda.email && (
            <p className="nota">
              Esta banda aún no ha añadido su contacto directo. Puedes escribirle por sus redes
              {banda.fuente_url && <> o ver su <a href={banda.fuente_url} target="_blank" rel="noopener noreferrer">ficha en Musicofrades</a></>}.
            </p>
          )}
          {redes.length > 0 && (
            <>
              <h2>Redes</h2>
              <div className="lista-redes">
                {redes.map((x) => (
                  <a key={x} href={enlaceRed(x, banda[x]!)} target="_blank" rel="noopener noreferrer">
                    <Icono nombre={x} />{NOMBRE_RED[x]}
                  </a>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
