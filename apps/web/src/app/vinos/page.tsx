"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import { wines, type Wine } from "@/features/wine-catalog/wineData";

const styles: Array<Wine["style"] | "Todos"> = ["Todos", "Blanco", "Rosado", "Tinto", "Naranjo", "Espumante"];

export default function WinesPage() {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<(typeof styles)[number]>("Todos");
  const [selected, setSelected] = useState(wines[0].id);
  const visible = useMemo(() => wines.filter((wine) => {
    const haystack = `${wine.name} ${wine.winery} ${wine.valley} ${wine.grapes.join(" ")}`.toLowerCase();
    return (style === "Todos" || wine.style === style) && haystack.includes(query.toLowerCase().trim());
  }), [query, style]);
  const active = visible.find((wine) => wine.id === selected) ?? visible[0] ?? wines[0];

  return (
    <main className="catalogPage">
      <header className="catalogHeader">
        <div><p className="eyebrow">Base sensorial boliviana</p><h1>Vinos de altura</h1><p>Primer catálogo documental de Cinti y del Valle Central de Tarija.</p></div>
        <Link href="/explorar">Volver al mapa 3D</Link>
      </header>
      <section className="catalogToolbar" aria-label="Filtros del catálogo">
        <label><span>Buscar vino, bodega o cepa</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Tannat, Aranjuez, Vischoqueña…" /></label>
        <div className="wineFilters">{styles.map((item) => <button className={style === item ? "active" : undefined} key={item} onClick={() => setStyle(item)} type="button">{item}</button>)}</div>
      </section>
      <div className="catalogLayout">
        <section className="wineGrid" aria-label={`${visible.length} vinos encontrados`}>
          {visible.map((wine) => (
            <button className={`wineCard${active.id === wine.id ? " active" : ""}`} key={wine.id} onClick={() => setSelected(wine.id)} type="button">
              <WineArt styleName={wine.style} />
              <span className="wineCardCopy"><small>{wine.valley}</small><strong>{wine.name}</strong><span>{wine.winery}</span><em>{wine.grapes.join(" · ")}</em></span>
            </button>
          ))}
          {!visible.length ? <p className="emptyCatalog">No encontramos vinos con esos filtros.</p> : null}
        </section>
        <aside className="wineProfile" key={active.id}>
          <WineArt hero styleName={active.style} />
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
          <button aria-disabled="true" className="pairingAction" disabled type="button">Motor de platos: siguiente etapa <span>→</span></button>
        </aside>
      </div>
    </main>
  );
}

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
