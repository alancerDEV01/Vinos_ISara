import { ExperienceLaunchButton } from "./ExperienceLaunchButton";

export default function HomePage() {
  return (
    <main className="landing">
      <div className="landingVines" aria-hidden="true" />
      <div className="landingAura" aria-hidden="true" />
      <section className="institutionalIntro">
        <div className="landingCopy">
          <p className="eyebrow">Enología · Gastronomía · Inteligencia explicable</p>
          <h1><span>Bolivia en</span><span>la copa</span></h1>
          <p className="lead">Plataforma inteligente de maridaje entre vinos bolivianos y gastronomía boliviana mediante análisis sensorial.</p>
          <div className="landingPrinciples"><span>Afinidad</span><span>Contraste</span><span>Territorio</span></div>
        </div>
        <div className="institutionalStack">
          <aside className="authorCard"><img src="/images/institutional/sara-vladislavic.png" alt="Ing. Vladislavic Mendoza Sara Alejandra" /><div><small>Investigación y desarrollo · Versión académica 2026</small><strong>Ing. Vladislavic Mendoza<br />Sara Alejandra</strong><p>Facultad de Ciencias y Tecnología<br />Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca</p><a href="mailto:vladislavic.sara@usfx.bo">vladislavic.sara@usfx.bo</a></div></aside>
          <ExperienceLaunchButton />
        </div>
      </section>
    </main>
  );
}
