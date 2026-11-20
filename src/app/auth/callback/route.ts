import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { rutaSegura } from "@/lib/foro";
import { crearClienteServidor } from "@/lib/supabase/server";

/**
 * Llega desde el enlace del correo. Admite dos formatos:
 *  - token_hash (recomendado): funciona aunque el enlace se abra en otro navegador o en la app del correo.
 *  - code: solo funciona en el mismo navegador donde se pidió el enlace.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const tipo = (searchParams.get("type") ?? "email") as EmailOtpType;
  const destino = rutaSegura(searchParams.get("next") ?? request.cookies.get("volver")?.value, "/");

  const supabase = await crearClienteServidor();
  let ok = false;
  if (tokenHash) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type: tipo })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  const respuesta = NextResponse.redirect(`${origin}${ok ? destino : `/login?error=enlace&next=${encodeURIComponent(destino)}`}`);
  if (ok) respuesta.cookies.delete("volver");
  return respuesta;
}
