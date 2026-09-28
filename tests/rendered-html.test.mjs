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
  for (const text of ["SPRÁVCE", "KONTROLA SPRÁVCE V ARES", "Čtyři varianty", "Průzkum názorů", "Vyber lepší", "Podpora projektu", "Volební tombola", "POUKÁZKA", "INVESTICE", "DOKLAD", "ZPĚT", "UKONČIT", "POTVRDIT", "Živé průzkumy", "Ukončené průzkumy", "OTEVŘÍT JEN KE ČTENÍ A KOPÍROVÁNÍ"]) assert.match(page, new RegExp(text));
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
  for (const text of ["Živá pracovní šablona INVESTICE", "Kód a pořadí použití", "Hodnota průzkumu pro správce", "Datum a doba platnosti", "Vyplnit první pole okna C", "UKONČIT EDITACI A ZOBRAZIT CELÝ TVL"]) assert.match(page, new RegExp(text));
});

test("celý TVL zachovává identifikátor B, osobní okno D a jednu A4", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /Identifikátor TVL · 17 symbolů/);
  assert.match(page, /4 volitelné symboly účastníka/);
  assert.match(page, /Array\.from\(\{ length: 4 \}/);
  assert.match(page, /className="identifier-symbol"/);
  assert.match(page, /Volitelný symbol \$\{index \+ 1\}/);
  assert.doesNotMatch(page, /"COTO001" \+ "A001"/);
  assert.match(page, /className="personal-only window-d"/);
  assert.match(page, /Okno D · pouze na POUKÁZCE/);
  assert.match(page, /className="tvl-paper printed-sheet original-a4"/);
});

test("výsledek se vrací ke správci i do vložených TVL", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["Návrh", "Posílení", "Kopírování", "Sčítání", "Řešení", "každého původního nebo zkopírovaného TVL", "všech se načte shodný výsledek"]) assert.match(page, new RegExp(text));
});

test("volba role vysvětluje účel COTO i podmínky správce", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["nejmenší správní a společenské celky", "Potřebuješ IČO a samostatný účet na propagaci", "do nich se vracejí výsledky průzkumů"]) assert.match(page, new RegExp(text));
});

test("účastník vidí řádkové výsledky účtu na propagaci", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  for (const text of ["Řádkové výsledky účtu na propagaci", "KONTROLA ÚČASTNÍKA", "Tvoje body", "ZKONTROLOVAT ŘÁDKY ÚČTU NA PROPAGACI", "ZKOPÍROVAT PRO DALŠÍHO SPRÁVCE"]) assert.match(page, new RegExp(text));
  assert.match(css, /\.account-result-row/);
});

test("pokyny používají přímé tykání", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["Vyber si správce", "Otevři jeho aktivitu", "Tvoje hodnocení", "Zadej IČO", "Přejeď kurzorem"]) assert.match(page, new RegExp(text));
  assert.doesNotMatch(page, /Zadejte|Doplňte|Vyberte|Otevřete|Najeďte|Klikněte|Můžete|Zkontrolujte|Vaše hodnocení/);
});

test("originální logo a obrazovka cíle se nesmí znovu nahradit maketou", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const logo = await readFile(new URL("../public/coto-logo-original.png", import.meta.url));
  assert.ok(logo.byteLength > 1_000_000, "chybí dodané originální logo");
  assert.match(page, /coto-logo-original\.png/);
  assert.doesNotMatch(page, /coto-logo-video\.svg/);
  for (const text of ["Cíl a filosofie internetové aplikace COTO", "průběžný a obousměrný", "TVL je Třídílný Volební List"]) assert.match(page, new RegExp(text));
  assert.match(page, /shodným\s+kódem a časovým razítkem/);
});

test("okno C má tři nečíslovaná dlouhá pole a jedno hodnocení", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  const windowC = page.slice(page.indexOf('className="project-list window-c"'), page.indexOf('{kind === "voucher"'));
  assert.match(page, /className="project-field"/);
  assert.match(page, /className=\{\s*"participant-score/);
  assert.doesNotMatch(windowC, /<span>\{index \+ 1\}<\/span>/);
  assert.doesNotMatch(windowC, /manager-priority/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\) 38px/);
  assert.match(css, /\.survey-box \.window-c \{[\s\S]*?gap: 4px/);
  assert.match(css, /border-bottom: 1px solid #555 !important/);
});

test("poukázka obsahuje okno D, text a střihovou linku v pevné A4", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  assert.match(page, /className="voucher-footer"/);
  assert.match(page, /<CutLine label="oddělit POUKÁZKU"/);
  assert.match(page, /cut-scissors/);
  assert.match(css, /grid-template-rows: 55% 43%/);
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
  assert.doesNotMatch(page, /window\.localStorage\.setItem/);
});

test("správce dostává popisky při pohybu kurzoru", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/revision-2026-09-24.css", import.meta.url), "utf8");
  for (const text of ["POPIS PRO SPRÁVCE", "Přejeď kurzorem přes volbu", "Kód a pořadí", "Uzamkne TVL"]) assert.match(page, new RegExp(text));
  assert.match(page, /data-help=/);
  assert.match(css, /\.manager-help:hover::after/);
  assert.match(css, /\.manager-hover-caption/);
});
