"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { BoliviaDepartmentMap, getDepartmentCenter, getDepartmentSpan } from "./BoliviaDepartmentMap";
import { departmentContent } from "./departmentContent";
import { departmentGalleries } from "./departmentGallery";
import type { DepartmentCollection } from "./geojson";

type SucreWeather = {
  cloudCover: number;
  isDay: boolean;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
};

const fallbackWeather = (): SucreWeather => {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    timeZone: "America/La_Paz",
  }).format(new Date()));
  return { cloudCover: 35, isDay: hour >= 6 && hour < 19, temperature: 18, weatherCode: 1, windSpeed: 8 };
};

function weatherLabel(code: number) {
  if (code === 0) return "Cielo despejado";
  if (code <= 2) return "Parcialmente nublado";
  if (code === 3) return "Nublado";
  if (code === 45 || code === 48) return "Niebla";
  if (code >= 51 && code <= 67) return "Lluvia";
  if (code >= 71 && code <= 77) return "Nieve";
  if (code >= 80 && code <= 82) return "Chubascos";
  if (code >= 95) return "Tormenta";
  return "Clima variable";
}

function MapCamera({ data, focused }: { data: DepartmentCollection | null; focused: string | null }) {
  const controls = useRef<React.ElementRef<typeof CameraControls>>(null);
  const aspect = useThree((state) => state.size.width / state.size.height);

  useEffect(() => {
    if (!controls.current) return;
    const feature = focused ? data?.features.find((item) => item.properties.name === focused) : null;
    if (feature) {
      const [x, z] = getDepartmentCenter(feature);
      const span = getDepartmentSpan(feature);
      const mobileFactor = aspect < 1 ? 2.25 : 1.62;
      const distance = Math.max(4.4, Math.min(8.6, span * mobileFactor));
      void controls.current.setLookAt(x, distance, z + distance * 0.12, x, 0, z, true);
      return;
    }
    const distance = aspect < 1 ? 13.8 : 12.2;
    void controls.current.setLookAt(0, distance, distance * 0.22, 0, 0, 0, true);
  }, [aspect, data, focused]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      maxDistance={18}
      maxPolarAngle={Math.PI / 2.02}
      minDistance={6}
      minPolarAngle={0}
    />
  );
}

export default function BoliviaExperience() {
  const [map, setMap] = useState<DepartmentCollection | null>(null);
  const [selected, setSelected] = useState("Tarija");
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [weather, setWeather] = useState<SucreWeather>(fallbackWeather);
  const [liveWeather, setLiveWeather] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [pairingMode, setPairingMode] = useState<"wine" | "dish">("wine");

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

  useEffect(() => {
    const controller = new AbortController();
    const loadWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-19.0477&longitude=-65.2592&current=temperature_2m,weather_code,cloud_cover,is_day,wind_speed_10m&timezone=America%2FLa_Paz",
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error(`Clima no disponible (${response.status})`);
        const data = await response.json() as { current?: Record<string, number> };
        const current = data.current;
        if (!current) throw new Error("Respuesta meteorológica incompleta");
        setWeather({
          cloudCover: Math.max(0, Math.min(100, current.cloud_cover ?? 35)),
          isDay: current.is_day === 1,
          temperature: current.temperature_2m ?? 18,
          weatherCode: current.weather_code ?? 1,
          windSpeed: current.wind_speed_10m ?? 8,
        });
        setLiveWeather(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setWeather(fallbackWeather());
        setLiveWeather(false);
      }
    };
    void loadWeather();
    const refresh = window.setInterval(loadWeather, 10 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(refresh);
    };
  }, []);

  const content = departmentContent[selected] ?? departmentContent.Tarija;
  const gallery = departmentGalleries[selected] ?? departmentGalleries.Tarija;
  const slide = gallery[galleryIndex] ?? gallery[0];
  const rainy = (weather.weatherCode >= 51 && weather.weatherCode <= 67)
    || (weather.weatherCode >= 80 && weather.weatherCode <= 82)
    || weather.weatherCode >= 95;
  const stormy = weather.weatherCode >= 95;
  const weatherStyle = {
    "--cloud-opacity": String(0.15 + weather.cloudCover * 0.0075),
    "--cloud-speed": `${Math.max(18, 50 - weather.windSpeed)}s`,
    "--sun-opacity": String(weather.isDay ? Math.max(0.22, 1 - weather.cloudCover / 125) : 0.9),
  } as CSSProperties;
  const selectDepartment = (name: string) => {
    setSelected(name);
    setFocused(name);
    setGalleryIndex(0);
  };

  useEffect(() => setGalleryIndex(0), [selected]);

  useEffect(() => {
    gallery.forEach((item) => {
      const image = new Image();
      image.src = item.image;
    });
  }, [gallery.length, selected]);

  return (
    <section className="experience">
      <div
        className={`scene weather-${weather.isDay ? "day" : "night"}${rainy ? " weather-rain" : ""}${stormy ? " weather-storm" : ""}`}
        style={weatherStyle}
        aria-label="Mapa tridimensional interactivo de Bolivia"
      >
        <div className="weatherBadge" aria-live="polite">
          <span className="weatherSymbol" aria-hidden="true">{rainy ? "☔" : weather.cloudCover > 65 ? "☁" : weather.cloudCover > 15 ? "⛅" : weather.isDay ? "☀" : "☾"}</span>
          <span><strong>Sucre · {weather.isDay ? "día" : "noche"}</strong><small>{weatherLabel(weather.weatherCode)} · {Math.round(weather.temperature)} °C{liveWeather ? " · ahora" : ""}</small></span>
        </div>
        {rainy ? <div className="rainLayer" aria-hidden="true" /> : null}
        <Canvas
          camera={{ position: [0, 13, 2.8], fov: 38 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          onCreated={({ gl }) => gl.setClearAlpha(0)}
          performance={{ min: 0.55 }}
          shadows
        >
          <AdaptiveDpr />
          <hemisphereLight args={["#e4edf0", "#493626", 1.22]} />
          <directionalLight castShadow position={[-5, 10, 6]} intensity={2.35} color="#fff2d2" />
          <pointLight position={[5, 4, -4]} intensity={3.5} color="#8ebbd0" distance={15} />
          {map ? (
            <BoliviaDepartmentMap
              data={map}
              selected={selected}
              hovered={hovered}
              focused={focused}
              onSelect={selectDepartment}
              onHover={setHovered}
            />
          ) : null}
          <MapCamera data={map} focused={focused} />
        </Canvas>
        <div className="mapStatus" aria-live="polite">
          {hovered ? `Explorar ${hovered}` : map ? "Arrastra para rotar · rueda para acercar" : "Cargando mapa…"}
        </div>
      {focused ? <aside aria-label={`Experiencia de ${selected}`} className="sidePanel mapOverlayPanel">
        <button aria-label="Cerrar ficha del departamento" className="overlayClose" onClick={() => setFocused(null)} type="button">× <span>Cerrar</span></button>
        <p className="eyebrow">Región seleccionada</p>
        <h2 key={selected}>{selected}</h2>
        <p className="regionFocus">{content.focus}</p>
        <p>{content.description}</p>
        <section className="placeCarousel" aria-label={`Cinco destinos de ${selected}`} key={`${selected}-gallery`}>
          <div className="placeSlide">
            <img alt={`Visual de ambientación de ${slide.title}, ${selected}`} key={slide.image} src={slide.image} />
            <div className="placeShade" />
            <div className="placeCopy"><small>{String(galleryIndex + 1).padStart(2, "0")} / 05 · Visual de ambientación</small><h3>{slide.title}</h3><p>{slide.description}</p></div>
            <button aria-label="Lugar anterior" className="carouselPrev" onClick={() => setGalleryIndex((galleryIndex - 1 + gallery.length) % gallery.length)} type="button">←</button>
            <button aria-label="Lugar siguiente" className="carouselNext" onClick={() => setGalleryIndex((galleryIndex + 1) % gallery.length)} type="button">→</button>
          </div>
          <div className="carouselDots">{gallery.map((item, index) => <button aria-label={`Ver ${item.title}`} className={index === galleryIndex ? "active" : undefined} key={item.title} onClick={() => setGalleryIndex(index)} type="button" />)}</div>
        </section>
        <section className="pairingStudio" key={`${selected}-pairing`}>
          <div className="pairingStudioHead"><span>✦ IA sensorial</span><small>Vista previa explicable</small></div>
          <div className="pairingModes" role="tablist" aria-label="Dirección de la recomendación">
            <button aria-selected={pairingMode === "wine"} className={pairingMode === "wine" ? "active" : undefined} onClick={() => setPairingMode("wine")} role="tab" type="button">Tengo un vino</button>
            <button aria-selected={pairingMode === "dish"} className={pairingMode === "dish" ? "active" : undefined} onClick={() => setPairingMode("dish")} role="tab" type="button">Tengo un plato</button>
          </div>
          <div className="pairingResult" key={`${selected}-${pairingMode}`}>
            <div className="pairingDishVisual">{content.dish.image ? <img alt={content.dish.imageAlt ?? content.dish.name} src={content.dish.image} /> : <span>◌</span>}<i /></div>
            <div><small>{pairingMode === "wine" ? "Plato regional sugerido" : "Explorar vino compatible"}</small><h3>{pairingMode === "wine" ? content.dish.name : selected === "Tarija" ? "Tannat de Tarija" : selected === "Chuquisaca" ? "Vischoqueña de Cinti" : "Vino boliviano por contraste"}</h3><p>{pairingMode === "wine" ? "La IA comparará intensidad, grasa, picor, aromas, textura y vínculo territorial." : "La IA contrastará acidez, taninos, cuerpo, dulzor y familias aromáticas con el plato."}</p></div>
          </div>
          <div className="pairingLinks"><Link href={pairingMode === "wine" ? "/vinos" : "/platos"}>Elegir {pairingMode === "wine" ? "vino" : "plato"}</Link><span>afinidad · contraste · cultura</span></div>
        </section>
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
              onClick={() => selectDepartment(feature.properties.name)}
              type="button"
            >
              {feature.properties.name}
            </button>
          ))}
        </div>
      </aside> : null}
      </div>
    </section>
  );
}
