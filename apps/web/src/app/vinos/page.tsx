"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { wines, type Wine } from "@/features/wine-catalog/wineData";
import { dishes } from "@/features/dish-catalog/dishData";
import { rankDishesForWine } from "@/features/pairing/pairingEngine";
import { PairingResultCard } from "@/features/pairing/PairingResultCard";
import { RegionArrival } from "@/features/bolivia-map/RegionArrival";

const styles: Array<Wine["style"] | "Todos"> = ["Todos", "Blanco", "Rosado", "Tinto", "Naranjo", "Espumante"];

export default function WinesPage() {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<(typeof styles)[number]>("Todos");
  const [department, setDepartment] = useState("");
  const [selected, setSelected] = useState(wines[0].id);
  useEffect(() => setDepartment(new URLSearchParams(window.location.search).get("departamento") ?? ""), []);
  const visible = useMemo(() => wines.filter((wine) => {
    const haystack = `${wine.name} ${wine.winery} ${wine.valley} ${wine.grapes.join(" ")}`.toLowerCase();
    return (!department || wine.department === department) && (style === "Todos" || wine.style === style) && haystack.includes(query.toLowerCase().trim());
  }), [department, query, style]);
  const active = visible.find((wine) => wine.id === selected) ?? visible[0] ?? wines[0];
  const pairings = useMemo(() => rankDishesForWine(active, dishes).slice(0, 3), [active]);

  return (
    <main className="catalogPage">
      <header className="catalogHeader">
        <div><p className="eyebrow">Base sensorial boliviana</p><h1>{department ? `Vinos de ${department}` : "Vinos de altura"}</h1><p>Catálogo documental de Cinti y del Valle Central de Tarija.</p></div>
        <Link href="/explorar">Volver al mapa 3D</Link>
      </header>
      <RegionArrival department={department} mode="vinos" />
      <section className="catalogToolbar" aria-label="Filtros del catálogo">
        <label><span>Buscar vino, bodega o cepa</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Tannat, Aranjuez, Vischoqueña…" /></label>
        <div className="wineFilters">{styles.map((item) => <button className={style === item ? "active" : undefined} key={item} onClick={() => setStyle(item)} type="button">{item}</button>)}</div>
      </section>
      <div className="catalogLayout">
        <section className="wineGrid" aria-label={`${visible.length} vinos encontrados`}>
          {visible.map((wine) => (
            <button className={`wineCard${active.id === wine.id ? " active" : ""}`} key={wine.id} onClick={() => setSelected(wine.id)} type="button">
              <WineArt styleName={wine.style} /><GrapeIcon />
              <span className="wineCardCopy"><small>{wine.valley}</small><strong>{wine.name}</strong><span>{wine.winery}</span><em>{wine.grapes.join(" · ")}</em></span>
            </button>
          ))}
          {!visible.length ? <p className="emptyCatalog">No encontramos vinos con esos filtros.</p> : null}
        </section>
        <aside className="wineProfile" key={active.id}>
          <WineArt hero styleName={active.style} /><div className="wineGrapeHero"><GrapeIcon /><span>{active.grapes.join(" · ")}</span></div>
          <p className="eyebrow">Perfil sensorial de referencia</p>
          <h2>{active.name}</h2>
          <p className="wineMeta">{active.winery} · {active.valley} · {active.department}</p>
          <div className="profileFacts"><span><small>Estilo</small>{active.style}</span><span><small>Cepa</small>{active.grapes.join(", ")}</span><span><small>Apariencia</small>{active.appearance}</span></div>
          <section className="wineTechnical" aria-label="Ficha técnica enológica">
            <h3>Ficha enológica</h3>
            <div>
              <TechnicalFact label="Zona / municipio" value={active.zone} />
              <TechnicalFact label="Altitud" value={active.altitude} />
              <TechnicalFact label="Añada" value={active.vintage} />
              <TechnicalFact label="Alcohol" value={active.alcohol} />
              <TechnicalFact label="Elaboración" value={active.process} />
              <TechnicalFact label="Fermentación" value={active.fermentation} />
              <TechnicalFact label="Maloláctica" value={active.malolactic} />
              <TechnicalFact label="Crianza" value={active.aging} />
              <TechnicalFact label="Recipiente" value={active.agingVessel} />
              <TechnicalFact label="Tiempo de crianza" value={active.agingTime} />
            </div>
          </section>
          <AromaFamilies wine={active} />
          <SensoryGroup title="Descriptores de nariz" values={active.nose} />
          <SensoryGroup title="Boca" values={active.palate} />
          <SensoryGroup title="Carácter" values={active.character} />
          <PalateAxes wine={active} />
          <p className="sourceNotice">Registro en borrador extraído del documento fuente. El perfil puede cambiar según añada, parcela, crianza y vinificación; los campos no documentados no se completan por inferencia.</p>
          <section className="pairingRecommendations"><p className="eyebrow">Tengo este vino · platos recomendados</p>{pairings.map((result) => <PairingResultCard key={result.dish.id} perspective="wine" result={result} />)}</section>
        </aside>
      </div>
    </main>
  );
}

function GrapeIcon() { return <span className="grapeIcon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M25 12c5-7 11-7 15-5-2 6-8 9-15 7M24 12c-3-5-7-7-11-7"/><circle cx="24" cy="18" r="5"/><circle cx="16" cy="23" r="5"/><circle cx="32" cy="23" r="5"/><circle cx="21" cy="31" r="5"/><circle cx="29" cy="31" r="5"/><circle cx="25" cy="39" r="4"/></svg></span>; }

function TechnicalFact({ label, value }: { label: string; value?: string }) {
  return <span className={value ? undefined : "pending"}><small>{label}</small>{value ?? "No documentado"}</span>;
}

const aromaTerms: Array<[keyof NonNullable<Wine["aromaFamilies"]>, string[]]> = [
  ["Frutal", ["fruta", "cereza", "ciruela", "mora", "arándano", "frambuesa", "fresa", "cassis", "grosella", "durazno", "damasco", "piña", "pomelo", "limón", "lima", "maracuyá", "higo", "dátiles", "lichi", "manzana", "naranja"]],
  ["Floral", ["flor", "rosa", "jazmín", "lavanda", "violeta"]],
  ["Herbal / vegetal", ["herbal", "hierba", "pimiento", "hojas", "balsám"]],
  ["Especiado", ["especia", "pimienta", "clavo", "canela", "nuez moscada"]],
  ["Crianza", ["vainilla", "cacao", "chocolate", "café", "tabaco", "tostado", "humo", "cuero", "madera", "roble"]],
];

function AromaFamilies({ wine }: { wine: Wine }) {
  const explicit = wine.aromaFamilies ?? {};
  const inferred = aromaTerms.reduce<Partial<Record<keyof NonNullable<Wine["aromaFamilies"]>, string[]>>>((result, [family, terms]) => {
    const matches = wine.nose.filter((item) => terms.some((term) => item.toLocaleLowerCase("es").includes(term)));
    if (matches.length) result[family] = matches;
    return result;
  }, {});
  const groups = aromaTerms.map(([family]) => [family, explicit[family] ?? inferred[family]] as const).filter((entry) => entry[1]?.length);
  return <section className="aromaFamilies"><h3>Familias aromáticas</h3>{groups.length ? <div>{groups.map(([family, values]) => <article key={family}><small>{family}</small><span>{values?.join(" · ")}</span></article>)}</div> : <p>Clasificación pendiente de revisión.</p>}</section>;
}

const axes: Array<keyof NonNullable<Wine["palateAxes"]>> = ["Dulzor", "Acidez", "Alcohol", "Taninos", "Astringencia", "Cuerpo", "Intensidad", "Textura", "Persistencia"];

function PalateAxes({ wine }: { wine: Wine }) {
  return <section className="palateAxes"><h3>Matriz de boca</h3><p>Escala semicuantitativa requerida por el documento.</p><div>{axes.map((axis) => <span className={wine.palateAxes?.[axis] ? undefined : "pending"} key={axis}><small>{axis}</small>{wine.palateAxes?.[axis] ?? "Pendiente"}</span>)}</div></section>;
}

function SensoryGroup({ title, values }: { title: string; values: string[] }) {
  return <section className="sensoryGroup"><h3>{title}</h3><div>{values.map((value) => <span key={value}>{value}</span>)}</div></section>;
}

function WineArt({ styleName, hero = false }: { styleName: Wine["style"]; hero?: boolean }) {
  const positions: Record<Wine["style"], [number, number]> = { Blanco: [0, 0], Rosado: [50, 0], Tinto: [100, 0], Naranjo: [0, 100], Espumante: [50, 100] };
  const [x, y] = positions[styleName];
  return <span aria-label={`Ilustración de vino ${styleName.toLowerCase()}`} className={`wineArt${hero ? " hero" : ""}`} role="img" style={{ "--wine-x": `${x}%`, "--wine-y": `${y}%` } as CSSProperties} />;
}
