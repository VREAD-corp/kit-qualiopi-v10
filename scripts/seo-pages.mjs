// Pages guides du site (SEO, plan interne seo/qualiopi.md, §4) :
//   P1 indicateurs/indicateur-33.html · P3 preparer-audit-qualiopi-2026.html (+ auto-diagnostic)
//   P4 modeles-qualiopi-gratuits.html · P5 qualiopi-1er-novembre-2026.html · P2 indicateurs/indicateur-N.html
// Faits réglementaires : src/data/referentiel-2026.json (texte officiel relevé sur Légifrance) et
// src/data/statut-textes.json (guide de lecture, arrêtés). Chaque affirmation renvoie à sa source.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { INDICATOR_PAGES_CONTENT } from './seo-indicateurs-data.mjs';

const ROOT = join(import.meta.dirname, '..');
export const REF = JSON.parse(readFileSync(join(ROOT, 'src/data/referentiel-2026.json'), 'utf8'));
export const STATUT = JSON.parse(readFileSync(join(ROOT, 'src/data/statut-textes.json'), 'utf8'));

// ------------------------------------------------------------------ Sources officielles
export const SRC = {
  decret: { label: 'Décret n° 2026-728 du 1er août 2026 relatif au référentiel national sur la qualité des actions concourant au développement des compétences (JORF n° 0180 du 4 août 2026)', url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054608509' },
  decretPdf: { label: 'Le même décret en PDF, sur le site du ministère du Travail', url: 'https://travail-emploi.gouv.fr/sites/travail-emploi/files/2026-09/D%C3%A9cret%20no%202026-728%20du%201er%20ao%C3%BBt%202026.pdf' },
  annexe2019: { label: 'Code du travail, annexe du référentiel national qualité, version en vigueur du 1er janvier 2021 au 1er novembre 2026', url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000038591641' },
  arrete: { label: 'Arrêté du 6 juin 2019 relatif aux modalités d\'audit associées au référentiel national (version en vigueur, dernière modification par l\'arrêté du 1er juillet 2025)', url: 'https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038565293' },
  guidePage: { label: 'Ministère du Travail, page « Référentiel national qualité | Guide de lecture Qualiopi » (mise à jour du 16 septembre 2026)', url: 'https://travail-emploi.gouv.fr/referentiel-national-qualite-guide-de-lecture-qualiopi' },
  guideV9: { label: 'Guide de lecture du référentiel national qualité, V9 du 8 janvier 2024 (PDF)', url: 'https://travail-emploi.gouv.fr/sites/travail-emploi/files/files-spip/pdf/guide_de_lecture_qualiopi_v9_du_8_janvier_2024.pdf' },
  qr: { label: 'Ministère du Travail, questions-réponses sur la certification qualité, version 2 (PDF)', url: 'https://travail-emploi.gouv.fr/sites/travail-emploi/files/files-spip/pdf/questions-reponses_version_2.pdf' },
  marque: { label: 'Ministère du Travail, « Qualiopi, marque de certification qualité des prestataires de formation »', url: 'https://travail-emploi.gouv.fr/qualiopi-marque-de-certification-qualite-des-prestataires-de-formation' },
  fc: { label: 'France compétences, délibération n° 2026-07-26 du 15 juillet 2026 (avis favorable sur le projet de décret)', url: 'https://www.francecompetences.fr/app/uploads/2026/08/Deliberation_26_Avis_decret_Qualiopi.pdf' },
  liste: { label: 'Liste publique des organismes de formation (data.gouv.fr)', url: 'https://www.data.gouv.fr/datasets/liste-publique-des-organismes-de-formation-l-6351-7-1-du-code-du-travail' },
  inserjeunes: { label: 'InserJeunes, diffusion des indicateurs des CFA', url: 'https://www.inserjeunes.education.gouv.fr/diffusion/accueil' },
};
export const DECRET_LD = { '@type': 'Legislation', name: 'Décret n° 2026-728 du 1er août 2026 relatif au référentiel national sur la qualité des actions concourant au développement des compétences', legislationIdentifier: '2026-728', legislationDate: '2026-08-01', url: SRC.decret.url };

// ------------------------------------------------------------------ Outils
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const frDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d === 1 ? '1er' : d} ${MONTHS[m - 1]} ${y}`; };
export const PUBLISHED = '2026-10-13';
export const CHECKED = STATUT.checked;
// Typographie française : espace insécable avant « : ; ? ! » et à l'intérieur des guillemets (texte visible uniquement).
export function frTypo(html) {
  return html.split(/(<[^>]+>)/).map((part) => (part.startsWith('<') ? part : part
    .replace(/ ([:;?!»])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/(\d) (€|%)/g, '$1 $2')
    .replace(/(\d) (\d{3})(?!\d)/g, '$1 $2'))).join('');
}
// Pages en sous-dossier : les liens relatifs du gabarit (styles.css, ./, commander.html…) remontent d'un niveau.
export function rebase(html, prefix) {
  if (!prefix) return html;
  return html.replace(/(\s(?:href|src)=")([^"]*)"/g, (m, attr, url) => {
    if (/^(?:[a-z]+:|#|\/|\.\.\/|data:)/i.test(url)) return m;
    return `${attr}${prefix}${url.startsWith('./') ? url.slice(2) : url}"`;
  });
}

const CAT_LABEL = { 1: 'actions de formation', 2: 'bilans de compétences', 3: 'VAE', 4: 'apprentissage' };
export const refOf = (n) => REF.indicators.find((i) => i.n === n);
export const INDICATOR_PAGES = new Set(Object.keys(INDICATOR_PAGES_CONTENT).map(Number).concat([33]));
export const indicatorHref = (n) => (INDICATOR_PAGES.has(n) ? `indicateurs/indicateur-${n}.html` : `changements-v9-v10.html#indicateur-${n}`);
export const GUIDE_PUBLISHED = STATUT.guide.published === true;
// Phrase courte réutilisée partout (accueil compris) : état du guide de lecture du référentiel 2026.
export const GUIDE_STATUS = GUIDE_PUBLISHED
  ? `publié le ${frDate(STATUT.guide.date)} (${STATUT.guide.label})`
  : `non publié à ce jour (vérifié le ${frDate(CHECKED)})`;
// Même information, en verbe : « Le guide … ${GUIDE_IS}. »
export const GUIDE_IS = GUIDE_PUBLISHED
  ? `a été publié le ${frDate(STATUT.guide.date)} (${STATUT.guide.label})`
  : `n'est pas publié (vérifié le ${frDate(CHECKED)})`;
const arretesPending = STATUT.arretes.filter((a) => !a.published);

// Les pages du guide (liens croisés entre elles, depuis la page « Ce qui change » et l'accueil).
export const GUIDE_LINKS = [
  { href: 'indicateurs/indicateur-33.html', title: 'Indicateur 33', text: 'Le nouvel indicateur : texte, CFA concernés, grille d\'exemple' },
  { href: 'preparer-audit-qualiopi-2026.html', title: 'Préparer son audit après le 1er novembre', text: 'Calendrier J-60, règles d\'audit et auto-diagnostic des 33 indicateurs' },
  { href: 'qualiopi-1er-novembre-2026.html', title: 'Qualiopi au 1er novembre 2026', text: 'Quel référentiel pour votre audit, certificats en cours, guide de lecture' },
  { href: 'modeles-qualiopi-gratuits.html', title: 'Modèles Qualiopi gratuits', text: '3 modèles Word et le tableau des changements en PDF, sans inscription' },
];
export const guideLinksHtml = (exclude = '') => `<ul class="related">${GUIDE_LINKS.filter((l) => l.href !== exclude).map((l) => `<li><a href="${l.href}">${l.title}<span>${l.text}</span></a></li>`).join('')}</ul>`;

// ------------------------------------------------------------------ Contenu du kit (v1.1.0)
// Modèles qualité T01–T19 (DATA.templates), documents administratifs T20–T39 (DATA.pack), tableurs X01–X06
// (DATA.sheets), synthèses D01–D05 (DATA.docs sans le lisez-moi D00). Mêmes comptes que l'accueil (build.mjs).
export function kitInventory(DATA) {
  const models = [...DATA.templates, ...(DATA.pack ?? [])];
  const sheets = DATA.sheets ?? [];
  const syntheses = DATA.docs.filter((d) => d.id !== 'D00');
  const docHref = (id) => `./#doc-${id.toLowerCase()}`;
  return {
    models, sheets, syntheses, docHref,
    nbModels: models.length, nbSheets: sheets.length, nbSyntheses: syntheses.length,
    byId: (id) => [...models, ...sheets, ...syntheses].find((d) => d.id === id),
    forIndicator: (n) => [...models, ...sheets].filter((t) => t.indicators.includes(n)),
  };
}
// « T26 certificat de réalisation » lié à sa ligne dans le contenu du kit (accueil).
export const docLink = (inv, id, esc, { lower = true } = {}) => {
  const d = inv.byId(id);
  const title = lower ? d.title.charAt(0).toLowerCase() + d.title.slice(1) : d.title;
  return `<a href="${inv.docHref(id)}">${d.id} ${esc(title)}</a>`;
};

// ------------------------------------------------------------------ Gabarit commun
export function makeKit(ctx) {
  const { OPEN, PRICE_TAG, PRICE_NOTE, SITE, ORG_REF, MAILTO, CONTACT, esc } = ctx;
  const kitCta = ({ title, text }) => `
<aside class="kit-cta" data-section="kit-cta" aria-labelledby="kit-cta-h">
  <h2 id="kit-cta-h">${title}</h2>
  <p>${text}</p>
  ${OPEN ? `<a class="btn btn-primary" href="commander.html">Commander le kit complet, ${PRICE_TAG} net</a>` : `<a class="btn btn-primary" href="./#offre">Voir le kit complet (${PRICE_TAG})</a>`}
  <p class="small muted">${PRICE_NOTE}. Réservé aux professionnels (SIREN), fichiers et facture par e-mail. Pour juger avant d'acheter : <a href="modeles-qualiopi-gratuits.html">3 modèles gratuits</a>, sans inscription.</p>
</aside>`;
  const sources = (list) => `<h2 id="sources">Sources officielles</h2>
  <ul class="sources">${list.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>
  <p class="small muted">Textes consultés le ${frDate(CHECKED)}.</p>`;
  const about = () => `<div class="about-page small muted">
  <p>Page rédigée par Jalonel (READ FRANCE SAS) avec l'aide d'Octave, notre assistant IA, à partir des textes officiels cités ci-dessus, relus sur Légifrance et sur le site du ministère du Travail le ${frDate(CHECKED)}. Les reformulations n'engagent que nous : le texte publié au Journal officiel fait foi. Information, pas un conseil juridique. Directeur de la publication : Tanguy Warsmann. Une erreur, ou un texte paru depuis ? Écrivez à <a href="${MAILTO}">${CONTACT}</a>.</p>
</div>`;
  const byline = (modified = PUBLISHED) => `<p class="byline">Par Jalonel · publié le ${frDate(PUBLISHED)}${modified !== PUBLISHED ? ` · mis à jour le ${frDate(modified)}` : ''} · textes officiels vérifiés le ${frDate(CHECKED)}</p>`;
  const crumbs = (items) => `<p class="eyebrow">${items.map(([label, href]) => (href ? `<a href="${href}">${label}</a>` : label)).join(' › ')}</p>`;
  const breadcrumbLd = (items) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: SITE + path })) });
  const articleLd = ({ path, headline, description, modified = PUBLISHED, about = [DECRET_LD], citation = [], type = 'Article' }) => ({
    '@context': 'https://schema.org', '@type': type, headline, description, inLanguage: 'fr',
    datePublished: PUBLISHED, dateModified: modified, mainEntityOfPage: SITE + path, url: SITE + path, image: `${SITE}og.png`,
    author: ORG_REF, publisher: ORG_REF,
    about, ...(citation.length ? { citation: citation.map((s) => ({ '@type': 'CreativeWork', name: s.label, url: s.url })) } : {}),
  });
  const faqLd = (qas) => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: qas.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });
  const faqHtml = (qas) => `<div class="faq" data-section="faq">${qas.map(([q, a], i) => `<details id="faq-${i + 1}"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
  return { kitCta, sources, about, byline, crumbs, breadcrumbLd, articleLd, faqLd, faqHtml };
}

// Nombre d'indicateurs cochés dans l'annexe pour chaque catégorie d'actions (avant les conditions « lorsque… »).
export const countByCat = (c) => REF.indicators.filter((i) => i.cats.includes(c)).length;
export const catsLabel = (i) => (i.cats.length === 4 ? 'toutes les catégories d\'actions' : i.cats.map((c) => CAT_LABEL[c]).join(', '));

// ------------------------------------------------------------------ Pages
import { page33 } from './seo-page-33.mjs';
import { pageAudit } from './seo-page-audit.mjs';
import { pageModeles } from './seo-page-modeles.mjs';
import { pageNovembre } from './seo-page-novembre.mjs';
import { pagesIndicateurs } from './seo-indicateurs.mjs';

export function seoPages(ctx) {
  const kit = makeKit(ctx);
  const all = [page33(ctx, kit), pageAudit(ctx, kit), pageModeles(ctx, kit), pageNovembre(ctx, kit), ...pagesIndicateurs(ctx, kit)];
  return all.map((p) => ({ ...p, body: frTypo(p.body), head: '<link rel="stylesheet" href="guides.css">\n', tail: '<script src="guides.js" defer></script>\n', lastmod: p.lastmod ?? PUBLISHED, prefix: p.path.includes('/') ? '../' : '' }));
}
