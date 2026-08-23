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
    {launching ? <div className="launchTransition" role="status" aria-live="polite"><div className="launchStars"/><div className="launchRing ringOne"/><div className="launchRing ringTwo"/><div className="launchRing ringThree"/><div className="launchWine"/><div className="launchCloud launchCloudLeft"/><div className="launchCloud launchCloudRight"/><div className="launchMessage"><small>Enología · territorio · cultura</small><strong>Entrando a Bolivia</strong><span>Preparando el mapa sensorial…</span><i/></div></div> : null}
  </>;
}
