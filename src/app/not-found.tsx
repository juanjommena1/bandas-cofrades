import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="wrap pagina">
    <section className="caja">
      <h1>No encontramos esta página</h1>
      <Link className="boton sec" href="/">← Volver al buscador</Link>
    </section>
    </div>
  );
}
