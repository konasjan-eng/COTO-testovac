import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("vykreslí pracovní šablonu správce COTO", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /COTO · Digitální pracovní list TVL/);
  assert.match(html, /POUKÁZKA/);
  assert.match(html, /INVESTICE/);
  assert.match(html, /DOKLAD/);
  assert.match(html, /NÁHLED CELÉHO TVL/);
  assert.match(html, /Účastník/);
});

test("neobsahuje původní startovací obrazovku", async () => {
  const response = await render();
  const html = await response.text();
  assert.doesNotMatch(html, /Your site is taking shape/);
  assert.doesNotMatch(html, /codex-preview/);
});
