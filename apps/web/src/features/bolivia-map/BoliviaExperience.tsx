"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BoliviaDepartmentMap, getBoliviaMapCenter, getDepartmentCenter, getDepartmentSize, getDepartmentSpan } from "./BoliviaDepartmentMap";
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

type UserLocation = {
  latitude: number;
  longitude: number;
  name: string;
  fallback: boolean;
};

const SUCRE_LOCATION: UserLocation = {
  latitude: -19.0477,
  longitude: -65.2592,
  name: "Sucre",
  fallback: true,
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
  const viewportSize = useThree((state) => state.size);
  const aspect = viewportSize.width / viewportSize.height;

  useEffect(() => {
    if (!controls.current) return;
    const feature = focused ? data?.features.find((item) => item.properties.name === focused) : null;
    if (feature) {
      const [x, z] = getDepartmentCenter(feature);
      const span = getDepartmentSpan(feature);
      const { depth, width } = getDepartmentSize(feature);
      const isOverlayBesideMap = viewportSize.width > 800;
      const desktopFitFactor = isOverlayBesideMap ? 1.78 : 1.62;
      const distance = aspect < 1
        ? Math.max(5.2, Math.min(22.5, Math.max(width * 2.95, depth * 3.25)))
        : Math.max(5.2, Math.min(9.2, span * desktopFitFactor));

      // En escritorio la ficha ocupa el costado derecho. Desplazamos el punto
      // de mirada hacia ese costado para que el departamento quede centrado en
      // el lienzo visible de la izquierda, sin quedar debajo de la tarjeta.
      const horizontalOffset = isOverlayBesideMap ? span * 0.35 : 0;
      const cameraX = x + horizontalOffset;
      // En móvil el lienzo ocupa también el contenido que continúa debajo del
      // encabezado. Apuntamos un poco al sur del centro geométrico para elevar
      // el departamento y encajarlo completo en la portada superior.
      const mobileVerticalOffset = aspect < 1
        ? depth * (focused === "Pando" ? 0.78 : 0.55)
        : 0;
      const targetZ = z + mobileVerticalOffset;
      void controls.current.setLookAt(
        cameraX,
        distance,
        targetZ + distance * 0.12,
        cameraX,
        0,
        targetZ,
        true,
      );
      return;
    }
    const distance = aspect < 1
      ? Math.max(17.2, Math.min(23.5, 10.5 / Math.max(aspect, 0.4)))
      : 12.2;
    const [mapX, mapZ] = data ? getBoliviaMapCenter(data) : [0, 0];
    const mobileCenterCorrection = aspect < 1 ? -0.12 : 0;
    void controls.current.setLookAt(
      mapX + mobileCenterCorrection,
      distance,
      mapZ + distance * 0.18,
      mapX + mobileCenterCorrection,
      0,
      mapZ,
      true,
    );
  }, [aspect, data, focused, viewportSize.width]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      maxDistance={30}
      maxPolarAngle={Math.PI / 2.02}
      minDistance={6}
      minPolarAngle={0}
    />
  );
}

export default function BoliviaExperience() {
  const router = useRouter();
  const [lowPower] = useState(() => typeof window !== "undefined"
    && window.matchMedia("(max-width: 800px), (prefers-reduced-motion: reduce)").matches);
  const [map, setMap] = useState<DepartmentCollection | null>(null);
  const [selected, setSelected] = useState("Tarija");
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [weather, setWeather] = useState<SucreWeather>(fallbackWeather);
  const [liveWeather, setLiveWeather] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation>(SUCRE_LOCATION);
  const [locating, setLocating] = useState(true);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [pairingMode, setPairingMode] = useState<"wine" | "dish">("wine");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [journey, setJourney] = useState<"vinos" | "platos" | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

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
    let active = true;
    if (!("geolocation" in navigator)) {
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let name = "Tu ubicación";
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=es`,
          );
          if (response.ok) {
            const place = await response.json() as { city?: string; locality?: string; principalSubdivision?: string };
            name = place.city || place.locality || place.principalSubdivision || name;
          }
        } catch {
          // Las coordenadas siguen siendo válidas aunque falle el nombre del lugar.
        }
        if (!active) return;
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude, name, fallback: false });
        setLocating(false);
      },
      () => {
        if (!active) return;
        setUserLocation(SUCRE_LOCATION);
        setLocating(false);
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 9000 },
    );
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&current=temperature_2m,weather_code,cloud_cover,is_day,wind_speed_10m&timezone=auto`,
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
  }, [userLocation.latitude, userLocation.longitude]);

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
  const enterDepartment = (destination: "vinos" | "platos") => {
    if (journey) return;
    setJourney(destination);
    window.setTimeout(() => router.push(`/${destination}?departamento=${encodeURIComponent(selected)}&entrada=territorio`), 1850);
  };

  useEffect(() => setGalleryIndex(0), [selected]);

  useEffect(() => {
    const nextSlide = gallery[(galleryIndex + 1) % gallery.length];
    if (!nextSlide) return;
    const image = new Image();
    image.decoding = "async";
    image.src = nextSlide.image;
  }, [gallery, galleryIndex]);

  useEffect(() => {
    if (!focused) return;
    const timer = window.setInterval(
      () => setGalleryIndex((index) => (index + 1) % gallery.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, [focused, gallery.length]);

  useEffect(() => {
    sceneRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
    sceneRef.current?.style.setProperty("--map-scroll-y", "0px");
  }, [focused]);

  return (
    <>
      <header className="topbar">
        <strong className="brand">Explora Bolivia</strong>
        <div className="topbarWeather" aria-live="polite" title={userLocation.fallback ? "Ubicación de respaldo mientras no se autorice la geolocalización" : "Clima según tu ubicación actual"}>
          <span className="weatherSymbol" aria-hidden="true">{rainy ? "☔" : weather.cloudCover > 65 ? "☁" : weather.cloudCover > 15 ? "⛅" : weather.isDay ? "☀" : "☾"}</span>
          <span>
            <strong>{locating ? "Localizando…" : userLocation.name} · {weather.isDay ? "día" : "noche"}</strong>
            <small>{weatherLabel(weather.weatherCode)} · {Math.round(weather.temperature)} °C{liveWeather ? " · ahora" : ""}{userLocation.fallback && !locating ? " · ubicación de respaldo" : ""}</small>
          </span>
        </div>
        <button
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          className={`menuToggle${mobileMenuOpen ? " open" : ""}`}
          onClick={() => setMobileMenuOpen((open) => !open)}
          type="button"
        >
          <span /><span /><span />
        </button>
        <nav aria-label="Principal" className={mobileMenuOpen ? "open" : undefined}>
          <a href="/">Inicio</a>
          <a href="/vinos">Vinos</a>
          <a href="/platos">Gastronomía</a>
          <a href="/explorar">Regiones</a>
        </nav>
      </header>
      <section className="experience">
      <div
        className={`scene weather-${weather.isDay ? "day" : "night"}${rainy ? " weather-rain" : ""}${stormy ? " weather-storm" : ""}`}
        ref={sceneRef}
        style={weatherStyle}
        aria-label="Mapa tridimensional interactivo de Bolivia"
      >
        {rainy ? <div className="rainLayer" aria-hidden="true" /> : null}
        {journey ? <div className={`territoryJourney journey-${journey}`} role="status" aria-live="polite">
          <div className="journeyHorizon"/><div className="journeyParticles"/><div className="journeyFlash"/>
          <div className="journeyCloud cloudOne"/><div className="journeyCloud cloudTwo"/><div className="journeyCloud cloudThree"/><div className="journeyCloud cloudFour"/>
          <div className="journeyPortal"><span className="journeyEmblem" aria-hidden="true">{journey === "vinos" ? "V" : "P"}</span><small>Entrando a {selected}</small><strong>{journey === "vinos" ? "Viñedos de altura" : "Sabores del territorio"}</strong><span>{journey === "vinos" ? "Descubriendo cepas, bodegas y perfiles sensoriales…" : "Descubriendo platos, ingredientes y memoria cultural…"}</span><i><em/></i></div>
        </div> : null}
        <Canvas
          camera={{ position: [0, 13, 2.8], fov: 38 }}
          dpr={lowPower ? 1 : [1, 1.35]}
          frameloop={lowPower ? "demand" : "always"}
          gl={{ alpha: true, antialias: true, stencil: true }}
          onCreated={({ gl }) => gl.setClearAlpha(0)}
          performance={{ min: 0.55 }}
          shadows={!lowPower}
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
              lowPower={lowPower}
              onSelect={selectDepartment}
              onHover={setHovered}
            />
          ) : null}
          <MapCamera data={map} focused={focused} />
        </Canvas>
        <div className="mapStatus" aria-live="polite">
          {hovered ? `Explorar ${hovered}` : map ? "Arrastra para rotar · rueda para acercar" : "Cargando mapa…"}
        </div>
      {focused ? <aside
        aria-label={`Experiencia de ${selected}`}
        className="sidePanel mapOverlayPanel"
        key={selected}
        onScroll={(event) => sceneRef.current?.style.setProperty("--map-scroll-y", `${-event.currentTarget.scrollTop}px`)}
      >
        <button aria-label="Cerrar ficha del departamento" className="overlayClose" onClick={() => setFocused(null)} type="button">× <span>Cerrar</span></button>
        <header className="territoryHeader">
          <p className="eyebrow"><span>◉</span> Región seleccionada</p>
          <h2 key={selected}>{selected}</h2>
          <p className="regionFocus">{content.focus}</p>
          <p className="territoryDescription">{content.description}</p>
          <div className="territoryFacts" aria-label="Resumen de la experiencia regional">
            <span><strong>{gallery.length}</strong> destinos</span>
            <span><strong>1</strong> plato destacado</span>
            <span><strong>IA</strong> maridaje</span>
          </div>
        </header>
        <section className="placeCarousel" aria-label={`Cinco destinos de ${selected}`} key={`${selected}-gallery`}>
          <div className="placeSlide">
            <img alt={`Visual de ambientación de ${slide.title}, ${selected}`} key={slide.image} src={slide.image} />
            <div className="placeShade" />
            <div className="placeCopy"><small>{String(galleryIndex + 1).padStart(2, "0")} / 05 · Visual de ambientación</small><h3>{slide.title}</h3><p>{slide.description}</p></div>
          </div>
          <div className="carouselDots">{gallery.map((item, index) => <button aria-label={`Ver ${item.title}`} className={index === galleryIndex ? "active" : undefined} key={item.title} onClick={() => setGalleryIndex(index)} type="button" />)}</div>
        </section>
        <nav className="departmentActions" aria-label={`Explorar contenido de ${selected}`}>
          <button onClick={() => enterDepartment("vinos")} type="button"><span className="departmentActionIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3h10l-1 6.2a4.1 4.1 0 0 1-8 0L7 3Z"/><path d="M12 13.3V21M8.7 21h6.6"/></svg></span><strong>Vinos</strong><small>Descubrir etiquetas</small></button>
          <button onClick={() => enterDepartment("platos")} type="button"><span className="departmentActionIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="6.2"/><circle cx="12" cy="12" r="3.4"/><path d="M3.5 4v7M5.5 4v7M4.5 11v9M20 4v16M20 4c-2 1.7-2.1 5.7 0 7"/></svg></span><strong>Platos</strong><small>Ver gastronomía</small></button>
        </nav>
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
        <p className="departmentListLabel">Cambiar de departamento</p>
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
    </>
  );
}
