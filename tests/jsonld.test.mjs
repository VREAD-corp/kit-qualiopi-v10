// Données structurées (schema.org JSON-LD) de la page d'accueil.
//  - docs/index.html (build publié) : chaque bloc JSON-LD se parse ; Organization READ FRANCE (SIREN) ;
//    Product + Offer 79.00 EUR InStock vers commander.html quand la vente est ouverte ; FAQPage.
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

test('index.html : JSON-LD valide, Organization (SIREN), FAQPage', () => {
  const items = jsonld(readFileSync(join(ROOT, 'docs', 'index.html'), 'utf8'));
  const [org] = byType(items, 'Organization');
  assert.ok(org, 'Organization présente');
  assert.equal(org['@id'], ORG_ID);
  assert.equal(org.name, 'READ FRANCE SAS');
  assert.equal(org.legalName, 'READ FRANCE');
  assert.equal(org.url, 'https://outils.vread.fr/');
  assert.deepEqual(org.identifier, { '@type': 'PropertyValue', propertyID: 'SIREN', value: '988741773' });
  assert.equal(org.address['@type'], 'PostalAddress');
  assert.equal(org.address.streetAddress, '11 rue Rouvet');
  assert.equal(org.address.postalCode, '75019');
  assert.equal(org.address.addressLocality, 'Paris');
  assert.equal(org.address.addressCountry, 'FR');
  const [faq] = byType(items, 'FAQPage');
  assert.ok(faq && faq.mainEntity.length > 0, 'FAQPage présente');
});

test('index.html : Product + Offer 79.00 EUR, InStock, vendeur = Organization', { skip: !config.SALES_OPEN && 'vente fermée' }, () => {
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
  assert.equal(o.price, '79.00');
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
  assert.equal(byType(items, 'Organization').length, 1);
});
