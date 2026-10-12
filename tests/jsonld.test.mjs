// Données structurées (schema.org JSON-LD) de la page d'accueil.
//  - docs/index.html (build publié) : chaque bloc JSON-LD se parse ; WebPage publiée par l'Organization du hub (@id) ;
//    Product + Offer 129.00 EUR InStock vers commander.html quand la vente est ouverte ; FAQPage.
//  - Build de test avec SALES_OPEN=false : ni Product ni Offer (pas de prix « disponible » affiché).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SITE = 'https://outils.vread.fr/kit-qualiopi-v10/';
const ORG_ID = 'https://outils.vread.fr/#org';
const config = JSON.parse(readFileSync(join(ROOT, 'sales.config.json'), 'utf8'));

function jsonld(html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(blocks.length > 0, 'au moins un bloc JSON-LD');
  return blocks.map((b) => {
    const o = JSON.parse(b); // lève une erreur si le JSON est invalide
    assert.equal(o['@context'], 'https://schema.org');
    return o;
  });
}
const byType = (items, type) => items.filter((o) => o['@type'] === type);

// L'Organization complète n'est définie que sur le site vitrine ; ici, seulement des références par @id.
const ORG_REF = { '@type': 'Organization', '@id': ORG_ID, name: 'READ FRANCE SAS' };
const noDuplicateOrg = (items) => {
  const text = JSON.stringify(items);
  for (const key of ['legalName', 'PostalAddress', 'identifier']) assert.ok(!text.includes(`"${key}"`), `pas de nœud Organization dupliqué (${key})`);
  assert.equal(byType(items, 'Organization').length, 0, 'pas de nœud Organization autonome');
};

test('index.html : JSON-LD valide, WebPage publiée par l\'Organization du hub (@id), FAQPage', () => {
  const items = jsonld(readFileSync(join(ROOT, 'docs', 'index.html'), 'utf8'));
  const [page] = byType(items, 'WebPage');
  assert.ok(page, 'WebPage présente');
  assert.equal(page.url, SITE);
  assert.deepEqual(page.publisher, ORG_REF);
  noDuplicateOrg(items);
  const [faq] = byType(items, 'FAQPage');
  assert.ok(faq && faq.mainEntity.length > 0, 'FAQPage présente');
});

test('changements-v9-v10.html : Article, auteur et éditeur = référence @id', () => {
  const items = jsonld(readFileSync(join(ROOT, 'docs', 'changements-v9-v10.html'), 'utf8'));
  const [article] = byType(items, 'Article');
  assert.deepEqual(article.author, ORG_REF);
  assert.deepEqual(article.publisher, ORG_REF);
  noDuplicateOrg(items);
});

test('index.html : Product + Offer 129.00 EUR, InStock, vendeur = Organization', { skip: !config.SALES_OPEN && 'vente fermée' }, () => {
  const items = jsonld(readFileSync(join(ROOT, 'docs', 'index.html'), 'utf8'));
  const [product] = byType(items, 'Product');
  assert.ok(product, 'Product présent');
  assert.equal(product.name, 'Kit Qualiopi V10');
  assert.equal(product.sku, 'kit-qualiopi-v10');
  assert.equal(product.url, SITE);
  assert.equal(product.image, `${SITE}og.png`);
  assert.deepEqual(product.brand, { '@type': 'Brand', name: 'Kit Qualiopi V10' });
  assert.ok(product.description.length > 50);
  const o = product.offers;
  assert.equal(o['@type'], 'Offer');
  assert.equal(o.price, '129.00');
  assert.equal(o.price, (config.amount / 100).toFixed(2), 'prix dérivé de sales.config.json');
  assert.equal(o.priceCurrency, 'EUR');
  assert.equal(o.availability, 'https://schema.org/InStock');
  assert.equal(o.itemCondition, 'https://schema.org/NewCondition');
  assert.equal(o.url, `${SITE}commander.html`);
  assert.deepEqual(o.seller, { '@id': ORG_ID });
  assert.ok(!('valueAddedTaxIncluded' in o), 'pas de valueAddedTaxIncluded (franchise en base)');
});

test('SALES_OPEN=false : ni Product ni Offer dans le JSON-LD', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'jsonld-'));
  const cfg = join(tmp, 'cfg.json');
  writeFileSync(cfg, JSON.stringify({ ...config, SALES_OPEN: false }));
  const out = join(tmp, 'out');
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, env: { ...process.env, SALES_CONFIG: cfg, OUT_DIR: out }, stdio: 'pipe' });
  const html = readFileSync(join(out, 'index.html'), 'utf8');
  const items = jsonld(html);
  assert.equal(byType(items, 'Product').length, 0);
  assert.ok(!JSON.stringify(items).includes('"Offer"'));
  assert.equal(byType(items, 'WebPage').length, 1);
  assert.equal(byType(items, 'Organization').length, 0);
});
