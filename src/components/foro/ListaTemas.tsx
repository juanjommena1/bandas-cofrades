import Link from "next/link";
import { fechaForo, type Tema } from "@/lib/foro";

export function Etiquetas({ tema }: { tema: Pick<Tema, "fijado" | "cerrado" | "oculto"> }) {
  return (
    <>
      {tema.fijado && <span className="etiqueta oro">Fijado</span>}
      {tema.cerrado && <span className="etiqueta">Cerrado</span>}
      {tema.oculto && <span className="etiqueta roja">Oculto</span>}
    </>
  );
}

export default function ListaTemas({ temas, vacio, conBanda }: {
  temas: (Tema & { banda_nombre?: string })[];
  vacio: string;
  /** Mostrar a qué banda pertenece cada tema. */
  conBanda?: boolean;
}) {
  if (temas.length === 0) return <p className="vacio">{vacio}</p>;
  return (
    <ul className="lista-temas">
      {temas.map((t) => (
        <li key={t.id}>
          <Link href={`/foro/tema/${t.id}`} className="tema-fila">
            <span className="tema-titulo">
              <Etiquetas tema={t} />
              {t.titulo}
            </span>
            <span className="tema-meta">
              {conBanda && t.banda_nombre && <><strong>{t.banda_nombre}</strong> · </>}
              {t.autor?.apodo ?? "Usuario"} · {t.num_respuestas} {t.num_respuestas === 1 ? "respuesta" : "respuestas"} · {fechaForo(t.ultima_actividad)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
