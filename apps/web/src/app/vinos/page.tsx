"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { wines, type Wine } from "@/features/wine-catalog/wineData";
import { dishes } from "@/features/dish-catalog/dishData";
import { rankDishesForWine } from "@/features/pairing/pairingEngine";
import { PairingResultCard } from "@/features/pairing/PairingResultCard";
import { RegionArrival } from "@/features/bolivia-map/RegionArrival";
import { CatalogTopbar } from "@/components/CatalogTopbar";

const styles: Array<Wine["style"] | "Todos"> = ["Todos", "Blanco", "Rosado", "Tinto", "Naranjo", "Espumante"];

export default function WinesPage() {
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<(typeof styles)[number]>("Todos");
  const [department, setDepartment] = useState("");
  const [selected, setSelected] = useState(wines[0].id);
  const profileRef = useRef<HTMLElement>(null);
  useEffect(() => setDepartment(new URLSearchParams(window.location.search).get("departamento") ?? ""), []);
  const visible = useMemo(() => wines.filter((wine) => {
    const haystack = `${wine.name} ${wine.winery} ${wine.valley} ${wine.grapes.join(" ")}`.toLowerCase();
    return (!department || wine.department === department) && (style === "Todos" || wine.style === style) && haystack.includes(query.toLowerCase().trim());
  }), [department, query, style]);
  const active = visible.find((wine) => wine.id === selected) ?? visible[0] ?? wines[0];
  const pairings = useMemo(() => rankDishesForWine(active, dishes).slice(0, 3), [active]);
  const technical = technicalProfile(active);
  const selectWine = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <><CatalogTopbar context="Enología boliviana"/><main className="catalogPage">
      <section className="catalogIntroPanel">
        <header className="catalogHeader">
          <div><p className="eyebrow">Base sensorial boliviana</p><h1>{department ? `Vinos de ${department}` : "Vinos de altura"}</h1><p>Catálogo documental de Cinti y del Valle Central de Tarija.</p></div>
          <Link href="/explorar">Volver al mapa 3D</Link>
        </header>
        <RegionArrival department={department} mode="vinos" />
        <section className="catalogToolbar" aria-label="Filtros del catálogo">
          <label><span>Buscar vino, bodega o cepa</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. Tannat, Aranjuez, Vischoqueña…" /></label>
          <div className="wineFilters">{styles.map((item) => <button className={style === item ? "active" : undefined} key={item} onClick={() => setStyle(item)} type="button">{item}</button>)}</div>
        </section>
      </section>
      <div className="catalogLayout">
        <section className="wineGrid" aria-label={`${visible.length} vinos encontrados`}>
          {visible.map((wine) => (
            <button className={`wineCard${active.id === wine.id ? " active" : ""}`} key={wine.id} onClick={() => selectWine(wine.id)} type="button">
              <WineArt styleName={wine.style} /><GrapeIcon />
              <span className="wineCardCopy"><small>{wine.valley}</small><strong>{wine.name}</strong><span>{wine.winery}</span><em>{wine.grapes.join(" · ")}</em></span>
            </button>
          ))}
        </section>
        <aside className="wineProfile" key={active.id} ref={profileRef}>
          <div className="profileLead wineProfileLead">
            <div className="profileMedia"><WineArt hero styleName={active.style} /><div className="wineGrapeHero"><GrapeIcon /><span>{active.grapes.join(" · ")}</span></div></div>
            <div className="profileIntro">
              <p className="eyebrow">Perfil sensorial de referencia</p>
              <h2>{active.name}</h2>
              <p className="wineMeta">{active.winery} · {active.valley} · {active.department}</p>
              <div className="profileFacts"><span><small>Estilo</small>{active.style}</span><span><small>Cepa</small>{active.grapes.join(", ")}</span><span><small>Apariencia</small>{active.appearance}</span></div>
            </div>
          </div>
          <section className="wineTechnical" aria-label="Ficha técnica enológica">
            <h3>Ficha enológica</h3>
            <div>
              <TechnicalFact label="Origen" value={technical.origin} />
              <TechnicalFact label="Altitud regional" value={technical.altitude} />
              <TechnicalFact label="Añada" value={technical.vintage} />
              <TechnicalFact label="Alcohol" value={technical.alcohol} />
              <TechnicalFact label="Elaboración" value={technical.process} />
              <TechnicalFact label="Fermentación" value={technical.fermentation} />
              <TechnicalFact label="Maloláctica" value={technical.malolactic} />
              <TechnicalFact label="Crianza" value={technical.aging} />
              <TechnicalFact label="Recipiente" value={technical.agingVessel} />
              <TechnicalFact label="Tiempo de crianza" value={technical.agingTime} />
            </div>
          </section>
          <AromaFamilies wine={active} />
          <SensoryGroup title="Descriptores de nariz" values={active.nose} />
          <SensoryGroup title="Boca" values={active.palate} />
          <SensoryGroup title="Carácter" values={active.character} />
          <PalateAxes wine={active} />
          <section className="pairingRecommendations"><div className="aiRecommendationHeading"><span>IA</span><div><p className="eyebrow">Recomendación inteligente</p><h3>La IA recomienda estos platos para este vino</h3></div></div>{pairings.map((result) => <PairingResultCard key={result.dish.id} perspective="wine" result={result} />)}</section>
        </aside>
      </div>
    </main></>
  );
}

function GrapeIcon() { return <span className="grapeIcon" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M25 12c5-7 11-7 15-5-2 6-8 9-15 7M24 12c-3-5-7-7-11-7"/><circle cx="24" cy="18" r="5"/><circle cx="16" cy="23" r="5"/><circle cx="32" cy="23" r="5"/><circle cx="21" cy="31" r="5"/><circle cx="29" cy="31" r="5"/><circle cx="25" cy="39" r="4"/></svg></span>; }

function TechnicalFact({ label, value }: { label: string; value?: string }) {
  return <span className={value ? undefined : "pending"}><small>{label}</small>{value ?? "No documentado"}</span>;
}

function technicalProfile(wine: Wine) {
  const sparkling = wine.style === "Espumante";
  return {
    origin: wine.zone ?? `${wine.valley}, ${wine.department}, Bolivia`,
    altitude: wine.altitude ?? "Valle vitícola de altura · referencia regional",
    vintage: wine.vintage ?? "Variable según cosecha",
    alcohol: wine.alcohol ?? "Consultar etiqueta de la añada",
    process: wine.process ?? (sparkling ? "Segunda fermentación y toma de espuma" : wine.style === "Naranjo" ? "Vinificación con contacto de pieles" : "Vinificación según protocolo de bodega"),
    fermentation: wine.fermentation ?? (sparkling ? "Alcohólica + segunda fermentación" : "Alcohólica"),
    malolactic: wine.malolactic ?? (wine.style === "Tinto" ? "Según decisión de bodega" : "No indicada"),
    aging: wine.aging ?? (wine.agingVessel ? "Sí" : "No indicada en la fuente"),
    agingVessel: wine.agingVessel ?? "No indicado en la fuente",
    agingTime: wine.agingTime ?? "No indicado en la fuente",
  };
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
  const profile = completePalateProfile(wine);
  return <section className="palateAxes"><h3>Matriz de boca</h3><div>{axes.map((axis) => <span key={axis}><small>{axis}</small><b>{profile[axis].label}</b><i><em style={{ width: `${profile[axis].score}%` }}/></i></span>)}</div></section>;
}

function completePalateProfile(wine: Wine): Record<(typeof axes)[number], { label: string; score: number }> {
  const text = [...wine.palate, ...wine.character, ...wine.nose].join(" ").toLocaleLowerCase("es");
  const grapes = wine.grapes.join(" ").toLocaleLowerCase("es");
  const has = (...terms: string[]) => terms.some((term) => text.includes(term));
  const varietal = (...terms: string[]) => terms.some((term) => grapes.includes(term));
  const signature = [...wine.id].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const variation = (axis: number) => ((signature * (axis + 5)) % 9) - 4;
  const red = wine.style === "Tinto";
  const orange = wine.style === "Naranjo";
  const sparkling = wine.style === "Espumante";
  const tannic = varietal("tannat", "cabernet", "syrah") || has("taninos firmes", "potente", "estructurado");
  const aromatic = varietal("moscatel", "vischoqueña") || has("aromático", "floral", "fragante");
  const soft = varietal("merlot", "malbec", "negra criolla") || has("suave", "sedoso", "aterciopelado", "redondo");
  const clamp = (value: number) => Math.max(6, Math.min(96, Math.round(value)));
  const scores = {
    Dulzor: clamp((has("demi", "semidulce") ? 62 : aromatic ? 29 : 17) + variation(0)),
    Acidez: clamp((sparkling ? 78 : has("acidez marcada", "gran frescura", "vivaz") ? 82 : aromatic || wine.style === "Blanco" || wine.style === "Rosado" ? 69 : red ? 58 : 64) + variation(1)),
    Alcohol: clamp((has("potente", "corpulento", "opulento") ? 76 : red ? 64 : sparkling ? 48 : 56) + variation(2)),
    Taninos: clamp((!red && !orange ? 9 : orange ? 46 : tannic ? 84 : soft ? 56 : 66) + variation(3)),
    Astringencia: clamp((!red && !orange ? 10 : orange ? 52 : tannic ? 75 : soft ? 43 : 58) + variation(4)),
    Cuerpo: clamp((has("corpulento", "con cuerpo", "amplio", "carnoso", "opulento") ? 84 : tannic ? 76 : has("ligero", "delicado") ? 35 : sparkling ? 45 : soft ? 63 : 57) + variation(5)),
    Intensidad: clamp((has("intenso", "potente", "profundo", "complejo") ? 84 : aromatic ? 68 : has("delicado", "ligero") ? 40 : 59) + variation(6)),
    Textura: clamp((has("aterciopelado", "sedoso") ? 82 : has("texturado", "carnoso", "estructura") ? 76 : sparkling ? 69 : soft ? 65 : 52) + variation(7)),
    Persistencia: clamp((has("final largo", "largo", "persistente") ? 88 : tannic ? 76 : aromatic ? 60 : has("ligero", "delicado") ? 41 : 58) + variation(8)),
  };
  const label = (axis: keyof typeof scores, score: number) => {
    if (axis === "Dulzor") return score < 25 ? "Seco" : score < 45 ? "Seco amable" : score < 70 ? "Semiseco" : "Dulce";
    if (axis === "Taninos") return score < 20 ? "Muy bajos" : score < 45 ? "Suaves" : score < 68 ? "Medios" : score < 84 ? "Firmes" : "Muy firmes";
    if (axis === "Astringencia") return score < 25 ? "Baja" : score < 50 ? "Media-baja" : score < 72 ? "Media" : "Alta";
    if (axis === "Textura") return has("aterciopelado") ? "Aterciopelada" : has("sedoso") ? "Sedosa" : sparkling ? "Burbuja fina" : score >= 72 ? "Estructurada" : score >= 55 ? "Redonda" : "Fluida";
    if (axis === "Persistencia") return score < 45 ? "Corta-media" : score < 68 ? "Media" : score < 84 ? "Larga" : "Muy larga";
    if (axis === "Cuerpo") return score < 42 ? "Ligero" : score < 68 ? "Medio" : score < 84 ? "Amplio" : "Corpulento";
    return score < 40 ? "Baja" : score < 62 ? "Media" : score < 80 ? "Media-alta" : "Alta";
  };
  return Object.fromEntries(axes.map((axis) => [axis, { score: scores[axis], label: wine.palateAxes?.[axis] ?? label(axis, scores[axis]) }])) as Record<(typeof axes)[number], { label: string; score: number }>;
}

function SensoryGroup({ title, values }: { title: string; values: string[] }) {
  return <section className="sensoryGroup"><h3>{title}</h3><div>{values.map((value) => <span key={value}>{value}</span>)}</div></section>;
}

function WineArt({ styleName, hero = false }: { styleName: Wine["style"]; hero?: boolean }) {
  const positions: Record<Wine["style"], [number, number]> = { Blanco: [0, 0], Rosado: [50, 0], Tinto: [100, 0], Naranjo: [0, 100], Espumante: [50, 100] };
  const [x, y] = positions[styleName];
  return <span aria-label={`Ilustración de vino ${styleName.toLowerCase()}`} className={`wineArt${hero ? " hero" : ""}`} role="img" style={{ "--wine-x": `${x}%`, "--wine-y": `${y}%` } as CSSProperties} />;
}
