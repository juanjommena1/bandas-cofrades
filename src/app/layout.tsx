import type { Metadata } from "next";
import Link from "next/link";
import { modoDemo } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bandas Cofrades",
  description: "Catálogo de bandas de cornetas y tambores, agrupaciones musicales y bandas de música para hermandades y cofradías.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap" />
      </head>
      <body>
        <header className="cabecera">
          <div className="wrap">
            <Link className="marca" href="/"><span className="marca-icono">BC</span><span className="marca-texto">Bandas Cofrades</span></Link>
            <nav className="nav">
              <Link href="/">Catálogo</Link>
              <Link href="/foro" className="nav-foro">Foro</Link>
              <Link href="/panel" className="destacado">Soy una banda</Link>
            </nav>
          </div>
        </header>
        {modoDemo && (
          <div className="aviso"><div className="wrap">
            Versión de prueba: catálogo con datos públicos de bandas. El panel para bandas se activará al conectar la base de datos.
          </div></div>
        )}
        <main>{children}</main>
      </body>
    </html>
  );
}
