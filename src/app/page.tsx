import Link from "next/link";
import { fechaCorta } from "@/components/Calendario";
import { buscarBandas, type EstadoBusqueda } from "@/lib/datos";
import {
  FRANJAS, PROVINCIAS, SEMANA_SANTA_2027, TIPOS, nombreDia, precioTexto,
  type Franja, type TipoBanda,
} from "@/lib/tipos";

const ETIQUETA: Record<EstadoBusqueda, string> = { libre: "Libre", sin_confirmar: "Sin confirmar", ocupado: "Ocupada" };

type Params = Promise<{ fecha?: string; franja?: string; provincia?: string; tipo?: string }>;

export default async function Buscar({ searchParams }: { searchParams: Params }) {
  const p = await searchParams;
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(p.fecha ?? "") ? p.fecha! : "2027-03-25";
  const franja = p.franja && p.franja in FRANJAS ? (p.franja as Franja) : undefined;
  const tipo = p.tipo && p.tipo in TIPOS ? (p.tipo as TipoBanda) : undefined;
  const provincia = p.provincia && PROVINCIAS.includes(p.provincia) ? p.provincia : undefined;

  const resultados = await buscarBandas({ fecha, franja, provincia, tipo });
  const libres = resultados.filter((r) => r.estado === "libre").length;

  const enlaceDia = (f: string) => {
    const q = new URLSearchParams({ fecha: f });
    if (franja) q.set("franja", franja);
    if (provincia) q.set("provincia", provincia);
    if (tipo) q.set("tipo", tipo);
    return `/?${q}`;
  };

  return (
    <>
      <div>
        <h1>Encuentra banda para tu salida</h1>
        <p className="lead">Elige el día y la zona. Verás primero las bandas que han confirmado que tienen ese hueco libre.</p>
      </div>

      <section className="caja" aria-label="Buscador">
        <div className="dias" aria-label="Días de Semana Santa 2027">
          {SEMANA_SANTA_2027.map((d) => (
            <Link key={d.fecha} href={enlaceDia(d.fecha)} className="dia" aria-current={d.fecha === fecha}>
              {d.nombre.replace("Domingo de ", "")}<small>{fechaCorta(d.fecha).replace(" 2027", "")}</small>
            </Link>
          ))}
        </div>
        <form className="campos" action="/">
          <label>Fecha<input type="date" name="fecha" defaultValue={fecha} /></label>
          <label>Franja
            <select name="franja" defaultValue={franja ?? ""}>
              <option value="">Cualquiera</option>
              {Object.entries(FRANJAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label>Provincia
            <select name="provincia" defaultValue={provincia ?? ""}>
              <option value="">Todas</option>
              {PROVINCIAS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <label>Tipo de banda
            <select name="tipo" defaultValue={tipo ?? ""}>
              <option value="">Todos</option>
              {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <button className="boton" type="submit" style={{ alignSelf: "end" }}>Buscar</button>
        </form>
      </section>

      <p style={{ fontWeight: 600, margin: 0 }}>
        {libres} {libres === 1 ? "banda libre" : "bandas libres"} el {nombreDia(fecha)} ({fechaCorta(fecha)})
        {franja ? `, ${FRANJAS[franja].toLowerCase()}` : ""}
      </p>

      <div className="lista">
        {resultados.length === 0 && <div className="vacio">No hay bandas con estos filtros. Prueba otra provincia o tipo.</div>}
        {resultados.map(({ banda, estado }) => (
          <Link key={banda.id} className="tarjeta" href={`/bandas/${banda.slug}?fecha=${fecha}`}>
            <div>
              <h3>{banda.nombre}</h3>
              <div className="meta">
                {banda.localidad} ({banda.provincia})
                {banda.musicos ? ` · ${banda.musicos} músicos` : ""}
                {precioTexto(banda) ? ` · ${precioTexto(banda)}` : ""}
              </div>
              <span className="etiqueta">{TIPOS[banda.tipo]}</span>
            </div>
            <span className={`pill ${estado}`}>{ETIQUETA[estado]}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
