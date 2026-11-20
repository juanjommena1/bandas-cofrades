import Link from "next/link";
import { TIPOS, type Banda } from "@/lib/tipos";
import Icono from "./Icono";

export function iniciales(nombre: string) {
  const palabras = nombre.replace(/\(.*?\)/g, "").replace(/\b(BCT|AM|de|del|la|las|los|y)\b/gi, "")
    .split(/\s+/).filter(Boolean);
  const pal = palabras.length ? palabras : nombre.split(/\s+/);
  return pal.length === 1 ? pal[0]!.slice(0, 2).toUpperCase() : pal.slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
}

export default function TarjetaBanda({ banda }: { banda: Banda }) {
  const redes = (["instagram", "facebook", "youtube", "web"] as const).filter((r) => banda[r]);
  return (
    <Link href={`/bandas/${banda.slug}`} className={`tarjeta tipo-${banda.tipo}`}>
      <div className="tarjeta-portada">
        <span className="monograma">{iniciales(banda.nombre)}</span>
        <span className="chip-tipo">{TIPOS[banda.tipo]}</span>
      </div>
      <div className="tarjeta-cuerpo">
        <h3>{banda.nombre}</h3>
        <p className="lugar"><Icono nombre="pin" tam={15} />{banda.localidad}, {banda.provincia}</p>
        <div className="datos-mini">
          {banda.ano_fundacion && <span><Icono nombre="calendario" tam={14} />Desde {banda.ano_fundacion}</span>}
          {banda.musicos && <span><Icono nombre="musicos" tam={14} />{banda.musicos} músicos</span>}
        </div>
      </div>
      <div className="tarjeta-pie">
        <span className="redes">{redes.map((r) => <Icono key={r} nombre={r} tam={16} />)}</span>
        <span className="ver">Ver perfil <Icono nombre="flecha" tam={16} /></span>
      </div>
    </Link>
  );
}
