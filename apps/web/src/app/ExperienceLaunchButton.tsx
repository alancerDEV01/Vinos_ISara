"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ExperienceLaunchButton() {
  const router = useRouter();
  const [launching, setLaunching] = useState(false);
  const launch = () => {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => router.push("/explorar"), 1450);
  };
  return <>
    <button className="primaryAction launchAction" onClick={launch} type="button">Comenzar la experiencia <span>→</span></button>
    {launching ? <div className="launchTransition" role="status" aria-live="polite"><div className="launchRing ringOne"/><div className="launchRing ringTwo"/><div className="launchWine"/><div className="launchMessage"><small>Enología · territorio · cultura</small><strong>Entrando a Bolivia</strong><span>Preparando el mapa sensorial…</span></div></div> : null}
  </>;
}
