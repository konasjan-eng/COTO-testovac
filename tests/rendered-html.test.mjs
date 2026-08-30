import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
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
  for (const text of ["SPRÁVCE", "KONTROLA SPRÁVCE V ARES", "POUKÁZKA", "INVESTICE", "DOKLAD", "ZPĚT", "UKONČIT", "POTVRDIT PN1", "Živé průzkumy", "Ukončené průzkumy", "OTEVŘÍT JEN KE ČTENÍ A KOPÍROVÁNÍ"]) assert.match(page, new RegExp(text));
});
