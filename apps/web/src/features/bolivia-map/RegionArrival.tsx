"use client";

import { useEffect, useState } from "react";
import { departmentGalleries } from "./departmentGallery";

export function RegionArrival({ department, mode }: { department: string; mode: "vinos" | "platos" }) {
  if (!department) return null;
  const gallery = departmentGalleries[department] ?? [];
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [department]);
  useEffect(() => {
    if (gallery.length < 2) return;
    const timer = window.setInterval(() => setActive((index) => (index + 1) % gallery.length), 4300);
    return () => window.clearInterval(timer);
  }, [department, gallery.length]);
  if (!gallery.length) return null;
  const place = gallery[active];
  return <section className="regionArrival" aria-label={`Paisajes de ${department}`}>
    <div className="regionArrivalCopy"><small>Has entrado al territorio</small><h2>{department}</h2><p>{mode === "vinos" ? "Viñedos, cepas y perfiles sensoriales conectados con su paisaje." : "Cocina, ingredientes y memoria cultural conectados con su territorio."}</p></div>
    <div className="regionArrivalCarousel">
      <figure key={`${department}-${place.title}`}><img src={place.image} alt={`${place.title}, ${department}`} /><figcaption><small>{String(active + 1).padStart(2,"0")} / {String(gallery.length).padStart(2,"0")}</small><strong>{place.title}</strong><span>{place.description}</span></figcaption></figure>
      <div className="regionArrivalControls"><div>{gallery.map((item,index) => <button aria-label={`Ver ${item.title}`} className={index === active ? "active" : undefined} key={item.title} onClick={() => setActive(index)} type="button"/>)}</div></div>
    </div>
  </section>;
}
