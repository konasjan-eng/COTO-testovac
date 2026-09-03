"use client";

import { useEffect, useMemo, useState } from "react";

type Project = { title: string; detail: string; value: number };
type SectionKind = "voucher" | "investment" | "receipt";

const initialProjects: Project[] = [
  { title: "", detail: "", value: 1 },
  { title: "", detail: "", value: 2 },
  { title: "", detail: "", value: 3 },
];

function TvlSection({ kind, code, organiser, title, period, validFrom, validTo, projects, participantScores, personal, activationStamp, currentDate, currentTime, showControls, onBack, onFinish, onInspect }: {
  kind: SectionKind;
  code: string;
  organiser: string;
  title: string;
  period: string;
  validFrom: string;
  validTo: string;
  projects: Project[];
  participantScores?: number[];
  personal?: { address: string; identity: string };
  activationStamp?: string;
  currentDate: string;
  currentTime: string;
  showControls?: boolean;
  onBack?: () => void;
  onFinish?: () => void;
  onInspect: (index: number) => void;
}) {
  const labels = { voucher: "POUKÁZKA", investment: "INVESTICE", receipt: "DOKLAD" };
  const numbers = { voucher: "1.", investment: "2.", receipt: "3." };
  return (
    <section className={`tvl-section ${kind}`} aria-label={labels[kind]}>
      <div className="tvl-topline">
        <span><b>Kód varianty<br/>průzkumu COTO</b><i>PN 1</i></span>
        <h2><em>{numbers[kind]}</em> {labels[kind]}</h2>
        <span><b>Hodnota průzkumu<br/>z účtu správce</b><i>1–3 Kč</i></span>
        <span className="validity"><b>Týden platnosti tohoto<br/>průzkumu názorů</b><i>{validFrom}</i><i>{validTo}</i></span>
      </div>

      <div className="tvl-columns">
        <div className="tvl-left">
          <div className="choice-box window-e">
            <span className="window-letter">E</span>
            <div><span>Číslo volené strany</span>{["", ""].map((v,i)=><b key={i}>{v}</b>)}</div>
            <div><span>Číslo vybraného kandidáta</span>{["", "", "", "", ""].map((v,i)=><b key={i}>{v}</b>)}</div>
          </div>
          <div className="identifier-label"><span><mark>B</mark> Anonymizér TVL · 17 symbolů</span><span>+ 4 symboly</span></div>
          <div className="identifier window-b"><code>{code.slice(0,17)}</code><code>{code.slice(-4)}</code></div>
          <div className="admin-box window-a">
            <div className="stamp"><span><mark>A</mark> Ověřená identifikace správce z ARES</span><i>{organiser.match(/\d{8}/)?.[0] || "IČO"}</i><small>{organiser}</small></div>
            <div className="activation"><div><span>Datum</span><strong>{currentDate}</strong><span>Běžící čas</span><strong>{currentTime}</strong></div><div><span>Časové razítko ukončí a zamkne editaci</span><b>{activationStamp}</b></div></div>
            {kind === "investment" && showControls && <div className="window-a-actions"><button onClick={onBack}>ZPĚT</button><button onClick={onFinish}>UKONČIT</button></div>}
          </div>
        </div>

        <div className="tvl-right">
          <div className="survey-box">
            <h3>Průzkum návrhů a otázek</h3>
            <div className="project-list window-c">
              <span className="window-letter">C</span>
              <div className="project-columns"><span>Návrh nebo otázka</span><b>Správce<br/>1–3 Kč</b><b>Účastník<br/>1–9 bodů</b></div>
              {projects.map((project, i) => (
                <button key={i} className="project-row" onClick={() => onInspect(i)} title="Kliknutím otevřete celý popis">
                  <span>{i + 1}</span><strong>{project.title || "Klikněte a zapište projekt nebo otázku"}</strong><span>{project.value} Kč</span><span>{participantScores?.[i] ? `${participantScores[i]} b.` : ""}</span>
                </button>
              ))}
            </div>
            <small>* Správce ocení svou prioritu 1–3 Kč. Účastník samostatně přidělí každému řádku 1–9 bodů.</small>
          </div>
          {kind === "voucher" && (
            <div className="personal-only window-d">
              <span className="window-letter">D</span>
              <div className="address-lines">
                <span>Jméno a příjmení účastníka ................................................</span>
                <span>ulice / část obce .................................................................</span>
                <span>obec ........................................................ PSČ ...................</span>
                <span>národnost ............................................................................</span>
                <b>Rodné číslo　{personal?.identity || "□ □ □ □ □ □ / □ □ □ □"}</b>
              </div>
              <div className="qr"><span>OSOBNÍ</span><b>QR</b><span>účastníka</span></div>
            </div>
          )}
          {kind === "investment" && <div className="section-explanation"><b>Kvalita účastníka je zdrojem i cílem správce.</b><ol><li>Správce ocení každý ze svých nejvýše tří projektů částkou 1–3 Kč z účtu na propagaci.</li><li>Účastník samostatně zvýší hodnotu každého návrhu nebo otázky hodnocením 1–9 bodů.</li><li>Potvrzená akce přejde jako PN1 mezi živé.</li></ol></div>}
          {kind === "receipt" && <div className="section-explanation receipt-copy"><b>Účastník po skončení akce vyhledá svůj identifikátor.</b><p>COTO zobrazí shodu vloženého názoru nebo důvěry s výsledkem správce.</p></div>}
        </div>
      </div>

      {kind === "voucher" && <div className="voucher-instructions"><b>Pasivní účastník</b> může doplnit adresu pro papírové použití. <strong>Aktivní účastník</strong> používá shodný identifikátor ve všech třech dílech; jeho osobní údaje zůstávají pouze v POUKÁZCE.</div>}
      {kind !== "investment" && <div className="invalid-warning">PŘI PŘEPISOVÁNÍ A ŠKRTÁNÍ JE TIŠTĚNÝ LIST NEPLATNÝ!</div>}
    </section>
  );
}

export default function Home() {
  const [entryStage, setEntryStage] = useState<"icon" | "logo" | "roles" | "ares" | "variants" | "app" | "dashboard" | "readonly">("icon");
  const [role, setRole] = useState<"manager" | "participant">("manager");
  const [projects, setProjects] = useState(initialProjects);
  const [title] = useState("PN1 · Průzkum návrhů a otázek");
  const [organiser, setOrganiser] = useState("Správce PN · IČO 12226491");
  const [start, setStart] = useState("2026-08-31");
  const [selected, setSelected] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [locked, setLocked] = useState(false);
  const [code] = useState("PN20260831COTO001-A001");
  const [live, setLive] = useState<{ title: string; period: string; code: string }[]>([]);
  const [finished] = useState<{ title: string; period: string; code: string }[]>([]);
  const [participantOpen, setParticipantOpen] = useState(false);
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [receipt, setReceipt] = useState("");
  const [activationStamp, setActivationStamp] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [printCount, setPrintCount] = useState(1);
  useEffect(() => {
    const showTime = () => { const now = new Date(); setCurrentDate(now.toLocaleDateString("cs-CZ")); setCurrentTime(now.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 })); };
    showTime(); const timer = window.setInterval(showTime, 47); return () => window.clearInterval(timer);
  }, []);
  const period = useMemo(() => {
    const d = new Date(`${start}T00:00:00`);
    if (Number.isNaN(d.getTime())) return "doplňte pondělí";
    const end = new Date(d); end.setDate(end.getDate() + 6);
    return `${d.toLocaleDateString("cs-CZ")} – ${end.toLocaleDateString("cs-CZ")}`;
  }, [start]);
  const validity = useMemo(() => {
    const d = new Date(`${start}T00:00:00`); if (Number.isNaN(d.getTime())) return { from: "", to: "" };
    const end = new Date(d); end.setDate(end.getDate() + 6); return { from: d.toLocaleDateString("cs-CZ"), to: end.toLocaleDateString("cs-CZ") };
  }, [start]);

  const updateProject = (index: number, patch: Partial<Project>) => setProjects((items) => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const openStampedPreview = () => {
    if (!activationStamp) {
      const now = new Date();
      setActivationStamp(now.toLocaleString("cs-CZ", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", fractionalSecondDigits: 3 }));
      setLocked(true);
    }
    setPreview(true);
  };
  const returnToEditing = () => {
    setPreview(false);
    setLocked(false);
    setActivationStamp("");
  };
  const confirm = () => {
    if (!window.confirm("Potvrzením se akce uzamkne. Další úpravy už nebudou možné. Pokračovat?")) return;
    setPreview(false);
    setLive([{ title, period, code }]);
    setEntryStage("dashboard");
  };
  const sendOpinion = () => {
    if (scores.some((score) => score < 1 || score > 9)) {
      window.alert("Přidělte všem třem projektům hodnocení od 1 do 9 bodů.");
      return;
    }
    const stamp = new Date();
    setReceipt(`${code}-${stamp.getTime().toString(36).toUpperCase()} · ${stamp.toLocaleString("cs-CZ", { fractionalSecondDigits: 3 })}`);
  };

  const sharedTvl = { code, organiser, title, period, validFrom: validity.from, validTo: validity.to, projects, activationStamp, currentDate, currentTime };

  if (entryStage === "icon") return <main className="entry-screen"><button className="coto-entry-icon" onClick={() => setEntryStage("logo")} aria-label="Otevřít COTO"><img src="/COTO-testovac/coto-uvod.png" alt="COTO – Codáš a Tomáš, aplikace pro spravedlivou výměnu informací" /></button></main>;
  if (entryStage === "logo") return <main className="entry-screen"><button className="coto-entry-logo" onClick={() => setEntryStage("roles")}><span className="logo-people"><i>●</i><i>●</i></span><b>COTO</b><span>Co/dáš A To/máš</span><small>pro spravedlivou výměnu informací</small></button></main>;
  if (entryStage === "roles") return <main className="entry-screen"><div className="entry-panel"><h1>COTO</h1><p>Vyberte způsob vstupu</p><button onClick={() => setEntryStage("ares")}>SPRÁVCE</button><button onClick={() => { setRole("participant"); setEntryStage("app"); }}>ÚČASTNÍK</button><button className="muted" onClick={() => setEntryStage("logo")}>ZPĚT</button></div></main>;
  if (entryStage === "ares") return <main className="entry-screen"><div className="entry-panel"><p className="eyebrow">KONTROLA SPRÁVCE V ARES</p><h1>Identifikace správce</h1><label>IČO<input value="12226491" readOnly /></label><p className="ares-ok">Zkušební kontrola ARES: údaje správce připraveny pro okno A.</p><button onClick={() => setEntryStage("variants")}>POKRAČOVAT K VÝBĚRU VARIANTY</button><button className="muted" onClick={() => setEntryStage("roles")}>ZPĚT</button></div></main>;
  if (entryStage === "variants") return <main className="entry-screen"><div className="entry-panel variant-panel"><p className="eyebrow">SPRÁVCE · VÝBĚR VARIANTY COTO</p><h1>Čtyři varianty</h1><button className="variant-choice active" onClick={() => setEntryStage("app")}><b>PN</b><span>Průzkum názorů</span><em>OTEVŘÍT PRACOVNÍ ŠABLONU</em></button><button className="variant-choice" disabled><b>PP</b><span>Pořadí priorit</span><em>PŘIPRAVUJEME</em></button><button className="variant-choice" disabled><b>DD</b><span>Dárce daru</span><em>PŘIPRAVUJEME</em></button><button className="variant-choice" disabled><b>VO</b><span>Volba občana</span><em>PŘIPRAVUJEME</em></button><button className="muted" onClick={() => setEntryStage("ares")}>ZPĚT</button></div></main>;
  if (entryStage === "dashboard") return <main className="dashboard-screen"><header className="dashboard-logo"><b>COTO</b><div><strong>{organiser}</strong><small>Ověřená identita správce · ARES</small></div></header><button className="new-survey" onClick={() => { setLocked(false); setActivationStamp(""); setEntryStage("app"); }}>+ NOVÝ PRŮZKUM</button><section className="manager-columns"><div><p className="eyebrow">PN · ŽIVÉ</p><h2>Živé průzkumy</h2>{live.map((item) => <article key={item.code}><span className="live-dot"/><div><b>PN1 · Průzkum návrhů a otázek</b><small>{item.period}</small><button onClick={() => setEntryStage("readonly")}>OTEVŘÍT JEN KE ČTENÍ A KOPÍROVÁNÍ</button></div><code>{item.code}</code></article>)}</div><div><p className="eyebrow">PN · UKONČENÉ</p><h2>Ukončené průzkumy</h2><p className="empty-column">Po skončení týdne se PN1 přesune sem.</p></div></section></main>;
  if (entryStage === "readonly") return <main className="readonly-screen"><div className="readonly-toolbar"><button onClick={() => setEntryStage("dashboard")}>ZPĚT NA PŘEHLED</button><button onClick={() => navigator.clipboard?.writeText(`${title}\n${projects.map((p, i) => `${i + 1}. ${p.title}: ${p.detail}`).join("\n")}`)}>KOPÍROVAT OBSAH</button></div><div className="tvl-paper"><TvlSection kind="voucher" {...sharedTvl} onInspect={setSelected}/><div className="cut">✂</div><TvlSection kind="investment" {...sharedTvl} onInspect={setSelected}/><div className="cut">✂</div><TvlSection kind="receipt" {...sharedTvl} onInspect={setSelected}/></div></main>;

  return (
    <main>
      <nav className="topbar">
        <div><b>COTO</b><span>Průzkum názorů · PN</span></div>
        <div className="role-switch" aria-label="Volba role"><button className={role === "manager" ? "active" : ""} onClick={() => setRole("manager")}>Správce</button><button className={role === "participant" ? "active" : ""} onClick={() => setRole("participant")}>Účastník</button></div>
        <div className="status"><i className={locked ? "locked" : "draft"} />{locked ? "Uzamčeno · živý projekt" : "Pracovní test"}</div>
      </nav>

      {role === "participant" ? <>
        <header className="intro participant-intro"><div><p className="eyebrow">ÚČASTNÍK · PRVNÍ PRŮCHOD</p><h1>Vyberte správce.<br />Otevřete jeho aktivitu.</h1></div><p>V tomto testu je dostupný jeden správce. Uzamčená akce se účastníkovi zobrazí mezi živými; po konci týdne patří do historie.</p></header>
        <section className="participant-shell">
          <div className="organiser-column"><p className="eyebrow">SEZNAM SPRÁVCŮ</p><button className="organiser-choice active" onClick={() => live.length && setParticipantOpen(true)}><span>01</span><div><b>{organiser}</b><small>{live.length ? "1 živá aktivita" : "0 živých aktivit"}</small></div><em>→</em></button></div>
          <div className="activity-column">{!participantOpen ? <div className="empty-state"><b>{live.length ? "Vyberte správce vlevo" : "Správce zatím nemá potvrzenou živou aktivitu"}</b><span>{live.length ? "Potom se zobrazí jeho živé a ukončené aktivity." : "Nejprve dokončete a potvrďte PN1 v roli správce."}</span></div> : <><div className="activity-head"><div><span className="variant">PN</span><div><small>ŽIVÁ AKTIVITA KE STAŽENÍ</small><h2>{title}</h2></div></div><code>{code}</code></div><p className="participant-period">{period}</p><div className="participant-projects">{projects.map((project, index) => <article key={index}><button className="participant-detail" onClick={() => setSelected(index)}><span>C{index + 1}</span><div><b>{project.title || `Téma ${index + 1}`}</b><small>Kliknutím nebo klepnutím otevřete celý popis</small></div></button><label>Vaše hodnocení<select value={scores[index]} onChange={(event) => setScores((current) => current.map((score, i) => i === index ? Number(event.target.value) : score))}><option value="0">zvolte 1–9</option>{Array.from({ length: 9 }, (_, score) => <option key={score + 1} value={score + 1}>{score + 1} bodů</option>)}</select></label></article>)}</div>{!receipt ? <button className="send-opinion" onClick={sendOpinion}>ODESLAT NÁZOR A VYTVOŘIT ČASOVÉ RAZÍTKO</button> : <div className="participant-receipt"><p className="eyebrow">ZKUŠEBNÍ KONTROLNÍ KÓD</p><strong>{receipt}</strong><p>Uložte si jej pro pozdější dohledání svého řádku ve výsledcích.</p><button onClick={() => window.print()}>TISK TVL · pouze můj vyplněný list</button></div>}<p className="prototype-warning">Tato verze neodesílá skutečný hlas ani peníze. Je určena pouze ke kontrole kroků a textů.</p></>}</div>
        </section>
      </> : <>

      <header className="intro">
        <div><p className="eyebrow">DIGITÁLNÍ PRACOVNÍ LIST TVL</p><h1>Jedna informace.<br />Tři propojené díly.</h1></div>
        <p>TVL je nosič komunikace mezi správci a účastníky. Nejde o běžný webový formulář: správce připravuje díl <b>INVESTICE</b> a společné údaje se současně přenášejí do <b>POUKÁZKY</b> a <b>DOKLADU</b>.</p>
      </header>

      <div className="workspace">
        <aside className="editor-card">
          <div className="editor-title"><span>01</span><div><small>varianta COTO</small><h2>PN · Průzkum názorů</h2></div></div>
          <label>Správce<input disabled={locked} value={organiser} onChange={(e) => setOrganiser(e.target.value)} /></label>
          <label>Začátek týdne (pondělí)<input disabled={locked} type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
          <p className="period">{period}</p>
          <div className="editor-projects">
            <small>Kliknutím otevřete obsah řádku C</small>
            {projects.map((p, i) => <button disabled={locked} key={i} onClick={() => setSelected(i)}><span>{i + 1}</span><b>{p.title || "Zapsat projekt nebo otázku"}</b><em>upravit</em></button>)}
          </div>
          <div className="editor-actions"><button className="back-step" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>ZPĚT</button><button className="preview-btn" onClick={openStampedPreview}>UKONČIT <span>→</span></button></div>
        </aside>

        <div className="paper-wrap">
          <div className="paper-label"><span>NÁHLED PŘENOSU</span><small>změny se propisují současně</small></div>
          <div className="tvl-paper compact">
            <TvlSection kind="voucher" {...sharedTvl} onInspect={setSelected} />
            <p className="cut-copy">Každý účastník si oddělí POUKÁZKU a díly 2 a 3 vloží do online skeneru s monitorem. Zapíše si pořadové číslo skenu pro urychlené vyhledání své anonymní účasti.</p>
            <div className="cut">✂ <span>oddělit POUKÁZKU</span></div>
            <TvlSection kind="investment" {...sharedTvl} showControls onBack={() => setEntryStage("ares")} onFinish={openStampedPreview} onInspect={setSelected} />
            <div className="cut">✂ <span>oddělit INVESTICI</span></div>
            <TvlSection kind="receipt" {...sharedTvl} onInspect={setSelected} />
          </div>
        </div>
      </div>

      <section className="manager-columns">
        <div><p className="eyebrow">PN · ŽIVÉ</p><h2>Živé průzkumy</h2>{live.length ? live.map((item) => <article key={item.code}><span className="live-dot" /><div><b>PN1 · Průzkum návrhů a otázek</b><small>{item.period}</small><button onClick={() => { setRole("participant"); setParticipantOpen(true); }}>OTEVŘÍT / STÁHNOUT JAKO ÚČASTNÍK</button></div><code>{item.code}</code></article>) : <p className="empty-column">Po potvrzení se PN1 zobrazí zde.</p>}</div>
        <div><p className="eyebrow">PN · UKONČENÉ</p><h2>Ukončené průzkumy</h2>{finished.length ? finished.map((item) => <article key={item.code}><div><b>{item.title}</b><small>{item.period}</small></div></article>) : <p className="empty-column">Po skončení týdne se PN1 přesune sem.</p>}</div>
      </section>
      <section className="print-controls"><div><p className="eyebrow">PAPÍROVÁ VERZE PRŮZKUMU</p><h2>TISK TVL</h2><p>Každý výtisk dostane vlastní pořadové číslo a nový anonymizační kód B.</p></div><label>Počet číslovaných listů<input type="number" min="1" max="999" value={printCount} onChange={(e) => setPrintCount(Math.max(1, Number(e.target.value)))} /></label><button onClick={() => window.print()}>TISK TVL · {printCount} ks</button></section>
      </>}

      {selected !== null && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}><section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">ŘÁDEK C{selected + 1}</p><h2>Projekt nebo otázka</h2>
        <label>Nadpis<input autoFocus disabled={locked} value={projects[selected].title} onChange={(e) => updateProject(selected, { title: e.target.value })} /></label>
        <label>Podrobný popis<textarea disabled={locked} rows={6} value={projects[selected].detail} onChange={(e) => updateProject(selected, { detail: e.target.value })} /></label>
        <label>Hodnota priority správce z účtu na propagaci (1–3 Kč)<input disabled={locked} type="number" min="1" max="3" value={projects[selected].value} onChange={(e) => updateProject(selected, { value: Math.min(3, Math.max(1, Number(e.target.value))) })} /></label>
        <div className="modal-note">Správce zde přidělí projektu 1–3 Kč podle své priority. Hodnocení účastníka je jiné pole na konci stejného řádku a má rozsah 1–9 bodů.</div>
        <button className="save" onClick={() => setSelected(null)}>{locked ? "ZAVŘÍT" : "ULOŽIT DO VŠECH TŘÍ DÍLŮ"}</button>
      </section></div>}

      {preview && <div className="preview-overlay"><div className="preview-toolbar"><div><b>Celý TVL · časové razítko {activationStamp}</b><span>Editace je zamčená. Zpět razítko zruší a dovolí opravit chyby; Potvrdit zveřejní PN1.</span></div><div><button onClick={returnToEditing}>ZPĚT K OPRAVÁM</button><button className="confirm" onClick={confirm}>POTVRDIT PN1</button></div></div><div className="preview-scroll"><div className="tvl-paper"><TvlSection kind="voucher" {...sharedTvl} personal={{address:"", identity:""}} onInspect={setSelected} /><p className="cut-copy">Každý účastník si oddělí POUKÁZKU a díly 2 a 3 vloží do online skeneru s monitorem. Zapíše si pořadové číslo skenu pro urychlené vyhledání své anonymní účasti.</p><div className="cut">✂ <span>oddělit POUKÁZKU</span></div><TvlSection kind="investment" {...sharedTvl} onInspect={setSelected} /><div className="cut">✂ <span>oddělit INVESTICI</span></div><TvlSection kind="receipt" {...sharedTvl} onInspect={setSelected} /></div></div></div>}

      <div className="print-batch" aria-hidden="true">
        {(role === "manager" ? Array.from({ length: Math.min(999, printCount) }, (_, i) => i) : receipt ? [0] : []).map((copyIndex) => {
          const printCode = `${code.slice(0, 17)}${String(copyIndex + 1).padStart(4, "0")}`;
          const printShared = { ...sharedTvl, code: printCode, participantScores: role === "participant" ? scores : undefined };
          return <div className="printed-sheet" key={printCode}><div className="printed-number">TVL PN1 · pořadové číslo {copyIndex + 1}</div><TvlSection kind="voucher" {...printShared} personal={{ address: "", identity: "" }} onInspect={() => {}} /><p className="cut-copy">Každý účastník si oddělí POUKÁZKU a díly 2 a 3 vloží do online skeneru s monitorem. Zapíše si pořadové číslo skenu pro urychlené vyhledání své anonymní účasti.</p><div className="cut">✂ <span>oddělit POUKÁZKU</span></div><TvlSection kind="investment" {...printShared} onInspect={() => {}} /><div className="cut">✂ <span>oddělit INVESTICI</span></div><TvlSection kind="receipt" {...printShared} onInspect={() => {}} /></div>;
        })}
      </div>
    </main>
  );
}
