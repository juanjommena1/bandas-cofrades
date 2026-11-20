import Link from "next/link";
import Icono from "@/components/Icono";
import TarjetaBanda from "@/components/TarjetaBanda";
import { listarBandas } from "@/lib/datos";
import { PROVINCIAS, PROVINCIAS_ANDALUCIA, TIPOS, type TipoBanda } from "@/lib/tipos";

const POR_PAGINA = 48;

type Params = Promise<{ q?: string; provincia?: string; tipo?: string; pagina?: string; extintas?: string }>;

export default async function Catalogo({ searchParams }: { searchParams: Params }) {
  const p = await searchParams;
  const q = (p.q ?? "").trim().slice(0, 80) || undefined;
  const tipo = p.tipo && p.tipo in TIPOS ? (p.tipo as TipoBanda) : undefined;
  const provincia = p.provincia && PROVINCIAS.includes(p.provincia) ? p.provincia : undefined;
  const extintas = p.extintas === "1";

  const [bandas, todas] = await Promise.all([listarBandas({ q, provincia, tipo, extintas }), listarBandas({})]);
  const provinciasConBandas = new Set(todas.map((b) => b.provincia)).size;
  const paginas = Math.max(1, Math.ceil(bandas.length / POR_PAGINA));
  const pagina = Math.min(paginas, Math.max(1, parseInt(p.pagina ?? "1", 10) || 1));
  const visibles = bandas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const enlace = (cambios: { tipo?: TipoBanda | null; pagina?: number; extintas?: boolean }) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (provincia) s.set("provincia", provincia);
    const t = cambios.tipo === undefined ? tipo : cambios.tipo;
    if (t) s.set("tipo", t);
    if (cambios.extintas ?? extintas) s.set("extintas", "1");
    if (cambios.pagina && cambios.pagina > 1) s.set("pagina", String(cambios.pagina));
    const qs = s.toString();
    return qs ? `/?${qs}` : "/";
  };
  const enlaceTipo = (t?: TipoBanda) => enlace({ tipo: t ?? null });

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Encuentra la <em>banda</em> para tu cofradía</h1>
          <p>Cornetas y tambores, agrupaciones musicales y bandas de música de toda España, con su historia, redes y contacto directo.</p>
          <form className="buscador" action="/" role="search">
            <label className="campo-texto">
              <Icono nombre="buscar" />
              <span className="sr">Buscar</span>
              <input type="search" name="q" defaultValue={q} placeholder="Nombre de la banda o localidad" aria-label="Nombre de la banda o localidad" />
            </label>
            <select name="provincia" defaultValue={provincia ?? ""} aria-label="Provincia">
              <option value="">Toda España</option>
              <optgroup label="Andalucía">
                {PROVINCIAS_ANDALUCIA.map((x) => <option key={x}>{x}</option>)}
              </optgroup>
              <optgroup label="Resto de España">
                {PROVINCIAS.filter((x) => !PROVINCIAS_ANDALUCIA.includes(x)).map((x) => <option key={x}>{x}</option>)}
              </optgroup>
            </select>
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            {extintas && <input type="hidden" name="extintas" value="1" />}
            <button className="boton oro" type="submit">Buscar</button>
          </form>
          <div className="cifras">
            <div><strong>{todas.length.toLocaleString("es-ES", { useGrouping: "always" } as Intl.NumberFormatOptions)}</strong>bandas activas</div>
            <div><strong>{provinciasConBandas}</strong>provincias</div>
            <div><strong>3</strong>tipos de formación</div>
          </div>
        </div>
      </section>

      <div className="wrap contenido">
        <div className="barra">
          <nav className="chips" aria-label="Tipo de banda">
            <Link className="chip" href={enlaceTipo()} aria-current={!tipo}>Todas</Link>
            {(Object.keys(TIPOS) as TipoBanda[]).map((t) => (
              <Link key={t} className="chip" href={enlaceTipo(t)} aria-current={tipo === t}>{TIPOS[t]}</Link>
            ))}
          </nav>
          <p className="resultado">
            {bandas.length.toLocaleString("es-ES", { useGrouping: "always" } as Intl.NumberFormatOptions)} {bandas.length === 1 ? "banda" : "bandas"}
            {provincia ? ` en ${provincia}` : ""}{q ? ` para «${q}»` : ""}
            {" · "}
            <Link href={enlace({ extintas: !extintas, pagina: 1 })}>{extintas ? "Ocultar extintas" : "Incluir extintas"}</Link>
          </p>
        </div>

        {bandas.length === 0 ? (
          <div className="vacio">No hay bandas con estos filtros. Prueba con otra provincia o quita la búsqueda.</div>
        ) : (
          <div className="rejilla">{visibles.map((b) => <TarjetaBanda key={b.id} banda={b} />)}</div>
        )}

        {paginas > 1 && (
          <nav className="paginacion" aria-label="Páginas">
            {pagina > 1 ? <Link className="chip" href={enlace({ pagina: pagina - 1 })}>← Anterior</Link> : <span />}
            <span className="resultado">Página {pagina} de {paginas}</span>
            {pagina < paginas ? <Link className="chip" href={enlace({ pagina: pagina + 1 })}>Siguiente →</Link> : <span />}
          </nav>
        )}
      </div>
    </>
  );
}
