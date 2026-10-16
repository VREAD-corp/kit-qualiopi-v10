// cro.js (aggregate behaviour counters + A/B framework, vendored byte-identical from octave-checkout/gas/web/cro.js):
// portable behaviour check (tests/cro.check.mjs, vendored too), published copy, and the tag on every generated page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DOCS = join(ROOT, 'docs');
const API = 'https://script.google.com/macros/s/AKfycbzD1IRL8QALluKGZxgGiORFP6-DkC_qFJYR9aOxZiimxa06nbCqpzUI-9iLblp6V2VY/exec';

test('cro.check.mjs passes on src/cro.js and docs/cro.js is the same file', () => {
  execFileSync(process.execPath, [join(ROOT, 'tests', 'cro.check.mjs'), join(ROOT, 'src', 'cro.js')], { stdio: 'pipe' });
  assert.ok(readFileSync(join(ROOT, 'src', 'cro.js')).equals(readFileSync(join(DOCS, 'cro.js'))));
  assert.ok(readFileSync(join(ROOT, 'src', 'cro-goals.js')).equals(readFileSync(join(DOCS, 'cro-goals.js'))));
});

test('every published page loads cro.js (site, backend, hosts, CTA) after mesure.js, then cro-goals.js', () => {
  const pages = readdirSync(DOCS, { recursive: true }).map(String).filter((f) => f.endsWith('.html'));
  assert.ok(pages.length > 15);
  for (const f of pages) {
    const html = readFileSync(join(DOCS, f), 'utf8');
    const pre = f.includes('/') ? '../' : '';
    const tag = `<script src="${pre}cro.js" data-site="kit-qualiopi-v10" data-api="${API}" data-hosts="qualiopi.jalonel.com outils.vread.fr" data-cta="a[href*='commander'],#pay-button" defer></script>`;
    const i = html.indexOf(tag);
    assert.ok(i > 0, `${f}: cro.js tag`);
    assert.ok(html.indexOf(`<script src="${pre}mesure.js" defer>`) < i, `${f}: after mesure.js`);
    assert.ok(html.indexOf(`<script src="${pre}cro-goals.js" defer></script>`) > i, `${f}: cro-goals.js after cro.js`);
    assert.doesNotMatch(html, /OCTAVE_XP/, `${f}: no A/B experiment on this site`);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${f}: unique ids`);
  }
  const index = readFileSync(join(DOCS, 'index.html'), 'utf8');
  for (const id of ['hero', 'changements', 'contenu-kit', 'pour-qui', 'offre', 'faq', 'qui', 'sources']) assert.match(index, new RegExp(`<section[^>]* id="${id}"`), `section #${id}`);
  assert.match(index, /<details id="faq-1">/);
});
