import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/COTO-testovac/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("začíná klikací ikonou COTO", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /aria-label="Otevřít COTO"/);
  assert.match(html, /COTO/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview/);
});

test("úvod používá přesně znovu dodanou čtvercovou ikonu bez spodních nápisů", async () => {
  const icon = await readFile(new URL("../public/coto-icon-original-2026-09-28.png", import.meta.url));
  assert.equal(icon.readUInt32BE(16), 1254);
  assert.equal(icon.readUInt32BE(20), 1254);
  assert.equal(createHash("sha256").update(icon).digest("hex"), "55d8399c207848e15bcf6b8dc33e84fef4e51f485d9ab3affe2d4712b91a2897");
});

test("obsahuje celý sjednaný průchod správce", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["SPRÁVCE", "Ověření správce v ARES a účtu na propagaci", "Otevři nový průzkum a vyber variantu", "Průzkum názorů", "Vyber lepší", "Podpora projektu", "Volební tombola", "POUKÁZKA", "INVESTICE", "DOKLAD", "ZPĚT", "UKONČIT", "POTVRDIT", "Živé průzkumy", "Ukončené průzkumy", "OTEVŘÍT JEN KE ČTENÍ A KOPÍROVÁNÍ"]) assert.match(page, new RegExp(text, "i"));
});

test("vstupní proces se nesmí při dalších úpravách ztratit", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const order = ['entryStage === "icon"', 'entryStage === "logo"', 'entryStage === "purpose"', 'entryStage === "roles"', 'entryStage === "ares"', 'entryStage === "variants"'];
  let last = -1;
  for (const marker of order) { const found = page.indexOf(marker); assert.ok(found > last, `chybí nebo je mimo pořadí: ${marker}`); last = found; }
});

test("logo COTO v horní liště vrací na titulní obrázek", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /className="topbar-home"[^>]*onClick=\{\(\) => setEntryStage\("icon"\)\}/);
  assert.match(page, /aria-label="Zobrazit titulní stránku COTO"/);
});

test("živá pracovní šablona se nesmí znovu přeskočit", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["Logo aplikace COTO", "Průzkum názorů a řešení", "Hodnota zkušeností správce", "Týden průzkumu pro kódy VL a VT", "Nepoužité řádky označ křížkem", "UKONČIT · VYTVOŘIT ČASOVÉ RAZÍTKO"]) assert.match(page, new RegExp(text));
});

test("celý TVL zachovává identifikátor B, osobní okno D a jednu A4", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  assert.match(page, /Volitelný kód účastníka/);
  assert.match(page, /identifierCode\.split\(""\)/);
  assert.match(page, /padEnd\(17, " "\)\.slice\(0, 17\)/);
  assert.match(page, /Array\.from\(\{ length: 4 \}/);
  assert.match(page, /className="identifier-symbol"/);
  assert.match(css, /grid-template-columns: repeat\(21, minmax\(0, 1fr\)\)/);
  assert.doesNotMatch(page, /"COTO001" \+ "A001"/);
  assert.match(page, /className="personal-only window-d"/);
  assert.match(page, /Osobní údaje · pouze na POUKÁZCE/);
  assert.match(page, /className="tvl-paper printed-sheet original-a4"/);
});

test("výsledek se vrací ke správci i do vložených TVL", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["Návrh", "Posílení", "Kopírování", "Sčítání", "Řešení", "každého původního nebo zkopírovaného TVL", "všech se načte shodný výsledek"]) assert.match(page, new RegExp(text));
});

test("volba role vysvětluje účel COTO i podmínky správce", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["nejmenší správní a společenské celky", "IČO v systému ARES a samostatný Účet na propagaci", "anonymně svůj vyplněný a odeslaný tiskopis TVL"]) assert.match(page, new RegExp(text));
});

test("účastník vidí řádkové výsledky účtu na propagaci", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  for (const text of ["Řádkové výsledky účtu na propagaci", "KONTROLA ÚČASTNÍKA", "Součet bodů", "pouze statistický součet", "ZKONTROLOVAT ŘÁDKY ÚČTU NA PROPAGACI", "VYBRAT 1–3 TÉMATA PRO DALŠÍHO SPRÁVCE"]) assert.match(page, new RegExp(text));
  assert.match(css, /\.account-result-row/);
});

test("pokyny používají přímé tykání", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["Vyber si správce", "Otevři jeho aktivitu", "Tvoje hodnocení", "Zadej IČO", "Nejdřív vyber průzkum"]) assert.match(page, new RegExp(text));
  assert.doesNotMatch(page, /zadejte|doplňte|vyberte|otevřete|najeďte|klikněte|přidělte|můžete|zkontrolujte|vaše hodnocení/i);
});

test("správce se ověřuje v živém ARES a chybná data vždy dostanou hlášku", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of [
    "ARES_SUBJECT_URL",
    "hasValidIcoChecksum",
    "hasValidCzechAccount",
    "OVĚŘUJI IČO V ARES",
    "nebylo v systému ARES nalezeno",
    "Spojení se systémem ARES se nezdařilo",
    "platný český formát a kontrolní součet",
    "Majitele účtu potvrdí bankovní prostředí",
  ]) assert.match(page, new RegExp(text));
  assert.match(page, /fetch\(`\$\{ARES_SUBJECT_URL\}\/\$\{normalizedIco\}`/);
  assert.doesNotMatch(page, /setOrganiser\("Jan Koňas · správce COTO · IČO " \+ ico\)/);
});

test("originální logo a obrazovka cíle se nesmí znovu nahradit maketou", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const logo = await readFile(new URL("../public/coto-logo-original.png", import.meta.url));
  assert.ok(logo.byteLength > 1_000_000, "chybí dodané originální logo");
  assert.match(page, /coto-logo-original\.png/);
  assert.doesNotMatch(page, /coto-logo-video\.svg/);
  for (const text of ["Cíl a filosofie internetové aplikace COTO", "obnovení důvěry", "průkazný, anonymně kontrolovatelný proces", "Třídílný Volební List"]) assert.match(page, new RegExp(text));
  assert.match(page, /Shodný kód na trojici šablon/);
  assert.match(page, /purpose-text-editor/);
  assert.match(page, /localStorage\.setItem\(PURPOSE_STORAGE_KEY/);
});

test("okno C má tři nečíslovaná dlouhá pole a jedno hodnocení", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  const windowC = page.slice(page.indexOf('className="project-list window-c"'), page.indexOf('{kind === "voucher"'));
  assert.match(page, /className="project-field"/);
  assert.match(page, /className=\{\s*"participant-score/);
  assert.doesNotMatch(windowC, /<span>\{index \+ 1\}<\/span>/);
  assert.doesNotMatch(windowC, /manager-priority/);
  assert.match(page, /Hodnocení účastníkem 1–9/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) 62px/);
  assert.match(css, /\.survey-box \.window-c \{[\s\S]*?gap: 4px/);
  assert.match(css, /border-bottom: 1px solid #555 !important/);
  assert.match(css, /display: grid !important;[\s\S]*?grid-template-columns: minmax\(0, 1fr\) 62px/);
});

test("poukázka obsahuje okno D, text a střihovou linku v pevné A4", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  const printCss = await readFile(new URL("../app/print-a4-2026-10-04.css", import.meta.url), "utf8");
  assert.match(page, /className="voucher-footer"/);
  assert.match(page, /<CutLine label="oddělit POUKÁZKU"/);
  assert.match(page, /cut-scissors/);
  assert.match(css, /grid-template-rows: 55% 43%/);
  assert.match(page, /className="personal-identifier-row"/);
  assert.match(page, /Číslo bankovní transakce/);
  assert.match(css, /border-top: 2px dashed #353a37/);
  assert.match(css, /\.tvl-section\.voucher \.tvl-topline h2 \{ color: #168a45; \}/);
  assert.match(css, /\.tvl-section\.investment \.tvl-topline h2 \{ color: #d62f36; \}/);
  assert.match(css, /\.tvl-section\.receipt \.tvl-topline h2 \{ color: #2769b2; \}/);
  assert.match(printCss, /var\(--voucher-share, 38\.5%\)/);
  assert.match(printCss, /var\(--investment-share, 27%\)/);
  assert.match(printCss, /var\(--receipt-share, 30\.5%\)/);
  assert.match(printCss, /\.original-a4 \.voucher \.tvl-columns \{[\s\S]*?flex: 0 0 62% !important/);
  assert.match(printCss, /height: 277mm !important/);
  assert.match(printCss, /margin: 5mm auto !important/);
  assert.match(printCss, /grid-template-rows:\s*32%\s*2%\s*32%\s*2%\s*32% !important/);
  assert.match(printCss, /break-inside: avoid-page !important/);
  assert.doesNotMatch(printCss, /grid-template-rows:\s*4mm\s+106mm\s+6mm\s+78mm\s+6mm\s+87mm/);
});

test("další správce může zkopírovat jeden nebo více vybraných námětů", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /VYBRAT 1–3 TÉMATA PRO DALŠÍHO SPRÁVCE/);
  assert.match(page, /copySelection/);
  assert.match(page, /type="checkbox"/);
  assert.match(page, /ZKOPÍROVAT VYBRANÉ PRO DALŠÍHO SPRÁVCE/);
  assert.match(page, /projects\.filter\(\(project, index\) => copySelection\[index\] && !project\.unused\)/);
});

test("celý průzkum má samostatný průběžný počet kopií pro správce i účastníka", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  assert.match(page, /wholeSurveyCopyCounts/);
  assert.match(page, /Kopírováno \{wholeSurveyCopyCounts\[item\.code\] \|\| 0\}×/);
  assert.match(page, /Kopírováno \{wholeSurveyCopyCounts\[code\] \|\| 0\}×/);
  assert.match(page, /\[sourceCode\]: \(current\[sourceCode\] \|\| 0\) \+ 1/);
  assert.match(page, /Kód \$\{sourceCode\} patří do jiné varianty/);
  assert.match(page, /startWholeSurveyCopy/);
  assert.match(page, /Variace/);
  assert.match(page, /lastWholeSurveyCopyAt/);
  assert.match(page, /Jde jen o orientační počet/);
  assert.match(css, /color: #b42318/);
});

test("všechny opravované obrazovky mají nenápadné číslo", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /className="screen-badge"/);
  assert.match(page, /ScreenBadge current=\{1\}/);
  assert.match(page, /current=\{role === "participant" \? 10 : 7\}/);
});

test("pracovní komunikace s Lin není vložena do veřejné aplikace", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["OPRAVA K OBRAZOVCE", "coto-oprava-obrazovka-", "KOPÍROVAT TUTO", "KOPÍROVAT VŠE"]) assert.doesNotMatch(page, new RegExp(text));
});

test("správce dostává popisky při pohybu kurzoru", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  for (const text of ["Označení kódu se zobrazí až po výběru", "1 = 20–39 let", "VL = Vyber lepší", "zamkne editaci", "Vrátí tě k výběru varianty"]) assert.match(page, new RegExp(text, "i"));
  assert.match(page, /data-help=/);
  assert.match(css, /\.manager-help:hover::after/);
  assert.doesNotMatch(page, /className="manager-hover-caption"/);
  assert.doesNotMatch(page, /className="transfer-note"/);
});

test("obrazovka 07 zachovává živou práci správce bez veřejných značek oken", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["screen7-logo", "screen7Guide", "timestampPurpose", "printedIdentityHelp", "TISKNOUT CELÝ TVL PRO EVIDENCI", "POTVRDIT {variant}1"]) assert.match(page, new RegExp(text));
  assert.match(page, /project\.unused \? "× NEPOUŽITO"/);
  assert.match(page, /projects\.filter\(\(project\) => !project\.unused\)/);
  assert.match(page, /setLive\(\(current\) => \[/);
  assert.doesNotMatch(page, /className="sheet-marker/);
});

test("obrazovka 07 odkrývá kód, zkušenost a týden postupně", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const state of ["screen7CodeChosen", "experienceChosen", "weekChosen"]) assert.match(page, new RegExp(state));
  assert.match(page, /screen7CodeChosen \? `\$\{variant\}001` : "VYBER"/);
  assert.match(page, /disabled=\{locked \|\| !screen7CodeChosen\}/);
  assert.match(page, /disabled=\{locked \|\| !screen7CodeChosen \|\| !experienceChosen\}/);
  assert.match(page, /setScreen7CodeChosen\(true\)[\s\S]*?setExperienceChosen\(false\)[\s\S]*?setWeekChosen\(false\)/);
  assert.match(page, /setExperienceChosen\(true\)[\s\S]*?setWeekChosen\(false\)/);
  assert.match(page, /setWeekChosen\(true\)/);
});

test("horní nabídky živé šablony zůstávají po kliknutí otevřené", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /onMouseEnter=\{\(\) => \{[^}]*setSelectorOpen\("(?:variant|value|week)"\)/);
  assert.doesNotMatch(page, /onFocus=\{\(\) => \{[^}]*setSelectorOpen\("(?:variant|value|week)"\)/);
  for (const selector of ["variant", "value", "week"]) {
    assert.match(page, new RegExp(`onClick=\\{\\(\\) => setSelectorOpen\\(selectorOpen === "${selector}" \\? null : "${selector}"\\)\\}`));
  }
});

test("horní nabídky nepřekrývá duplicitní nápověda a týdnů jsou čtyři", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const printCss = await readFile(new URL("../app/print-a4-2026-10-04.css", import.meta.url), "utf8");
  assert.match(page, /weeks\.slice\(0, 4\)\.map/);
  assert.match(page, /week-option-help/);
  assert.match(page, /data-help=\{editableCopy\.surveyWeekHelp\}/);
  assert.match(page, /publicLabel\(editableCopy\.managerExperienceLabel\)/);
  assert.match(printCss, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\) !important/);
  assert.match(printCss, /grid-template-rows: 17px 60px/);
});

test("tisk správce čísluje každý TVL a zvýrazňuje časové razítko", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const printCss = await readFile(new URL("../app/print-a4-2026-10-04.css", import.meta.url), "utf8");
  assert.match(page, /Počet číslovaných TVL/);
  assert.match(page, /setPrintCount/);
  assert.match(page, /sheetNumber: role === "manager" \? copyIndex \+ 1 : undefined/);
  assert.match(page, /Kód TVL č\./);
  assert.match(printCss, /\.original-a4 \.timestamp-box b \{[\s\S]*?font-size: 9px/);
});

test("hodnota zkušeností má věkové skupiny a v TVL jen číslici", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["20–39 let", "40–59 let", "60–89 let", "V tiskopisu se zobrazí pouze zvolená číslice 1–3"]) assert.match(page, new RegExp(text));
  assert.match(page, /<b>Hodnota zkušeností správce<\/b>\s*<i>\{surveyValue\}<\/i>/);
  assert.doesNotMatch(page, /<i>\{surveyValue\} \{surveyValue === 1 \? "bod" : "body"\}<\/i>/);
});

test("vyplněný TVL lze vytisknout a odkaz na živou aplikaci sdílet", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  for (const text of ["🌐 COTO – ŽIVÁ APLIKACE", "TISKNOUT CELÝ TVL NA JEDNU A4", "TISK / ULOŽIT CELÝ TVL NA JEDNU A4", "Uložit jako PDF", "SMS nebo MMS"]) assert.match(page, new RegExp(text));
  assert.match(page, /navigator\.share/);
  assert.match(page, /navigator\.clipboard\.writeText/);
  assert.match(layout, /print-a4-2026-10-04\.css/);
});

test("účastník má už ve volbě role seznam správců", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /className="role-organiser-list"/);
  assert.match(page, /managerListLabel/);
  assert.match(page, /setRole\("participant"\); setEntryStage\("app"\)/);
});
