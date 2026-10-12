// Génère src/og.png (1200×630) par capture Chromium d'une carte HTML. node scripts/og.mjs
import { chromium } from 'playwright';
import { join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const ROOT = resolve(import.meta.dirname, '..');
const DATA = JSON.parse(readFileSync(join(ROOT, 'src/data/changements.json'), 'utf8'));
const NB_MODELES = DATA.templates.length + (DATA.pack ?? []).length;
const NB_TABLEURS = (DATA.sheets ?? []).length;
const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
body{margin:0;width:1200px;height:630px;font-family:system-ui,"Segoe UI",Roboto,Arial,sans-serif;background:#13203a;color:#fff;display:flex}
.c{padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between;width:100%;background:linear-gradient(135deg,#13203a 0%,#1d4ed8 140%)}
.k{font-size:30px;font-weight:700;color:#bcd0ff;letter-spacing:.02em}
h1{font-size:76px;line-height:1.05;margin:18px 0 0;font-weight:850}
p{font-size:34px;margin:0;color:#e6ecff}
.b{display:flex;gap:16px;flex-wrap:wrap}
.b span{background:#fff;color:#13203a;border-radius:999px;padding:10px 22px;font-size:28px;font-weight:700}
.f{font-size:24px;color:#bcd0ff}
</style></head><body><div class="c">
<div><div class="k">Référentiel national qualité · 1er novembre 2026</div><h1>Kit Qualiopi V10</h1></div>
<p>Ce qui change, les preuves à préparer pour les 33 indicateurs, ${NB_MODELES}&nbsp;modèles Word et LibreOffice, ${NB_TABLEURS}&nbsp;tableurs.</p>
<div class="b"><span>Tableau V9 → V10</span><span>Check-list d'audit</span><span>Échantillon gratuit</span></div>
<div class="f">Un produit de READ FRANCE SAS · produit indépendant, sans lien avec l'État ou un certificateur</div>
</div></body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.screenshot({ path: join(ROOT, 'src/og.png') });
await browser.close();
console.log('src/og.png');
