"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { dishes, generatedDishCells } from "@/features/dish-catalog/dishData";
import { wines } from "@/features/wine-catalog/wineData";
import { rankWinesForDish } from "@/features/pairing/pairingEngine";
import { PairingResultCard } from "@/features/pairing/PairingResultCard";
import { RegionArrival } from "@/features/bolivia-map/RegionArrival";
import { CatalogTopbar } from "@/components/CatalogTopbar";

const departments = ["Todos", "Chuquisaca", "Tarija", "Cochabamba", "La Paz", "Oruro", "Potosí", "Santa Cruz", "Beni", "Pando"];

export default function DishesPage() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("Todos");
  const [selected, setSelected] = useState(dishes[0].id);
  const profileRef = useRef<HTMLElement>(null);
  useEffect(() => setDepartment(new URLSearchParams(window.location.search).get("departamento") ?? "Todos"), []);
  const visible = useMemo(() => dishes.filter((dish) => {
    const haystack = `${dish.name} ${dish.department} ${dish.region} ${dish.ingredients.join(" ")}`.toLowerCase();
    return (department === "Todos" || dish.department === department) && haystack.includes(query.toLowerCase().trim());
  }), [department, query]);
  const active = visible.find((dish) => dish.id === selected) ?? visible[0] ?? dishes[0];
  const pairings = useMemo(() => rankWinesForDish(active, wines).slice(0, 3), [active]);
  const selectDish = (id: string) => {
    setSelected(id);
    requestAnimationFrame(() => profileRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <><CatalogTopbar context="Gastronomía boliviana"/><main className="dishPage">
      <header className="dishHeader">
        <div><p className="eyebrow">Patrimonio gastronómico</p><h1>{department !== "Todos" ? `Sabores de ${department}` : "Sabores de Bolivia"}</h1><p>Preparaciones regionales caracterizadas para construir maridajes explicables.</p></div>
        <nav><Link href="/vinos">Explorar vinos</Link><Link href="/explorar">Mapa 3D</Link></nav>
      </header>
      <RegionArrival department={department === "Todos" ? "" : department} mode="platos" />
      <section className="dishToolbar" aria-label="Filtros gastronómicos">
        <label><span>Buscar plato, región o ingrediente</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej. saice, Tarija, maní…" /></label>
        <div className="departmentFilters">{departments.map((item) => <button className={department === item ? "active" : undefined} key={item} onClick={() => setDepartment(item)} type="button">{item}</button>)}</div>
      </section>
      <div className="dishLayout">
        <section className="dishGrid" aria-label={`${visible.length} platos encontrados`}>
          {visible.map((dish) => <button className={`dishCard${active.id === dish.id ? " active" : ""}`} key={dish.id} onClick={() => selectDish(dish.id)} type="button">
            {dish.image ? <img alt={dish.imageAlt ?? ""} src={dish.image} /> : <GeneratedDishImage cell={generatedDishCells[dish.id] ?? 0} />}
            <span className="dishCardOverlay"><small>{dish.department}</small><strong>{dish.name}</strong><span>{dish.region}</span></span>
          </button>)}
          {!visible.length ? <p className="emptyCatalog">No encontramos platos con esos filtros.</p> : null}
        </section>
        <aside className="dishProfile" key={active.id} ref={profileRef}>
          {active.image ? <img className="dishHero" alt={active.imageAlt ?? ""} src={active.image} /> : <GeneratedDishImage cell={generatedDishCells[active.id] ?? 0} hero />}
          <div className="dishProfileBody">
            <p className="eyebrow">Perfil organoléptico preliminar</p><h2>{active.name}</h2><p className="dishMeta">{active.region} · {active.department}</p><p>{active.description}</p>
            <div className="dishLevels"><Level label="Intensidad" value={active.intensity} /><Level label="Grasa" value={active.fat} /><Level label="Picor" value={active.spice} /></div>
            <TagGroup title="Sabores" values={active.tastes} /><TagGroup title="Aromas" values={active.aromas} /><TagGroup title="Texturas" values={active.textures} /><TagGroup title="Técnicas" values={active.techniques} /><TagGroup title="Ingredientes dominantes" values={active.ingredients} />
            <section className="pairingRecommendations"><p className="eyebrow">Tengo este plato · vinos recomendados</p>{pairings.map((result) => <PairingResultCard key={result.wine.id} perspective="dish" result={result} />)}</section>
          </div>
        </aside>
      </div>
    </main></>
  );
}

function Level({ label, value }: { label: string; value: string }) { return <span><small>{label}</small><strong>{value}</strong></span>; }
function TagGroup({ title, values }: { title: string; values: string[] }) { return <section className="dishTagGroup"><h3>{title}</h3><div>{values.map((value) => <span key={value}>{value}</span>)}</div></section>; }
function GeneratedDishImage({ cell, hero = false }: { cell: number; hero?: boolean }) {
  const column = cell % 3;
  const row = Math.floor(cell / 3);
  return <span aria-label="Ilustración gastronómica generada" className={`${hero ? "dishHero " : ""}generatedDishImage`} role="img" style={{ "--dish-x": `${column * 50}%`, "--dish-y": `${row * 50}%` } as CSSProperties} />;
}
