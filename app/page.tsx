"use client";

import { useEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";

type Project = { title: string; detail: string; unused: boolean };
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

const variantHelpKeys: Record<VariantCode, keyof EditableCopy> = {
  PN: "variantPN",
  VL: "variantVL",
  PP: "variantPP",
  VT: "variantVT",
};

const screenSteps = [
  "Ikona COTO",
  "Originální logo",
  "Cíl a filosofie",
  "Volba role",
  "Ověření správce",
  "Výběr varianty",
  "Živá šablona",
  "Celý TVL",
  "Přehled správce",
  "Průchod účastníka",
];

const initialProjects: Project[] = [
  { title: "", detail: "", unused: false },
  { title: "", detail: "", unused: false },
  { title: "", detail: "", unused: false },
];

const emptyPersonal: PersonalData = {
  name: "",
  street: "",
  city: "",
  nationality: "",
  identity: "",
};

const PURPOSE_STORAGE_KEY = "coto-purpose-text-2026-09-29";
const SCREEN_COPY_STORAGE_KEY = "coto-screen-copy-2026-09-30-v2";
const EDITABLE_COPY_STORAGE_KEY = "coto-editable-copy-2026-09-30";
const TVL_LAYOUT_STORAGE_KEY = "coto-tvl-layout-2026-09-30";
const TVL_LAYOUT_VERSION = 2;

const defaultScreenCopy: Record<number, string> = {
  1: "Klikni na ikonu a otevři COTO.",
  2: "Klikni na originální logo a přečti si cíl a filosofii projektu.",
  3: "Text cíle a filosofie můžeš upravit vpravo; změna se ihned ukáže vlevo.",
  4: "COTO vrací výsledky do nejmenších správních a společenských celků, kde téma vzniklo.",
  5: "Zadej IČO a samostatný účet na propagaci.",
  6: "Najetím kurzorem nebo prvním dotykem zobrazíš popis varianty. Kliknutím nebo druhým dotykem ji vybereš.",
  7: "Nejdřív vyber průzkum, potom hodnotu zkušeností správce a nakonec týden. Pak vyplň jeden až tři návrhy; nepoužité řádky označ křížkem.",
  8: "Zkontroluj celý třídílný TVL na jedné A4. Rozměry můžeš doladit vpravo.",
  9: "Do řádku každého TVL se vrací pouze statistický součet.",
  10: "Vyber správce, ohodnoť každý použitý návrh 1–9 body a odešli svůj TVL.",
};

const defaultVoucherHelp =
  "Toto místo pod dílem POUKÁZKA je vyhrazené pro nápovědu tiskové verze COTO pro účastníka. Text doplníme po kontrole šablon.";

type EditableCopy = {
  roleSummary: string;
  managerChoice: string;
  participantChoice: string;
  participantHelp: string;
  aresHeading: string;
  aresInstructions: string;
  verifiedManager: string;
  copySurveyLabel: string;
  variantPN: string;
  variantVL: string;
  variantPP: string;
  variantVT: string;
  managerListLabel: string;
  surveyChoiceLabel: string;
  surveyChoiceHelp: string;
  managerExperienceLabel: string;
  managerExperienceHelp: string;
  surveyWeekLabel: string;
  surveyWeekHelp: string;
  copyCountHelp: string;
  screen7Guide: string;
  timestampPurpose: string;
  printedIdentityHelp: string;
};

const defaultEditableCopy: EditableCopy = {
  roleSummary: "COTO je nástroj pro nejmenší správní a společenské celky – obce, spolky, školy nebo firmy, ale i pro osoby s vlastním IČO a samostatným účtem na propagaci. Na účtu správce ve výsledcích průzkumů najde každý účastník anonymně svůj vyplněný a odeslaný tiskopis TVL.",
  managerChoice: "IČO v systému ARES a samostatný Účet na propagaci ti potvrdí schopnost nabízet řešení otázek a potřebných projektů.",
  participantChoice: "Vyber v seznamu správce a průzkumy vhodné pro tvou podporu.",
  participantHelp: "Řešení podpoříš odesláním svého hodnocení. Poslat přátelům odkaz na šikovné projekty tě asi napadne. Velikost podpory stejného průzkumu donutí správce jednat – a také mu umožní vhodná řešení realizovat s doložitelnou podporou fyzických účastníků průzkumu. Anonymizér v trojici šablon listu TVL řeší vše… tvl… neke…",
  aresHeading: "Ověření správce v ARES a účtu na propagaci v bankovním prostředí",
  aresInstructions: "Zadej IČO a samostatný účet na propagaci.\n\n1. Kontrola IČO správce v ARES a v bankovní identitě proběhne automaticky.\n2. Na chybné či neexistující IČO nebo účet upozorní hláška.\n3. Takto ověřenému správci se jeho identita zobrazí ihned v otevřené pracovní šabloně. Správce může pod identitu v okně A doplnit logo své firmy; obec vloží lvíčka.",
  verifiedManager: "Ověřený správce",
  copySurveyLabel: "Vlož kód jiného průzkumu stejné varianty",
  variantPN: "Průzkum názorů: náměty, otázky a jejich podpora.",
  variantVL: "Vyber lepší: porovnání dvou nebo více možností.",
  variantPP: "Podpora projektu: podpora konkrétního projektu.",
  variantVT: "Volební tombola: výběr lidí spojených s řešením.",
  managerListLabel: "Seznam správců pro účastníka",
  surveyChoiceLabel: "Průzkum názorů a řešení",
  surveyChoiceHelp: "Nejdřív otevři nabídku a vyber PN, VL, PP nebo VT. Označení kódu se zobrazí až po výběru.",
  managerExperienceLabel: "Hodnota zkušeností správce",
  managerExperienceHelp: "1 = 20–39 let, 2 = 40–59 let, 3 = 60–89 let. V tiskopisu se zobrazí pouze zvolená číslice 1–3.",
  surveyWeekLabel: "Týden průzkumu pro kódy VL a VT",
  surveyWeekHelp: "VL = Vyber lepší = referendum pod jiným názvem. VT = Volební tombola = průzkum emocí před volbami. Průzkum trvá od pondělí do neděle do 24:00. Nejdřív vyber kód, potom týden.",
  copyCountHelp: "Jde jen o orientační počet, který upozorňuje na zájem o průzkum. Jinému správci kliknutí otevře seznam variant. Stejná varianta se zvýrazní a po výběru zapíše do čisté pracovní šablony Variaci: původní kód a časové razítko kopie.",
  screen7Guide: "1. Nejdřív vyber průzkum; označení kódu se ukáže až potom.\n2. Vyber hodnotu zkušeností správce 1–3 a následně týden průzkumu.\n3. Vyplň jeden až tři návrhy potřeb nebo řešení otázek; nepoužité řádky označ křížkem.",
  timestampPurpose: "Zamkne editaci a uloží průzkum do seznamů s výsledky v prostředí účtu na propagaci. Pomáhá také rychleji vyhledat aktivity účastníků.",
  printedIdentityHelp: "U variant VL a VT vyplňují účastníci tištěné listy osobně po ztotožnění. První díl si ponechají, druhé dva vhodí do urny.",
};

type TvlLayout = {
  voucher: number;
  investment: number;
  cRow: number;
  windowD: number;
  identityRow: number;
};

const defaultTvlLayout: TvlLayout = {
  voucher: 34,
  investment: 31,
  cRow: 26,
  windowD: 35,
  identityRow: 17,
};

const defaultPurposeText = `Cílem PRŮZKUMU NÁZORŮ aplikací COTO – v internetové i tištěné verzi je obnovení důvěry v hodnotu hlasu voliče.

Aplikace COTO (Co/dáš a To/máš) mění formu průzkumů a zavedených volebních nástrojů na průkazný, anonymně kontrolovatelný proces – každým účastníkem průzkumu (!!!).

Třídílný Volební List (TVL ….řeší vše……..tvl!!!) umožňuje jednoduchou komunikaci užitím čtyř variant aplikace COTO, každá zpracovává hlavní potřeby řešení a řízení společných i společenských témat. Shodný kód na trojici šablon + „časové razítko“ usnadňují vyhledávání svých TVL v množině správců a průzkumů, které můžeme podpořit svým hodnocením… aplikací v mobilu.

Dobré průzkumy sdílením a kopírováním dobrých návrhů, projektů… posilují množinu lidí a obcí se stejnou problematikou… a donutí vládu problém řešit „zdola“, od nápadů jednotlivců.`;

const purposeHighlights = [
  ["PRŮZKUMU NÁZORŮ aplikací COTO", "purpose-red"],
  ["průkazný, anonymně kontrolovatelný proces", "purpose-green"],
  ["každým účastníkem průzkumu (!!!)", "purpose-red"],
  ["obnovení důvěry", "purpose-blue"],
  ["v hodnotu hlasu voliče", "purpose-blue"],
  ["Třídílný Volební List", "purpose-red"],
  ["Co/dáš a To/máš", "purpose-green"],
  ["Shodný kód", "purpose-blue"],
  ["časové razítko", "purpose-blue"],
  ["Dobré průzkumy", "purpose-green"],
  ["zdola", "purpose-red"],
] as const;

function renderPurposeText(text: string) {
  const escaped = purposeHighlights
    .map(([phrase]) => phrase)
    .sort((a, b) => b.length - a.length)
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const matcher = new RegExp(`(${escaped.join("|")})`, "gi");

  return text.split(matcher).map((part, index) => {
    const highlighted = purposeHighlights.find(
      ([phrase]) => phrase.toLocaleLowerCase("cs-CZ") === part.toLocaleLowerCase("cs-CZ"),
    );
    if (!highlighted) return part;
    return <strong className={highlighted[1]} key={part + index}>{part}</strong>;
  });
}

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

function ResultsJourney({
  scoreTotal,
  linkedTvlCount = 1,
}: {
  scoreTotal?: number;
  linkedTvlCount?: number;
}) {
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
        správci i do každého původního nebo zkopírovaného TVL. Vrací se pouze
        statistický součet, ne názvy témat ani osobní údaje. Právě je
        propojeno {linkedTvlCount} {linkedTvlCount === 1 ? "použité TVL" : "použitých TVL"};
        na všech se načte shodný výsledek a ukáže, na které úrovni má vzniklý
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

function PromotionAccountResults({
  account,
  identifier,
  scores,
  linkedTvlCount,
}: {
  account: string;
  identifier: string;
  scores: number[];
  linkedTvlCount: number;
}) {
  const scoreTotal = scores.reduce((sum, score) => sum + score, 0);
  return (
    <section className="promotion-account" aria-label="Řádkové výsledky účtu na propagaci">
      <header>
        <div>
          <p className="eyebrow">KONTROLA ÚČASTNÍKA</p>
          <h2>Účet na propagaci</h2>
        </div>
        <code>{account}</code>
      </header>
      <p>
        Pod anonymním identifikátorem tu najdeš pouze statistický součet za
        každý použitý TVL. Názvy témat ani osobní údaje z okna D se sem nepřenášejí.
      </p>
      <div className="account-result-head" aria-hidden="true">
        <span>TVL</span><span>Propojení</span><span>Účet správce</span><span>Součet bodů</span>
      </div>
      {Array.from({ length: linkedTvlCount }, (_, index) => (
        <div className="account-result-row" key={index}>
          <code>{index === 0 ? identifier : `propojený TVL ${index + 1}`}</code>
          <b>{index === 0 ? "původní list" : "kopie jiného správce"}</b>
          <span>{account}</span>
          <strong>{index === 0 ? scoreTotal || "–" : "čeká na součet"}</strong>
        </div>
      ))}
      <small>
        Výsledek je načtený do všech propojených listů COTO: {linkedTvlCount}× TVL.
      </small>
    </section>
  );
}

function LiveScreenEditor({
  current,
  note,
  onNote,
  editableCopy,
  onEditableCopy,
  purposeText,
  onPurposeText,
  onRestorePurpose,
  voucherHelp,
  onVoucherHelp,
  layout,
  onLayout,
}: {
  current: number;
  note: string;
  onNote: (value: string) => void;
  editableCopy: EditableCopy;
  onEditableCopy: (key: keyof EditableCopy, value: string) => void;
  purposeText: string;
  onPurposeText: (value: string) => void;
  onRestorePurpose: () => void;
  voucherHelp: string;
  onVoucherHelp: (value: string) => void;
  layout: TvlLayout;
  onLayout: (key: keyof TvlLayout, value: number) => void;
}) {
  const editableFields: Partial<Record<number, Array<[keyof EditableCopy, string]>>> = {
    4: [
      ["roleSummary", "Žluté úvodní pole"],
      ["managerChoice", "Text v poli SPRÁVCE"],
      ["participantChoice", "Text v poli ÚČASTNÍK"],
      ["participantHelp", "Žlutá nápověda účastníka"],
      ["managerListLabel", "Nadpis seznamu správců"],
    ],
    5: [
      ["aresHeading", "Společný nadpis obrazovky"],
      ["aresInstructions", "Pokyny k ověření"],
    ],
    6: [
      ["verifiedManager", "Řádek ověřeného správce"],
      ["copySurveyLabel", "Pokyn pro kód jiného průzkumu"],
      ["variantPN", "Žlutá nápověda PN"],
      ["variantVL", "Žlutá nápověda VL"],
      ["variantPP", "Žlutá nápověda PP"],
      ["variantVT", "Žlutá nápověda VT"],
    ],
    7: [
      ["surveyChoiceLabel", "Nadpis první volby"],
      ["surveyChoiceHelp", "Nápověda první volby"],
      ["managerExperienceLabel", "Nadpis prostřední volby"],
      ["managerExperienceHelp", "Nápověda zkušeností 1–3"],
      ["surveyWeekLabel", "Nadpis volby týdne"],
      ["surveyWeekHelp", "Nápověda VL, VT a týdne"],
      ["screen7Guide", "Postup práce v obrazovce 07"],
      ["timestampPurpose", "Úloha časového razítka"],
      ["printedIdentityHelp", "Tištěné varianty VL a VT"],
    ],
    9: [["copyCountHelp", "Nápověda počtu kopií"]],
    10: [["copyCountHelp", "Nápověda počtu kopií"]],
  };
  const confirmWithEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <aside className="live-screen-editor" aria-label={`Opravy obrazovky ${current}`}>
      <header>
        <span>OPRAVY OBRAZOVKY</span>
        <strong>{String(current).padStart(2, "0")}</strong>
        <b>{screenSteps[current - 1]}</b>
      </header>
      <div className="editor-screen-list" aria-label="Číslování obrazovek">
        {screenSteps.map((_, index) => (
          <span className={index + 1 === current ? "active" : ""} key={index}>{String(index + 1).padStart(2, "0")}</span>
        ))}
      </div>
      {!editableFields[current] && (
        <label>
          Text přímo v levé obrazovce
          <textarea value={note} onKeyDown={confirmWithEnter} onChange={(event) => onNote(event.target.value)} />
        </label>
      )}
      {editableFields[current]?.map(([key, label]) => (
        <label key={key}>
          {label}
          <textarea
            value={editableCopy[key]}
            onKeyDown={confirmWithEnter}
            onChange={(event) => onEditableCopy(key, event.target.value)}
          />
        </label>
      ))}
      {current === 3 && (
        <>
          <label>
            Cíl a filosofie
            <textarea id="purpose-text-editor" className="long-editor" value={purposeText} onChange={(event) => onPurposeText(event.target.value)} />
          </label>
          <button type="button" onClick={onRestorePurpose}>VRÁTIT TEXT Z 29. 9. 2026</button>
        </>
      )}
      {current === 8 && (
        <>
          <label>
            Text pod dílem POUKÁZKA
            <textarea value={voucherHelp} onChange={(event) => onVoucherHelp(event.target.value)} />
          </label>
          <div className="layout-controls">
            <b>POSUN LINEK A OKEN NA A4</b>
            <label>Výška POUKÁZKY <output>{layout.voucher}%</output><input type="range" min="34" max="44" step="0.5" value={layout.voucher} onChange={(e) => onLayout("voucher", Number(e.target.value))} /></label>
            <label>Výška INVESTICE <output>{layout.investment}%</output><input type="range" min="23" max="32" step="0.5" value={layout.investment} onChange={(e) => onLayout("investment", Number(e.target.value))} /></label>
            <label>Výška řádku C <output>{layout.cRow}px</output><input type="range" min="18" max="31" value={layout.cRow} onChange={(e) => onLayout("cRow", Number(e.target.value))} /></label>
            <label>Výška okna D <output>{layout.windowD}%</output><input type="range" min="28" max="46" value={layout.windowD} onChange={(e) => onLayout("windowD", Number(e.target.value))} /></label>
            <label>Řádek identifikátoru D <output>{layout.identityRow}px</output><input type="range" min="13" max="25" value={layout.identityRow} onChange={(e) => onLayout("identityRow", Number(e.target.value))} /></label>
          </div>
        </>
      )}
      <p>Text se při psaní ihned mění na svém místě vlevo. Enter potvrdí; Shift+Enter vloží nový řádek.</p>
    </aside>
  );
}

function ScreenBadge({ current }: { current: number }) {
  return (
    <div className="screen-badge" aria-label={"Obrazovka " + current}>
      <span>{String(current).padStart(2, "0")}</span>
      <b>{screenSteps[current - 1]}</b>
    </div>
  );
}

function CutLine({ label }: { label: string }) {
  return (
    <div className="cut">
      <span className="cut-scissors" aria-hidden="true">✂</span>
      <em>{label}</em>
      <i />
      <span className="cut-scissors cut-scissors-right" aria-hidden="true">✂</span>
    </div>
  );
}

function TvlSection({
  kind,
  code,
  organiser,
  managerLogo,
  variant,
  surveyValue,
  title,
  validFrom,
  validTo,
  projects,
  participantScores,
  participantSymbols,
  personal,
  activationStamp,
  variationSourceCode,
  variationCopyStamp,
  currentDate,
  currentTime,
  timestampPurpose,
  printedIdentityHelp,
  voucherHelp,
  showWindowGuides = false,
  codeVisible = true,
  showControls,
  onBack,
  onFinish,
  onInspect,
}: {
  kind: SectionKind;
  code: string;
  organiser: string;
  managerLogo?: string;
  variant: VariantCode;
  surveyValue: number;
  title: string;
  validFrom: string;
  validTo: string;
  projects: Project[];
  participantScores?: number[];
  participantSymbols?: string[];
  personal?: PersonalData;
  activationStamp?: string;
  variationSourceCode?: string;
  variationCopyStamp?: string;
  currentDate: string;
  currentTime: string;
  timestampPurpose: string;
  printedIdentityHelp: string;
  voucherHelp?: string;
  showWindowGuides?: boolean;
  codeVisible?: boolean;
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
  const personalIdentifierLabel =
    variant === "PP" ? "Číslo bankovní transakce" : "Rodné číslo";
  const identifierCode = (codeVisible ? code : "").padEnd(17, " ").slice(0, 17);

  return (
    <section className={"tvl-section " + kind} aria-label={labels[kind]}>
      <div className="tvl-topline">
        <span>
          <b>Kód varianty COTO</b>
          <i>{codeVisible ? `${variant}001` : "—"}</i>
        </span>
        <h2><em>{numbers[kind]}</em> {labels[kind]}</h2>
        <span>
          <b>Hodnota zkušeností správce</b>
          <i>{surveyValue}</i>
        </span>
        <span className="validity">
          <b>Týden platnosti listu</b>
          <i>{validFrom}</i>
          <i>{validTo}</i>
        </span>
      </div>

      <div className="tvl-columns">
        <div className="tvl-left">
          <div className="choice-box window-e">
            {showWindowGuides && <span className="window-letter">E</span>}
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
            <span>{showWindowGuides && <mark>B</mark>}Volitelný kód účastníka</span>
          </div>
          <div className="identifier window-b">
            {identifierCode.split("").map((symbol, index) => (
              <span className="identifier-symbol identifier-generated" key={`generated-${index}`}>{symbol}</span>
            ))}
            {Array.from({ length: 4 }, (_, index) => (
              <span className="identifier-symbol" key={index}>
                {participantSymbols?.[index] || ""}
              </span>
            ))}
          </div>

          <div className="admin-box window-a">
            <div className="stamp">
              <span>{showWindowGuides && <mark>A</mark>}Ověřený správce z ARES</span>
              <i>{organiser.match(/\d{8}/)?.[0] || "IČO"}</i>
              <small>{organiser}</small>
              {managerLogo && <img className="manager-logo-in-window-a" src={managerLogo} alt="Logo ověřeného správce" />}
            </div>
            <div className="activation">
              <div className="running-date-time">
                <p><span>Datum</span><strong>{currentDate}</strong></p>
                <p><span>Běžící čas</span><strong>{currentTime}</strong></p>
              </div>
              <div className="timestamp-box">
                <strong className="timestamp-heading">ČASOVÉ RAZÍTKO</strong>
                <small>{timestampPurpose}</small>
                <b>{activationStamp || "zatím nevytvořeno"}</b>
              </div>
              {variationSourceCode && (
                <div className="variation-record">
                  <strong>VARIACE</strong>
                  <span>{variationSourceCode}</span>
                  <b>{variationCopyStamp || "časové razítko vznikne výběrem varianty"}</b>
                </div>
              )}
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
            <h3>{codeVisible ? title : "Průzkum zatím nevybrán"}</h3>
            <div className="project-list window-c">
              {showWindowGuides && <span className="window-letter">C</span>}
              <div className="project-columns">
                <span>Návrh, otázka nebo projekt</span>
                <b>Hodnocení účastníkem 1–9</b>
              </div>
              {projects.map((project, index) => (
                <button
                  key={index}
                  className={"project-row " + (project.unused ? "unused-project" : "")}
                  onClick={() => onInspect(index)}
                  title={showControls
                    ? "Správce: kliknutím otevři nadpis a popis tématu"
                    : "Kliknutím otevři celý popis"}
                  aria-label="Otevřít téma v okně C"
                >
                  <span className="project-field">
                    <strong>
                      {project.unused ? "× NEPOUŽITO" : project.title || "Klikni a zapiš projekt nebo otázku"}
                    </strong>
                  </span>
                  <span
                    className={
                      "participant-score " +
                      (participantScores?.[index] ? "returned" : "")
                    }
                  >
                    {project.unused ? "×" : participantScores?.[index] || ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {kind === "voucher" && (
            <div className="personal-only window-d">
              {showWindowGuides && <span className="window-letter">D</span>}
              <div className="personal-address">
                <div className="address-lines">
                  <span>Jméno a příjmení účastníka {personal?.name || "................................"}</span>
                  <span>ulice / část obce {personal?.street || "........................................"}</span>
                  <span>obec / PSČ {personal?.city || "..............................................."}</span>
                  <span>národnost {personal?.nationality || "............................................"}</span>
                </div>
                <div className="qr">
                  <span>OSOBNÍ</span>
                  <b>QR</b>
                  <span>účastníka</span>
                </div>
              </div>
              <div className="personal-identifier-row">
                <b>{personalIdentifierLabel}</b>
                <span>{personal?.identity || "□ □ □ □ □ □ / □ □ □ □"}</span>
              </div>
            </div>
          )}

          {kind === "investment" && (
            <div className="section-explanation">
              <b>Kvalita účastníka je zdrojem i cílem správce.</b>
              <ol>
                <li>Správce vloží jeden až tři návrhy a číslicí 1–3 označí hodnotu svých zkušeností.</li>
                <li>Účastník každý projekt samostatně posílí hodnocením 1–9 bodů.</li>
                <li>Potvrzená akce přejde mezi živé a po týdnu do výsledků.</li>
              </ol>
              {(variant === "VL" || variant === "VT") && <p className="printed-identity-help">{printedIdentityHelp}</p>}
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
        <div className="voucher-footer">
          <div className="voucher-instructions">
            {voucherHelp || defaultVoucherHelp}
          </div>
          <div className="invalid-warning">
            PŘI PŘEPISOVÁNÍ A ŠKRTÁNÍ JE TIŠTĚNÝ LIST NEPLATNÝ!
          </div>
        </div>
      )}
      {kind === "receipt" && (
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
  const [touchPreviewVariant, setTouchPreviewVariant] = useState<VariantCode | null>(null);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [organiser, setOrganiser] = useState("Jan Koňas · správce COTO · IČO 12226491");
  const [managerLogo, setManagerLogo] = useState("");
  const [ico, setIco] = useState("12226491");
  const [account, setAccount] = useState("4310751369/0800");
  const [aresVerified, setAresVerified] = useState(false);
  const [copySurveyMode, setCopySurveyMode] = useState(false);
  const [copiedSurveyCode, setCopiedSurveyCode] = useState("");
  const [start, setStart] = useState(weeks[0]?.start || "");
  const [surveyValue, setSurveyValue] = useState(1);
  const [screen7CodeChosen, setScreen7CodeChosen] = useState(false);
  const [experienceChosen, setExperienceChosen] = useState(false);
  const [weekChosen, setWeekChosen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState<
    "variant" | "value" | "week" | null
  >(null);
  const [preview, setPreview] = useState(false);
  const [locked, setLocked] = useState(false);
  const [live, setLive] = useState<
    { title: string; period: string; code: string; variant: VariantCode }[]
  >([]);
  const [participantOpen, setParticipantOpen] = useState(false);
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [participantSymbols, setParticipantSymbols] = useState<string[]>(["", "", "", ""]);
  const [personal, setPersonal] = useState<PersonalData>(emptyPersonal);
  const [receipt, setReceipt] = useState("");
  const [showAccountResults, setShowAccountResults] = useState(false);
  const [copiedSurveyCount, setCopiedSurveyCount] = useState(0);
  const [wholeSurveyCopyCounts, setWholeSurveyCopyCounts] = useState<Record<string, number>>({});
  const [lastWholeSurveyCopyAt, setLastWholeSurveyCopyAt] = useState<Record<string, string>>({});
  const [variationSourceCode, setVariationSourceCode] = useState("");
  const [variationCopyStamp, setVariationCopyStamp] = useState("");
  const [copyPanelOpen, setCopyPanelOpen] = useState(false);
  const [copySelection, setCopySelection] = useState([true, true, true]);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");
  const [activationStamp, setActivationStamp] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [printCount] = useState(1);
  const [formError, setFormError] = useState("");
  const [purposeText, setPurposeText] = useState(defaultPurposeText);
  const [screenCopy, setScreenCopy] = useState<Record<number, string>>(defaultScreenCopy);
  const [editableCopy, setEditableCopy] = useState<EditableCopy>(defaultEditableCopy);
  const [voucherHelp, setVoucherHelp] = useState(defaultVoucherHelp);
  const [tvlLayout, setTvlLayout] = useState<TvlLayout>(defaultTvlLayout);

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

  useEffect(() => {
    const restoreSavedWork = window.setTimeout(() => {
      try {
        const savedCopy = window.localStorage.getItem(SCREEN_COPY_STORAGE_KEY);
        if (savedCopy) setScreenCopy({ ...defaultScreenCopy, ...JSON.parse(savedCopy) });
        const savedEditableCopy = window.localStorage.getItem(EDITABLE_COPY_STORAGE_KEY);
        if (savedEditableCopy) setEditableCopy({ ...defaultEditableCopy, ...JSON.parse(savedEditableCopy) });
        const savedLayout = window.localStorage.getItem(TVL_LAYOUT_STORAGE_KEY);
        if (savedLayout) {
          const parsed = JSON.parse(savedLayout);
          setTvlLayout(parsed.version === TVL_LAYOUT_VERSION
            ? { ...defaultTvlLayout, ...parsed.layout }
            : defaultTvlLayout);
          setVoucherHelp(parsed.voucherHelp || defaultVoucherHelp);
        }
      } catch {
        // Poškozené místní nastavení nesmí zastavit živou šablonu.
      }
    }, 0);
    return () => window.clearTimeout(restoreSavedWork);
  }, []);

  useEffect(() => {
    const savedPurpose = window.localStorage.getItem(PURPOSE_STORAGE_KEY);
    if (!savedPurpose) return;
    const restoreSavedPurpose = window.setTimeout(() => setPurposeText(savedPurpose), 0);
    return () => window.clearTimeout(restoreSavedPurpose);
  }, []);

  const updatePurposeText = (nextText: string) => {
    setPurposeText(nextText);
    window.localStorage.setItem(PURPOSE_STORAGE_KEY, nextText);
  };

  const restorePurposeText = () => {
    setPurposeText(defaultPurposeText);
    window.localStorage.setItem(PURPOSE_STORAGE_KEY, defaultPurposeText);
  };

  const updateScreenCopy = (screen: number, value: string) => {
    setScreenCopy((current) => {
      const next = { ...current, [screen]: value };
      window.localStorage.setItem(SCREEN_COPY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateEditableCopy = (key: keyof EditableCopy, value: string) => {
    setEditableCopy((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(EDITABLE_COPY_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateVoucherHelp = (value: string) => {
    setVoucherHelp(value);
    window.localStorage.setItem(TVL_LAYOUT_STORAGE_KEY, JSON.stringify({ version: TVL_LAYOUT_VERSION, layout: tvlLayout, voucherHelp: value }));
  };

  const updateTvlLayout = (key: keyof TvlLayout, value: number) => {
    setTvlLayout((current) => {
      const next = { ...current, [key]: value };
      window.localStorage.setItem(TVL_LAYOUT_STORAGE_KEY, JSON.stringify({ version: TVL_LAYOUT_VERSION, layout: next, voucherHelp }));
      return next;
    });
  };

  const shareLiveApp = async () => {
    const url = window.location.origin + window.location.pathname;
    const shareData = {
      title: "COTO – živá aplikace",
      text: "Otevři COTO – živou aplikaci pro průzkum názorů.",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareFeedback("Nabídka pro odeslání odkazu je otevřená.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Odkaz na živou aplikaci je zkopírovaný.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareFeedback("Odkaz zkopíruj z adresního řádku Chrome.");
    }
  };

  const receiptShare = Math.max(20, 96 - tvlLayout.voucher - tvlLayout.investment);
  const tvlLayoutStyle = {
    "--voucher-share": `${tvlLayout.voucher}%`,
    "--investment-share": `${tvlLayout.investment}%`,
    "--receipt-share": `${receiptShare}%`,
    "--c-row-height": `${tvlLayout.cRow}px`,
    "--window-d-height": `${tvlLayout.windowD}%`,
    "--window-d-id-height": `${tvlLayout.identityRow}px`,
  } as CSSProperties;

  const renderEditor = (current: number) => (
    <LiveScreenEditor
      current={current}
      note={screenCopy[current] || ""}
      onNote={(value) => updateScreenCopy(current, value)}
      editableCopy={editableCopy}
      onEditableCopy={updateEditableCopy}
      purposeText={purposeText}
      onPurposeText={updatePurposeText}
      onRestorePurpose={restorePurposeText}
      voucherHelp={voucherHelp}
      onVoucherHelp={updateVoucherHelp}
      layout={tvlLayout}
      onLayout={updateTvlLayout}
    />
  );

  const chosenVariant = variantOptions.find((option) => option.code === variant) || variantOptions[0];
  const title = variant + "1 · " + chosenVariant.name;

  const validity = useMemo(() => {
    const date = new Date(start + "T12:00:00");
    if (Number.isNaN(date.getTime())) return { from: "", to: "", period: "vyber týden" };
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
    return variant + datePart + "COTO001";
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
    if (copySurveyMode && copiedSurveyCode.trim() && !copiedSurveyCode.trim().toUpperCase().startsWith(nextVariant)) {
      setFormError("Variace musí zůstat ve stejné variantě jako původní průzkum.");
      return;
    }
    setVariant(nextVariant);
    setHoveredVariant(nextVariant);
    setScreen7CodeChosen(true);
    setExperienceChosen(false);
    setWeekChosen(false);
    setSelectorOpen(null);
    setFormError("");
  };

  const openWorkingVariant = (nextVariant: VariantCode) => {
    const sourceCode = copiedSurveyCode.trim().toUpperCase();
    if (copySurveyMode && !sourceCode) {
      setFormError("Vlož kód průzkumu, který chceš celý převzít.");
      return;
    }
    if (copySurveyMode && !sourceCode.startsWith(nextVariant)) {
      setFormError(`Kód ${sourceCode} patří do jiné varianty. Vyber stejnou variantu jako na začátku kódu.`);
      return;
    }
    if (copySurveyMode) {
      const now = new Date();
      setCopiedSurveyCode(sourceCode);
      setVariationSourceCode(sourceCode);
      setVariationCopyStamp(now.toLocaleString("cs-CZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      }));
    } else {
      setVariationSourceCode("");
      setVariationCopyStamp("");
    }
    setVariant(nextVariant);
    setHoveredVariant(nextVariant);
    setScreen7CodeChosen(copySurveyMode);
    setExperienceChosen(false);
    setWeekChosen(false);
    setSelectorOpen(null);
    setFormError("");
    setEntryStage("app");
  };

  const startWholeSurveyCopy = (item: { code: string; variant: VariantCode }) => {
    setCopySurveyMode(true);
    setCopiedSurveyCode(item.code);
    setVariant(item.variant);
    setHoveredVariant(item.variant);
    setVariationSourceCode(item.code);
    setVariationCopyStamp(lastWholeSurveyCopyAt[item.code] || "");
    setLocked(false);
    setPreview(false);
    setActivationStamp("");
    setFormError("");
    setEntryStage("variants");
  };

  const chooseWeek = (nextStart: string) => {
    setStart(nextStart);
    setWeekChosen(true);
    setSelectorOpen(null);
    setFormError("");
  };

  const chooseSurveyValue = (nextValue: number) => {
    setSurveyValue(nextValue);
    setExperienceChosen(true);
    setWeekChosen(false);
    setSelectorOpen(null);
    setFormError("");
  };

  const openStampedPreview = () => {
    const activeProjects = projects.filter((project) => !project.unused);
    const missingProjects = projects
      .map((project, index) =>
        project.unused || (project.title.trim() && project.detail.trim()) ? "" : String(index + 1),
      )
      .filter(Boolean);
    if (!screen7CodeChosen || !experienceChosen || !weekChosen || !activeProjects.length || missingProjects.length) {
      setFormError(
        !screen7CodeChosen
          ? "Nejdřív vyber průzkum. Teprve potom se zobrazí jeho kód."
          : !experienceChosen
            ? "Vyber hodnotu zkušeností správce 1, 2 nebo 3."
            : !weekChosen
              ? "Vyber týden průzkumu od pondělí do neděle."
              : !activeProjects.length
                ? "Vyplň aspoň jeden návrh. Nepoužité řádky označ křížkem."
                : `Doplň název i stručný popis aktivních návrhů${missingProjects.length ? `; zkontroluj řádek ${missingProjects.join(", ")}` : ""}.`,
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
    setLive((current) => [
      ...current.filter((item) => item.code !== code),
      { title, period: validity.period, code, variant },
    ]);
    if (copySurveyMode && copiedSurveyCode.trim()) {
      const sourceCode = copiedSurveyCode.trim().toUpperCase();
      setWholeSurveyCopyCounts((current) => ({
        ...current,
        [sourceCode]: (current[sourceCode] || 0) + 1,
      }));
      setLastWholeSurveyCopyAt((current) => ({
        ...current,
        [sourceCode]: variationCopyStamp || activationStamp,
      }));
    }
    setCopySurveyMode(false);
    setCopiedSurveyCode("");
    setEntryStage("dashboard");
  };

  const sendOpinion = () => {
    if (projects.some((project, index) => !project.unused && (scores[index] < 1 || scores[index] > 9))) {
      window.alert("Přiděl každému použitému návrhu hodnocení od 1 do 9 bodů.");
      return;
    }
    const stamp = new Date();
    setReceipt(
      code + participantSymbols.join("") + "-" + stamp.getTime().toString(36).toUpperCase() + " · " +
      stamp.toLocaleString("cs-CZ", { fractionalSecondDigits: 3 }),
    );
    setShowAccountResults(true);
  };

  const copySelectedProjects = () => {
    const selectedProjects = projects.filter((project, index) => copySelection[index] && !project.unused);
    if (!selectedProjects.length) {
      setCopyFeedback("Vyber aspoň jeden nápad, otázku nebo projekt.");
      return;
    }
    const copiedText = selectedProjects
      .map((project) => project.title + "\n" + project.detail)
      .join("\n\n");
    void navigator.clipboard?.writeText(copiedText);
    setCopiedSurveyCount((count) => count + 1);
    setCopyFeedback(
      selectedProjects.length === 1
        ? "Zkopíroval se jeden vybraný námět a zůstal propojený s výsledkem."
        : `Zkopírovaly se ${selectedProjects.length} vybrané náměty a zůstaly propojené s výsledkem.`,
    );
  };

  const sharedTvl = {
    code,
    organiser,
    managerLogo,
    variant,
    surveyValue,
    title,
    validFrom: weekChosen ? validity.from : "",
    validTo: weekChosen ? validity.to : "",
    projects,
    participantSymbols,
    personal,
    activationStamp,
    variationSourceCode,
    variationCopyStamp,
    currentDate,
    currentTime,
    timestampPurpose: editableCopy.timestampPurpose,
    printedIdentityHelp: editableCopy.printedIdentityHelp,
    voucherHelp,
    codeVisible: screen7CodeChosen,
  };

  if (entryStage === "icon") {
    return (
      <main className="entry-screen with-live-editor">
        <ScreenBadge current={1} />
        {renderEditor(1)}
        <p className="screen-inline-copy entry-copy" aria-live="polite">{screenCopy[1]}</p>
        <button
          className="coto-entry-icon video-look original-icon"
          onClick={() => setEntryStage("logo")}
          aria-label="Otevřít COTO"
        >
          <img src="/COTO-testovac/coto-icon-original-2026-09-28.png" alt="Původní ikona COTO" />
        </button>
      </main>
    );
  }

  if (entryStage === "logo") {
    return (
      <main className="entry-screen with-live-editor">
        <ScreenBadge current={2} />
        {renderEditor(2)}
        <p className="screen-inline-copy entry-copy" aria-live="polite">{screenCopy[2]}</p>
        <button
          className="coto-entry-logo coto-entry-logo-image"
          onClick={() => setEntryStage("purpose")}
          aria-label="Pokračovat z loga COTO k cíli aplikace"
        >
          <img
            src="/COTO-testovac/coto-logo-original.png"
            alt="COTO – Co/dáš a To/máš, aplikace pro spravedlivou výměnu informací"
          />
        </button>
      </main>
    );
  }

  if (entryStage === "purpose") {
    return (
      <main className="entry-screen with-live-editor">
        <ScreenBadge current={3} />
        {renderEditor(3)}
        <section className="entry-panel purpose-panel" id="dokument-projekt-coto">
          <button
            className="purpose-close"
            onClick={() => setEntryStage("logo")}
            aria-label="Zpět k logu COTO"
          >
            ×
          </button>
          <p className="eyebrow">PROJEKT COTO · OBRAZOVKA 03</p>
          <p className="screen-inline-copy" aria-live="polite">{screenCopy[3]}</p>
          <h1>Cíl a filosofie internetové aplikace COTO</h1>
          <div className="purpose-workspace">
            <div className="purpose-copy" aria-label="Výsledný text cíle a filosofie">
              {purposeText.split(/\n\s*\n/).map((paragraph, index) => (
                <p className={index === 2 ? "purpose-added" : undefined} key={index}>
                  {renderPurposeText(paragraph)}
                </p>
              ))}
            </div>
          </div>
          <div className="purpose-actions">
            <span>Dokument Projekt COTO</span>
            <button onClick={() => setEntryStage("roles")}>POKRAČOVAT DO COTO →</button>
          </div>
        </section>
      </main>
    );
  }

  if (entryStage === "roles") {
    return (
      <main className="entry-screen with-live-editor">
        <ScreenBadge current={4} />
        {renderEditor(4)}
        <section className="entry-panel role-panel">
          <img className="entry-mini-logo" src="/COTO-testovac/coto-logo-original.png" alt="Logo COTO" />
          <p className="role-summary" aria-live="polite">{editableCopy.roleSummary}</p>
          <h1>Vyber si</h1>
          <div className="role-buttons">
            <button
              className="manager-help"
              data-help="Jako správce založíš průzkum, vyplníš živou šablonu a po kontrole ji uzamkneš."
              onClick={() => { setRole("manager"); setEntryStage("ares"); }}
            >
              <strong>SPRÁVCE</strong>
              <small aria-live="polite">{editableCopy.managerChoice}</small>
            </button>
            <button
              className="manager-help"
              data-help={editableCopy.participantHelp}
              onClick={() => { setRole("participant"); setEntryStage("app"); }}
            >
              <strong>ÚČASTNÍK</strong>
              <small aria-live="polite">{editableCopy.participantChoice}</small>
            </button>
          </div>
          <p>
            Jako správce vytváříš a potvrzuješ průzkum. Jako účastník si vybereš
            správce, otevřeš jeho živou aktivitu a posílíš témata svým TVL.
          </p>
          <section className="role-organiser-list" aria-label={editableCopy.managerListLabel}>
            <strong aria-live="polite">{editableCopy.managerListLabel}</strong>
            <button onClick={() => { setRole("participant"); setEntryStage("app"); }}>
              <span>{organiser}</span>
              <small>{live.length ? `${live.length} živá aktivita` : "zatím bez živé aktivity"}</small>
              <em>→</em>
            </button>
          </section>
          <button className="muted" onClick={() => setEntryStage("purpose")}>ZPĚT</button>
        </section>
      </main>
    );
  }

  if (entryStage === "ares") {
    return (
      <main className="entry-screen with-live-editor">
        <ScreenBadge current={5} />
        {renderEditor(5)}
        <section className="entry-panel manager-entry">
          <img className="entry-mini-logo" src="/COTO-testovac/coto-logo-original.png" alt="Logo COTO" />
          <h1 aria-live="polite">{editableCopy.aresHeading}</h1>
          <p className="ares-instructions" aria-live="polite">{editableCopy.aresInstructions}</p>
          <label
            className="manager-help help-right"
            data-help="Osm číslic IČO určí správce a později se přenese do okna A všech tří dílů."
          >
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
          <label
            className="manager-help help-right"
            data-help="Účet správce určuje zdroj hodnoty 1–3 Kč za informaci; ve zkoušce se peníze neposílají."
          >
            Účet na propagaci
            <input
              value={account}
              onChange={(event) => { setAccount(event.target.value); setAresVerified(false); }}
            />
          </label>
          {!aresVerified ? (
            <button
              className="manager-help help-right"
              data-help="Zkontroluje osm číslic IČO a připraví identitu správce pro okno A."
              onClick={() => {
                if (ico.length !== 8 || !account.trim()) {
                  setFormError("Doplň osm číslic IČO a samostatný účet na propagaci.");
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
              <label className="manager-logo-upload">
                Logo firmy nebo obce pod identitu v okně A
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setManagerLogo(String(reader.result || ""));
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <button
                className="manager-help help-right"
                data-help="Otevře čtyři způsoby použití COTO. Zvolený kód se přenese do záhlaví TVL."
                onClick={() => { setCopySurveyMode(false); setCopiedSurveyCode(""); setVariationSourceCode(""); setVariationCopyStamp(""); setEntryStage("variants"); }}
              >
                OTEVŘI NOVÝ PRŮZKUM A VYBER VARIANTU
              </button>
              <button
                className="manager-help help-right"
                data-help="Otevře stejné čtyři varianty a dovolí vložit kód dřívějšího průzkumu."
                onClick={() => { setCopySurveyMode(true); setEntryStage("variants"); }}
              >
                OTEVŘI VARIANTY A VLOŽ KÓD JINÉHO PRŮZKUMU
              </button>
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
      <main className="entry-screen with-live-editor">
        <ScreenBadge current={6} />
        {renderEditor(6)}
        <section className="entry-panel variant-panel">
          <img className="entry-mini-logo" src="/COTO-testovac/coto-logo-original.png" alt="Logo COTO" />
          <p className="verified-manager" aria-live="polite">{editableCopy.verifiedManager}: <b>{organiser}</b></p>
          {copySurveyMode && (
            <div className="variation-source-choice">
              <label className="copy-survey-code">
                <span aria-live="polite">{editableCopy.copySurveyLabel}</span>
                <input value={copiedSurveyCode} onChange={(event) => setCopiedSurveyCode(event.target.value.toUpperCase())} placeholder="např. PN20260930COTO001" />
              </label>
              <p>
                <b>Variace:</b> {copiedSurveyCode || "vlož kód"}
                <span>Poslední kopie: {lastWholeSurveyCopyAt[copiedSurveyCode.trim().toUpperCase()] || "zatím žádná"}</span>
              </p>
            </div>
          )}
          {variantOptions.map((option) => (
            <button
              key={option.code}
              className={"variant-choice manager-help help-right " + (hoveredVariant === option.code ? "active" : "")}
              data-help={editableCopy[variantHelpKeys[option.code]]}
              onMouseEnter={() => setHoveredVariant(option.code)}
              onFocus={() => setHoveredVariant(option.code)}
              onTouchStart={(event) => {
                if (touchPreviewVariant !== option.code) {
                  event.preventDefault();
                  setTouchPreviewVariant(option.code);
                  setHoveredVariant(option.code);
                }
              }}
              onClick={() => openWorkingVariant(option.code)}
            >
              <b>{option.code}</b>
              <span>{option.name}<small>{option.description}</small></span>
              <em aria-label="Potvrdit výběr">➜</em>
            </button>
          ))}
          {formError && <p className="form-error">{formError}</p>}
          <button className="muted" onClick={() => setEntryStage("ares")}>ZPĚT</button>
        </section>
      </main>
    );
  }

  if (entryStage === "dashboard") {
    return (
      <main className="dashboard-screen with-live-editor">
        <ScreenBadge current={9} />
        {renderEditor(9)}
        <header className="dashboard-logo">
          <div className="dashboard-title">
            <small>OBRAZOVKA 09 · PŘEHLED SPRÁVCE</small>
            <button className="dashboard-home" onClick={() => setEntryStage("icon")}>COTO</button>
          </div>
          <div>
            <strong>{organiser}</strong>
            <small>Ověřená identita správce · ARES</small>
          </div>
        </header>
        <p className="screen-inline-copy dashboard-inline-copy" aria-live="polite">{screenCopy[9]}</p>
        <button
          className="new-survey manager-help"
          data-help="Založí nový průzkum a vrátí správce k výběru varianty."
          onClick={() => { setLocked(false); setActivationStamp(""); setCopySurveyMode(false); setCopiedSurveyCode(""); setVariationSourceCode(""); setVariationCopyStamp(""); setEntryStage("variants"); }}
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
                  <span className="survey-list-status">
                    <small>Živý týden: {item.period}</small>
                    <button
                      className="survey-copy-count manager-help help-right"
                      data-help={editableCopy.copyCountHelp}
                      onClick={() => startWholeSurveyCopy(item)}
                    >
                      Kopírováno {wholeSurveyCopyCounts[item.code] || 0}×
                    </button>
                  </span>
                  <small>Pořadí použité varianty: {item.variant}1</small>
                  <button onClick={() => setEntryStage("readonly")}>OTEVŘÍT JEN KE ČTENÍ A KOPÍROVÁNÍ</button>
                  <button onClick={() => { setRole("participant"); setParticipantOpen(true); setEntryStage("app"); }}>
                    OTEVŘÍT JAKO ÚČASTNÍK
                  </button>
                  <button
                    onClick={() => { setCopyPanelOpen(true); setCopyFeedback(""); setEntryStage("readonly"); }}
                    title="Vybereš jeden, dva nebo všechny tři náměty a zachováš jejich spojení s výsledky"
                  >
                    VYBRAT 1–3 TÉMATA PRO DALŠÍHO SPRÁVCE
                  </button>
                  {copiedSurveyCount > 0 && (
                    <small>
                      Propojeno s dalšími správci: {copiedSurveyCount}. Výsledky se načtou
                      na všech {copiedSurveyCount + 1} použitých TVL.
                    </small>
                  )}
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
            {live.map((item) => (
              <article className="scheduled-result" key={`ended-${item.code}`}>
                <span className="live-dot" />
                <div>
                  <b>{item.variant}1 · po skončení týdne</b>
                  <small>{item.code}</small>
                  <small>Časové razítko zachová spojení s výsledky účtu na propagaci.</small>
                </div>
              </article>
            ))}
          </div>
        </section>
        {receipt && (
          <PromotionAccountResults
            account={account}
            identifier={receipt.split(" · ")[0]}
            scores={scores}
            linkedTvlCount={copiedSurveyCount + 1}
          />
        )}
        <ResultsJourney
          scoreTotal={receipt ? scores.reduce((sum, score) => sum + score, 0) : undefined}
          linkedTvlCount={copiedSurveyCount + 1}
        />
      </main>
    );
  }

  if (entryStage === "readonly") {
    return (
      <main className="readonly-screen with-live-editor">
        <ScreenBadge current={8} />
        {renderEditor(8)}
        <div className="readonly-toolbar">
          <strong>OBRAZOVKA 08 · CELÝ TVL</strong>
          <p className="screen-inline-copy" aria-live="polite">{screenCopy[8]}</p>
          <button onClick={() => setEntryStage("dashboard")}>ZPĚT NA PŘEHLED</button>
          <button onClick={() => { setCopyPanelOpen((open) => !open); setCopyFeedback(""); }}>
            VYBRAT TÉMATA KE KOPÍROVÁNÍ
          </button>
          <button onClick={() => window.print()}>TISKNOUT CELÝ TVL NA JEDNU A4</button>
          {role === "manager" ? (
            <button
              className="survey-copy-count manager-help help-right"
              data-help={editableCopy.copyCountHelp}
              onClick={() => startWholeSurveyCopy({ code, variant })}
            >
              Kopírováno {wholeSurveyCopyCounts[code] || 0}×
            </button>
          ) : (
            <strong className="survey-copy-count manager-help" data-help={editableCopy.copyCountHelp}>
              Kopírováno {wholeSurveyCopyCounts[code] || 0}×
            </strong>
          )}
        </div>
        {copyPanelOpen && (
          <section className="copy-topics-panel" aria-label="Výběr témat pro dalšího správce">
            <div>
              <p className="eyebrow">KOPÍROVÁNÍ TÉMAT</p>
              <h2>Vyber jeden nebo více vhodných námětů</h2>
              <p>Další správce převezme jen označené názvy a popisy. Jejich výsledky zůstanou propojené s použitými TVL.</p>
            </div>
            <div className="copy-topic-choices">
              {projects.map((project, index) => (
                <label key={project.title + index}>
                  <input
                    type="checkbox"
                    disabled={project.unused}
                    checked={copySelection[index]}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setCopySelection((current) => current.map((value, itemIndex) => itemIndex === index ? checked : value));
                      setCopyFeedback("");
                    }}
                  />
                  <span>{project.unused ? "× Nepoužitý řádek" : project.title || "Nevyplněný námět"}</span>
                </label>
              ))}
            </div>
            <button type="button" onClick={copySelectedProjects}>ZKOPÍROVAT VYBRANÉ PRO DALŠÍHO SPRÁVCE</button>
            {copyFeedback && <strong className="copy-feedback" role="status">{copyFeedback}</strong>}
          </section>
        )}
        <div className="tvl-paper original-a4" style={tvlLayoutStyle}>
          <TvlSection kind="voucher" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={setSelected} />
          <CutLine label="oddělit POUKÁZKU" />
          <TvlSection kind="investment" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={setSelected} />
          <CutLine label="oddělit INVESTICI" />
          <TvlSection kind="receipt" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={setSelected} />
        </div>
        {receipt && (
          <PromotionAccountResults
            account={account}
            identifier={receipt.split(" · ")[0]}
            scores={scores}
            linkedTvlCount={copiedSurveyCount + 1}
          />
        )}
        <ResultsJourney
          scoreTotal={receipt ? scores.reduce((sum, score) => sum + score, 0) : undefined}
          linkedTvlCount={copiedSurveyCount + 1}
        />
        <div className="print-batch" aria-hidden="true">
          <div className="tvl-paper printed-sheet original-a4" style={tvlLayoutStyle}>
            <div className="printed-number">TVL {variant}1 · celý třídílný list</div>
            <TvlSection kind="voucher" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={() => {}} />
            <CutLine label="oddělit POUKÁZKU" />
            <TvlSection kind="investment" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={() => {}} />
            <CutLine label="oddělit INVESTICI" />
            <TvlSection kind="receipt" {...sharedTvl} participantScores={receipt ? scores : undefined} onInspect={() => {}} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="application-screen with-live-editor">
      <ScreenBadge current={role === "participant" ? 10 : 7} />
      {renderEditor(role === "participant" ? 10 : 7)}
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
        <div className="topbar-actions">
          <button className="share-live-link" onClick={shareLiveApp}>🌐 COTO – ŽIVÁ APLIKACE</button>
          <div className="status">
            <i className={locked ? "locked" : "draft"} />
            {locked ? "Uzamčeno · živý projekt" : "Živá pracovní šablona"}
          </div>
        </div>
      </nav>
      {shareFeedback && <p className="share-feedback" role="status">{shareFeedback}</p>}

      {role === "participant" ? (
        <>
          <header className="intro participant-intro">
            <div>
              <p className="eyebrow">OBRAZOVKA 10 · ÚČASTNÍK · VYPLŇOVACÍ PRŮCHOD</p>
              <h1>Vyber si správce.<br />Otevři jeho aktivitu.</h1>
            </div>
            <p aria-live="polite">{screenCopy[10]}</p>
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
                  <b>{live.length ? "Klikni na správce vlevo" : "Správce zatím nemá potvrzenou živou aktivitu"}</b>
                  <span>{live.length ? "Potom se zobrazí jeho živý TVL." : "Nejdřív v roli správce vyplň a potvrď pracovní šablonu."}</span>
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
                  <div className="participant-period-row">
                    <p className="participant-period">Živý týden: {validity.period}</p>
                    <strong className="survey-copy-count manager-help" data-help={editableCopy.copyCountHelp}>
                      Kopírováno {wholeSurveyCopyCounts[code] || 0}×
                    </strong>
                  </div>

                  <fieldset className="personal-form">
                    <legend>Osobní údaje · pouze na POUKÁZCE</legend>
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

                  <fieldset className="participant-symbol-form">
                    <legend>Čtyři volitelné symboly účastníka</legend>
                    <p>Každé políčko přijme jeden tvůj symbol. Můžeš je nechat prázdná.</p>
                    <div>
                      {participantSymbols.map((symbol, index) => (
                        <input
                          key={index}
                          aria-label={`Volitelný symbol ${index + 1}`}
                          maxLength={1}
                          value={symbol}
                          onChange={(event) => {
                            const nextSymbol = event.target.value.replace(/\s/g, "").slice(-1).toUpperCase();
                            setParticipantSymbols((current) =>
                              current.map((item, itemIndex) => itemIndex === index ? nextSymbol : item),
                            );
                          }}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <div className="participant-projects">
                    {projects.map((project, index) => project.unused ? null : (
                      <article key={index}>
                        <button className="participant-detail" onClick={() => setSelected(index)}>
                          <span aria-hidden="true">•</span>
                          <div>
                            <b>{project.title || "Nevyplněné téma"}</b>
                            <small>Kliknutím otevři celý popis návrhu</small>
                          </div>
                        </button>
                        <label>
                          Tvoje hodnocení
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
                            <option value="0">zvol 1–9</option>
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
                        Tento kód spojuje tvůj DOKLAD s pozdějším součtovým
                        výsledkem, aniž by se do něj přeneslo okno D.
                      </p>
                      <button onClick={() => window.print()}>TISK / ULOŽIT CELÝ TVL NA JEDNU A4</button>
                      <small className="mobile-print-help">V telefonu vyber u tisku „Uložit jako PDF“ a soubor potom přilož ke zprávě SMS nebo MMS.</small>
                      <button onClick={() => setEntryStage("readonly")}>ZOBRAZIT VÝSLEDEK VRÁCENÝ DO TVL</button>
                      <button onClick={() => setShowAccountResults((shown) => !shown)}>
                        {showAccountResults ? "SKRÝT ŘÁDKY ÚČTU NA PROPAGACI" : "ZKONTROLOVAT ŘÁDKY ÚČTU NA PROPAGACI"}
                      </button>
                    </div>
                  )}
                  {receipt && showAccountResults && (
                    <PromotionAccountResults
                      account={account}
                      identifier={receipt.split(" · ")[0]}
                      scores={scores}
                      linkedTvlCount={copiedSurveyCount + 1}
                    />
                  )}
                  <ResultsJourney
                    scoreTotal={receipt ? scores.reduce((sum, score) => sum + score, 0) : undefined}
                    linkedTvlCount={copiedSurveyCount + 1}
                  />
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
          <section className="live-workbench">
            <img className="screen7-logo" src="/COTO-testovac/coto-logo-original.png" alt="Logo aplikace COTO" />
            <div className="live-selector-row">
              <div className="field-selector">
                <small aria-live="polite">{editableCopy.surveyChoiceLabel}</small>
                <button
                  className="manager-help"
                  data-help={editableCopy.surveyChoiceHelp}
                  disabled={locked || copySurveyMode}
                  onClick={() => setSelectorOpen(selectorOpen === "variant" ? null : "variant")}
                  aria-expanded={selectorOpen === "variant"}
                >
                  <b>{screen7CodeChosen ? `${variant}001` : "VYBER"}</b>
                  <span>{screen7CodeChosen ? chosenVariant.name : "kód z nabídky"}</span>
                  <em>▾</em>
                </button>
                {selectorOpen === "variant" && (
                  <div className="selector-menu" role="listbox">
                    {variantOptions.map((option) => (
                      <button
                        key={option.code}
                        className={screen7CodeChosen && variant === option.code ? "chosen" : ""}
                        onClick={() => chooseVariant(option.code)}
                      >
                        <b>{option.code}001</b>
                        <span>{option.name}<small>{option.description}</small></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="field-selector value-selector">
                <small aria-live="polite">{editableCopy.managerExperienceLabel}</small>
                <button
                  className="manager-help"
                  data-help={editableCopy.managerExperienceHelp}
                  disabled={locked || !screen7CodeChosen}
                  onClick={() => setSelectorOpen(selectorOpen === "value" ? null : "value")}
                  aria-expanded={selectorOpen === "value"}
                >
                  <b>{experienceChosen ? surveyValue : "1–3"}</b>
                  <span>{experienceChosen
                    ? surveyValue === 1 ? "20–39 let" : surveyValue === 2 ? "40–59 let" : "60–89 let"
                    : "nejdřív vyber kód"}</span>
                  <em>▾</em>
                </button>
                {selectorOpen === "value" && (
                  <div className="selector-menu value-menu" role="listbox">
                    {[
                      { value: 1, age: "20–39 let" },
                      { value: 2, age: "40–59 let" },
                      { value: 3, age: "60–89 let" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={experienceChosen && surveyValue === option.value ? "chosen" : ""}
                        onClick={() => chooseSurveyValue(option.value)}
                      >
                        <b>{option.value}</b><span>{option.age}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="field-selector week-selector">
                <small aria-live="polite">{editableCopy.surveyWeekLabel}</small>
                <button
                  className="manager-help"
                  data-help={editableCopy.surveyWeekHelp}
                  disabled={locked || !screen7CodeChosen || !experienceChosen}
                  onClick={() => setSelectorOpen(selectorOpen === "week" ? null : "week")}
                  aria-expanded={selectorOpen === "week"}
                >
                  <b>{!screen7CodeChosen
                    ? "Nejdřív vyber kód"
                    : !experienceChosen
                      ? "Potom vyber zkušenost"
                      : weekChosen
                        ? validity.period
                        : "Vyber týden Po–Ne"}</b><em>▾</em>
                </button>
                {selectorOpen === "week" && (
                  <div className="selector-menu week-menu" role="listbox">
                    {weeks.map((week) => (
                      <button
                        key={week.start}
                        className={weekChosen && start === week.start ? "chosen" : ""}
                        onClick={() => chooseWeek(week.start)}
                      >
                        {week.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {variationSourceCode && (
              <p className="working-variation manager-help" data-help={editableCopy.copyCountHelp}>
                <b>Variace</b>
                <span>{variationSourceCode}</span>
                <strong>{variationCopyStamp}</strong>
              </p>
            )}

            <p className="screen7-guide" aria-live="polite">{editableCopy.screen7Guide}</p>

            <div className="working-paper-wrap">
              <div
                className="tvl-paper working-investment"
              >
                <TvlSection
                  kind="investment"
                  {...sharedTvl}
                  showControls
                  onBack={() => setEntryStage("variants")}
                  onFinish={openStampedPreview}
                  onInspect={setSelected}
                />
              </div>
            </div>

            <section className="timestamp-help" aria-live="polite">
              <strong>ČASOVÉ RAZÍTKO</strong>
              <p>{editableCopy.timestampPurpose}</p>
            </section>
            {(variant === "VL" || variant === "VT") && (
              <p className="printed-identity-screen-help" aria-live="polite">{editableCopy.printedIdentityHelp}</p>
            )}
            {formError && <p className="form-error work-error">{formError}</p>}
            <div className="workbench-actions">
              <button
                className="manager-help"
                data-help="Vrátí tě k výběru varianty bez potvrzení a uzamčení TVL."
                onClick={() => setEntryStage("variants")}
              >
                ZPĚT
              </button>
              <button
                className="print-working-tvl manager-help"
                data-help="Vytiskne právě vyplněný třídílný TVL na jednu A4. V telefonu můžeš výstup uložit jako PDF."
                onClick={() => window.print()}
              >
                TISKNOUT CELÝ TVL NA JEDNU A4
              </button>
              <button
                className="finish-work manager-help"
                data-help="Vytvoří a zobrazí časové razítko, zamkne editaci a otevře celý TVL před potvrzením."
                onClick={openStampedPreview}
              >
                UKONČIT · VYTVOŘIT ČASOVÉ RAZÍTKO
              </button>
            </div>
          </section>

        </>
      )}

      {selected !== null && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setSelected(null)}>×</button>
            <p className="eyebrow">TÉMA PRŮZKUMU</p>
            <h2>Projekt, námět nebo otázka</h2>
            <label className="unused-project-toggle">
              <input
                type="checkbox"
                disabled={locked}
                checked={projects[selected].unused}
                onChange={(event) => updateProject(selected, { unused: event.target.checked })}
              />
              <span>Nepoužitý řádek označit křížkem ×</span>
            </label>
            <label
              className="manager-help help-right"
              data-help="Vlož krátký název tématu. Po uložení se objeví ve všech třech dílech TVL."
            >
              Nadpis
              <input
                autoFocus
                disabled={locked || projects[selected].unused}
                value={projects[selected].title}
                onChange={(event) => updateProject(selected, { title: event.target.value })}
              />
            </label>
            <label
              className="manager-help help-right"
              data-help="Sem lze vložit zkopírovaný text. Účastník otevře úplný popis kliknutím na název tématu."
            >
              Stručný popis
              <textarea
                disabled={locked || projects[selected].unused}
                rows={6}
                value={projects[selected].detail}
                onChange={(event) => updateProject(selected, { detail: event.target.value })}
              />
            </label>
            <div className="modal-note">
              Správce označí hodnotu svých zkušeností číslicí 1–3 v horní
              nabídce. Účastník hodnotí každý použitý návrh 1–9 body. Uložený
              řádek se ihned přenese do všech tří dílů TVL.
            </div>
            <button
              className="save manager-help help-right"
              data-help="Uloží změnu a okamžitě ji přenese do POUKÁZKY, INVESTICE i DOKLADU."
              onClick={() => setSelected(null)}
            >
              {locked ? "ZAVŘÍT" : "ULOŽIT A PŘENÉST DO TVL"}
            </button>
          </section>
        </div>
      )}

      {preview && (
        <div className="preview-overlay">
          <div className="preview-toolbar">
            <div>
              <b>OBRAZOVKA 08 · CELÝ TVL · časové razítko {activationStamp}</b>
              <span>
                Zkontroluj POUKÁZKU, INVESTICI a DOKLAD. Časové razítko už
                uzamklo editaci; celý TVL můžeš vytisknout pro evidenci správce.
              </span>
            </div>
            <div>
              <button
                className="manager-help"
                data-help="Zruší právě vytvořené časové razítko a vrátí správce do živé šablony."
                onClick={returnToEditing}
              >
                ZPĚT K OPRAVÁM
              </button>
              <button
                className="manager-help"
                data-help="Vytiskne celý třídílný TVL na jednu A4 pro evidenci správce."
                onClick={() => window.print()}
              >
                TISKNOUT CELÝ TVL PRO EVIDENCI
              </button>
              <button
                className="confirm manager-help"
                data-help="Přesune průzkum s kódem a pořadím varianty do seznamu živých; po skončení týdne přejde do ukončených."
                onClick={confirm}
              >
                POTVRDIT {variant}1
              </button>
            </div>
          </div>
          <div className="preview-scroll">
            <div className="tvl-paper original-a4" style={tvlLayoutStyle}>
              <TvlSection kind="voucher" {...sharedTvl} onInspect={setSelected} />
              <CutLine label="oddělit POUKÁZKU" />
              <TvlSection kind="investment" {...sharedTvl} onInspect={setSelected} />
              <CutLine label="oddělit INVESTICI" />
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
          const printCode = code.slice(0, 14) + String(copyIndex + 1).padStart(3, "0");
          const printShared = {
            ...sharedTvl,
            code: printCode,
            participantScores: role === "participant" ? scores : undefined,
            participantSymbols: role === "participant" ? participantSymbols : ["", "", "", ""],
          };
          return (
            <div className="tvl-paper printed-sheet original-a4" style={tvlLayoutStyle} key={printCode}>
              <div className="printed-number">TVL {variant}1 · pořadové číslo {copyIndex + 1}</div>
              <TvlSection kind="voucher" {...printShared} onInspect={() => {}} />
              <CutLine label="oddělit POUKÁZKU" />
              <TvlSection kind="investment" {...printShared} onInspect={() => {}} />
              <CutLine label="oddělit INVESTICI" />
              <TvlSection kind="receipt" {...printShared} onInspect={() => {}} />
            </div>
          );
        })}
      </div>
    </main>
  );
}
