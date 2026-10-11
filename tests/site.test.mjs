// Vérifie le site (local par défaut, ou en ligne avec SITE_URL=...).
// Rendu, absence d'erreur console, pas de défilement horizontal à 390 px, liens internes 200,
// lien de l'échantillon joignable, métadonnées uniques, aucun bouton d'achat ni lien de paiement.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(import.meta.dirname, '..', 'docs');
const PAGES = ['', 'changements-v9-v10.html', 'mentions-legales.html', 'confidentialite.html', 'cgv.html'];
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
let server, base, browser;

before(async () => {
  if (process.env.SITE_URL) { base = process.env.SITE_URL; }
  else {
    server = createServer(async (req, res) => {
      const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^\/+/, '') || 'index.html';
      try { const body = await readFile(join(ROOT, p.endsWith('/') ? p + 'index.html' : p)); res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' }); res.end(body); }
      catch { res.writeHead(404); res.end('404'); }
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}/`;
  }
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

const seen = { titles: new Set(), descriptions: new Set() };
const links = new Set();

for (const path of PAGES) {
  test(`page « ${path || 'accueil'} » : rendu, console, 390 px, métadonnées`, async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    const res = await page.goto(base + path, { waitUntil: 'load' });
    assert.equal(res.status(), 200);
    assert.deepEqual(errors, []);
    const t = await page.title();
    const d = await page.getAttribute('meta[name="description"]', 'content');
    assert.ok(t.length > 10 && !seen.titles.has(t), `titre unique : ${t}`);
    assert.ok(d && d.length > 40 && !seen.descriptions.has(d), 'description unique');
    seen.titles.add(t); seen.descriptions.add(d);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.getAttribute('html', 'lang'), 'fr');
    assert.ok(await page.getAttribute('meta[property="og:image"]', 'content'));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `défilement horizontal de ${overflow}px`);
    const body = await page.locator('body').innerText();
    assert.match(body, /READ FRANCE SAS/);
    const actions = (await page.$$eval('a, button, input[type=submit]', (els) => els.map((e) => e.innerText || e.value || ''))).join(' | ');
    assert.doesNotMatch(actions, /acheter|commander|panier|payer/i, 'aucun bouton d\'achat tant que la vente est fermée');
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
    assert.ok(!hrefs.some((h) => /stripe\.com|checkout/i.test(h)), 'aucun lien de paiement');
    hrefs.forEach((h) => links.add(h));
    await page.close();
  });
}

test('liens internes et ressources : 200', async () => {
  const internal = [...links].filter((h) => h.startsWith(base)).map((h) => h.split('#')[0]);
  for (const extra of ['sitemap.xml', 'robots.txt', 'styles.css', 'og.png', 'favicon.svg']) internal.push(base + extra);
  for (const h of new Set(internal)) {
    const r = await fetch(h);
    assert.equal(r.status, 200, h);
  }
});

test('lien de téléchargement de l\'échantillon joignable', { skip: process.env.SKIP_RELEASE === '1' }, async () => {
  const sample = [...links].find((h) => h.includes('/releases/download/'));
  assert.ok(sample, 'lien de l\'échantillon présent');
  const r = await fetch(sample, { method: 'HEAD', redirect: 'follow' });
  assert.equal(r.status, 200, sample);
});

test('liens externes (sources officielles, GitHub) : pas de 404', async () => {
  const external = [...links].filter((h) => !h.startsWith(base) && !h.includes('/releases/download/') && !h.includes('legifrance.gouv.fr'));
  for (const h of new Set(external)) {
    const r = await fetch(h, { method: 'GET', redirect: 'follow' });
    assert.ok(r.status < 400, `${h} → ${r.status}`);
  }
});
