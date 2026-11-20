import { NextResponse, type NextRequest } from "next/server";
import { rutaSegura } from "@/lib/foro";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${rutaSegura(searchParams.get("next"), "/panel")}`);
  }
  return NextResponse.redirect(`${origin}/login?error=enlace`);
}
