import type { Metadata } from "next";
import Link from "next/link";
import { modoDemo } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bandas Cofrades",
  description: "Encuentra banda libre para tu salida procesional: perfiles y disponibilidad de bandas de cornetas y tambores, agrupaciones musicales y bandas de música.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Marcellus&family=Source+Sans+3:wght@400;600;700&display=swap" />
      </head>
      <body>
        <header className="cabecera">
          <div className="wrap">
            <Link className="marca" href="/">Bandas <span>Cofrades</span></Link>
            <nav className="nav">
              <Link href="/">Buscar banda</Link>
              <Link href="/panel">Soy una banda</Link>
            </nav>
          </div>
        </header>
        {modoDemo && (
          <div className="aviso"><div className="wrap">
            Modo demostración: se muestran <strong>bandas de ejemplo</strong> inventadas. Configura Supabase para usar datos reales.
          </div></div>
        )}
        <main><div className="wrap">{children}</div></main>
      </body>
    </html>
  );
}
