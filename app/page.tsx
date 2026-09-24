"use client";

import { useEffect, useMemo, useState } from "react";

type Project = { title: string; detail: string; value: number };
type SectionKind = "voucher" | "investment" | "receipt";
type EntryStage =
  | "icon"
  | "logo"
  | "purpose"
  | "roles"
  | "ares"
  | "variants"
  | "app"
  | "dashboard"
  | "readonly";
type VariantCode = "PN" | "VL" | "PP" | "VT";
type PersonalData = {
  name: string;
  street: string;
  city: string;
  nationality: string;
  identity: string;
};

const variantOptions: { code: VariantCode; name: string; description: string }[] = [
  { code: "PN", name: "Průzkum názorů", description: "Náměty, otázky a jejich podpora" },
  { code: "VL", name: "Vyber lepší", description: "Porovnání dvou nebo více možností" },
  { code: "PP", name: "Podpora projektu", description: "Podpora konkrétního projektu" },
  { code: "VT", name: "Volební tombola", description: "Výběr lidí spojených s řešením" },
];

const initialProjects: Project[] = [
  { title: "", detail: "", value: 1 },
  { title: "", detail: "", value: 2 },
  { title: "", detail: "", value: 3 },
];

const emptyPersonal: PersonalData = {
  name: "",
  street: "",
  city: "",
  nationality: "",
  identity: "",
};

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function buildWeekOptions() {
  const monday = new Date();
  monday.setHours(12, 0, 0, 0);
  const distance = (8 - monday.getDay()) % 7;
  monday.setDate(monday.getDate() + distance);
  return Array.from({ length: 6 }, (_, index) => {
    const start = new Date(monday);
    start.setDate(start.getDate() + index * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return {
      start: toIsoDate(start),
      label:
        start.toLocaleDateString("cs-CZ") +
        " – " +
        end.toLocaleDateString("cs-CZ"),
    };
  });
}

function ResultsJourney({ scoreTotal }: { scoreTotal?: number }) {
  return (
    <section className="results-journey" aria-label="Cesta tématu a návrat výsledku">
      <p className="eyebrow">CESTA TÉMATU A VÝSLEDKU</p>
      <div className="journey-steps">
        {["Návrh", "Posílení", "Kopírování", "Sčítání", "Řešení"].map(
          (step, index) => (
            <div key={step}>
              <span>{index + 1}</span>
              <b>{step}</b>
            </div>
          ),
        )}
      </div>
      <p>
        Shodné projekty se spojují napříč správci. Součtový výsledek se vrací
        správci i do každého vloženého TVL a ukazuje, na které úrovni má vzniklý
        tlak dostat řešení.
      </p>
      {typeof scoreTotal === "number" && (
        <strong className="returned-total">
          Zkušební součet právě vloženého TVL: {scoreTotal} bodů
        </strong>
      )}
    </section>
  );
}

function TvlSection({
  kind,
  code,
  organiser,
  variant,
  title,
  validFrom,
  validTo,
  projects,
  participantScores,
  personal,
  activationStamp,
  currentDate,
  currentTime,
  showControls,
  onBack,
  onFinish,
  onInspect,
}: {
  kind: SectionKind;
  code: string;
  organiser: string;
  variant: VariantCode;
  title: string;
  validFrom: string;
  validTo: string;
  projects: Project[];
  participantScores?: number[];
  personal?: PersonalData;
  activationStamp?: string;
  currentDate: string;
  currentTime: string;
  showControls?: boolean;
  onBack?: () => void;
  onFinish?: () => void;
  onInspect: (index: number) => void;
}) {
  const labels = {
    voucher: "POUKÁZKA",
    investment: "INVESTICE",
    receipt: "DOKLAD",
  };
  const numbers = { voucher: "1.", investment: "2.", receipt: "3." };

  return (
    <section className={"tvl-section " + kind} aria-label={labels[kind]}>
      <div className="tvl-topline">
        <span>
          <b>Kód varianty<br />COTO</b>
          <i>{variant} 1</i>
        </span>
        <h2><em>{numbers[kind]}</em> {labels[kind]}</h2>
        <span>
          <b>Hodnota z účtu<br />správce</b>
          <i>1–3 Kč</i>
        </span>
        <span className="validity">
          <b>Týden platnosti<br />tohoto listu</b>
          <i>{validFrom}</i>
          <i>{validTo}</i>
        </span>
      </div>

      <div className="tvl-columns">
        <div className="tvl-left">
          <div className="choice-box window-e">
            <span className="window-letter">E</span>
            <div>
              <span>Číslo volené strany</span>
              {["", ""].map((value, index) => <b key={index}>{value}</b>)}
            </div>
            <div>
              <span>Číslo vybraného kandidáta</span>
              {["", "", "", "", ""].map((value, index) => <b key={index}>{value}</b>)}
            </div>
          </div>

          <div className="identifier-label">
            <span><mark>B</mark> Identifikátor TVL · 17 symbolů</span>
            <span>+ 4 symboly</span>
          </div>
          <div className="identifier window-b">
            <code>{code.slice(0, 17)}</code>
            <code>{code.slice(-4)}</code>
          </div>

          <div className="admin-box window-a">
            <div className="stamp">
              <span><mark>A</mark> Ověřený správce z ARES</span>
              <i>{organiser.match(/\d{8}/)?.[0] || "IČO"}</i>
              <small>{organiser}</small>
            </div>
            <div className="activation">
              <div>
                <span>Datum</span>
                <strong>{currentDate}</strong>
                <span>Běžící čas</span>
                <strong>{currentTime}</strong>
              </div>
              <div>
                <span>Časové razítko ukončí a zamkne editaci</span>
                <b>{activationStamp || "zatím nevytvořeno"}</b>
              </div>
            </div>
            {kind === "investment" && showControls && (
              <div className="window-a-actions">
                <button onClick={onBack}>ZPĚT</button>
                <button onClick={onFinish}>UKONČIT</button>
              </div>
            )}
          </div>
        </div>

        <div className="tvl-right">
          <div className="survey-box">
            <h3>{title}</h3>
            <div className="project-list window-c">
              <span className="window-letter">C</span>
              <div className="project-columns">
                <span>Návrh, otázka nebo projekt</span>
                <b>1–9</b>
              </div>
              {projects.map((project, index) => (
                <button
                  key={index}
                  className="project-row"
                  onClick={() => onInspect(index)}
                  title="Kliknutím otevřete celý popis"
                >
                  <span>{index + 1}</span>
                  <strong>
                    {project.title || "Klikněte a zapište projekt nebo otázku"}
                  </strong>
                  <span className="manager-priority">{project.value} Kč</span>
                  <span
                    className={
                      "participant-score " +
                      (participantScores?.[index] ? "returned" : "")
                    }
                  >
                    {participantScores?.[index] || ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {kind === "voucher" && (
            <div className="personal-only window-d">
              <span className="window-letter">D</span>
              <div className="address-lines">
                <span>Jméno a příjmení účastníka {personal?.name || "................................"}</span>
                <span>ulice / část obce {personal?.street || "........................................"}</span>
                <span>obec / PSČ {personal?.city || "..............................................."}</span>
                <span>národnost {personal?.nationality || "............................................"}</span>
                <b>Rodné číslo　{personal?.identity || "□ □ □ □ □ □ / □ □ □ □"}</b>
              </div>
              <div className="qr">
                <span>OSOBNÍ</span>
                <b>QR</b>
                <span>účastníka</span>
              </div>
            </div>
          )}

          {kind === "investment" && (
            <div className="section-explanation">
              <b>Kvalita účastníka je zdrojem i cílem správce.</b>
              <ol>
                <li>Správce vloží nejvýše tři projekty a každému určí prioritu 1–3 Kč.</li>
                <li>Účastník každý projekt samostatně posílí hodnocením 1–9 bodů.</li>
                <li>Potvrzená akce přejde mezi živé a po týdnu do výsledků.</li>
              </ol>
            </div>
          )}

          {kind === "receipt" && (
            <div className="section-explanation receipt-copy">
              <b>Výsledek se vrací na související TVL.</b>
              <p>
                Účastník podle identifikátoru dohledá svůj řádek, součet a další
                shodné projekty.
              </p>
            </div>
          )}
        </div>
      </div>

      {kind === "voucher" && (
        <div className="voucher-instructions">
          <b>Pasivní účastník</b> může doplnit adresu pro papírové použití.{" "}
          <strong>Aktivní účastník</strong> používá shodný identifikátor ve všech
          třech dílech; osobní údaje zůstávají pouze v okně D POUKÁZKY.
        </div>
      )}
      {kind !== "investment" && (
        <div className="invalid-warning">
          PŘI PŘEPISOVÁNÍ A ŠKRTÁNÍ JE TIŠTĚNÝ LIST NEPLATNÝ!
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const weeks = useMemo(() => buildWeekOptions(), []);
  const [entryStage, setEntryStage] = useState<EntryStage>("icon");
  const [role, setRole] = useState<"manager" | "participant">("manager");
  const [variant, setVariant] = useState<VariantCode>("PN");
  const [hoveredVariant, setHoveredVariant] = useState<VariantCode>("PN");
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [organiser, setOrganiser] = useState("Jan Koňas · správce COTO · IČO 12226491");
  const [ico, setIco] = useState("12226491");
  const [account, setAccount] = useState("4310751369/0800");
  const [aresVerified, setAresVerified] = useState(false);
  const [start, setStart] = useState(weeks[0]?.start || "");
  const [selected, setSelected] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState<"variant" | "week" | null>(null);
  const [preview, setPreview] = useState(false);
  const [locked, setLocked] = useState(false);
  const [live, setLive] = useState<
    { title: string; period: string; code: string; variant: VariantCode }[]
  >([]);
  const [participantOpen, setParticipantOpen] = useState(false);
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [personal, setPersonal] = useState<PersonalData>(emptyPersonal);
  const [receipt, setReceipt] = useState("");
  const [activationStamp, setActivationStamp] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [printCount, setPrintCount] = useState(1);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const showTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("cs-CZ"));
      setCurrentTime(
        now.toLocaleTimeString("cs-CZ", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        }),
      );
    };
    showTime();
    const timer = window.setInterval(showTime, 83);
    return () => window.clearInterval(timer);
  }, []);

  const chosenVariant = variantOptions.find((option) => option.code === variant) || variantOptions[0];
  const previewVariant = variantOptions.find((option) => option.code === hoveredVariant) || variantOptions[0];
  const title = variant + "1 · " + chosenVariant.name;

  const validity = useMemo(() => {
    const date = new Date(start + "T12:00:00");
    if (Number.isNaN(date.getTime())) return { from: "", to: "", period: "vyberte týden" };
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return {
      from: date.toLocaleDateString("cs-CZ"),
      to: end.toLocaleDateString("cs-CZ"),
      period: date.toLocaleDateString("cs-CZ") + " – " + end.toLocaleDateString("cs-CZ"),
    };
  }, [start]);

  const code = useMemo(() => {
    const datePart = start.replaceAll("-", "").padEnd(8, "0").slice(0, 8);
    return variant + datePart + "COTO001" + "A001";
  }, [start, variant]);

  const updateProject = (index: number, patch: Partial<Project>) => {
    setProjects((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );
    setFormError("");
  };

  const chooseVariant = (nextVariant: VariantCode) => {
    setVariant(nextVariant);
    setHoveredVariant(nextVariant);
    setSelectorOpen(null);
    setFormError("");
  };

  const chooseWeek = (nextStart: string) => {
    setStart(nextStart);
    setSelectorOpen(null);
    setFormError("");
  };

  const openStampedPreview = () => {
    const missingProjects = projects
      .map((project, index) =>
        project.title.trim() && project.detail.trim() ? "" : "C" + (index + 1),
      )
      .filter(Boolean);
    if (!start || missingProjects.length) {
      setFormError(
        "Doplňte týden a nadpis i stručný popis všech tří řádků " +
          (missingProjects.length ? "(" + missingProjects.join(", ") + ")." : "."),
      );
      return;
    }
    if (!activationStamp) {
      const now = new Date();
      setActivationStamp(
        now.toLocaleString("cs-CZ", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        }),
      );
    }
    setLocked(true);
    setPreview(true);
    setFormError("");
  };

  const returnToEditing = () => {
    setPreview(false);
    setLocked(false);
    setActivationStamp("");
  };

  const confirm = () => {
    setPreview(false);
    setLocked(true);
    setLive([{ title, period: validity.period, code, variant }]);
    setEntryStage("dashboard");
  };

  const sendOpinion = () => {
    if (scores.some((score) => score < 1 || score > 9)) {
      window.alert("Přidělte všem třem projektům hodnocení od 1 do 9 bodů.");
      return;
    }
    const stamp = new Date();
    setReceipt(
      code + "-" + stamp.getTime().toString(36).toUpperCase() + " · " +
      stamp.toLocaleString("cs-CZ", { fractionalSecondDigits: 3 }),
    );
  };

  const sharedTvl = {
    code,
    organiser,
    variant,
    title,
    validFrom: validity.from,
    validTo: validity.to,
    projects,
    personal,
    activationStamp,
    currentDate,
    currentTime,
  };

  if (entryStage === "icon") {
    return (
      <main className="entry-screen">
        <button
          className="coto-entry-icon video-look original-icon"
          onClick={() => setEntryStage("logo")}
          aria-label="Otevřít COTO"
        >
          <img src="/COTO-testovac/coto-icon-original.png" alt="Původní ikona COTO" />
        </button>
      </main>
    );
  }

  if (entryStage === "logo") {
    return (
      <main className="entry-screen">
        <button
          className="coto-entry-logo coto-entry-logo-image"
          onClick={() => setEntryStage("purpose")}
          aria-label="Pokračovat z loga COTO k cíli aplikace"
        >
          <img
            src="/COTO-testovac/coto-logo-video.svg"
            alt="COTO – Co/dáš a To/máš, aplikace pro spravedlivou výměnu informací"
          />
        </button>
      </main>
    );
  }

  if (entryStage === "purpose") {
    return (
      <main className="entry-screen">
        <section className="entry-panel purpose-panel">
          <p className="eyebrow">CÍL A FILOSOFIE COTO</p>
          <h1>Od osobního názoru k řešení</h1>
          <p>
            COTO dává člověku jednoduchý nástroj, kterým může svůj názor vložit,
            dohledat jeho cestu a zkontrolovat jeho rostoucí hodnotu.
          </p>
          <p>
            Shodné potřeby se mohou spojovat napříč obcemi, spolky a dalšími
            správci zdola nahoru. Výsledek se vrací správci i na každý
            související TVL.
          </p>
          <ResultsJourney />
          <button onClick={() => setEntryStage("roles")}>POKRAČOVAT DO COTO</button>
          <button className="muted" onClick={() => setEntryStage("logo")}>ZPĚT</button>
        </section>
      </main>
    );
  }

  if (entryStage === "roles") {
    return (
      <main className="entry-screen">
        <section className="entry-panel role-panel">
          <img className="entry-mini-logo" src="/COTO-testovac/coto-logo-video.svg" alt="" />
          <h1>Vyber si</h1>
          <div className="role-buttons">
            <button onClick={() => { setRole("manager"); setEntryStage("ares"); }}>SPRÁVCE</button>
            <button onClick={() => { setRole("participant"); setEntryStage("app"); }}>ÚČASTNÍK</button>
          </div>
          <p>
            Správce vytváří a potvrzuje průzkum. Účastník vybírá správce,
            otevírá jeho živou aktivitu a posiluje témata svým TVL.
          </p>
          <button className="muted" onClick={() => setEntryStage("purpose")}>ZPĚT</button>
        </section>
      </main>
    );
  }

  if (entryStage === "ares") {
    return (
      <main className="entry-screen">
        <section className="entry-panel manager-entry">
          <img className="entry-mini-logo" src="/COTO-testovac/coto-logo-video.svg" alt="" />
          <p className="eyebrow">KONTROLA SPRÁVCE V ARES</p>
          <h1>Ověření správce</h1>
          <p>
            Zadejte IČO a účet na propagaci. V této zkušební verzi se pouze
            ověří správný průchod a přenos do okna A.
          </p>
          <label>
            IČO správce
            <input
              inputMode="numeric"
              value={ico}
              onChange={(event) => {
                setIco(event.target.value.replace(/\D/g, "").slice(0, 8));
                setAresVerified(false);
              }}
            />
          </label>
          <label>
            Účet na propagaci
            <input
              value={account}
              onChange={(event) => { setAccount(event.target.value); setAresVerified(false); }}
            />
          </label>
          {!aresVerified ? (
            <button
              onClick={() => {
                if (ico.length !== 8 || !account.trim()) {
                  setFormError("Doplňte osm číslic IČO a účet na propagaci.");
                  return;
                }
                setOrganiser("Jan Koňas · správce COTO · IČO " + ico);
                setAresVerified(true);
                setFormError("");
              }}
            >
              OVĚŘIT IDENTITU SPRÁVCE
            </button>
          ) : (
            <>
              <p className="ares-ok">Ověřeno: identita správce je připravena pro okno A.</p>
              <button onClick={() => setEntryStage("variants")}>POKRAČOVAT K VARIANTÁM</button>
            </>
          )}
          {formError && <p className="form-error">{formError}</p>}
          <button className="muted" onClick={() => setEntryStage("roles")}>ZPĚT</button>
        </section>
      </main>
    );
  }

  if (entryStage === "variants") {
    return (
      <main className="entry-screen">
        <section className="entry-panel variant-panel">
          <p className="verified-manager">Ověřený správce: <b>{organiser}</b></p>
          <p className="eyebrow">VÝBĚR VARIANTY COTO</p>
          <h1>Čtyři varianty</h1>
          <p className="variant-preview">
            V pracovním listu se právě zobrazí:{" "}
            <strong>{previewVariant.code}1 · {previewVariant.name}</strong>
          </p>
          {variantOptions.map((option) => (
            <button
              key={option.code}
              className={"variant-choice " + (hoveredVariant === option.code ? "active" : "")}
              onMouseEnter={() => setHoveredVariant(option.code)}
              onFocus={() => setHoveredVariant(option.code)}
              onClick={() => { chooseVariant(option.code); setEntryStage("app"); }}
            >
              <b>{option.code}</b>
              <span>{option.name}<small>{option.description}</small></span>
              <em>OTEVŘÍT ŽIVOU ŠABLONU</em>
            </button>
          ))}
          <button className="muted" onClick={() => setEntryStage("ares")}>ZPĚT</button>
        </section>
      </main>
    );
  }

  if (entryStage === "dashboard") {
    return (
      <main className="dashboard-screen">
        <header className="dashboard-logo">
          <button className="dashboard-home" onClick={() => setEntryStage("icon")}>COTO</button>
          <div>
            <strong>{organiser}</strong>
            <small>Ověřená identita správce · ARES</small>
          </div>
        </header>
        <button
          className="new-survey"
          onClick={() => { setLocked(false); setActivationStamp(""); setEntryStage("variants"); }}
        >
          + NOVÝ PRŮZKUM
        </button>
        <section className="manager-columns">
          <div>
            <p className="eyebrow">ŽIVÉ</p>
            <h2>Živé průzkumy</h2>
            {live.map((item) => (
              <article key={item.code}>
                <span className="live-dot" />
                <div>
                  <b>{item.title}</b>
                  <small>{item.period}</small>
                  <button onClick={() => setEntryStage("readonly")}>OTEVŘÍT JEN KE ČTENÍ A KOPÍROVÁNÍ</button>
                  <button onClick={() => { setRole("participant"); setParticipantOpen(true); setEntryStage("app"); }}>
                    OTEVŘÍT JAKO ÚČASTNÍK
                  </button>
                </div>
                <code>{item.code}</code>
              </article>
            ))}
          </div>
          <div>
            <p className="eyebrow">UKONČENÉ A VÝSLEDKY</p>
            <h2>Ukončené průzkumy</h2>
            <p className="empty-column">
              Po skončení týdne se aktivita přesune sem. Shodná témata se
              seskupí a součtový výsledek se vrátí do souvisejících TVL.
            </p>
          </div>
        </section>
        <ResultsJourney scoreTotal={receipt ? scores.reduce((sum, score) => sum + score, 0) : undefined} />
      </main>
    );
  }

  if (entryStage === "readonly") {
    return (
      <main className="readonly-screen">
        <div className="readonly-toolbar">
          <button onClick={() => setEntryStage("dashboard")}>ZPĚT NA PŘEHLED</button>
          <button
            onClick={() =>
              navigator.clipboard?.writeText(
                title + "\n" +
                projects.map((project, index) =>
                  "C" + (index + 1) + " " + project.title + ": " + project.detail,
                ).join("\n"),
              )
            }
          >
            KOPÍROVAT CELÉ OKNO C
          </button>
          <button onClick={() => window.print()}>TISKNOUT CELÝ TVL</button>
        </div>
        <div className="tvl-paper original-a4">
          <TvlSection kind="voucher" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={setSelected} />
          <div className="cut">✂ <span>oddělit POUKÁZKU</span></div>
          <TvlSection kind="investment" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={setSelected} />
          <div className="cut">✂ <span>oddělit INVESTICI</span></div>
          <TvlSection kind="receipt" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={setSelected} />
        </div>
        <ResultsJourney scoreTotal={receipt ? scores.reduce((sum, score) => sum + score, 0) : undefined} />
      </main>
    );
  }

  return (
    <main>
      <nav className="topbar">
        <div>
          <button className="topbar-home" onClick={() => setEntryStage("icon")} aria-label="Zobrazit titulní stránku COTO">
            <b>COTO</b>
          </button>
          <span>{chosenVariant.name + " · " + variant}</span>
        </div>
        <div className="role-switch" aria-label="Volba role">
          <button className={role === "manager" ? "active" : ""} onClick={() => setRole("manager")}>Správce</button>
          <button className={role === "participant" ? "active" : ""} onClick={() => setRole("participant")}>Účastník</button>
        </div>
        <div className="status">
          <i className={locked ? "locked" : "draft"} />
          {locked ? "Uzamčeno · živý projekt" : "Živá pracovní šablona"}
        </div>
      </nav>

      {role === "participant" ? (
        <>
          <header className="intro participant-intro">
            <div>
              <p className="eyebrow">ÚČASTNÍK · VYPLŇOVACÍ PRŮCHOD</p>
              <h1>Vyberte správce.<br />Otevřete jeho aktivitu.</h1>
            </div>
            <p>
              Otevřete úplné popisy C1–C3, přidělte každému 1–9 bodů a
              odešlete svůj TVL. Potom dostanete identifikátor pro návrat k
              výsledku.
            </p>
          </header>

          <section className="participant-shell">
            <div className="organiser-column">
              <p className="eyebrow">SEZNAM SPRÁVCŮ</p>
              <button className="organiser-choice active" onClick={() => live.length && setParticipantOpen(true)}>
                <span>01</span>
                <div>
                  <b>{organiser}</b>
                  <small>{live.length ? "1 živá aktivita" : "0 živých aktivit"}</small>
                </div>
                <em>→</em>
              </button>
            </div>

            <div className="activity-column">
              {!participantOpen ? (
                <div className="empty-state">
                  <b>{live.length ? "Klikněte na správce vlevo" : "Správce zatím nemá potvrzenou živou aktivitu"}</b>
                  <span>{live.length ? "Potom se zobrazí jeho živý TVL." : "Nejprve v roli správce vyplňte a potvrďte pracovní šablonu."}</span>
                </div>
              ) : (
                <>
                  <div className="activity-head">
                    <div>
                      <span className="variant">{variant}</span>
                      <div><small>ŽIVÁ AKTIVITA</small><h2>{title}</h2></div>
                    </div>
                    <code>{code}</code>
                  </div>
                  <p className="participant-period">{validity.period}</p>

                  <fieldset className="personal-form">
                    <legend>Okno D · pouze na POUKÁZCE</legend>
                    <label>
                      Jméno a příjmení
                      <input value={personal.name} onChange={(event) => setPersonal({ ...personal, name: event.target.value })} />
                    </label>
                    <label>
                      Ulice / část obce
                      <input value={personal.street} onChange={(event) => setPersonal({ ...personal, street: event.target.value })} />
                    </label>
                    <label>
                      Obec a PSČ
                      <input value={personal.city} onChange={(event) => setPersonal({ ...personal, city: event.target.value })} />
                    </label>
                    <label>
                      Národnost
                      <input value={personal.nationality} onChange={(event) => setPersonal({ ...personal, nationality: event.target.value })} />
                    </label>
                    <label>
                      Rodné číslo / osobní identifikátor
                      <input value={personal.identity} onChange={(event) => setPersonal({ ...personal, identity: event.target.value })} />
                    </label>
                  </fieldset>

                  <div className="participant-projects">
                    {projects.map((project, index) => (
                      <article key={index}>
                        <button className="participant-detail" onClick={() => setSelected(index)}>
                          <span>C{index + 1}</span>
                          <div>
                            <b>{project.title || "Nevyplněné téma"}</b>
                            <small>Kliknutím otevřete celý popis a hodnotu správce</small>
                          </div>
                        </button>
                        <label>
                          Vaše hodnocení
                          <select
                            value={scores[index]}
                            onChange={(event) =>
                              setScores((current) =>
                                current.map((score, scoreIndex) =>
                                  scoreIndex === index ? Number(event.target.value) : score,
                                ),
                              )
                            }
                          >
                            <option value="0">zvolte 1–9</option>
                            {Array.from({ length: 9 }, (_, score) => (
                              <option key={score + 1} value={score + 1}>{score + 1} bodů</option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))}
                  </div>

                  {!receipt ? (
                    <button className="send-opinion" onClick={sendOpinion}>ODESLAT TVL A VYTVOŘIT ČASOVÉ RAZÍTKO</button>
                  ) : (
                    <div className="participant-receipt">
                      <p className="eyebrow">OSOBNÍ KONTROLNÍ KÓD</p>
                      <strong>{receipt}</strong>
                      <p>
                        Tento kód spojuje váš DOKLAD s pozdějším součtovým
                        výsledkem, aniž by se do něj přeneslo okno D.
                      </p>
                      <button onClick={() => window.print()}>TISK MÉHO CELÉHO TVL NA JEDNU A4</button>
                      <button onClick={() => setEntryStage("readonly")}>ZOBRAZIT VÝSLEDEK VRÁCENÝ DO TVL</button>
                    </div>
                  )}
                  <ResultsJourney scoreTotal={receipt ? scores.reduce((sum, score) => sum + score, 0) : undefined} />
                  <p className="prototype-warning">
                    Tato verze neodesílá skutečný hlas ani peníze. Slouží k
                    ověření celého vyplňovacího postupu.
                  </p>
                </>
              )}
            </div>
          </section>
        </>
      ) : (
        <>
          <header className="intro live-intro">
            <div>
              <p className="eyebrow">SPRÁVCE · PRACOVNÍ LIST</p>
              <h1>Živá pracovní šablona INVESTICE</h1>
            </div>
            <p>
              Najeďte kurzorem na pole varianty nebo týdne a vyberte nabídku.
              Změna se ihned propíše do INVESTICE a později do stejného místa
              POUKÁZKY a DOKLADU. Řádky C1–C3 otevřete přímo v listu.
            </p>
          </header>

          <section className="live-workbench">
            <div className="live-selector-row">
              <div
                className="field-selector"
                onMouseEnter={() => !locked && setSelectorOpen("variant")}
                onMouseLeave={() => setSelectorOpen(null)}
              >
                <small>Kód varianty COTO</small>
                <button
                  disabled={locked}
                  onFocus={() => setSelectorOpen("variant")}
                  onClick={() => setSelectorOpen(selectorOpen === "variant" ? null : "variant")}
                  aria-expanded={selectorOpen === "variant"}
                >
                  <b>{variant}001</b>
                  <span>{chosenVariant.name}</span>
                  <em>▾</em>
                </button>
                {selectorOpen === "variant" && (
                  <div className="selector-menu" role="listbox">
                    {variantOptions.map((option) => (
                      <button
                        key={option.code}
                        className={variant === option.code ? "chosen" : ""}
                        onClick={() => chooseVariant(option.code)}
                      >
                        <b>{option.code}</b><span>{option.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="field-selector week-selector"
                onMouseEnter={() => !locked && setSelectorOpen("week")}
                onMouseLeave={() => setSelectorOpen(null)}
              >
                <small>Týden platnosti</small>
                <button
                  disabled={locked}
                  onFocus={() => setSelectorOpen("week")}
                  onClick={() => setSelectorOpen(selectorOpen === "week" ? null : "week")}
                  aria-expanded={selectorOpen === "week"}
                >
                  <b>{validity.period}</b><em>▾</em>
                </button>
                {selectorOpen === "week" && (
                  <div className="selector-menu week-menu" role="listbox">
                    {weeks.map((week) => (
                      <button
                        key={week.start}
                        className={start === week.start ? "chosen" : ""}
                        onClick={() => chooseWeek(week.start)}
                      >
                        {week.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="transfer-note">
              <span>●</span> Vybráno: <b>{variant}1</b> · <b>{validity.period}</b>.
              Stejné údaje čekají na přenos do všech tří dílů.
            </p>

            <div className="working-paper-wrap">
              <div className="paper-label">
                <span>ORIGINÁLNÍ DÍL 2 · INVESTICE</span>
                <small>Zelené značky ukazují vyplňovaná místa</small>
              </div>
              <div className="tvl-paper working-investment">
                <TvlSection
                  kind="investment"
                  {...sharedTvl}
                  showControls
                  onBack={() => setEntryStage("variants")}
                  onFinish={openStampedPreview}
                  onInspect={setSelected}
                />
                {!locked && (
                  <>
                    <button className="sheet-marker marker-c1" onClick={() => setSelected(0)} aria-label="Vyplnit řádek C1">+</button>
                    <button className="sheet-marker marker-c2" onClick={() => setSelected(1)} aria-label="Vyplnit řádek C2">+</button>
                    <button className="sheet-marker marker-c3" onClick={() => setSelected(2)} aria-label="Vyplnit řádek C3">+</button>
                  </>
                )}
              </div>
            </div>

            <p className="work-instruction">
              Klikněte na řádek C1, C2 nebo C3, napište nadpis a stručný popis a
              vyberte prioritu správce 1–3 Kč. Po vyplnění všech tří řádků
              ukončete editaci v okně A.
            </p>
            {formError && <p className="form-error work-error">{formError}</p>}
            <div className="workbench-actions">
              <button onClick={() => setEntryStage("variants")}>ZPĚT</button>
              <button className="finish-work" onClick={openStampedPreview}>UKONČIT EDITACI A ZOBRAZIT CELÝ TVL</button>
            </div>
          </section>

          <section className="manager-columns">
            <div>
              <p className="eyebrow">ŽIVÉ</p>
              <h2>Živé průzkumy</h2>
              {live.length ? (
                live.map((item) => (
                  <article key={item.code}>
                    <span className="live-dot" />
                    <div><b>{item.title}</b><small>{item.period}</small></div>
                    <code>{item.code}</code>
                  </article>
                ))
              ) : (
                <p className="empty-column">Po kontrole celého TVL a potvrzení se aktivita objeví zde.</p>
              )}
            </div>
            <div>
              <p className="eyebrow">UKONČENÉ</p>
              <h2>Ukončené průzkumy</h2>
              <p className="empty-column">
                Po skončení platnosti se zde objeví součtové výsledky a vazby
                na shodné projekty.
              </p>
            </div>
          </section>

          <section className="print-controls">
            <div>
              <p className="eyebrow">PAPÍROVÁ VERZE</p>
              <h2>Tisk celého TVL</h2>
              <p>
                Každý výtisk dostane vlastní identifikátor B. Všechny tři díly
                se tisknou na jedinou A4.
              </p>
            </div>
            <label>
              Počet číslovaných listů
              <input
                type="number"
                min="1"
                max="999"
                value={printCount}
                onChange={(event) =>
                  setPrintCount(Math.min(999, Math.max(1, Number(event.target.value))))
                }
              />
            </label>
            <button onClick={() => window.print()}>TISK CELÉHO TVL · {printCount} ks</button>
          </section>
        </>
      )}

      {selected !== null && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <p className="eyebrow">OKNO C · ŘÁDEK C{selected + 1}</p>
            <h2>Projekt, námět nebo otázka</h2>
            <label>
              Nadpis
              <input
                autoFocus
                disabled={locked}
                value={projects[selected].title}
                onChange={(event) => updateProject(selected, { title: event.target.value })}
              />
            </label>
            <label>
              Stručný popis
              <textarea
                disabled={locked}
                rows={6}
                value={projects[selected].detail}
                onChange={(event) => updateProject(selected, { detail: event.target.value })}
              />
            </label>
            <fieldset className="priority-choice" disabled={locked}>
              <legend>Priorita správce z účtu na propagaci</legend>
              {[1, 2, 3].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={projects[selected].value === value ? "chosen" : ""}
                  onClick={() => updateProject(selected, { value })}
                >
                  {value} Kč
                </button>
              ))}
            </fieldset>
            <div className="modal-note">
              Částka správce 1–3 Kč a hodnocení účastníka 1–9 bodů jsou dvě
              různá pole. Uložený řádek se ihned přenese do všech tří dílů TVL.
            </div>
            <button className="save" onClick={() => setSelected(null)}>
              {locked ? "ZAVŘÍT" : "ULOŽIT A PŘENÉST DO TVL"}
            </button>
          </section>
        </div>
      )}

      {preview && (
        <div className="preview-overlay">
          <div className="preview-toolbar">
            <div>
              <b>Celý TVL · časové razítko {activationStamp}</b>
              <span>
                Zkontrolujte POUKÁZKU včetně okna D, identifikátor B, INVESTICI
                a DOKLAD. Zpět razítko zruší; potvrzení TVL uzamkne.
              </span>
            </div>
            <div>
              <button onClick={returnToEditing}>ZPĚT K OPRAVÁM</button>
              <button className="confirm" onClick={confirm}>POTVRDIT {variant}1</button>
            </div>
          </div>
          <div className="preview-scroll">
            <div className="tvl-paper original-a4">
              <TvlSection kind="voucher" {...sharedTvl} onInspect={setSelected} />
              <div className="cut">✂ <span>oddělit POUKÁZKU</span></div>
              <TvlSection kind="investment" {...sharedTvl} onInspect={setSelected} />
              <div className="cut">✂ <span>oddělit INVESTICI</span></div>
              <TvlSection kind="receipt" {...sharedTvl} onInspect={setSelected} />
            </div>
          </div>
        </div>
      )}

      <div className="print-batch" aria-hidden="true">
        {(role === "manager"
          ? Array.from({ length: Math.min(999, printCount) }, (_, index) => index)
          : receipt ? [0] : []
        ).map((copyIndex) => {
          const printCode = code.slice(0, 17) + String(copyIndex + 1).padStart(4, "0");
          const printShared = {
            ...sharedTvl,
            code: printCode,
            participantScores: role === "participant" ? scores : undefined,
          };
          return (
            <div className="tvl-paper printed-sheet original-a4" key={printCode}>
              <div className="printed-number">TVL {variant}1 · pořadové číslo {copyIndex + 1}</div>
              <TvlSection kind="voucher" {...printShared} onInspect={() => {}} />
              <div className="cut">✂ <span>oddělit POUKÁZKU</span></div>
              <TvlSection kind="investment" {...printShared} onInspect={() => {}} />
              <div className="cut">✂ <span>oddělit INVESTICI</span></div>
              <TvlSection kind="receipt" {...printShared} onInspect={() => {}} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
