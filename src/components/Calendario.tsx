import { FRANJAS, SEMANA_SANTA_2027, type Disponibilidad, type Franja } from "@/lib/tipos";

const TEXTO = { libre: "Libre", ocupado: "Ocupada", sin_confirmar: "Sin confirmar" } as const;

export function estadoCelda(disp: Disponibilidad[], fecha: string, franja: Franja) {
  return disp.find((d) => d.fecha === fecha && d.franja === franja)?.estado ?? "sin_confirmar";
}

/** Calendario de solo lectura de Semana Santa 2027, por franjas. */
export default function Calendario({ disponibilidad }: { disponibilidad: Disponibilidad[] }) {
  return (
    <div className="tabla">
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Día</th>
            {Object.values(FRANJAS).map((f) => <th key={f}>{f}</th>)}
          </tr>
        </thead>
        <tbody>
          {SEMANA_SANTA_2027.map((d) => (
            <tr key={d.fecha}>
              <td className="nombre-dia">{d.nombre}<small>{fechaCorta(d.fecha)}</small></td>
              {(Object.keys(FRANJAS) as Franja[]).map((f) => {
                const e = estadoCelda(disponibilidad, d.fecha, f);
                return <td key={f}><span className={`franja ${e}`}>{TEXTO[e]}</span></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function fechaCorta(fecha: string) {
  return new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export { TEXTO };
