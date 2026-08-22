"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { BoliviaMapPlaceholder } from "./BoliviaMapPlaceholder";

export default function BoliviaExperience() {
  return (
    <section className="experience">
      <div className="scene" aria-label="Mapa tridimensional interactivo de Bolivia">
        <Canvas camera={{ position: [0, 7, 8], fov: 38 }} dpr={[1, 1.75]}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[4, 8, 6]} intensity={2.2} color="#ffd58c" />
          <BoliviaMapPlaceholder />
          <OrbitControls enablePan={false} minDistance={6} maxDistance={14} maxPolarAngle={1.25} />
        </Canvas>
      </div>
      <aside className="sidePanel">
        <p className="eyebrow">Región seleccionada</p>
        <h2>Tarija</h2>
        <p>Vinos de altura, gastronomía regional y maridajes respaldados por atributos sensoriales.</p>
        <div className="scoreGrid" aria-label="Puntuaciones de maridaje de demostración">
          <div className="score"><strong>87</strong>Afinidad</div>
          <div className="score"><strong>91</strong>Contraste</div>
          <div className="score"><strong>95</strong>Cultura</div>
        </div>
      </aside>
    </section>
  );
}
