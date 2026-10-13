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
const PAGES = ['', 'changements-v9-v10.html', 'mentions-legales.html', 'confidentialite.html', 'cgv-pro.html', 'cgv.html',
  // Pages guides (scripts/seo-pages.mjs)
  'indicateurs/indicateur-33.html', 'preparer-audit-qualiopi-2026.html', 'modeles-qualiopi-gratuits.html', 'qualiopi-1er-novembre-2026.html',
  ...[1, 2, 3, 7, 12, 14, 15, 19, 20, 27, 30, 32].map((n) => `indicateurs/indicateur-${n}.html`)];
// Gate: while sales.config.json has SALES_OPEN=false, no page may offer to buy.
const SALES_OPEN = JSON.parse(await readFile(resolve(import.meta.dirname, '..', 'sales.config.json'), 'utf8')).SALES_OPEN === true;
const TYPES = { '.js': 'text/javascript', '.pdf': 'application/pdf', '.docx': 'application/octet-stream', '.odt': 'application/octet-stream', '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
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
    const tracked = [];
    page.on('request', (r) => { if (r.url().includes('script.google.com')) tracked.push(r.url()); });
    const res = await page.goto(base + path + '?octave_notrack=1', { waitUntil: 'load' });
    assert.equal(res.status(), 200);
    assert.deepEqual(errors, []);
    // cro.js (behaviour counters / A/B) is loaded and has run; octave_notrack=1: nothing is sent.
    assert.equal(await page.evaluate(() => typeof (window.octaveCro && window.octaveCro.goal)), 'function');
    assert.equal(await page.getAttribute('script[src$="cro.js"]', 'data-site'), 'kit-qualiopi-v10');
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
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
    if (!SALES_OPEN) assert.doesNotMatch(actions, /acheter|commander|panier|payer/i, 'aucun bouton d\'achat tant que la vente est fermée');
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.href));
    assert.ok(!hrefs.some((h) => /stripe\.com|checkout/i.test(h)), 'aucun lien de paiement');
    if (!SALES_OPEN) assert.ok(!hrefs.some((h) => /commander\.html|commande\.html/.test(h)), 'aucun lien vers la commande');
    hrefs.forEach((h) => links.add(h));
    await page.close();
    assert.deepEqual(tracked, [], 'aucun envoi de mesure pendant les tests (octave_notrack=1)');
  });
}

test('liens internes et ressources : 200', async () => {
  const internal = [...links].filter((h) => h.startsWith(base)).map((h) => h.split('#')[0]);
  for (const extra of ['sitemap.xml', 'robots.txt', 'styles.css', 'mesure.js', 'cro.js', 'cro-goals.js', 'og.png', 'favicon.svg', 'img/apercu-d02-checklist-33-indicateurs.webp', 'img/apercu-d04-plan-21-jours.webp', 'img/apercu-t01-fiche-programme.webp', 'img/apercu-t07-procedure-violences.webp', 'img/apercu-t20-convention-formation.webp', 'img/apercu-t22-reglement-interieur.webp', 'img/apercu-t30-questionnaire-chaud.webp']) internal.push(base + extra);
  for (const h of new Set(internal)) {
    const r = await fetch(h);
    assert.equal(r.status, 200, h);
  }
});

test('lien de téléchargement de l\'échantillon joignable', { skip: process.env.SKIP_RELEASE === '1' }, async () => {
  const sample = [...links].find((h) => h.includes('/releases/download/'));
  assert.ok(sample, 'lien de l\'échantillon présent');
  // Vérification par l'API publique (sans télécharger le fichier, pour ne pas fausser le KPI download_count).
  const m = sample.match(/github\.com\/([^/]+\/[^/]+)\/releases\/download\/([^/]+)\/(.+)$/);
  assert.ok(m, sample);
  const r = await fetch(`https://api.github.com/repos/${m[1]}/releases/tags/${m[2]}`, { headers: { accept: 'application/vnd.github+json' } });
  assert.equal(r.status, 200);
  const rel = await r.json();
  assert.ok(rel.assets.some((a) => a.name === m[3] && a.state === 'uploaded' && a.size > 100000), `asset ${m[3]} présent`);
});

test('liens externes (sources officielles, GitHub) : pas de 404', async () => {
  const external = [...links].filter((h) => /^https?:/.test(h) && !h.startsWith(base) && !h.includes('/releases/download/') && !h.includes('legifrance.gouv.fr') && !h.includes('travail-emploi.gouv.fr')); // both sit behind bot protection
  for (const h of new Set(external)) {
    const r = await fetch(h, { method: 'GET', redirect: 'follow' });
    assert.ok(r.status < 400, `${h} → ${r.status}`);
  }
});
