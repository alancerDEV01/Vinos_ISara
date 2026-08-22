"use client";

import dynamic from "next/dynamic";

const BoliviaExperience = dynamic(
  () => import("@/features/bolivia-map/BoliviaExperience"),
  { ssr: false, loading: () => <p>Cargando experiencia territorial…</p> },
);

export default function ExplorePage() {
  return (
    <main className="explorePage">
      <header className="topbar">
        <strong>Explora Bolivia</strong>
        <nav aria-label="Principal">
          <a href="/vinos">Vinos</a>
          <a href="/platos">Gastronomía</a>
          <a href="/explorar">Regiones</a>
        </nav>
      </header>
      <BoliviaExperience />
    </main>
  );
}
