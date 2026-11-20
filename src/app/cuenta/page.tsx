import { redirect } from "next/navigation";
import { rutaSegura, sesionForo } from "@/lib/foro";
import { modoDemo } from "@/lib/supabase/config";
import { guardarApodo } from "../foro/acciones";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tu apodo · Bandas Cofrades" };

const ERRORES: Record<string, string> = {
  apodo: "El apodo debe tener entre 3 y 30 caracteres: letras, números, espacios, puntos o guiones.",
  ocupado: "Ese apodo ya lo usa otra persona. Prueba con otro.",
  guardar: "No se pudo guardar. Inténtalo de nuevo.",
};

type Props = { searchParams: Promise<{ next?: string; error?: string }> };

export default async function Cuenta({ searchParams }: Props) {
  const { next, error } = await searchParams;
  const destino = rutaSegura(next, "/foro");
  if (modoDemo) redirect("/foro");
  const sesion = await sesionForo();
  if (!sesion.userId) redirect(`/login?next=${encodeURIComponent(`/cuenta?next=${destino}`)}`);

  return (
    <div className="wrap pagina">
      <section className="caja" style={{ maxWidth: 480 }}>
        <h1>{sesion.perfil ? "Cambia tu apodo" : "Elige tu apodo"}</h1>
        <p className="nota">Es el nombre que verán los demás en el foro. Tu correo nunca se muestra.</p>
        <form action={guardarApodo} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="next" value={destino} />
          <label>Apodo<input name="apodo" required minLength={3} maxLength={30} defaultValue={sesion.perfil?.apodo ?? ""} autoComplete="nickname" /></label>
          {error && <p className="error">{ERRORES[error] ?? ERRORES.guardar}</p>}
          <button className="boton" type="submit">Guardar y continuar</button>
        </form>
      </section>
    </div>
  );
}
