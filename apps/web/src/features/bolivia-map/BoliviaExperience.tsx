"use client";

import { Canvas } from "@react-three/fiber";
import { CameraControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { BoliviaDepartmentMap, getDepartmentCenter } from "./BoliviaDepartmentMap";
import type { DepartmentCollection } from "./geojson";

const departmentCopy: Record<string, { focus: string; description: string }> = {
  Tarija: {
    focus: "Valle Central de Tarija",
    description: "Vinos de altura, bodegas y gastronomía regional conectados por atributos sensoriales.",
  },
  Chuquisaca: {
    focus: "Valle de Cinti",
    description: "Cepas criollas, viñedos patrimoniales y preparaciones tradicionales de Chuquisaca.",
  },
};

function MapCamera({ focus }: { focus: [number, number] | null }) {
  const controls = useRef<React.ElementRef<typeof CameraControls>>(null);

  useEffect(() => {
    if (!controls.current) return;
    if (!focus) {
      void controls.current.setLookAt(0, 7.5, 8.5, 0, 0, 0, true);
      return;
    }
    const [x, z] = focus;
    void controls.current.setLookAt(x + 3.1, 4.8, z + 4.2, x, 0, z, true);
  }, [focus]);

  return <CameraControls ref={controls} makeDefault minDistance={4.5} maxDistance={14} />;
}

export default function BoliviaExperience() {
  const [map, setMap] = useState<DepartmentCollection | null>(null);
  const [selected, setSelected] = useState("Tarija");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/bolivia-departments.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar el mapa (${response.status})`);
        return response.json() as Promise<DepartmentCollection>;
      })
      .then(setMap)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
      });
    return () => controller.abort();
  }, []);

  const selectedFeature = map?.features.find((feature) => feature.properties.name === selected);
  const focus = selectedFeature ? getDepartmentCenter(selectedFeature) : null;
  const copy = departmentCopy[selected] ?? {
    focus: "Exploración nacional",
    description: "El catálogo de esta región se incorporará progresivamente con fuentes y revisión.",
  };

  return (
    <section className="experience">
      <div className="scene" aria-label="Mapa tridimensional interactivo de Bolivia">
        <Canvas camera={{ position: [0, 7, 8], fov: 38 }} dpr={[1, 1.75]}>
          <color attach="background" args={["#100c0d"]} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[4, 9, 6]} intensity={2.4} color="#ffd58c" />
          <pointLight position={[-5, 3, -4]} intensity={18} color="#8e2638" distance={12} />
          {map ? (
            <BoliviaDepartmentMap
              data={map}
              selected={selected}
              hovered={hovered}
              onSelect={setSelected}
              onHover={setHovered}
            />
          ) : null}
          <MapCamera focus={focus} />
        </Canvas>
        <div className="mapStatus" aria-live="polite">
          {hovered ? `Explorar ${hovered}` : map ? "Arrastra para rotar · rueda para acercar" : "Cargando mapa…"}
        </div>
      </div>
      <aside className="sidePanel">
        <p className="eyebrow">Región seleccionada</p>
        <h2>{selected}</h2>
        <p className="regionFocus">{copy.focus}</p>
        <p>{copy.description}</p>
        <div className="scoreGrid" aria-label="Puntuaciones de maridaje de demostración">
          <div className="score"><strong>87</strong>Afinidad</div>
          <div className="score"><strong>91</strong>Contraste</div>
          <div className="score"><strong>95</strong>Cultura</div>
        </div>
        <p className="demoNotice">Puntuaciones visuales de demostración; serán sustituidas por resultados de la API.</p>
        <div className="departmentList" aria-label="Seleccionar departamento">
          {map?.features.map((feature) => (
            <button
              className={feature.properties.name === selected ? "active" : undefined}
              key={feature.properties.code}
              onClick={() => setSelected(feature.properties.name)}
              type="button"
            >
              {feature.properties.name}
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
