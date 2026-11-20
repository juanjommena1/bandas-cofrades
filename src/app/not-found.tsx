import Link from "next/link";

export default function NoEncontrado() {
  return (
    <section className="caja">
      <h1>No encontramos esta página</h1>
      <Link className="volver" href="/">← Volver al buscador</Link>
    </section>
  );
}
