import { cookies, headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { rutaSegura } from "@/lib/foro";
import { modoDemo } from "@/lib/supabase/config";
import { crearClienteServidor } from "@/lib/supabase/server";

const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();

function datos(formData: FormData) {
  const next = rutaSegura(txt(formData.get("next")), "/panel");
  const modo = txt(formData.get("modo")) === "registro" ? "registro" : "entrar";
  return { next, modo, email: txt(formData.get("email")), volver: `/login?next=${encodeURIComponent(next)}&modo=${modo}` };
}

/** Entrar o crear cuenta con correo y contraseña (no envía correos si "Confirm email" está desactivado). */
async function conContrasena(formData: FormData) {
  "use server";
  const { next, modo, email, volver } = datos(formData);
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect(`${volver}&error=faltan`);
  if (password.length < 8) redirect(`${volver}&error=corta`);

  const supabase = await crearClienteServidor();
  if (modo === "registro") {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const codigo = error.code === "user_already_exists" ? "existe"
        : error.code === "weak_password" ? "corta"
        : error.code === "over_email_send_rate_limit" || error.status === 429 ? "limite" : "registro";
      redirect(`${volver}&error=${codigo}`);
    }
    // Si Supabase pide confirmar el correo, no hay sesión todavía.
    if (!data.session) redirect(`${volver}&enviado=confirmar`);
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect(`${volver}&error=${error.code === "email_not_confirmed" ? "sin_confirmar" : "credenciales"}`);
  }
  redirect(next);
}

/** Alternativa sin contraseña: enlace mágico al correo. */
async function enviarEnlace(formData: FormData) {
  "use server";
  const { next, email } = datos(formData);
  const volver = `/login?next=${encodeURIComponent(next)}&modo=enlace`;
  if (!email) redirect(`${volver}&error=faltan`);
  const h = await headers();
  const origen = h.get("origin") ?? `https://${h.get("host")}`;
  // Recordamos a dónde volver por si el enlace del correo no lo lleva.
  (await cookies()).set("volver", next, { path: "/", maxAge: 60 * 60, sameSite: "lax", httpOnly: true, secure: true });
  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origen}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) {
    const limite = error.code === "over_email_send_rate_limit" || error.status === 429;
    redirect(`${volver}&error=${limite ? "limite" : "envio"}`);
  }
  redirect(`${volver}&enviado=enlace`);
}

const ERRORES: Record<string, string> = {
  faltan: "Escribe tu correo y tu contraseña.",
  corta: "La contraseña debe tener al menos 8 caracteres.",
  existe: "Ya hay una cuenta con ese correo. Pulsa «Entrar» o usa el enlace al correo.",
  credenciales: "Correo o contraseña incorrectos. Si siempre entraste con enlace al correo, tu cuenta no tiene contraseña: usa el enlace.",
  sin_confirmar: "Tienes que confirmar tu correo antes de entrar. Revisa tu bandeja de entrada.",
  registro: "No se pudo crear la cuenta. Inténtalo de nuevo.",
  enlace: "Ese enlace no es válido o ya se usó. Pide uno nuevo y ábrelo una sola vez, en este mismo navegador.",
  limite: "Hemos enviado demasiados correos en poco tiempo. Espera un rato (hasta una hora) o entra con contraseña.",
  envio: "No se pudo enviar el enlace. Revisa el correo e inténtalo de nuevo.",
};

type Props = { searchParams: Promise<{ enviado?: string; error?: string; next?: string; modo?: string }> };

export default async function Login({ searchParams }: Props) {
  const { enviado, error, next, modo: m } = await searchParams;
  const destino = rutaSegura(next, "/panel");
  const modo = m === "registro" || m === "enlace" ? m : "entrar";
  const alForo = destino.startsWith("/foro") || destino.startsWith("/cuenta") || destino.endsWith("/foro");
  const enlaceModo = (x: string) => `/login?next=${encodeURIComponent(destino)}&modo=${x}`;

  return (
    <div className="wrap pagina">
      <section className="caja" style={{ maxWidth: 480 }}>
        <h1>{alForo ? "Entra para participar en el foro" : "Entra en el panel de tu banda"}</h1>
        {modoDemo ? (
          <p className="error">El acceso necesita Supabase configurado (ver README).</p>
        ) : enviado ? (
          <p>
            Revisa tu correo (mira también en spam) y pulsa el enlace <strong>en este mismo navegador</strong>
            {enviado === "confirmar" ? " para confirmar tu cuenta." : " para entrar."}
          </p>
        ) : (
          <>
            <nav className="pestanas" aria-label="Forma de entrar">
              <Link href={enlaceModo("entrar")} aria-current={modo === "entrar" ? "page" : undefined}>Entrar</Link>
              <Link href={enlaceModo("registro")} aria-current={modo === "registro" ? "page" : undefined}>Crear cuenta</Link>
              <Link href={enlaceModo("enlace")} aria-current={modo === "enlace" ? "page" : undefined}>Por enlace</Link>
            </nav>
            {modo === "enlace" ? (
              <form action={enviarEnlace} style={{ display: "grid", gap: 12 }}>
                <p className="nota">Te enviamos un enlace para entrar sin contraseña.</p>
                <input type="hidden" name="next" value={destino} />
                <label>Correo electrónico<input type="email" name="email" required autoComplete="email" /></label>
                {error && <p className="error">{ERRORES[error] ?? ERRORES.envio}</p>}
                <button className="boton" type="submit">Enviarme el enlace</button>
              </form>
            ) : (
              <form action={conContrasena} style={{ display: "grid", gap: 12 }}>
                <input type="hidden" name="next" value={destino} />
                <input type="hidden" name="modo" value={modo} />
                <label>Correo electrónico<input type="email" name="email" required autoComplete="email" /></label>
                <label>
                  Contraseña
                  <input type="password" name="password" required minLength={8}
                    autoComplete={modo === "registro" ? "new-password" : "current-password"} />
                </label>
                {modo === "registro" && <p className="nota">Mínimo 8 caracteres. Tu correo nunca se muestra en la web.</p>}
                {error && <p className="error">{ERRORES[error] ?? ERRORES.registro}</p>}
                <button className="boton" type="submit">{modo === "registro" ? "Crear cuenta" : "Entrar"}</button>
              </form>
            )}
          </>
        )}
      </section>
    </div>
  );
}
