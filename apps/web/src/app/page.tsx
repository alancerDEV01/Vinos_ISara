import Link from "next/link";

export default function HomePage() {
  return (
    <main className="landing">
      <section>
        <p className="eyebrow">Vinos · Gastronomía · Territorio</p>
        <h1>Explora Bolivia a través del maridaje</h1>
        <p className="lead">
          Descubre vinos, platos y relaciones culturales mediante un mapa 3D y un motor sensorial explicable.
        </p>
        <Link className="primaryAction" href="/explorar">
          Entrar al mapa 3D
        </Link>
      </section>
    </main>
  );
}
