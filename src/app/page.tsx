import Link from "next/link";
import Icono from "@/components/Icono";
import TarjetaBanda from "@/components/TarjetaBanda";
import { listarBandas } from "@/lib/datos";
import { PROVINCIAS, TIPOS, type TipoBanda } from "@/lib/tipos";

type Params = Promise<{ q?: string; provincia?: string; tipo?: string }>;

export default async function Catalogo({ searchParams }: { searchParams: Params }) {
  const p = await searchParams;
  const q = (p.q ?? "").trim().slice(0, 80) || undefined;
  const tipo = p.tipo && p.tipo in TIPOS ? (p.tipo as TipoBanda) : undefined;
  const provincia = p.provincia && PROVINCIAS.includes(p.provincia) ? p.provincia : undefined;

  const [bandas, todas] = await Promise.all([listarBandas({ q, provincia, tipo }), listarBandas({})]);
  const provinciasConBandas = new Set(todas.map((b) => b.provincia)).size;

  const enlaceTipo = (t?: TipoBanda) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (provincia) s.set("provincia", provincia);
    if (t) s.set("tipo", t);
    const qs = s.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <h1>Encuentra la <em>banda</em> para tu cofradía</h1>
          <p>Cornetas y tambores, agrupaciones musicales y bandas de música de toda Andalucía, con su historia, repertorio y contacto directo.</p>
          <form className="buscador" action="/" role="search">
            <label className="campo-texto">
              <Icono nombre="buscar" />
              <span className="sr">Buscar</span>
              <input type="search" name="q" defaultValue={q} placeholder="Nombre de la banda o localidad" aria-label="Nombre de la banda o localidad" />
            </label>
            <select name="provincia" defaultValue={provincia ?? ""} aria-label="Provincia">
              <option value="">Todas las provincias</option>
              {PROVINCIAS.map((x) => <option key={x}>{x}</option>)}
            </select>
            {tipo && <input type="hidden" name="tipo" value={tipo} />}
            <button className="boton oro" type="submit">Buscar</button>
          </form>
          <div className="cifras">
            <div><strong>{todas.length}</strong>bandas</div>
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
            {bandas.length} {bandas.length === 1 ? "banda" : "bandas"}
            {provincia ? ` en ${provincia}` : ""}{q ? ` para «${q}»` : ""}
          </p>
        </div>

        {bandas.length === 0 ? (
          <div className="vacio">No hay bandas con estos filtros. Prueba con otra provincia o quita la búsqueda.</div>
        ) : (
          <div className="rejilla">{bandas.map((b) => <TarjetaBanda key={b.id} banda={b} />)}</div>
        )}
      </div>
    </>
  );
}
