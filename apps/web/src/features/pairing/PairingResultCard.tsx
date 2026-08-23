"use client";

import { useState, type CSSProperties } from "react";
import type { PairingResult } from "./pairingEngine";
import { generatedDishCells } from "@/features/dish-catalog/dishData";

export function PairingResultCard({ result, perspective }: { result: PairingResult; perspective: "wine" | "dish" }) {
  const [rating, setRating] = useState<number | null>(null);
  return <article className="explainablePairing">
    {perspective === "wine" ? <PairingDishVisual result={result}/> : <PairingWineVisual result={result}/>}
    <header><span className="aiMark" aria-hidden="true">IA</span><div><small>Motor sensorial explicable · reglas v1</small><h3>{perspective === "wine" ? result.dish.name : result.wine.name}</h3><p>{perspective === "wine" ? `${result.dish.region} · ${result.dish.department}` : `${result.wine.winery} · ${result.wine.valley}`}</p></div><strong>{result.global}</strong></header>
    <div className="pairingScores"><span><b>{result.affinity}</b><small>Afinidad</small></span><span><b>{result.contrast}</b><small>Contraste</small></span><span><b>{result.culture}</b><small>Territorio</small></span></div>
    <p className="pairingVerdict">{result.verdict}</p>
    <ul>{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
    {result.cautions.length ? <div className="pairingCaution"><strong>Atención sensorial</strong>{result.cautions.join(" ")}</div> : null}
    <details><summary>¿Qué ocurre en la copa?</summary><p>{result.biochemical}</p></details>
    <div className="pairingRating"><span>{rating ? "Evaluación registrada en esta sesión" : "¿Qué tan adecuado considera este maridaje?"}</span><div>{[1,2,3,4,5].map((value) => <button aria-label={`${value} de 5`} className={rating === value ? "active" : undefined} key={value} onClick={() => setRating(value)} type="button">{value}</button>)}</div><small>{rating ? ["", "Muy inadecuado", "Inadecuado", "Aceptable", "Bueno", "Excelente"][rating] : "1 muy inadecuado · 5 excelente"}</small></div>
  </article>;
}

function PairingDishVisual({ result }: { result: PairingResult }) {
  if (result.dish.image) return <img className="pairingDishImage" src={result.dish.image} alt={result.dish.imageAlt ?? result.dish.name}/>;
  const cell = generatedDishCells[result.dish.id] ?? 0;
  return <span aria-label={`Ilustración de ${result.dish.name}`} className="pairingDishImage generatedDishImage" role="img" style={{ "--dish-x": `${(cell % 3) * 50}%`, "--dish-y": `${Math.floor(cell / 3) * 50}%` } as CSSProperties}/>;
}

function PairingWineVisual({ result }: { result: PairingResult }) {
  const positions: Record<PairingResult["wine"]["style"], [number, number]> = { Blanco:[0,0], Rosado:[50,0], Tinto:[100,0], Naranjo:[0,100], Espumante:[50,100] };
  const [x,y] = positions[result.wine.style];
  return <span aria-label={`Imagen de referencia de ${result.wine.name}`} className="pairingWineImage" role="img" style={{ "--wine-x":`${x}%`, "--wine-y":`${y}%` } as CSSProperties}><i/><strong>{result.wine.grapes[0]}</strong></span>;
}
