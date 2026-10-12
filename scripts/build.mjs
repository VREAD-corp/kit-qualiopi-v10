// Génère le site statique dans docs/ (servi par GitHub Pages depuis la branche main, dossier /docs).
// Aucune dépendance : node scripts/build.mjs
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkoutCsp, orderCsp, cgvProBody, checkoutConfigJs, loadSalesConfig, orderFormHtml, orderPageBody, prices } from './checkout-pages.mjs';

const ROOT = resolve(import.meta.dirname, '..');
// OUT_DIR: test builds only (the published site is docs/).
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : join(ROOT, 'docs');
// Sales gate: with SALES_OPEN=false (sales.config.json) the build emits no buy UI at all.
const SALES = loadSalesConfig(ROOT);
const OPEN = SALES.SALES_OPEN === true;
const PRICE = prices(SALES);
const DATA = JSON.parse(readFileSync(join(ROOT, 'src/data/changements.json'), 'utf8'));
const SITE = 'https://vread-corp.github.io/kit-qualiopi-v10/';
const REPO = 'https://github.com/VREAD-corp/kit-qualiopi-v10';
const SAMPLE_TAG = `echantillon-v${DATA.version}`;
const SAMPLE_FILE = `kit-qualiopi-v10-echantillon-${DATA.version}.zip`;
const SAMPLE_URL = `${REPO}/releases/download/${SAMPLE_TAG}/${SAMPLE_FILE}`;
const LASTMOD = '2026-10-12';
const PUBLISHED = '2026-10-11';
const BRAND = 'Kit Qualiopi V10';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const changed = DATA.indicators.filter((i) => i.change === 'modifie' || i.change === 'nouveau');
const modifiedNums = DATA.indicators.filter((i) => i.change === 'modifie').map((i) => i.n);

function layout({ path, title, description, body, jsonld = [], noindex = false, head = '', tail = '' }) {
  const url = SITE + path;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1d4ed8">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="styles.css">
${head}${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="./">${BRAND}<span>référentiel 2026 · 33 indicateurs</span></a>
    <nav aria-label="Navigation principale">
      <a href="./#contenu-kit">Le kit</a>
      <a href="changements-v9-v10.html">Ce qui change</a>
      <a href="./#faq">FAQ</a>
    </nav>
  </div>
</header>
<main id="contenu">
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <p class="foot-brand"><strong>${BRAND}</strong> — un produit de READ FRANCE SAS</p>
    <p class="small">Produit indépendant : ni édité, ni validé par l'État, France compétences ou un organisme certificateur. Qualiopi est une marque de l'État. Information, pas un conseil juridique ; aucune garantie de certification.</p>
    <nav aria-label="Liens légaux" class="foot-nav">
      <a href="mentions-legales.html">Mentions légales</a>
      <a href="confidentialite.html">Confidentialité</a>
      <a href="cgv-pro.html">CGV professionnels</a>
      <a href="${REPO}/issues">Contact</a>
    </nav>
  </div>
</footer>
${tail}</body>
</html>
`;
}

const downloadBtn = (label = 'Télécharger l\'échantillon gratuit') =>
  `<a class="btn btn-primary" href="${SAMPLE_URL}" download>${label}<span class="btn-sub">ZIP · DOCX, ODT, PDF · sans inscription</span></a>`;

const sourcesList = () => `<ul class="sources">${DATA.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>`;

// ---------------------------------------------------------------- Accueil
const faq = [
  ['Qu\'est-ce que « Qualiopi V10 » ?', 'C\'est le nom couramment donné au référentiel national qualité modifié par le décret n° 2026-728 du 1er août 2026, publié au Journal officiel du 4 août 2026. Le texte officiel ne parle pas de « V10 » : l\'expression fait suite à la version 9 du guide de lecture (8 janvier 2024).'],
  ['Quand le nouveau référentiel s\'applique-t-il ?', 'Le décret entre en vigueur le 1er novembre 2026. Jusqu\'au 31 octobre 2026, le référentiel de 2019 (32 indicateurs) reste applicable. Vérifiez avec votre organisme certificateur quel référentiel et quel guide de lecture seront utilisés pour votre prochain audit.'],
  ['Combien d\'indicateurs et qu\'est-ce qui change ?', `Les 7 critères sont inchangés. Le référentiel passe de 32 à 33 indicateurs : l\'indicateur 33 est créé et, selon notre lecture du texte, ${modifiedNums.length} indicateurs sont modifiés sur le fond (${modifiedNums.join(', ')}).`],
  ['L\'indicateur 33 me concerne-t-il ?', 'L\'indicateur 33 (évaluation des contenus et des enseignements par les apprenants) est rattaché aux CFA par les analyses publiées. Vérifiez la colonne d\'application dans l\'annexe officielle sur Légifrance ; le kit fournit un modèle dédié.'],
  ['Le guide de lecture officiel est-il publié ?', 'Pas à la date du 11 octobre 2026, pas plus que les arrêtés qui fixeront les seuils des indicateurs 19 et 20. Le kit le signale dans chaque document et sera mis à jour après leur parution.'],
  ['Mon certificat en cours reste-t-il valable ?', 'Le décret ne prévoit pas de disposition transitoire spécifique. Les modalités pour les audits de surveillance et de renouvellement réalisés après le 1er novembre 2026 sont à confirmer avec votre organisme certificateur.'],
  ['Le kit garantit-il la certification ?', 'Non. Seul un organisme certificateur décide, après audit. Le kit vous aide à organiser vos preuves ; il ne remplace ni le texte officiel, ni le guide de lecture, ni un conseil juridique ou un accompagnement.'],
  ['Dans quels formats sont les modèles ?', 'DOCX (Word) et ODT (LibreOffice), modifiables. Les synthèses sont aussi fournies en PDF.'],
  OPEN
    ? ['Comment acheter le kit complet ?', `Le kit complet est vendu aux professionnels (SIREN obligatoire) au prix de ${PRICE.sentence}. Commandez sur la page Commander : paiement par carte bancaire avec Stripe, fichier ZIP et facture acquittée envoyés par e-mail dès le paiement confirmé.`]
    : ['Puis-je acheter le kit complet maintenant ?', 'Pas encore : l\'ouverture des ventes est en préparation. L\'échantillon gratuit est disponible dès maintenant. Pour être prévenu, suivez les publications du dépôt GitHub (bouton Watch, puis Custom, puis Releases).'],
];

const indexBody = `
<section class="hero">
  <div class="wrap">
    <p class="eyebrow">Entrée en vigueur le <strong>1er novembre 2026</strong> · <span id="jours">décret n° 2026-728</span></p>
    <h1>Kit Qualiopi V10 : préparez le nouveau référentiel qualité 2026 à 33 indicateurs</h1>
    <p class="lead">Le décret n° 2026-728 modifie ${modifiedNums.length} indicateurs et en crée un 33e. Ce kit vous dit, indicateur par indicateur, quelles preuves préparer, et vous donne ${DATA.templates.length} modèles éditables (Word et LibreOffice) pour les produire.</p>
    <div class="cta">
      ${downloadBtn()}
      ${OPEN ? `<a class="btn btn-ghost" href="commander.html">Commander le kit complet<span class="btn-sub">${PRICE.short} · TVA non applicable, art. 293 B du CGI</span></a>` : ''}
      <a class="btn btn-ghost" href="changements-v9-v10.html">Voir ce qui change (V9 → V10)</a>
    </div>
    <p class="note">L'échantillon contient le tableau complet des changements et 3 modèles : procédure violences et ruptures (ind. 12), clause qualité de sous-traitance (ind. 27), amélioration continue et analyse des risques (ind. 32).</p>
  </div>
</section>

<section class="wrap section" aria-labelledby="changes-h">
  <h2 id="changes-h">Ce qui change au 1er novembre 2026</h2>
  <p>Les 7 critères restent les mêmes. Voici les indicateurs dont le contenu évolue, résumés avec nos mots (le texte officiel fait foi).</p>
  <ul class="cards">
    ${changed.map((i) => `<li class="card"><p class="card-n"><span class="badge ${i.change}">${esc(i.changeLabel)}</span> Indicateur ${i.n}</p><h3>${esc(i.titre)}</h3><p class="small muted">${esc(i.scope)}</p></li>`).join('\n    ')}
  </ul>
  <p><a href="changements-v9-v10.html">Tableau détaillé : avant, après et ce qu'il faut faire →</a></p>
</section>

<section class="band" id="contenu-kit" aria-labelledby="kit-h">
  <div class="wrap section">
    <h2 id="kit-h">Ce que contient le kit complet</h2>
    <div class="grid2">
      <div>
        <h3>4 synthèses (DOCX, ODT, PDF)</h3>
        <ul class="checks">
          ${DATA.docs.filter((d) => d.id !== 'D00').map((d) => `<li>${esc(d.title)}${d.sample ? ' <span class="tag">dans l\'échantillon</span>' : ''}</li>`).join('\n          ')}
        </ul>
        <p class="small muted">La check-list des 33 indicateurs donne pour chacun : à qui il s'applique, ce qui change, des exemples de preuves, les pièges fréquents, le modèle à utiliser et une grille « mon état / emplacement / responsable / échéance ».</p>
      </div>
      <div>
        <h3>${DATA.templates.length} modèles éditables (Word et LibreOffice)</h3>
        <ul class="tpl">
          ${DATA.templates.map((t) => `<li><span class="tid">${t.id}</span> ${esc(t.title)} <span class="small muted">— ind. ${t.indicators.join(', ')}</span>${t.sample ? ' <span class="tag">gratuit</span>' : ''}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="wrap section" aria-labelledby="who-h">
  <h2 id="who-h">Pour qui ?</h2>
  <ul class="cards cards-3">
    <li class="card"><h3>Organismes de formation</h3><p>Déjà certifiés et audités après le 1er novembre 2026, ou en préparation d'un audit initial. Particulièrement utile aux structures de 1 à 10 personnes sans responsable qualité.</p></li>
    <li class="card"><h3>CFA</h3><p>Les indicateurs 14, 15 et 20 sont renforcés et l'indicateur 33 est créé : modèles dédiés (livret apprenti, gouvernance, évaluation des enseignements).</p></li>
    <li class="card"><h3>Bilans de compétences et VAE</h3><p>Les indicateurs communs modifiés (1, 2, 12, 19, 27, 32) vous concernent aussi. La check-list indique ce qui ne s'applique pas à votre activité.</p></li>
  </ul>
</section>

<section class="band" aria-labelledby="price-h">
  <div class="wrap section">
    <h2 id="price-h">Disponibilité</h2>
    <div class="grid2">
      <div class="offer">
        <p class="offer-label">Disponible maintenant</p>
        <h3>Échantillon gratuit</h3>
        <p class="price">0 €</p>
        <p>Tableau des changements V9 → V10 + 3 modèles (indicateurs 12, 27, 32). Sans inscription, sans e-mail.</p>
        ${downloadBtn('Télécharger l\'échantillon')}
      </div>
      ${OPEN ? `<div class="offer" id="commander">
        <p class="offer-label">Disponible · réservé aux professionnels</p>
        <h3>Kit complet</h3>
        <p class="price">${PRICE.short}</p>
        <p class="small muted">${PRICE.std ? `soit ${PRICE.ht} HT + ${PRICE.vat} de TVA (20 %)` : 'TVA non applicable, art. 293 B du CGI'}</p>
        <p>4 synthèses + ${DATA.templates.length} modèles, envoyés par e-mail avec la facture dès le paiement confirmé, mise à jour après la publication du guide de lecture officiel. Achat unique, pas d'abonnement.</p>
        <a class="btn btn-primary" href="commander.html">Commander<span class="btn-sub">entreprises · SIREN · carte bancaire (Stripe)</span></a>
        <p class="small muted">Conditions : <a href="cgv-pro.html">CGV professionnels</a>.</p>
      </div>` : `<div class="offer offer-soon">
        <p class="offer-label">Ouverture des ventes prochainement</p>
        <h3>Kit complet</h3>
        <p class="price">${PRICE.std ? PRICE.short : `${PRICE.short} <small>(TVA non applicable, art. 293 B du CGI)</small>`}</p>
        <p>4 synthèses + ${DATA.templates.length} modèles, téléchargement immédiat après paiement, mise à jour après la publication du guide de lecture officiel. Achat unique, pas d'abonnement.</p>
        <p class="soon" role="note">La vente n'est pas encore ouverte : aucun paiement n'est possible pour l'instant. Pour être prévenu, suivez les <a href="${REPO}/releases">publications du dépôt GitHub</a> (Watch → Custom → Releases).</p>
      </div>`}
    </div>
  </div>
</section>

<section class="wrap section" aria-labelledby="not-h">
  <h2 id="not-h">Ce que le kit n'est pas</h2>
  <ul class="checks checks-neutral">
    <li>Ce n'est pas un conseil juridique, ni un accompagnement, ni un audit.</li>
    <li>Il ne garantit pas la certification : seul votre organisme certificateur décide, après audit.</li>
    <li>Il n'est ni édité ni validé par l'État, France compétences ou un certificateur, et ne contient pas le logo Qualiopi.</li>
    <li>Il ne remplace pas le texte officiel ni le guide de lecture, encore attendu au 11 octobre 2026.</li>
  </ul>
</section>

<section class="band" id="faq" aria-labelledby="faq-h">
  <div class="wrap section">
    <h2 id="faq-h">Questions fréquentes</h2>
    ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n    ')}
  </div>
</section>

<section class="wrap section" aria-labelledby="src-h">
  <h2 id="src-h">Sources officielles</h2>
  ${sourcesList()}
  <p class="small muted">Contenu vérifié le 11 octobre 2026.</p>
</section>
<script>
(function () {
  var el = document.getElementById('jours');
  if (!el) return;
  var d = Math.ceil((Date.UTC(2026, 10, 1) - Date.now()) / 86400000);
  if (d > 1) el.textContent = 'dans ' + d + ' jours';
  else if (d === 1) el.textContent = 'demain';
  else el.textContent = 'en vigueur';
})();
</script>
`;

// Organisation : même @id que le site vitrine (https://vread-corp.github.io/) pour que les moteurs fusionnent les entités.
const ORG_ID = 'https://vread-corp.github.io/#org';
const orgLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'READ FRANCE SAS',
  legalName: 'READ FRANCE',
  url: 'https://vread-corp.github.io/',
  address: { '@type': 'PostalAddress', streetAddress: '11 rue Rouvet', postalCode: '75019', addressLocality: 'Paris', addressCountry: 'FR' },
  identifier: { '@type': 'PropertyValue', propertyID: 'SIREN', value: '988741773' },
};
// Product + Offer seulement quand la vente est ouverte (pas de prix « disponible » dans les résultats de recherche sinon).
// Prix dérivé de sales.config.json (montant en centimes) ; franchise en base : prix net, pas de valueAddedTaxIncluded.
const productLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: BRAND,
  description: `Kit documentaire pour le nouveau référentiel national qualité Qualiopi applicable au 1er novembre 2026 (décret n° 2026-728, 33 indicateurs) : check-list des preuves, tableau des changements V9 → V10, ${DATA.templates.length} modèles DOCX et ODT. Vendu aux professionnels.${PRICE.std ? '' : ' Prix net, TVA non applicable (art. 293 B du CGI).'}`,
  image: `${SITE}og.png`,
  url: SITE,
  brand: { '@type': 'Brand', name: BRAND },
  sku: SALES.product,
  offers: {
    '@type': 'Offer',
    price: (SALES.amount / 100).toFixed(2),
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    url: `${SITE}commander.html`,
    seller: { '@id': ORG_ID },
    itemCondition: 'https://schema.org/NewCondition',
  },
};
const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };

// ---------------------------------------------------------------- Tableau des changements
const changesBody = `
<section class="wrap section">
  <p class="eyebrow"><a href="./">${BRAND}</a> › Ce qui change</p>
  <h1>Qualiopi V10 : tableau des changements du référentiel au 1er novembre 2026</h1>
  <p class="lead">Le décret n° 2026-728 du 1er août 2026 remplace la liste des indicateurs du référentiel national qualité. Les 7 critères sont inchangés ; on passe de 32 à 33 indicateurs. Voici, indicateur par indicateur, ce qui change et ce qu'il faut faire.</p>
  <div class="callout" role="note"><p><strong>À savoir.</strong> « V9 » et « V10 » sont des appellations courantes, pas des termes officiels. Les libellés ci-dessous sont des reformulations : le texte publié sur <a href="${esc(DATA.sources[0].url)}" rel="noopener">Légifrance</a> fait foi.</p></div>
  <h2>En bref</h2>
  <ul>
    <li><strong>${modifiedNums.length} indicateurs modifiés sur le fond</strong> : ${modifiedNums.join(', ')}.</li>
    <li><strong>1 indicateur nouveau</strong> : 33, évaluation des contenus et des enseignements par les apprenants.</li>
    <li>1 ajustement mineur (30) ; les autres indicateurs sont inchangés sur le fond.</li>
    <li>Encore attendus au 11 octobre 2026 : le nouveau guide de lecture et les arrêtés fixant les seuils des indicateurs 19 et 20.</li>
  </ul>
  <p>${downloadBtn('Télécharger ce tableau (DOCX, ODT, PDF) + 3 modèles')}</p>

  <h2>Indicateurs modifiés ou nouveaux</h2>
  ${changed.map((i) => `
  <article class="change" id="indicateur-${i.n}">
    <h3><span class="badge ${i.change}">${esc(i.changeLabel)}</span> Indicateur ${i.n} — ${esc(i.titre)}</h3>
    <p class="small muted">Concerne : ${esc(i.scope)}</p>
    <dl>
      <dt>Avant (référentiel 2019)</dt><dd>${esc(i.v9)}</dd>
      <dt>À partir du 1er novembre 2026</dt><dd>${esc(i.v10)}</dd>
      <dt>Ce qu'il faut faire</dt><dd>${esc(i.action)}</dd>
    </dl>
  </article>`).join('')}

  <h2>Les 33 indicateurs en un coup d'œil</h2>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Tableau des 33 indicateurs">
  <table>
    <caption class="sr">Statut de chaque indicateur au 1er novembre 2026</caption>
    <thead><tr><th scope="col">N°</th><th scope="col">Critère</th><th scope="col">Intitulé (reformulé)</th><th scope="col">Concerne</th><th scope="col">Statut</th></tr></thead>
    <tbody>
    ${DATA.indicators.map((i) => `<tr><td>${i.n}</td><td>${i.critere}</td><td>${esc(i.titre)}</td><td>${esc(i.scope)}</td><td><span class="badge ${i.change}">${esc(i.changeLabel)}</span></td></tr>`).join('\n    ')}
    </tbody>
  </table>
  </div>

  <h2>Les 7 critères (inchangés)</h2>
  <ol>${DATA.criteria.map((c) => `<li>${esc(c.title)} — indicateurs ${c.range[0]} à ${c.range[1]}</li>`).join('')}</ol>

  <h2>Points encore en attente</h2>
  <ul>${DATA.pending.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>

  <h2>Sources officielles</h2>
  ${sourcesList()}
  <p class="small muted">Analyse établie le 11 octobre 2026 par READ FRANCE SAS. Information, pas un conseil juridique.</p>
</section>`;

// ---------------------------------------------------------------- Pages légales
const mentionsBody = `
<section class="wrap section prose">
  <h1>Mentions légales</h1>
  <h2>Éditeur</h2>
  <p><strong>READ FRANCE SAS</strong>, société par actions simplifiée<br>
  Siège social : 11 rue Rouvet, 75019 Paris, France<br>
  SIREN 988 741 773 — RCS Paris 988 741 773<br>
  Capital social : 1 000 €<br>
  ${PRICE.std ? 'N° TVA intracommunautaire : FR57988741773' : 'TVA non applicable, art. 293 B du CGI (franchise en base)'}<br>
  Directeur de la publication : Tanguy Warsmann, président<br>
  Contact : en attendant l'ouverture d'une adresse dédiée, par les <a href="${REPO}/issues">tickets (issues) du dépôt GitHub du site</a>. Ne publiez pas de données personnelles dans un ticket public.</p>
  <p class="small muted">Données d'identification issues de l'annuaire des entreprises (recherche-entreprises.api.gouv.fr), consultées le 11 octobre 2026.</p>
  <h2>Hébergeur</h2>
  <p>GitHub, Inc. (GitHub Pages et GitHub Releases), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis — <a href="https://github.com">github.com</a>.</p>
  <h2>Propriété intellectuelle</h2>
  <p>Les textes, tableaux et modèles de ce site et du kit sont des créations originales de READ FRANCE SAS. Les textes officiels cités (décret, code du travail) sont accessibles sur Légifrance ; les reformulations proposées ne s'y substituent pas.</p>
  <p>« Qualiopi » est une marque de l'État (ministère chargé de la formation professionnelle). Ce site et ce kit sont indépendants : ils ne sont ni édités, ni validés, ni approuvés par l'État, France compétences, le COFRAC ou un organisme certificateur, et n'utilisent pas le logo Qualiopi.</p>
  <h2>Avertissement</h2>
  <p>Les informations publiées ont une vocation pratique et informative. Elles ne constituent pas un conseil juridique et ne garantissent pas l'obtention ou le maintien d'une certification.</p>
</section>`;

const privacyBody = `
<section class="wrap section prose">
  <h1>Politique de confidentialité</h1>
  <p><strong>En résumé : ce site ne collecte aucune donnée personnelle.</strong> Il n'utilise ni cookie, ni outil de mesure d'audience, ni traceur tiers, ni formulaire. C'est pourquoi aucun bandeau de consentement n'est affiché.</p>
  <h2>Ce que fait l'éditeur</h2>
  <p>READ FRANCE SAS ne dépose aucun cookie et ne reçoit aucune donnée vous concernant lorsque vous consultez ce site ou téléchargez l'échantillon. Le seul chiffre que nous consultons est le <strong>nombre total de téléchargements</strong> du fichier, fourni par GitHub de manière agrégée et anonyme.</p>
  <h2>Ce que fait l'hébergeur</h2>
  <p>Le site est hébergé par GitHub Pages et le fichier est distribué par GitHub Releases (GitHub, Inc.). Comme tout hébergeur, GitHub traite des données techniques de connexion (dont l'adresse IP) pour fournir le service et en assurer la sécurité, selon sa propre <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement">déclaration de confidentialité</a>.</p>
  <h2>Contact par ticket GitHub</h2>
  <p>Si vous nous écrivez via un ticket (issue) GitHub, votre message et votre pseudonyme GitHub sont publics. N'y indiquez pas de données personnelles.</p>
  ${OPEN ? `<h2>Commandes du kit complet</h2>
  <p>La page <a href="commander.html">Commander</a> est la seule à collecter des données : adresse e-mail, raison sociale, SIREN et adresse de facturation de l'entreprise acheteuse, pour exécuter la commande et établir la facture. Le paiement par carte est traité par Stripe, qui charge son module de paiement (et ses cookies de sécurité anti-fraude) sur cette page uniquement. Destinataires, durées de conservation et droits : voir l'article 13 des <a href="cgv-pro.html">CGV professionnels</a>.</p>` : `<h2>Ventes futures</h2>
  <p>La vente du kit complet n'est pas ouverte. Les traitements prévus pour les commandes (données de commande et de facturation, prestataire de paiement Stripe, durées de conservation, droits d'accès, de rectification et d'effacement, réclamation auprès de la CNIL) sont décrits à l'article 13 des <a href="cgv-pro.html">CGV professionnels</a>.</p>`}
  <p class="small muted">Dernière mise à jour : 11 octobre 2026.</p>
</section>`;

// Ancien projet de CGV grand public (11 octobre 2026) : remplacé par les CGV professionnels (vente B2B uniquement).
const cgvBody = `
<section class="wrap section prose">
  <h1>Conditions générales de vente</h1>
  <p>Le ${BRAND} est vendu <strong>uniquement aux professionnels</strong>. Les conditions applicables sont les <a href="cgv-pro.html">conditions générales de vente aux professionnels</a>. L'ancien projet de conditions grand public du 11 octobre 2026 est abandonné.</p>
</section>`;

const cgvProPage = `
<section class="wrap section prose">
${cgvProBody({
  config: SALES,
  productName: BRAND,
  contact: `en répondant à l'e-mail de livraison de la commande, ou par les <a href="${REPO}/issues">tickets (issues) du dépôt GitHub du site</a> (publics : n'y mettez aucune donnée personnelle)`,
  legalUrl: 'mentions-legales.html',
  privacyUrl: 'confidentialite.html',
  productDescription: `« ${BRAND} » : kit documentaire relatif au référentiel national qualité applicable au 1er novembre 2026 (décret n° 2026-728 du 1er août 2026, 33 indicateurs), comprenant 4 synthèses (DOCX, ODT, PDF), dont une check-list des 33 indicateurs et un tableau des changements, et ${DATA.templates.length} modèles éditables (DOCX, ODT), tels que décrits sur la <a href="./#contenu-kit">page de présentation</a> à la date de la commande.`,
  licenceScope: `l'Acheteur peut copier les fichiers, modifier les modèles et les utiliser dans tous ses établissements, pour son propre organisme de formation, CFA ou centre de bilans de compétences ou de VAE.`,
  updates: `Une mise à jour du kit établie après la publication du guide de lecture officiel du référentiel 2026 est envoyée sans frais à l'adresse électronique de commande si elle paraît dans les 12 mois suivant la commande.`,
  disclaimer: [
    `Le kit est un <strong>outil d'information et d'organisation</strong>. Il ne constitue ni un conseil juridique, ni une prestation d'accompagnement, de conseil ou d'audit, et <strong>ne garantit pas l'obtention, le maintien ou le renouvellement de la certification Qualiopi</strong> : seul l'organisme certificateur décide, après audit.`,
    `Le kit est indépendant : il n'est ni édité, ni validé, ni approuvé par l'État, France compétences, le COFRAC ou un organisme certificateur. « Qualiopi » est une marque de l'État ; le kit n'en utilise pas le logo. Les libellés des indicateurs sont des reformulations : le texte publié au Journal officiel et le guide de lecture officiel font foi.`,
    `Le contenu est à jour à sa date de version. Le guide de lecture officiel et les arrêtés d'application attendus peuvent préciser ou modifier les attentes ; il appartient à l'Acheteur de vérifier les textes applicables et de les confirmer avec son organisme certificateur.`,
  ],
})}
</section>`;

const commanderPage = `
<section class="wrap section">
  <p class="eyebrow"><a href="./">${BRAND}</a> › Commander</p>
  <h1>Commander le ${BRAND}</h1>
  <p class="lead">Kit complet : 4 synthèses et ${DATA.templates.length} modèles éditables. ${PRICE.sentence}.</p>
  ${orderFormHtml({ config: SALES, productName: BRAND, cgvUrl: 'cgv-pro.html' })}
</section>`;

const orderPage = `
<section class="wrap section">
  ${orderPageBody()}
  <p class="small muted">Une question ? Répondez à l'e-mail de livraison. <a href="./">Retour à l'accueil du ${BRAND}</a></p>
</section>`;

const notFoundBody = `<section class="wrap section"><h1>Page introuvable</h1><p><a href="./">Retour à l'accueil du ${BRAND}</a></p></section>`;

// ---------------------------------------------------------------- Écriture
mkdirSync(OUT, { recursive: true });
const pages = [
  { path: '', file: 'index.html', title: 'Kit Qualiopi V10 : modèles du nouveau référentiel Qualiopi 2026', description: `Nouveau référentiel Qualiopi 2026 : check-list des 33 indicateurs, tableau V9 → V10 et ${DATA.templates.length} modèles Word et LibreOffice prêts à adapter. Échantillon gratuit.`, body: indexBody, jsonld: OPEN ? [orgLd, productLd, faqLd] : [orgLd, faqLd], priority: '1.0' },
  { path: 'changements-v9-v10.html', file: 'changements-v9-v10.html', title: 'Nouveau référentiel Qualiopi 2026 : ce qui change (V9 → V10)', description: `Nouveau référentiel Qualiopi 2026 : les ${modifiedNums.length} indicateurs modifiés et le nouvel indicateur 33, avant / après et actions à mener. Source : décret n° 2026-728.`, body: changesBody, jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Qualiopi V10 : tableau des changements du référentiel au 1er novembre 2026', datePublished: PUBLISHED, dateModified: LASTMOD, inLanguage: 'fr', author: { '@type': 'Organization', name: 'READ FRANCE SAS' }, publisher: { '@type': 'Organization', name: 'READ FRANCE SAS' } }], priority: '0.9' },
  { path: 'mentions-legales.html', file: 'mentions-legales.html', title: 'Mentions légales — Kit Qualiopi V10', description: 'Éditeur, hébergeur et propriété intellectuelle du site Kit Qualiopi V10 (READ FRANCE SAS).', body: mentionsBody, priority: '0.2' },
  { path: 'confidentialite.html', file: 'confidentialite.html', title: 'Confidentialité — Kit Qualiopi V10', description: 'Aucun cookie, aucun traceur, aucune donnée personnelle collectée par le site Kit Qualiopi V10.', body: privacyBody, priority: '0.2' },
  { path: 'cgv-pro.html', file: 'cgv-pro.html', title: 'Conditions générales de vente aux professionnels — Kit Qualiopi V10', description: 'CGV B2B du Kit Qualiopi V10 (READ FRANCE SAS), version du 12 octobre 2026 : vente aux professionnels, prix, paiement Stripe, livraison par e-mail, licence, facturation.', body: cgvProPage, priority: '0.2', noindex: !OPEN },
  { path: 'cgv.html', file: 'cgv.html', title: 'Conditions générales de vente — Kit Qualiopi V10', description: 'Le Kit Qualiopi V10 est vendu uniquement aux professionnels : voir les conditions générales de vente aux professionnels.', body: cgvBody, priority: '0.1', noindex: true },
  ...(OPEN
    ? [
        { path: 'commander.html', file: 'commander.html', title: 'Commander le Kit Qualiopi V10 — professionnels', description: `Commande du Kit Qualiopi V10 par les entreprises (SIREN) : ${PRICE.sentence}, paiement par carte avec Stripe, fichier et facture par e-mail.`, body: commanderPage, noindex: true, head: `<meta http-equiv="Content-Security-Policy" content="${checkoutCsp(SALES)}">\n`, tail: '<script src="checkout/checkout-config.js"></script>\n<script src="https://js.stripe.com/v3/"></script>\n<script src="checkout/pay.js"></script>\n' },
        { path: 'commande.html', file: 'commande.html', title: 'Votre commande — Kit Qualiopi V10', description: 'Confirmation de la commande du Kit Qualiopi V10 : envoi du fichier et de la facture par e-mail.', body: orderPage, noindex: true, head: `<meta http-equiv="Content-Security-Policy" content="${orderCsp(SALES)}">\n<meta name="referrer" content="no-referrer">\n`, tail: '<script src="checkout/checkout-config.js"></script>\n<script src="checkout/order.js"></script>\n' },
      ]
    : []),
];
// Clean previous buy-UI output so that closing the sales removes it from docs/.
for (const f of ['commander.html', 'commande.html', 'checkout']) rmSync(join(OUT, f), { recursive: true, force: true });
for (const p of pages) writeFileSync(join(OUT, p.file), layout(p));
if (OPEN) {
  mkdirSync(join(OUT, 'checkout'), { recursive: true });
  for (const f of ['pay.js', 'order.js']) copyFileSync(join(ROOT, 'src', 'checkout', f), join(OUT, 'checkout', f));
  writeFileSync(join(OUT, 'checkout', 'checkout-config.js'), checkoutConfigJs(SALES, { termsUrl: `${SITE}cgv-pro.html`, orderPage: 'commande.html' }));
}
writeFileSync(join(OUT, '404.html'), layout({ path: '404.html', title: 'Page introuvable — Kit Qualiopi V10', description: 'Page introuvable.', body: notFoundBody, noindex: true }));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${LASTMOD}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync(join(OUT, '.nojekyll'), '');
for (const f of ['styles.css', 'favicon.svg']) copyFileSync(join(ROOT, 'src', f), join(OUT, f));
if (existsSync(join(ROOT, 'src/og.png'))) copyFileSync(join(ROOT, 'src/og.png'), join(OUT, 'og.png'));
console.log(`site généré dans ${OUT} (${pages.length + 1} pages, ventes ${OPEN ? 'OUVERTES' : 'fermées'}) — échantillon : ${SAMPLE_URL}`);
