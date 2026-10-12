// Sales gate (SALES_OPEN) and B2B buy UI.
//  - With SALES_OPEN=false (the committed sales.config.json), the build output, and the published
//    docs/, contain NO buy UI: no « Commander » page, no order page, no Stripe.js, no checkout script,
//    nothing in the sitemap, and the « pas encore en vente » message stays.
//  - A test build with SALES_OPEN=true (SALES_ALLOW_TEST=1, fake endpoint, pk_test_) emits the form
//    (e-mail, raison sociale, SIREN + Luhn, adresse de facturation, case CGV pro), the order page, and
//    the B2B terms; a browser run with a stubbed Stripe.js and endpoint checks the form behaviour.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve } from 'node:path';
import { chromium } from 'playwright';

const ROOT = resolve(import.meta.dirname, '..');
const BUILD = ['scripts/build.mjs'];
const SITE_PREFIX = ''; // pages are served at the root of OUT
const PRODUCT = 'kit-qualiopi-v10';
const PRICE_RE = /79,00\s€ net de taxe \(TVA non applicable, art\. 293 B du CGI\)/;
const SOON_RE = /La vente n'est pas encore ouverte/;
const DISCLAIMER_RE = /ne garantit pas l'obtention, le maintien ou le renouvellement de la certification Qualiopi/;
const BUY_MARKERS = [/js\.stripe\.com/, /commander\.html/, /commande\.html/, /checkout-config/, /octave-pay/, /pk_(live|test)_/, /script\.google\.com/];

const PUBLISHED = 'docs';
const repoConfig = JSON.parse(readFileSync(join(ROOT, 'sales.config.json'), 'utf8'));
const tmp = mkdtempSync(join(tmpdir(), 'sales-gate-'));

function build(config, env = {}) {
  const cfg = join(tmp, `cfg-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(cfg, JSON.stringify(config));
  const out = join(tmp, `out-${Math.random().toString(36).slice(2)}`);
  execFileSync(process.execPath, BUILD, { cwd: ROOT, env: { ...process.env, SALES_CONFIG: cfg, OUT_DIR: out, ...env }, stdio: 'pipe' });
  return out;
}
const files = (dir) => readdirSync(dir, { recursive: true }).map(String).filter((f) => statSync(join(dir, f)).isFile());
const read = (dir, f) => readFileSync(join(dir, SITE_PREFIX, f), 'utf8');

function assertClosed(dir) {
  for (const f of ['commander.html', 'commande.html', 'checkout/pay.js', 'checkout/order.js', 'checkout/checkout-config.js']) assert.ok(!existsSync(join(dir, SITE_PREFIX, f)), `${f} must not exist while SALES_OPEN=false`);
  for (const f of files(dir).filter((x) => /\.(html|js|xml|txt|json)$/.test(x))) {
    const body = readFileSync(join(dir, f), 'utf8');
    for (const re of BUY_MARKERS) assert.doesNotMatch(body, re, `${f} contains buy UI marker ${re}`);
    assert.doesNotMatch(body, /<form/i, `${f} contains a form`);
  }
  assert.match(read(dir, 'index.html'), SOON_RE);
  const sitemap = read(dir, 'sitemap.xml');
  assert.doesNotMatch(sitemap, /cgv-pro|commande|commander/);
  assert.match(read(dir, 'cgv-pro.html'), /<meta name="robots" content="noindex">/);
  assert.match(read(dir, 'cgv-pro.html'), /Les ventes ne sont pas encore ouvertes/);
}

const OPEN_CFG = { ...repoConfig, SALES_OPEN: true, endpoint: 'https://octave-test.invalid/exec', publishableKey: 'pk_test_fakeForGateTest123' };

test('committed config is coherent: closed, or open with the Apps Script /exec URL and a LIVE publishable key', () => {
  assert.equal(repoConfig.product, PRODUCT);
  assert.ok(['standard20', 'franchise293B'].includes(repoConfig.VAT));
  assert.equal(typeof repoConfig.SALES_OPEN, 'boolean');
  if (!repoConfig.SALES_OPEN) return;
  assert.match(repoConfig.endpoint, /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/);
  assert.match(repoConfig.publishableKey, /^pk_live_[A-Za-z0-9]+$/);
});

test('SALES_OPEN=false: build output has no buy UI, is not indexed, keeps « pas encore en vente »', () => {
  assertClosed(build({ ...repoConfig, SALES_OPEN: false }));
});

test('published output (docs/ as committed) matches SALES_OPEN (no buy UI at all while it is false)', () => {
  if (repoConfig.SALES_OPEN) {
    assert.ok(existsSync(join(ROOT, PUBLISHED, 'commander.html')), 'SALES_OPEN=true: the published output has the Commander page');
    return;
  }
  assertClosed(join(ROOT, 'docs'));
});

test('config validation: SALES_OPEN=true needs the Apps Script URL and a LIVE publishable key', () => {
  const BASE = { ...repoConfig, SALES_OPEN: false, endpoint: '', publishableKey: '' };
  const fails = (cfg, env) => assert.throws(() => build(cfg, env), /sales\.config|cfg-/);
  fails({ ...BASE, SALES_OPEN: true });
  fails({ ...BASE, SALES_OPEN: true, endpoint: 'https://script.google.com/macros/s/AKfycbTESTTESTTESTTESTTEST/exec', publishableKey: 'pk_test_abc' });
  fails({ ...BASE, SALES_OPEN: true, endpoint: 'https://evil.example/exec', publishableKey: 'pk_live_abc' });
  fails({ ...BASE, SALES_OPEN: 'yes' });
  fails({ ...BASE, VAT: 'none' });
  // A real-looking live config builds (no network involved).
  build({ ...BASE, SALES_OPEN: true, endpoint: 'https://script.google.com/macros/s/AKfycbTESTTESTTESTTESTTEST/exec', publishableKey: 'pk_live_abc' });
});

test('B2B terms (cgv-pro.html): every required clause, version, review comment, footer', () => {
  const html = read(build({ ...repoConfig, SALES_OPEN: false }), 'cgv-pro.html');
  assert.match(html, /<!--[\s\S]*PAS UN CONSEIL JURIDIQUE[\s\S]*relire[\s\S]*-->/);
  const text = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  for (const re of [
    /version du 12 octobre 2026/,
    /READ FRANCE SAS, société par actions simplifiée \(SAS\) au capital de 1 000\s€/, /11 rue Rouvet, 75019 Paris/, /SIREN 988 741 773/, /RCS Paris/, /TVA non applicable, art\. 293 B du CGI/, /Tanguy Warsmann/,
    /Champ d’application et acceptation/, /professionnel/, /accepte expressément/,
    /fichier numérique/, /livré par courrier électronique/,
    PRICE_RE,
    /par carte bancaire, au comptant, via le prestataire de paiement Stripe/,
    /Livraison et délai/, /au plus tard dans les 24 heures/,
    /droit de rétractation[^.]*ne s’applique pas/,
    /licence non exclusive, non cessible et non transférable/, /pour ses besoins internes/,
    DISCLAIMER_RE,
    /limitée au prix payé/,
    /trois fois le taux d’intérêt légal/, /indemnité forfaitaire pour frais de recouvrement de 40\s€/, /L441-10/,
    /Données personnelles/, /CNIL/, /10 ans/,
    /droit français/, /compétence exclusive des tribunaux de Paris/,
  ]) assert.match(text, re, String(re));
  if (repoConfig.VAT === 'franchise293B') assert.doesNotMatch(text, /TTC|toutes taxes comprises|FR57988741773|de TVA au taux/, 'franchise 293 B: no VAT wording in the B2B terms');
  assert.match(html, /READ FRANCE SAS/);
  assert.match(html, /<footer/);
  assert.match(html, /href="cgv-pro\.html"/);
});

test('mentions légales: share capital 1 000 € (no « à compléter »), VAT status matches the VAT mode', () => {
  const text = read(build({ ...repoConfig, SALES_OPEN: false }), 'mentions-legales.html').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  assert.match(text, /Capital social : 1 000\s€/);
  assert.doesNotMatch(text, /à compléter|non affichés/);
  if (repoConfig.VAT === 'franchise293B') assert.match(text, /TVA non applicable, art\. 293 B du CGI/);
});

let server, browser, openDir, base;
before(async () => {
  openDir = build(OPEN_CFG, { SALES_ALLOW_TEST: '1' });
  const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
  server = createServer((req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^\/+/, '');
    if (!p || p.endsWith('/')) p += 'index.html';
    try {
      const body = readFileSync(join(openDir, p));
      res.writeHead(200, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end('404');
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/${SITE_PREFIX}`;
});
after(async () => {
  await browser?.close();
  server?.close();
});

test('SALES_OPEN=true (test build): Commander page, order page, config, sitemap, links', () => {
  const cmd = read(openDir, 'commander.html');
  for (const name of ['email', 'company', 'siren', 'addressLine1', 'addressLine2', 'postalCode', 'city', 'terms']) assert.match(cmd, new RegExp(`name="${name}"`), name);
  assert.match(cmd, /<h2 id="commander-h">Commander<\/h2>/);
  assert.match(cmd, /id="terms-link" href="cgv-pro\.html"/);
  assert.match(cmd, /<meta name="robots" content="noindex">/);
  assert.match(cmd, /Content-Security-Policy[^>]*js\.stripe\.com[^>]*script\.google\.com/);
  assert.match(cmd, /<script src="https:\/\/js\.stripe\.com\/v3\/"><\/script>/);
  assert.match(cmd, /Commander avec obligation de paiement/);
  assert.match(read(openDir, 'commande.html'), /id="order-status"/);
  assert.match(read(openDir, 'commande.html'), /<meta name="robots" content="noindex">/);
  const conf = read(openDir, 'checkout/checkout-config.js');
  assert.match(conf, /"product":"kit-qualiopi-v10"/);
  assert.match(conf, /"orderPage":"commande\.html"/);
  assert.match(conf, /cgv-pro\.html/);
  for (const f of ['pay.js', 'order.js']) assert.equal(read(openDir, `checkout/${f}`), readFileSync(join(ROOT, 'src/checkout', f), 'utf8'));
  assert.doesNotMatch(read(openDir, 'sitemap.xml'), /commande|commander/);
  assert.match(read(openDir, 'sitemap.xml'), /cgv-pro\.html/);
  assert.match(read(openDir, 'index.html'), /href="commander\.html"/);
  assert.doesNotMatch(read(openDir, 'index.html'), SOON_RE);
  assert.doesNotMatch(read(openDir, 'cgv-pro.html'), /Les ventes ne sont pas encore ouvertes/);
});

// Minimal Stripe.js stand-in: Payment Element that becomes "ready", elements.submit() ok.
const FAKE_STRIPE = `window.Stripe = function () { return {
  elements: function () { return { create: function () { var h = {}; return { on: function (e, f) { h[e] = f; }, mount: function (sel) { document.querySelector(sel).textContent = '[carte]'; setTimeout(function () { h.ready && h.ready(); }, 10); } }; }, submit: function () { return Promise.resolve({}); } }; },
  confirmPayment: function () { return Promise.resolve({ error: { message: 'stub: no payment in tests' } }); } }; };`;

test('browser: form validates SIREN (Luhn) and billing address, then posts createIntent with all B2B fields', async () => {
  browser ??= await chromium.launch(); // launched here only: the build-level checks above need no browser
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const consoleLines = [];
  page.on('console', (m) => consoleLines.push(`${m.type()}: ${m.text()}`));
  page.on('requestfailed', (r) => consoleLines.push(`failed ${r.url()} ${r.failure()?.errorText}`));
  const posts = [];
  await page.route('https://js.stripe.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_STRIPE }));
  await page.route('https://octave-test.invalid/**', async (r) => {
    const req = r.request();
    if (req.method() === 'GET') return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, name: 'Kit Qualiopi V10', amount: OPEN_CFG.amount, currency: 'eur', label: 'catalogue: prix serveur', termsVersion: 'cgv-pro-2026-10-12' }) });
    posts.push(JSON.parse(req.postData()));
    return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: false, error: 'stub', message: 'stub: arrêt avant paiement' }) });
  });
  await page.goto(base + 'commander.html');
  await page.waitForSelector('#octave-pay[data-ready="1"]', { timeout: 10000 }).catch((e) => {
    throw new Error(`${e.message}\n${consoleLines.join('\n')}`);
  });
  assert.equal(await page.textContent('#product-price'), 'catalogue: prix serveur');
  await page.fill('input[name="email"]', 'achat@entreprise.example');
  await page.fill('input[name="company"]', 'Organisme Exemple SAS');
  await page.fill('input[name="siren"]', '732 829 321'); // bad Luhn
  await page.check('input[name="terms"]');
  await page.click('#pay-button');
  assert.match(await page.$eval('input[name="siren"]', (i) => i.validationMessage), /SIREN invalide/);
  assert.equal(posts.length, 0, 'no call with an invalid SIREN');
  await page.fill('input[name="siren"]', '732 829 320');
  await page.click('#pay-button');
  assert.equal(await page.$eval('input[name="addressLine1"]', (i) => i.validity.valueMissing), true);
  assert.equal(posts.length, 0, 'no call without billing address');
  await page.fill('input[name="addressLine1"]', '1 place Exemple');
  await page.fill('input[name="postalCode"]', '75011');
  await page.fill('input[name="city"]', 'Paris');
  await page.click('#pay-button');
  await page.waitForSelector('#pay-error:not([hidden])');
  assert.equal(posts.length, 1);
  assert.deepEqual({ ...posts[0], attempt: 'x' }, { action: 'createIntent', product: PRODUCT, email: 'achat@entreprise.example', company: 'Organisme Exemple SAS', siren: '732829320', addressLine1: '1 place Exemple', addressLine2: '', postalCode: '75011', city: 'Paris', termsAccepted: true, termsVersion: 'cgv-pro-2026-10-12', attempt: 'x' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 0, `horizontal scroll ${overflow}px`);
  assert.deepEqual(errors, []);
  // Order page without Stripe parameters: explicit message, no call.
  await page.goto(base + 'commande.html');
  assert.match(await page.textContent('#order-status'), /Lien de commande incomplet/);
  await page.close();
});
