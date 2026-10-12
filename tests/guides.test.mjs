// Pages guides (P1, P3, P4, P5 du plan SEO) : métadonnées, sources officielles, CTA unique, fichiers servis,
// et auto-diagnostic (applicabilité selon l'annexe, sauvegarde locale, impression).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright';
import { FREE_FILES } from '../scripts/seo-page-modeles.mjs';

const DOCS = resolve(import.meta.dirname, '..', 'docs');
const SITE = 'https://outils.vread.fr/kit-qualiopi-v10/';
const GUIDES = ['indicateurs/indicateur-33.html', 'preparer-audit-qualiopi-2026.html', 'modeles-qualiopi-gratuits.html', 'qualiopi-1er-novembre-2026.html'];
const P2 = [1, 2, 3, 7, 12, 14, 15, 19, 20, 27, 30, 32].map((n) => `indicateurs/indicateur-${n}.html`);
const html = (p) => readFileSync(join(DOCS, p), 'utf8');
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const words = (h) => h.replace(/<(script|style|head)[\s\S]*?<\/\1>/g, ' ').replace(/<header[\s\S]*?<\/header>|<footer class="foot"[\s\S]*?<\/footer>/g, ' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

for (const p of [...GUIDES, ...P2]) {
  test(`${p} : canonique, JSON-LD, sources officielles, un seul CTA payant, sitemap`, () => {
    const h = html(p);
    assert.ok(h.includes(`<link rel="canonical" href="${SITE}${p}">`), 'canonique');
    const items = ld(h);
    const art = items.find((o) => /Article/.test(o['@type']));
    assert.ok(art && art.datePublished && art.dateModified && art.mainEntityOfPage === SITE + p, 'Article daté');
    assert.equal(art.publisher['@id'], 'https://outils.vread.fr/#org');
    assert.ok(items.some((o) => o['@type'] === 'BreadcrumbList'), 'BreadcrumbList');
    assert.match(h, /href="https:\/\/www\.legifrance\.gouv\.fr\/jorf\/id\/JORFTEXT000054608509"/, 'lien vers le décret');
    assert.equal((h.match(/class="kit-cta"/g) || []).length, 1, 'un seul bloc CTA vers le kit');
    assert.match(h, /textes officiels vérifiés le \d+/, 'date de vérification affichée');
    assert.match(h, /assistant IA/, 'aide de l\'IA signalée');
    assert.ok(!/ — /.test(h.split('<main')[1].split('<footer')[0].replace(/<[^>]+>/g, '')), 'pas de tiret cadratin dans le texte');
    assert.ok(readFileSync(join(DOCS, 'sitemap.xml'), 'utf8').includes(`<loc>${SITE}${p}</loc>`), 'dans le sitemap');
  });
}

test('pages en sous-dossier : feuilles de style et liens remontent d\'un niveau', () => {
  const h = html('indicateurs/indicateur-33.html');
  assert.match(h, /href="\.\.\/styles\.css"/);
  assert.match(h, /href="\.\.\/guides\.css"/);
  assert.match(h, /src="\.\.\/guides\.js"/);
  assert.match(h, /href="\.\.\/changements-v9-v10\.html#indicateur-33"/);
  assert.ok(!/href="indicateurs\//.test(h), 'aucun lien indicateurs/… relatif depuis indicateurs/');
});

test('pages indicateur modifié : texte 2019 et 2026 cités, ajouts surlignés', () => {
  for (const p of P2) {
    const h = html(p);
    assert.equal((h.match(/class="official diff"/g) || []).length, 2, p);
    assert.match(h, /<ins>/, `${p} : ajouts surlignés`);
  }
});

test('pages indicateur : au moins 600 mots et le texte officiel cité', () => {
  for (const p of [...GUIDES, ...P2].filter((x) => x.startsWith('indicateurs/'))) {
    const h = html(p);
    assert.ok(words(h) >= 600, `${p} : ${words(h)} mots`);
    assert.match(h, /class="official( diff)?"/);
  }
});

test('hub : la page « Ce qui change » et l\'accueil renvoient vers l\'indicateur 33 et les guides', () => {
  const c = html('changements-v9-v10.html');
  for (const p of [...GUIDES, ...P2]) assert.ok(c.includes(`href="${p}"`), `changements → ${p}`);
  assert.ok(html('index.html').includes('href="indicateurs/indicateur-33.html"'), 'accueil → indicateur 33');
});

test('modèles gratuits : chaque fichier est servi depuis le site, et lié depuis la page', () => {
  const h = html('modeles-qualiopi-gratuits.html');
  for (const f of FREE_FILES) {
    assert.ok(existsSync(join(DOCS, 'telechargements', f)) && statSync(join(DOCS, 'telechargements', f)).size > 10000, f);
    assert.ok(h.includes(`href="telechargements/${f}"`), `lien ${f}`);
  }
});

// ------------------------------------------------------------------ Auto-diagnostic (navigateur)
let server, base, browser;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.png': 'image/png' };
before(async () => {
  server = createServer(async (req, res) => {
    const p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^\/+/, '') || 'index.html';
    try { const body = await readFile(join(DOCS, p)); res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' }); res.end(body); } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
  browser = await chromium.launch();
});
after(async () => { await browser?.close(); server?.close(); });

test('auto-diagnostic : applicabilité selon l\'annexe, résultat, sauvegarde locale, impression', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + 'preparer-audit-qualiopi-2026.html', { waitUntil: 'load' });
  assert.equal(await page.locator('.ad-q').count(), 33, '33 questions rendues côté serveur');
  // Actions de formation seules, sans condition : 28 indicateurs cochés moins 3, 7, 13, 16, 27, 28 (conditions) = 22.
  assert.match(await page.textContent('#ad-summary'), /^22 indicateurs/);
  assert.ok(await page.$eval('#q-33', (el) => el.classList.contains('is-na')), '33 non applicable hors apprentissage');
  await page.check('input[name=cat][value="4"]');
  assert.ok(!(await page.$eval('#q-33', (el) => el.classList.contains('is-na'))), '33 applicable aux CFA');
  await page.check('input[name=cond][value="sous-traitance"]');
  await page.check('input[name=i12][value=non]');
  await page.check('input[name=i27][value=partiel]');
  await page.check('input[name=i1][value=oui]');
  assert.match(await page.textContent('#ad-summary'), /3 réponses sur 28/);
  assert.equal(await page.locator('#ad-todo li').count(), 2);
  await page.reload({ waitUntil: 'load' });
  assert.ok(await page.isChecked('input[name=i12][value=non]'), 'réponse restaurée');
  assert.ok(await page.isChecked('input[name=cond][value="sous-traitance"]'), 'profil restauré');
  await page.evaluate(() => { window.print = () => {}; });
  await page.click('#ad-print-btn');
  assert.match(await page.textContent('#ad-print'), /Auto-diagnostic Qualiopi/);
  await page.click('#ad-draw-btn');
  assert.equal(await page.locator('#ad-draw-list li').count(), 5);
  assert.deepEqual(errors, []);
  await page.close();
});

test('auto-diagnostic : fonctionne sans stockage local (navigation privée stricte)', async () => {
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied'); } }); });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + 'preparer-audit-qualiopi-2026.html', { waitUntil: 'load' });
  await page.check('input[name=i1][value=oui]');
  assert.match(await page.textContent('#ad-summary'), /^1 réponse sur 22 /);
  assert.deepEqual(errors, []);
  await ctx.close();
});
