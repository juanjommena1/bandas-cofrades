import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { rutaSegura } from "@/lib/foro";
import { modoDemo } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

async function enviarEnlace(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  const next = rutaSegura(String(formData.get("next") ?? ""), "/panel");
  const volver = `/login?next=${encodeURIComponent(next)}`;
  if (!email) redirect(`${volver}&error=email`);
  const h = await headers();
  const origen = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origen}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  redirect(`${volver}&${error ? "error=envio" : "enviado=1"}`);
}

type Props = { searchParams: Promise<{ enviado?: string; error?: string; next?: string }> };

export default async function Login({ searchParams }: Props) {
  const { enviado, error, next } = await searchParams;
  const destino = rutaSegura(next, "/panel");
  const alForo = destino.startsWith("/foro") || destino.startsWith("/cuenta") || destino.endsWith("/foro");
  return (
    <div className="wrap pagina">
    <section className="caja" style={{ maxWidth: 480 }}>
      <h1>{alForo ? "Entra para participar en el foro" : "Entra en el panel de tu banda"}</h1>
      <p className="nota">Te enviamos un enlace a tu correo. Sin contraseñas.</p>
      {modoDemo ? (
        <p className="error">El acceso necesita Supabase configurado (ver README).</p>
      ) : enviado ? (
        <p>Revisa tu correo y pulsa el enlace para entrar.</p>
      ) : (
        <form action={enviarEnlace} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" name="next" value={destino} />
          <label>Correo electrónico<input type="email" name="email" required autoComplete="email" /></label>
          {error && <p className="error">No se pudo enviar el enlace. Revisa el correo e inténtalo de nuevo.</p>}
          <button className="boton" type="submit">Enviarme el enlace</button>
        </form>
      )}
    </section>
    </div>
  );
}
