// Sales gate (SALES_OPEN) and B2B buy UI.
//  - With SALES_OPEN=false (the committed sales.config.json), the build output, and the published
//    docs/, contain NO buy UI: no « Commander » page, no order page, no Stripe.js, no checkout script,
//    nothing in the sitemap, and the « pas encore en vente » message stays.
//  - A test build with SALES_OPEN=true (SALES_ALLOW_TEST=1, fake endpoint, pk_test_) emits the form
//    (e-mail, raison sociale, SIREN + Luhn, adresse de facturation, case CGV pro), the order page, and
//    the B2B terms; a browser run with a stubbed Stripe.js and endpoint checks the form behaviour.
//  - Quote / bank-transfer form (quotesEnabled, false in the committed config): no #octave-devis block and no
//    devis.js script tag while it is false; a test build with quotesEnabled=true has the block once, right
//    after #octave-pay, devis.js after pay.js, unique ids, and devis.js posts { action: 'quote', ... }.
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
  // mesure.js (anonymous audience snippet, posts to the Apps Script endpoint) is not buy UI.
  for (const f of files(dir).filter((x) => /\.(html|js|xml|txt|json)$/.test(x) && x !== join(SITE_PREFIX, 'mesure.js'))) {
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

const OPEN_CFG = { ...repoConfig, SALES_OPEN: true, quotesEnabled: false, endpoint: 'https://octave-test.invalid/exec', publishableKey: 'pk_test_fakeForGateTest123' };
const QUOTES_CFG = { ...OPEN_CFG, quotesEnabled: true };

test('committed config is coherent: closed, or open with the Apps Script /exec URL and a LIVE publishable key', () => {
  assert.equal(repoConfig.product, PRODUCT);
  assert.ok(['standard20', 'franchise293B'].includes(repoConfig.VAT));
  assert.equal(typeof repoConfig.SALES_OPEN, 'boolean');
  assert.equal(typeof repoConfig.quotesEnabled, 'boolean', 'sales.config.json must say quotesEnabled: true or false');
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

let server, browser, openDir, quotesDir, base;
before(async () => {
  openDir = build(OPEN_CFG, { SALES_ALLOW_TEST: '1' });
  quotesDir = build(QUOTES_CFG, { SALES_ALLOW_TEST: '1' });
  const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
  server = createServer((req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^\/+/, '');
    if (!p || p.endsWith('/')) p += 'index.html';
    const dir = p.startsWith('quotes/') ? quotesDir : openDir; // /quotes/…: the quotesEnabled=true build
    if (dir === quotesDir) p = p.slice('quotes/'.length);
    try {
      const body = readFileSync(join(dir, p));
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
  assert.match(cmd, /<button type="submit" id="pay-button" class="pay-button" disabled>Payer 79\u00a0€ et recevoir le kit Qualiopi V10<\/button>/);
  assert.match(cmd, /id="payment-loading"[^>]*>Chargement du paiement sécurisé…</);
  assert.match(read(openDir, 'commande.html'), /id="order-status"/);
  assert.match(read(openDir, 'commande.html'), /<meta name="robots" content="noindex">/);
  const conf = read(openDir, 'checkout/checkout-config.js');
  assert.match(conf, /"product":"kit-qualiopi-v10"/);
  assert.match(conf, /"orderPage":"commande\.html"/);
  assert.match(conf, /cgv-pro\.html/);
  assert.match(conf, new RegExp(`"amount":${OPEN_CFG.amount},"currency":"eur","termsVersion":"cgv-pro-2026-10-12"`));
  for (const f of ['pay.js', 'order.js', 'devis.js']) assert.equal(read(openDir, `checkout/${f}`), readFileSync(join(ROOT, 'src/checkout', f), 'utf8'));
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

test('browser: a stale displayed price (catalog or createIntent disagree) never reaches confirmPayment', async () => {
  browser ??= await chromium.launch();
  const fake = FAKE_STRIPE.replace('confirmPayment: function () {', 'confirmPayment: function () { window.__confirmed = (window.__confirmed || 0) + 1;');
  for (const mode of ['catalog', 'intent']) {
    const page = await browser.newPage();
    await page.route('https://js.stripe.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: fake }));
    await page.route('https://octave-test.invalid/**', async (r) => {
      const stale = { amount: 9900, label: '99,00 € net' };
      if (r.request().method() === 'GET') return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, currency: 'eur', termsVersion: 'cgv-pro-2026-10-12', ...(mode === 'catalog' ? stale : { amount: OPEN_CFG.amount, label: 'x' }) }) });
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, client_secret: 'pi_test123456789_secret_x', order_id: 'ok_x', currency: 'eur', ...stale }) });
    });
    await page.goto(base + 'commander.html');
    if (mode === 'intent') {
      await page.waitForSelector('#octave-pay[data-ready="1"]');
      await page.fill('input[name="email"]', 'achat@entreprise.example');
      await page.fill('input[name="company"]', 'Organisme Exemple SAS');
      await page.fill('input[name="siren"]', '732 829 320');
      await page.fill('input[name="addressLine1"]', '1 place Exemple');
      await page.fill('input[name="postalCode"]', '75011');
      await page.fill('input[name="city"]', 'Paris');
      await page.check('input[name="terms"]');
      await page.click('#pay-button');
    }
    await page.waitForSelector('#pay-error:not([hidden])');
    assert.match(await page.textContent('#pay-error'), mode === 'catalog' ? /n’est plus à jour \(prix actuel : 99,00 € net\)/ : /Le prix a changé \(prix actuel : 99,00 € net\) : aucun paiement/, mode);
    assert.equal(await page.isEnabled('#pay-button'), false, mode);
    assert.equal(await page.evaluate(() => window.__confirmed), undefined, mode);
    await page.close();
  }
});

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
  // Static price: the page never waits for (nor rewrites from) the catalog.
  assert.match(await page.textContent('#product-price'), /^79,00\s€ net \(TVA non applicable/);
  assert.equal(await page.textContent('#pay-button'), 'Payer 79\u00a0€ et recevoir le kit Qualiopi V10');
  assert.equal(await page.isEnabled('#pay-button'), true);
  assert.equal(await page.isHidden('#payment-loading'), true);
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
  assert.deepEqual({ ...posts[0], attempt: 'x' }, { action: 'createIntent', product: PRODUCT, email: 'achat@entreprise.example', company: 'Organisme Exemple SAS', siren: '732829320', addressLine1: '1 place Exemple', addressLine2: '', postalCode: '75011', city: 'Paris', termsAccepted: true, termsVersion: 'cgv-pro-2026-10-12', expectedAmount: OPEN_CFG.amount, attempt: 'x' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 0, `horizontal scroll ${overflow}px`);
  assert.deepEqual(errors, []);
  // Order page without Stripe parameters: explicit message, no call.
  await page.goto(base + 'commande.html');
  assert.match(await page.textContent('#order-status'), /Lien de commande incomplet/);
  await page.close();
});

// ---------------------------------------------------------------- Quote / bank-transfer form (quotesEnabled)
const ids = (html) => [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

test('quotesEnabled=false: no quote block, no devis.js script tag, checkout-config says quotesEnabled:false', () => {
  for (const dir of [openDir, ...(repoConfig.SALES_OPEN && repoConfig.quotesEnabled === false ? [join(ROOT, PUBLISHED)] : [])]) {
    const cmd = read(dir, 'commander.html');
    assert.doesNotMatch(cmd, /octave-devis|devis\.js|name="buyerRef"/, dir);
    assert.match(read(dir, 'checkout/checkout-config.js'), /"quotesEnabled":false\}/, dir);
  }
  // Absent key = off (other repos sharing checkout-pages.mjs), and a non-boolean value is refused.
  const { quotesEnabled, ...noKey } = OPEN_CFG;
  const dir = build(noKey, { SALES_ALLOW_TEST: '1' });
  assert.doesNotMatch(read(dir, 'commander.html'), /octave-devis/);
  assert.match(read(dir, 'checkout/checkout-config.js'), /"quotesEnabled":false\}/);
  assert.throws(() => build({ ...OPEN_CFG, quotesEnabled: 'yes' }, { SALES_ALLOW_TEST: '1' }), /quotesEnabled/);
  // SALES_OPEN=false wins: no buy UI at all, quote form included.
  assertClosed(build({ ...repoConfig, SALES_OPEN: false, quotesEnabled: true }));
});

test('quotesEnabled=true (test build): one quote block right after #octave-pay, devis.js after pay.js, unique ids', () => {
  const cmd = read(quotesDir, 'commander.html');
  assert.equal(cmd.match(/id="octave-devis-box"/g)?.length, 1);
  assert.equal(cmd.match(/<form id="octave-devis"/g)?.length, 1);
  assert.match(cmd, /<form id="octave-pay"[\s\S]*?<\/form>\s*<details id="octave-devis-box" class="card devis-box" hidden>/);
  assert.ok(cmd.indexOf('id="octave-devis-box"') > cmd.indexOf('id="octave-pay"'));
  assert.match(cmd, /<script src="checkout\/pay\.js"><\/script>\n<script src="checkout\/devis\.js"><\/script>/);
  assert.equal(cmd.match(/checkout\/devis\.js/g).length, 1);
  const all = ids(cmd);
  assert.deepEqual(all.filter((id, i) => all.indexOf(id) !== i), [], 'duplicate ids');
  const box = cmd.slice(cmd.indexOf('<details id="octave-devis-box"'), cmd.indexOf('</details>', cmd.indexOf('id="octave-devis-box"')));
  for (const name of ['email', 'company', 'siren', 'addressLine1', 'addressLine2', 'postalCode', 'city', 'buyerRef', 'website', 'terms']) assert.match(box, new RegExp(`name="${name}"`), name);
  assert.match(box, /<div class="hp" aria-hidden="true">/);
  assert.match(box, /class="terms-link" href="cgv-pro\.html"/); // same CGV link as the card form
  assert.match(box, /\(version du 12 octobre 2026\)/);
  assert.doesNotMatch(box, /\{\{|CGV_DATE/);
  assert.match(read(quotesDir, 'checkout/checkout-config.js'), /"quotesEnabled":true\}/);
  assert.equal(read(quotesDir, 'checkout/devis.js'), readFileSync(join(ROOT, 'src/checkout/devis.js'), 'utf8'));
  assert.match(read(quotesDir, 'styles.css'), /\.hp\{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden\}/);
});

// The vendored scripts must stay byte-identical to VREAD-corp/octave-checkout gas/web/ (its go-live check runs cmp).
const OCTAVE_WEB = [process.env.OCTAVE_CHECKOUT_DIR, join(ROOT, '..', 'octave-checkout'), join(ROOT, '..', '..', 'octave-checkout')]
  .filter(Boolean)
  .map((d) => join(d, 'gas', 'web'))
  .find((d) => existsSync(join(d, 'devis.js')));
test('vendored checkout scripts are identical to octave-checkout gas/web/', { skip: OCTAVE_WEB ? false : 'octave-checkout checkout not found (set OCTAVE_CHECKOUT_DIR)' }, () => {
  for (const f of ['pay.js', 'order.js', 'devis.js']) assert.ok(readFileSync(join(ROOT, 'src/checkout', f)).equals(readFileSync(join(OCTAVE_WEB, f))), `src/checkout/${f} differs from ${OCTAVE_WEB}/${f}`);
});

test('browser: quote box hidden when quotesEnabled=false, shown when true, posts the quote request', async () => {
  browser ??= await chromium.launch();
  const route = async (page, posts) => {
    await page.route('https://js.stripe.com/**', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_STRIPE }));
    await page.route('https://octave-test.invalid/**', async (r) => {
      const req = r.request();
      if (req.method() === 'GET') return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, amount: OPEN_CFG.amount, currency: 'eur', label: 'x', termsVersion: 'cgv-pro-2026-10-12' }) });
      posts.push(JSON.parse(req.postData()));
      return r.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, quote: 'D-2026-0001', email_masked: 'a***@entreprise.example' }) });
    });
  };
  // Off: the markup is not even there.
  let page = await browser.newPage();
  await route(page, []);
  await page.goto(base + 'commander.html');
  assert.equal(await page.$('#octave-devis-box'), null);
  await page.close();
  // On.
  page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const posts = [];
  await route(page, posts);
  await page.goto(base + 'quotes/commander.html');
  await page.waitForSelector('#octave-devis-box', { state: 'visible' });
  await page.click('#octave-devis-box summary');
  const f = (n, v) => page.fill(`#octave-devis input[name="${n}"]`, v);
  await f('email', 'achat@entreprise.example');
  await f('company', 'Organisme Exemple SAS');
  await f('siren', '732 829 320');
  await f('addressLine1', '1 place Exemple');
  await f('postalCode', '75011');
  await f('city', 'Paris');
  await f('buyerRef', 'BC-42');
  await page.check('#octave-devis input[name="terms"]');
  await page.click('#devis-button');
  await page.waitForSelector('#devis-ok:not([hidden])');
  assert.match(await page.textContent('#devis-ok'), /Devis D-2026-0001 envoyé à a\*\*\*@entreprise\.example/);
  const quotes = posts.filter((p) => p.action === 'quote');
  assert.equal(quotes.length, 1);
  assert.deepEqual({ ...quotes[0], attempt: 'x' }, { action: 'quote', product: PRODUCT, email: 'achat@entreprise.example', company: 'Organisme Exemple SAS', siren: '732829320', addressLine1: '1 place Exemple', addressLine2: '', postalCode: '75011', city: 'Paris', buyerRef: 'BC-42', website: '', termsAccepted: true, termsVersion: 'cgv-pro-2026-10-12', expectedAmount: OPEN_CFG.amount, attempt: 'x' });
  assert.equal(await page.getAttribute('#octave-devis .terms-link', 'href'), 'https://outils.vread.fr/kit-qualiopi-v10/cgv-pro.html');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 0, `horizontal scroll ${overflow}px`);
  assert.deepEqual(errors, []);
  await page.close();
});
