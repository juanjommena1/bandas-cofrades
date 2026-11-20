import { bloquearUsuario, denunciar, moderar } from "@/app/foro/acciones";

function Boton({ tipo, id, accion, volver, children }: {
  tipo: "tema" | "mensaje"; id: number; accion: string; volver: string; children: React.ReactNode;
}) {
  return (
    <form action={moderar}>
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="accion" value={accion} />
      <input type="hidden" name="volver" value={volver} />
      <button className="mini" type="submit">{children}</button>
    </form>
  );
}

/** Botones de moderación de un tema o respuesta. */
export function Moderar({ tipo, id, oculto, cerrado, fijado, volver }: {
  tipo: "tema" | "mensaje"; id: number; oculto: boolean; cerrado?: boolean; fijado?: boolean; volver: string;
}) {
  return (
    <div className="acciones-mod">
      <Boton tipo={tipo} id={id} accion={oculto ? "mostrar" : "ocultar"} volver={volver}>{oculto ? "Volver a mostrar" : "Ocultar"}</Boton>
      {tipo === "tema" && (
        <>
          <Boton tipo={tipo} id={id} accion={cerrado ? "abrir" : "cerrar"} volver={volver}>{cerrado ? "Reabrir" : "Cerrar"}</Boton>
          <Boton tipo={tipo} id={id} accion={fijado ? "desfijar" : "fijar"} volver={volver}>{fijado ? "Desfijar" : "Fijar arriba"}</Boton>
        </>
      )}
    </div>
  );
}

export function Bloquear({ usuario, bloquear, volver }: { usuario: string; bloquear: boolean; volver: string }) {
  return (
    <form action={bloquearUsuario}>
      <input type="hidden" name="usuario" value={usuario} />
      <input type="hidden" name="bloquear" value={bloquear ? "1" : "0"} />
      <input type="hidden" name="volver" value={volver} />
      <button className="mini" type="submit">{bloquear ? "Bloquear usuario" : "Desbloquear"}</button>
    </form>
  );
}

/** Enlace desplegable para denunciar un tema o respuesta, con motivo opcional. */
export function Denunciar({ tipo, id, volver }: { tipo: "tema" | "mensaje"; id: number; volver: string }) {
  return (
    <details className="denunciar">
      <summary>Denunciar</summary>
      <form action={denunciar}>
        <input type="hidden" name="tipo" value={tipo} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="volver" value={volver} />
        <label><span className="sr">Motivo</span><input name="motivo" maxLength={300} placeholder="Motivo (opcional)" /></label>
        <button className="mini" type="submit">Enviar denuncia</button>
      </form>
    </details>
  );
}
