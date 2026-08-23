"use client";

import dynamic from "next/dynamic";

const BoliviaExperience = dynamic(
  () => import("@/features/bolivia-map/BoliviaExperience"),
  { ssr: false, loading: () => <p>Cargando experiencia territorial…</p> },
);

export default function ExplorePage() {
  return (
    <main className="explorePage">
      <BoliviaExperience />
    </main>
  );
}
