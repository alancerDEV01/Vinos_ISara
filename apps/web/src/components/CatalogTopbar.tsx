"use client";

import Link from "next/link";
import { useState } from "react";

export function CatalogTopbar({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  return <header className="catalogTopbar">
    <Link className="brand" href="/">Bolivia en la copa</Link>
    <span className="catalogTopbarContext">{context}</span>
    <button aria-expanded={open} aria-label={open ? "Cerrar menú" : "Abrir menú"} className={`catalogMenuToggle${open ? " open" : ""}`} onClick={() => setOpen((value) => !value)} type="button"><i/><i/><i/></button>
    <nav className={open ? "open" : undefined}><Link href="/">Inicio</Link><Link href="/explorar">Mapa 3D</Link><Link href="/vinos">Vinos</Link><Link href="/platos">Gastronomía</Link></nav>
  </header>;
}
