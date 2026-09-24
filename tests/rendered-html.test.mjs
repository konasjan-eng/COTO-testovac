import assert from "node:assert/strict";
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
  for (const text of ["Živá pracovní šablona INVESTICE", "Kód varianty COTO", "Týden platnosti", "Vyplnit řádek C1", "UKONČIT EDITACI A ZOBRAZIT CELÝ TVL"]) assert.match(page, new RegExp(text));
});

test("celý TVL zachovává identifikátor B, osobní okno D a jednu A4", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /Identifikátor TVL · 17 symbolů/);
  assert.match(page, /className="personal-only window-d"/);
  assert.match(page, /Okno D · pouze na POUKÁZCE/);
  assert.match(page, /className="tvl-paper printed-sheet original-a4"/);
});

test("výsledek se vrací ke správci i do vložených TVL", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  for (const text of ["Návrh", "Posílení", "Kopírování", "Sčítání", "Řešení", "každého vloženého TVL"]) assert.match(page, new RegExp(text));
});
