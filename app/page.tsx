"use client";

import { useMemo, useState } from "react";

type Project = { title: string; detail: string; value: number };
type SectionKind = "voucher" | "investment" | "receipt";

const initialProjects: Project[] = [
  { title: "Obnova veřejného prostoru", detail: "Popište důvod, cíl a očekávaný přínos projektu.", value: 1 },
  { title: "Bezpečná cesta do školy", detail: "Popište důvod, cíl a očekávaný přínos projektu.", value: 1 },
  { title: "Komunitní zahrada", detail: "Popište důvod, cíl a očekávaný přínos projektu.", value: 1 },
];

function TvlSection({ kind, code, organiser, title, period, projects, personal, onInspect }: {
  kind: SectionKind;
  code: string;
  organiser: string;
  title: string;
  period: string;
  projects: Project[];
  personal?: { address: string; identity: string };
  onInspect: (index: number) => void;
}) {
  const labels = { voucher: "POUKÁZKA", investment: "INVESTICE", receipt: "DOKLAD" };
  return (
    <section className={`tvl-section ${kind}`} aria-label={labels[kind]}>
      <header className="section-head">
        <div><span className="variant">PN</span><strong>{labels[kind]}</strong></div>
        <div className="code"><small>společný kód TVL · 17+4</small>{code}</div>
      </header>
      <div className="meta-grid">
        <div><small>správce</small><b>{organiser}</b></div>
        <div><small>živé období</small><b>{period}</b></div>
      </div>
      <div className="survey-title"><small>otázka / název průzkumu</small><h3>{title}</h3></div>
      <div className="project-list">
        <div className="project-head"><span>C</span><span>Projekt nebo návrh</span><span>hodnota</span></div>
        {projects.map((project, i) => (
          <button key={i} className="project-row" onClick={() => onInspect(i)} title="Kliknutím otevřete celý popis">
            <span>{i + 1}</span><strong>{project.title || `Projekt ${i + 1}`}</strong><span>{project.value} Kč</span>
          </button>
        ))}
      </div>
      {kind === "voucher" && (
        <div className="personal-only">
          <div><small>adresa účastníka</small><span>{personal?.address || "doplní pouze účastník"}</span></div>
          <div><small>RČ / osobní identita</small><span>{personal?.identity || "doplní pouze účastník"}</span></div>
          <div className="qr"><span>OSOBNÍ</span><b>QR</b></div>
        </div>
      )}
      {kind !== "voucher" && <p className="privacy-note">Tento díl neobsahuje adresu, rodné číslo ani osobní QR kód.</p>}
      <footer>
        <span>Časové razítko se doplní při odeslání.</span>
        <span>TVL · PN</span>
      </footer>
    </section>
  );
}

export default function Home() {
  const [projects, setProjects] = useState(initialProjects);
  const [title, setTitle] = useState("Co má mít v příštím týdnu přednost?");
  const [organiser, setOrganiser] = useState("Správce PN · IČO 12226491");
  const [start, setStart] = useState("2026-08-31");
  const [selected, setSelected] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [locked, setLocked] = useState(false);
  const [code] = useState("PN20260831COTO001-A001");
  const [live, setLive] = useState<{ title: string; period: string; code: string }[]>([]);
  const period = useMemo(() => {
    const d = new Date(`${start}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "doplňte pondělí";
    const end = new Date(d); end.setDate(end.getDate() + 6);
    return `${d.toLocaleDateString("cs-CZ")} 00:00 – ${end.toLocaleDateString("cs-CZ")} 23:59:59,999`;
  }, [start]);

  const updateProject = (index: number, patch: Partial<Project>) => setProjects((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const confirm = () => {
    if (!window.confirm("Potvrzením se akce uzamkne. Další úpravy už nebudou možné. Pokračovat?")) return;
    setLocked(true);
    setPreview(false);
    setLive([{ title, period, code }]);
  };

  return (
    <main>
      <nav className="topbar">
        <div><b>COTO</b><span>Průzkum názorů · PN</span></div>
        <div className="status"><i className={locked ? "locked" : "draft"} />{locked ? "Uzamčeno · živý projekt" : "Pracovní šablona správce"}</div>
      </nav>

      <header className="intro">
        <div><p className="eyebrow">DIGITÁLNÍ PRACOVNÍ LIST TVL</p><h1>Jedna informace.<br />Tři propojené díly.</h1></div>
        <p>TVL je nosič komunikace mezi správci a účastníky. Nejde o běžný webový formulář: správce připravuje díl <b>INVESTICE</b> a společné údaje se současně přenášejí do <b>POUKÁZKY</b> a <b>DOKLADU</b>.</p>
      </header>

      <div className="workspace">
        <aside className="editor-card">
          <div className="editor-title"><span>01</span><div><small>varianta COTO</small><h2>PN · Průzkum názorů</h2></div></div>
          <label>Správce<input disabled={locked} value={organiser} onChange={(e) => setOrganiser(e.target.value)} /></label>
          <label>Otázka nebo název průzkumu<textarea disabled={locked} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label>Začátek týdne (pondělí)<input disabled={locked} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <p className="period">{period}</p>
          <div className="editor-projects">
            <small>Kliknutím otevřete obsah řádku C</small>
            {projects.map((p, i) => <button disabled={locked} key={i} onClick={() => setSelected(i)}><span>{i + 1}</span><b>{p.title || `Projekt ${i + 1}`}</b><em>upravit</em></button>)}
          </div>
          <button className="preview-btn" onClick={() => setPreview(true)}>NÁHLED CELÉHO TVL <span>→</span></button>
        </aside>

        <div className="paper-wrap">
          <div className="paper-label"><span>NÁHLED PŘENOSU</span><small>změny se propisují současně</small></div>
          <div className="tvl-paper compact">
            <TvlSection kind="voucher" {...{ code, organiser, title, period, projects }} onInspect={setSelected} />
            <div className="cut">✂ <span>oddělit POUKÁZKU</span></div>
            <TvlSection kind="investment" {...{ code, organiser, title, period, projects }} onInspect={setSelected} />
            <div className="cut">✂ <span>oddělit INVESTICI</span></div>
            <TvlSection kind="receipt" {...{ code, organiser, title, period, projects }} onInspect={setSelected} />
          </div>
        </div>
      </div>

      <section className="live-section">
        <div><p className="eyebrow">ŽIVÉ PROJEKTY SPRÁVCE</p><h2>{live.length ? "Akce je zveřejněna účastníkům" : "Zatím čeká na potvrzení"}</h2></div>
        {live.map((item) => <article key={item.code}><span className="live-dot" /><div><b>{item.title}</b><small>{item.period}</small></div><code>{item.code}</code></article>)}
      </section>

      {selected !== null && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}><section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">ŘÁDEK C{selected + 1}</p><h2>Projekt nebo otázka</h2>
        <label>Nadpis<input autoFocus disabled={locked} value={projects[selected].title} onChange={(e) => updateProject(selected, { title: e.target.value })} /></label>
        <label>Podrobný popis<textarea disabled={locked} rows={6} value={projects[selected].detail} onChange={(e) => updateProject(selected, { detail: e.target.value })} /></label>
        <label>Hodnota názoru správce (1–9 Kč)<input disabled={locked} type="number" min="1" max="9" value={projects[selected].value} onChange={(e) => updateProject(selected, { value: Math.min(9, Math.max(1, Number(e.target.value))) })} /></label>
        <div className="modal-note">Účastník tento popis otevře kurzorem a následně přidělí hodnocení 1–9 bodů.</div>
        <button className="save" onClick={() => setSelected(null)}>{locked ? "ZAVŘÍT" : "ULOŽIT DO VŠECH TŘÍ DÍLŮ"}</button>
      </section></div>}

      {preview && <div className="preview-overlay"><div className="preview-toolbar"><div><b>Náhled celého TVL</b><span>Zkontrolujte obsah kurzorem. Potvrzení je nevratné.</span></div><div><button onClick={() => setPreview(false)}>Zpět k úpravám</button><button className="confirm" onClick={confirm}>POTVRDIT A UZAMKNOUT</button></div></div><div className="preview-scroll"><div className="tvl-paper"><TvlSection kind="voucher" {...{ code, organiser, title, period, projects }} personal={{address:"", identity:""}} onInspect={setSelected} /><div className="cut">✂ <span>oddělit POUKÁZKU</span></div><TvlSection kind="investment" {...{ code, organiser, title, period, projects }} onInspect={setSelected} /><div className="cut">✂ <span>oddělit INVESTICI</span></div><TvlSection kind="receipt" {...{ code, organiser, title, period, projects }} onInspect={setSelected} /></div></div></div>}
    </main>
  );
}
