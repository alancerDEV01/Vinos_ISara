import { departmentGalleries } from "./departmentGallery";

export function RegionArrival({ department, mode }: { department: string; mode: "vinos" | "platos" }) {
  if (!department) return null;
  const gallery = departmentGalleries[department] ?? [];
  if (!gallery.length) return null;
  return <section className="regionArrival" aria-label={`Paisajes de ${department}`}>
    <div className="regionArrivalCopy"><small>Has entrado al territorio</small><h2>{department}</h2><p>{mode === "vinos" ? "Viñedos, cepas y perfiles sensoriales conectados con su paisaje." : "Cocina, ingredientes y memoria cultural conectados con su territorio."}</p></div>
    <div className="regionArrivalGallery">{gallery.slice(0, 3).map((place, index) => <figure className={index === 0 ? "featured" : undefined} key={place.title}><img src={place.image} alt={`${place.title}, ${department}`} /><figcaption><strong>{place.title}</strong><span>{place.description}</span></figcaption></figure>)}</div>
  </section>;
}
