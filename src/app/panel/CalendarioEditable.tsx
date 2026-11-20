"use client";

import { useOptimistic, useTransition, useState } from "react";
import { estadoCelda, fechaCorta, TEXTO } from "@/components/Calendario";
import { FRANJAS, SEMANA_SANTA_2027, type Disponibilidad, type EstadoFranja, type Franja } from "@/lib/tipos";
import { cambiarFranja } from "./acciones";

const SIGUIENTE = { libre: "ocupado", ocupado: null, sin_confirmar: "libre" } as const;

export default function CalendarioEditable({ bandaId, disponibilidad }: { bandaId: string; disponibilidad: Disponibilidad[] }) {
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimista, aplicar] = useOptimistic(
    disponibilidad,
    (actual, c: { fecha: string; franja: Franja; estado: EstadoFranja | null }) => {
      const resto = actual.filter((d) => !(d.fecha === c.fecha && d.franja === c.franja));
      return c.estado ? [...resto, { banda_id: bandaId, fecha: c.fecha, franja: c.franja, estado: c.estado }] : resto;
    },
  );

  function pulsar(fecha: string, franja: Franja) {
    const estado = SIGUIENTE[estadoCelda(optimista, fecha, franja)];
    setError(null);
    startTransition(async () => {
      aplicar({ fecha, franja, estado });
      try {
        await cambiarFranja(fecha, franja, estado);
      } catch {
        setError("No se pudo guardar el cambio. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <>
      <div className="tabla">
        <table>
          <thead>
            <tr><th style={{ textAlign: "left" }}>Día</th>{Object.values(FRANJAS).map((f) => <th key={f}>{f}</th>)}</tr>
          </thead>
          <tbody>
            {SEMANA_SANTA_2027.map((d) => (
              <tr key={d.fecha}>
                <td className="nombre-dia">{d.nombre}<small>{fechaCorta(d.fecha)}</small></td>
                {(Object.keys(FRANJAS) as Franja[]).map((f) => {
                  const e = estadoCelda(optimista, d.fecha, f);
                  return (
                    <td key={f}>
                      <button type="button" className={`franja ${e}`} onClick={() => pulsar(d.fecha, f)}
                        aria-label={`${d.nombre}, ${FRANJAS[f]}: ${TEXTO[e]}. Pulsa para cambiar`}>
                        {TEXTO[e]}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {error && <p className="error">{error}</p>}
      <p className="nota">Pulsa una franja para cambiarla: Libre, Ocupada o Sin confirmar. Se guarda al momento.</p>
    </>
  );
}
