import Link from "next/link";
import type { SesionForo } from "@/lib/foro";
import { modoDemo } from "@/lib/supabase/config";
import { crearTema, responder, salirForo } from "@/app/foro/acciones";

/**
 * Muestra el formulario solo si el usuario puede publicar; si no, le dice qué le falta
 * (entrar con su correo, elegir apodo...).
 */
function Acceso({ sesion, volverA, children }: { sesion: SesionForo; volverA: string; children: React.ReactNode }) {
  if (modoDemo) return <p className="nota">El foro se activará al conectar la base de datos.</p>;
  if (!sesion.userId) {
    return (
      <p className="nota">
        <Link className="boton sec" href={`/login?next=${encodeURIComponent(volverA)}`}>Entrar para participar</Link>
        {" "}Crea una cuenta con tu correo en un momento.
      </p>
    );
  }
  if (!sesion.perfil) {
    return (
      <p className="nota">
        <Link className="boton sec" href={`/cuenta?next=${encodeURIComponent(volverA)}`}>Elige tu apodo</Link>
        {" "}Es el nombre que verán los demás. Tu correo nunca se muestra.
      </p>
    );
  }
  if (sesion.perfil.bloqueado) return <p className="error">Tu cuenta está bloqueada en el foro y no puedes publicar.</p>;
  return <>{children}</>;
}

export function NuevoTema({ sesion, bandaSlug }: { sesion: SesionForo; bandaSlug: string | null }) {
  const volverA = bandaSlug ? `/bandas/${bandaSlug}/foro` : "/foro";
  return (
    <section className="caja">
      <h2>Abrir un tema</h2>
      <Acceso sesion={sesion} volverA={volverA}>
        <form action={crearTema} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="banda_slug" value={bandaSlug ?? ""} />
          <label>Título<input name="titulo" required minLength={3} maxLength={120} /></label>
          <label>Mensaje<textarea name="cuerpo" required maxLength={5000} rows={5} /></label>
          <p className="nota">Publicas como <strong>{sesion.perfil?.apodo}</strong>. Respeta a los demás: los mensajes ofensivos se ocultan.</p>
          <button className="boton" type="submit">Publicar tema</button>
        </form>
      </Acceso>
    </section>
  );
}

export function Responder({ sesion, temaId, cerrado }: { sesion: SesionForo; temaId: number; cerrado: boolean }) {
  if (cerrado) return <p className="nota">Este tema está cerrado y no admite más respuestas.</p>;
  return (
    <section className="caja" id="final">
      <h2>Responder</h2>
      <Acceso sesion={sesion} volverA={`/foro/tema/${temaId}`}>
        <form action={responder} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="tema_id" value={temaId} />
          <label><span className="sr">Tu respuesta</span><textarea name="cuerpo" required maxLength={5000} rows={4} /></label>
          <button className="boton" type="submit">Enviar respuesta</button>
        </form>
      </Acceso>
    </section>
  );
}

/** "Conectado como X · Cambiar apodo · Salir", o enlace para entrar. */
export function BarraSesion({ sesion, volverA }: { sesion: SesionForo; volverA: string }) {
  if (modoDemo) return null;
  if (!sesion.userId) {
    return <p className="nota barra-sesion"><Link href={`/login?next=${encodeURIComponent(volverA)}`}>Entrar</Link> para escribir en el foro.</p>;
  }
  return (
    <div className="nota barra-sesion">
      {sesion.perfil ? <>Conectado como <strong>{sesion.perfil.apodo}</strong></> : "Conectado"}
      {" · "}
      <Link href={`/cuenta?next=${encodeURIComponent(volverA)}`}>{sesion.perfil ? "Cambiar apodo" : "Elegir apodo"}</Link>
      {" · "}
      <form action={salirForo} style={{ display: "inline" }}><button type="submit" className="enlace">Salir</button></form>
    </div>
  );
}
