// Génère le site statique dans docs/ (servi par GitHub Pages depuis la branche main, dossier /docs).
// Aucune dépendance : node scripts/build.mjs
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkoutCsp, orderCsp, cgvProBody, checkoutConfigJs, loadSalesConfig, orderFormHtml, orderPageBody, prices } from './checkout-pages.mjs';
// Pages guides (indicateur 33, préparation d'audit, modèles gratuits, 1er novembre) : scripts/seo-pages.mjs.
import { seoPages, rebase, indicatorHref, guideLinksHtml, GUIDE_STATUS, INDICATOR_PAGES } from './seo-pages.mjs';
import { FREE_FILES } from './seo-page-modeles.mjs';

const ROOT = resolve(import.meta.dirname, '..');
// OUT_DIR: test builds only (the published site is docs/).
const OUT = process.env.OUT_DIR ? resolve(process.env.OUT_DIR) : join(ROOT, 'docs');
// Sales gate: with SALES_OPEN=false (sales.config.json) the build emits no buy UI at all.
const SALES = loadSalesConfig(ROOT);
const OPEN = SALES.SALES_OPEN === true;
// Quote / bank-transfer form (sales.config.json quotesEnabled, off by default): block + devis.js script tag.
const QUOTES = OPEN && SALES.quotesEnabled === true;
const PRICE = prices(SALES);
const DATA = JSON.parse(readFileSync(join(ROOT, 'src/data/changements.json'), 'utf8'));
const SITE = 'https://qualiopi.jalonel.com/';
const REPO = 'https://github.com/VREAD-corp/kit-qualiopi-v10';
const SAMPLE_TAG = `echantillon-v${DATA.version}`;
const SAMPLE_FILE = `kit-qualiopi-v10-echantillon-${DATA.version}.zip`;
const SAMPLE_URL = `${REPO}/releases/download/${SAMPLE_TAG}/${SAMPLE_FILE}`;
const LASTMOD = '2026-10-13';
const PUBLISHED = '2026-10-11';
const BRAND = 'Kit Qualiopi V10';
// « Commander » button ({prix} = the price, e.g. « Payer 129 € et recevoir le kit Qualiopi V10 »).
const PAY_LABEL = 'Payer {prix} et recevoir le kit Qualiopi V10';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const changed = DATA.indicators.filter((i) => i.change === 'modifie' || i.change === 'nouveau');
const modifiedNums = DATA.indicators.filter((i) => i.change === 'modifie').map((i) => i.n);

// Contact (remplace les tickets GitHub) et chrome du site (en-tête, pied de page, barre d'achat mobile).
const CONTACT = 'octave@vread.fr';
const MAILTO = `mailto:${CONTACT}`;
// Prix affiché compact (« 129 € »), dérivé de sales.config.json (montant en centimes).
const PRICE_TAG = `${SALES.amount % 100 === 0 ? SALES.amount / 100 : (SALES.amount / 100).toFixed(2).replace('.', ',')} €`;
const STICKY_PAGES = new Set(['', 'changements-v9-v10.html']);
// Pages de commande : même en-tête et pied de page que le site, sans le bouton « Commander » de l'en-tête.
const CHECKOUT_PAGES = new Set(['commander.html', 'commande.html']);

function siteChrome(body, path) {
  const sticky = OPEN && STICKY_PAGES.has(path);
  return `<a class="skip" href="#contenu">Aller au contenu</a>
<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="./"><span class="logo-mark" aria-hidden="true">33</span><span class="logo-txt">${BRAND}<small>une marque Jalonel</small></span></a>
    ${CHECKOUT_PAGES.has(path) ? '' : `<nav class="top-nav" aria-label="Navigation principale">
      <a href="./#contenu-kit">Le kit</a>
      <a href="changements-v9-v10.html">Ce qui change</a>
      <a href="preparer-audit-qualiopi-2026.html">Préparer l'audit</a>
      <a href="./#offre">Tarif</a>
      <a href="./#faq">FAQ</a>
      <a href="./#qui">Contact</a>
    </nav>`}
    ${OPEN && !CHECKOUT_PAGES.has(path) ? `<a class="btn btn-primary btn-sm top-cta" href="commander.html">Commander · ${PRICE_TAG}</a>` : ''}
  </div>
</header>
<main id="contenu">
${body}
</main>
<footer class="foot">
  <div class="wrap foot-in">
    <div>
      <p class="foot-brand"><strong>${BRAND}</strong> — <a href="https://jalonel.com/">Une marque Jalonel</a></p>
      <p class="small muted">Produit indépendant : ni édité ni validé par l'État, France compétences ou un organisme certificateur. Qualiopi est une marque de l'État. Information, pas un conseil juridique ; aucune garantie de certification.</p>
    </div>
    <nav aria-label="Liens légaux" class="foot-nav">
      <a href="mentions-legales.html">Mentions légales</a>
      <a href="confidentialite.html">Confidentialité</a>
      <a href="cgv-pro.html">CGV professionnels</a>
      <a href="${MAILTO}">Contact : ${CONTACT}</a>
      <a href="${REPO}">Code source du site</a>
    </nav>
  </div>
</footer>
${sticky ? `<div class="sticky-cta" role="region" aria-label="Commander le kit">
  <p><strong>Kit complet</strong> <span>${PRICE_TAG}</span></p>
  <a class="btn btn-primary btn-sm" href="commander.html">Commander →</a>
</div>
` : ''}`;
}

// Mesure du comportement (cro.js, copie exacte de octave-checkout/gas/web/cro.js) : compteurs journaliers agrégés,
// sans cookie ni identifiant. Même backend que mesure.js. CTA principal : les liens « Commander » et le bouton de paiement.
const CRO_API = 'https://script.google.com/macros/s/AKfycbzD1IRL8QALluKGZxgGiORFP6-DkC_qFJYR9aOxZiimxa06nbCqpzUI-9iLblp6V2VY/exec';
const CRO_CTA = "a[href*='commander'],#pay-button";

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
${head}<script src="mesure.js" defer></script>
<script src="cro.js" data-site="kit-qualiopi-v10" data-api="${CRO_API}" data-hosts="qualiopi.jalonel.com outils.vread.fr" data-cta="${CRO_CTA}" defer></script>
<script src="cro-goals.js" defer></script>
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n')}
</head>
<body${OPEN && STICKY_PAGES.has(path) ? ' class="has-sticky"' : ''}>
${siteChrome(body, path)}${tail}</body>
</html>
`;
}

const downloadBtn = (label = 'Télécharger l\'échantillon gratuit') =>
  `<a class="btn btn-primary" href="${SAMPLE_URL}" download data-mesure="free_download">${label}<span class="btn-sub">ZIP · DOCX, ODT, PDF · sans inscription</span></a>`;

const sourcesList = () => `<ul class="sources">${DATA.sources.map((s) => `<li><a href="${esc(s.url)}" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul>`;

// ---------------------------------------------------------------- Accueil
// Statut du guide de lecture : page officielle du ministère du Travail consultée le 12 octobre 2026
// (mise à jour du 16/09/2026, dernière version proposée : V9 du 8 janvier 2024).
// GUIDE_STATUS : importé de seo-pages.mjs, calculé depuis src/data/statut-textes.json.
const GUIDE_URL = 'https://travail-emploi.gouv.fr/referentiel-national-qualite-guide-de-lecture-qualiopi';
const CGV_LINK = '<a href="cgv-pro.html">CGV professionnels</a>';
const mail = `<a href="${MAILTO}">${CONTACT}</a>`;
const stripTags = (s) => s.replace(/<[^>]+>/g, '');
const templatesFree = DATA.templates.filter((t) => t.sample);
// Kit v1.1.0 : modèles qualité T01–T19 (DATA.templates), documents administratifs et variantes T20–T39 (DATA.pack),
// tableurs X01–X06 (DATA.sheets). Les pages guides continuent d'utiliser DATA.templates.
const PACK = DATA.pack ?? [];
const SHEETS = DATA.sheets ?? [];
const NB_MODELES = DATA.templates.length + PACK.length;
const NB_SYNTHESES = DATA.docs.filter((d) => d.id !== 'D00').length;

// Aperçus : vraies premières pages des documents du kit (rendues depuis les DOCX/PDF du dépôt de contenu).
const PREVIEWS = [
  { file: 'apercu-d02-checklist-33-indicateurs.webp', id: 'D02', title: 'Check-list des preuves, 33 indicateurs', text: 'Pour chaque indicateur : à qui il s\'applique, ce qui change, les preuves possibles, les pièges fréquents et le modèle à utiliser.', alt: 'Page 1 de la check-list D02 des preuves attendues pour les 33 indicateurs : l\'indicateur 1 avec ses preuves à cocher, ses pièges fréquents et une grille de suivi.' },
  { file: 'apercu-d04-plan-21-jours.webp', id: 'D04', title: 'Plan d\'action en 21 jours', text: 'Une action par jour, le livrable attendu et le modèle à utiliser, de l\'état des lieux à l\'audit à blanc.', alt: 'Début du plan d\'action D04 en 21 jours : un tableau par semaine, avec pour chaque jour l\'action, le livrable et le modèle (semaines 1 et 2).' },
  { file: 'apercu-t01-fiche-programme.webp', id: 'T01', title: 'Fiche programme de formation', text: 'Les rubriques exigées par l\'indicateur 1 modifié, avec les zones « À compléter » surlignées.', alt: 'Modèle T01, fiche programme de formation : rubriques public et prérequis, objectifs évaluables, contenu et déroulé, zones à compléter surlignées en jaune.' },
  { file: 'apercu-t07-procedure-violences.webp', id: 'T07', title: 'Procédure violences et ruptures', text: 'La procédure que l\'indicateur 12 modifié demande désormais : qui fait quoi, comment prévenir, comment signaler, comment traiter.', alt: 'Modèle T07, procédure de prévention des ruptures, des violences, du harcèlement et des discriminations : page 1 avec l\'objet, les rôles et la prévention.', free: true },
  { file: 'apercu-t20-convention-formation.webp', id: 'T20', title: 'Convention de formation', text: 'Les mentions de l\'article D. 6353-1 du code du travail, dont le taux d\'heures à distance, avec les zones à compléter surlignées.', alt: 'Modèle T20, convention de formation professionnelle : mode d\'emploi, parties au contrat, article 1 objet de l\'action et article 2 participants.' },
  { file: 'apercu-t22-reglement-interieur.webp', id: 'T22', title: 'Règlement intérieur', text: 'Santé et sécurité, procédure disciplinaire des articles R. 6352-3 à R. 6352-8, et l\'égalité de traitement exigée par l\'article L. 6352-4.', alt: 'Modèle T22, règlement intérieur des stagiaires et apprentis : champ d\'application, santé et sécurité, égalité de traitement et neutralité.' },
  { file: 'apercu-t30-questionnaire-chaud.webp', id: 'T30', title: 'Questionnaire à chaud', text: 'Dix affirmations notées de 1 à 4, la question qui sert au taux de satisfaction publié et la grille d\'exploitation.', alt: 'Modèle T30, questionnaire d\'appréciation à chaud : tableau de dix affirmations avec une échelle de 1 à 4 et les questions ouvertes.' },
];
const img = (p, { cls = '', lazy = true, priority = false } = {}) => `<img${cls ? ` class="${cls}"` : ''} src="img/${p.file}" width="760" height="1075" alt="${esc(p.alt)}"${lazy ? ' loading="lazy"' : ''}${priority ? ' fetchpriority="high"' : ''} decoding="async">`;

// FAQ : [question, réponse HTML]. Les questions d'achat d'abord. Le JSON-LD reprend le texte sans balises.
const faq = [
  ['Combien de temps faut-il pour adapter les modèles ?', 'Le plan d\'action fourni est découpé en 21 jours et compte <strong>1 à 2 heures par jour</strong>, à adapter selon la taille de votre organisme. Chaque modèle signale en surligné les zones « [À compléter] » à remplacer par vos informations ; supprimez les rubriques qui ne vous concernent pas.'],
  QUOTES
    ? ['Puis-je payer sur devis ou par virement ?', `Oui. Sur la page <a href="commander.html">Commander</a>, vous payez par carte bancaire (Stripe) ou vous demandez un devis, reçu aussitôt par e-mail en PDF, valable 30 jours, avec l'IBAN et la référence à reporter sur le virement. Le kit et la facture acquittée, établie au nom et au SIREN de votre organisme, partent par e-mail dès réception de l'intégralité du virement (article 5 des ${CGV_LINK}). Pour un bon de commande ou une demande particulière, répondez à l'e-mail du devis ou écrivez à ${mail}.`]
    : OPEN
    ? ['Puis-je payer sur devis ou par virement ?', `La commande en ligne se règle aujourd'hui par carte bancaire (Stripe), en une fois. Le paiement par virement sur devis prévu à l'article 5 des ${CGV_LINK} sera proposé prochainement sur la page <a href="commander.html">Commander</a> ; d'ici là, si votre service achats a besoin d'un devis, écrivez à ${mail}. La facture acquittée, établie au nom et au SIREN de votre organisme, est envoyée par e-mail avec les fichiers.`]
    : ['Puis-je payer sur devis ou par virement ?', `À l'ouverture des ventes, le kit pourra être réglé en une fois par carte bancaire (Stripe) ou par virement sur devis (article 5 des ${CGV_LINK}). La facture acquittée, établie au nom et au SIREN de votre organisme, sera envoyée par e-mail avec les fichiers. Une question : ${mail}.`],
  ['Et si le guide de lecture officiel change les attendus ?', `Le guide de lecture du référentiel 2026 est ${GUIDE_STATUS}. Une mise à jour du kit établie après sa publication vous est envoyée sans frais, à l'adresse e-mail de commande, si elle paraît dans les 12 mois suivant votre achat (article 10 des ${CGV_LINK}).`],
  ['Puis-je être remboursé ?', `La vente est conclue entre professionnels : le droit de rétractation des consommateurs ne s'applique pas et la commande est ferme dès le paiement (article 7 des ${CGV_LINK}). Si le fichier livré est illisible, incomplet ou ne correspond pas à la description, signalez-le dans les 30 jours : nous fournissons un fichier conforme ou, à défaut, remboursons le prix (article 10). Pour juger la qualité avant d'acheter, téléchargez l'échantillon gratuit.`],
  ['Qui a rédigé le kit ?', `Jalonel, marque de READ FRANCE SAS, société basée à Paris (SIREN 988 741 773), à partir des textes officiels cités en bas de page : décret n° 2026-728, annexe du code du travail, délibération de France compétences. La rédaction est originale ; les libellés des indicateurs sont des reformulations et le texte officiel fait foi. Jalonel n'est pas un organisme certificateur. Une question sur le contenu : ${mail}.`],
  OPEN
    ? ['Comment se passe la commande ?', `Le kit est vendu aux professionnels (SIREN obligatoire), ${PRICE_TAG} en achat unique. Sur la page <a href="commander.html">Commander</a>, vous payez par carte${QUOTES ? ' ou demandez un devis à régler par virement' : ''} ; le fichier ZIP et la facture acquittée arrivent par e-mail dès le paiement confirmé, au plus tard sous 24 heures.`]
    : ['Puis-je acheter le kit complet maintenant ?', `Pas encore : l'ouverture des ventes est en préparation. L'échantillon gratuit est disponible dès maintenant. Pour être prévenu, écrivez à ${mail}.`],
  ['Dans quels formats sont les modèles ?', 'DOCX (Word) et ODT (LibreOffice), modifiables. Les synthèses sont aussi fournies en PDF. Vous pouvez utiliser les modèles dans tous vos établissements (licence décrite à l\'article 8 des CGV).'],
  ['Quand le nouveau référentiel s\'applique-t-il ?', 'Le décret n° 2026-728 du 1er août 2026 entre en vigueur le 1er novembre 2026. Jusqu\'au 31 octobre 2026, le référentiel de 2019 (32 indicateurs) reste applicable. Vérifiez avec votre organisme certificateur quel référentiel et quel guide de lecture seront utilisés pour votre prochain audit.'],
  ['Qu\'est-ce que « Qualiopi V10 » ?', 'C\'est le nom couramment donné au référentiel national qualité modifié par le décret n° 2026-728 du 1er août 2026, publié au Journal officiel du 4 août 2026. Le texte officiel ne parle pas de « V10 » : l\'expression fait suite à la version 9 du guide de lecture (8 janvier 2024).'],
  ['Combien d\'indicateurs et qu\'est-ce qui change ?', `Les 7 critères sont inchangés. Le référentiel passe de 32 à 33 indicateurs : l'indicateur 33 est créé et, selon notre lecture du texte, ${modifiedNums.length} indicateurs sont modifiés sur le fond (${modifiedNums.join(', ')}).`],
  ['L\'indicateur 33 me concerne-t-il ?', 'L\'indicateur 33 (évaluation des contenus et des enseignements par les apprenants) est rattaché aux CFA par les analyses publiées. Vérifiez la colonne d\'application dans l\'annexe officielle sur Légifrance ; le kit fournit un modèle dédié.'],
  ['Le guide de lecture officiel est-il publié ?', `Non : ${GUIDE_STATUS}. La <a href="${GUIDE_URL}" rel="noopener">page du ministère du Travail</a> propose toujours la version 9 du 8 janvier 2024. Les arrêtés qui fixeront les seuils des indicateurs 19 et 20 n'étaient pas publiés au 11 octobre 2026. Le kit le signale dans chaque document.`],
  ['Mon certificat en cours reste-t-il valable ?', 'Le décret ne prévoit pas de disposition transitoire spécifique. Les modalités pour les audits de surveillance et de renouvellement réalisés après le 1er novembre 2026 sont à confirmer avec votre organisme certificateur.'],
  ['Le kit garantit-il la certification ?', 'Non. Seul un organisme certificateur décide, après audit. Le kit vous aide à organiser vos preuves ; il ne remplace ni le texte officiel, ni le guide de lecture, ni un conseil juridique ou un accompagnement.'],
];

const priceNote = PRICE.std ? `TTC, soit ${PRICE.ht} HT + ${PRICE.vat} de TVA (20 %)` : 'Prix net, TVA non applicable (art. 293 B du CGI)';

const heroCta = OPEN
  ? `<div class="cta">
        <a class="btn btn-primary btn-lg" href="commander.html">Obtenir le kit complet – ${PRICE_TAG}</a>
        <a class="link-arrow" href="${SAMPLE_URL}" download data-mesure="free_download">ou téléchargez d'abord 3 modèles gratuits</a>
      </div>
      <p class="cta-meta">${PRICE_TAG} ${PRICE.std ? `TTC (${PRICE.ht} HT)` : 'net, TVA non applicable (art. 293 B du CGI)'} · achat unique, sans abonnement · fichiers et facture par e-mail dès le paiement · réservé aux professionnels</p>`
  : `<div class="cta">
        ${downloadBtn('Télécharger 3 modèles gratuits')}
      </div>
      <p class="cta-meta">Kit complet ${PRICE_TAG} : la vente n'est pas encore ouverte.</p>`;

const offerCard = OPEN
  ? `<div class="offer" id="commander">
        <p class="offer-label">Kit complet · réservé aux professionnels</p>
        <p class="price">${PRICE_TAG}</p>
        <p class="price-note">${priceNote}</p>
        <ul class="checks">
          <li>Check-list des preuves pour les 33 indicateurs</li>
          <li>Plan d'action en 21 jours et check-list de préparation de l'audit</li>
          <li>Tableau des changements V9 → V10</li>
          <li>${NB_MODELES} modèles éditables, Word et LibreOffice, dont la convention, le règlement intérieur et l'émargement</li>
          <li>${SHEETS.length} tableurs Excel et LibreOffice avec formules, et un index des documents par indicateur</li>
          <li>Mise à jour sans frais après la publication du guide de lecture officiel (si elle paraît dans les 12 mois)</li>
          <li>Utilisable dans tous vos établissements</li>
        </ul>
        <a class="btn btn-primary btn-lg btn-block" href="commander.html">Obtenir le kit complet – ${PRICE_TAG}</a>
        <p class="small muted offer-foot">${QUOTES ? 'Paiement par carte (Stripe) ou virement sur devis' : 'Paiement par carte (Stripe)'} · SIREN demandé · facture acquittée par e-mail · ${CGV_LINK}</p>
        <p class="small offer-guarantee">Fichier illisible, incomplet ou non conforme à la description ? Signalez-le sous 30 jours : nous le remplaçons ou, à défaut, vous remboursons (article 10 des CGV).</p>
      </div>`
  : `<div class="offer offer-soon">
        <p class="offer-label">Ouverture des ventes prochainement</p>
        <h3>Kit complet</h3>
        <p class="price">${PRICE_TAG}</p>
        <p class="price-note">${priceNote}</p>
        <p>${NB_SYNTHESES} synthèses + ${NB_MODELES} modèles + ${SHEETS.length} tableurs, mise à jour après la publication du guide de lecture officiel. Achat unique, pas d'abonnement.</p>
        <p class="soon" role="note">La vente n'est pas encore ouverte : aucun paiement n'est possible pour l'instant. Pour être prévenu, écrivez à ${mail}.</p>
      </div>`;

const indexBody = `
<section class="hero" id="hero">
  <div class="wrap hero-in">
    <div class="hero-copy">
      <p class="countdown" id="countdown"><span class="countdown-d" id="jours" hidden></span><span>Nouveau référentiel en vigueur le <strong>1er novembre 2026</strong></span></p>
      <h1>Kit pour le nouveau référentiel Qualiopi 2026&nbsp;: les 33&nbsp;indicateurs, ${NB_MODELES}&nbsp;modèles, ${PRICE_TAG}</h1>
      <p class="lead">Pour les organismes de formation, CFA et centres de bilans audités après le 1er novembre 2026, sans consultant ni responsable qualité. La check-list des preuves indicateur par indicateur, un plan d'action en 21 jours, ${NB_MODELES} modèles Word et LibreOffice et ${SHEETS.length} tableurs à remplir avec vos informations. Le but : savoir, pour chacun des 33 indicateurs, quelle preuve montrer à l'auditeur, et avoir le document à jour.</p>
      ${heroCta}
    </div>
    <div class="hero-visual">
      <div class="stack">
        ${img(PREVIEWS[3], { cls: 'sheet sheet-3', lazy: false })}
        ${img(PREVIEWS[2], { cls: 'sheet sheet-2', lazy: false })}
        ${img(PREVIEWS[0], { cls: 'sheet sheet-1', lazy: false, priority: true })}
      </div>
      <p class="visual-cap">Vraies pages du kit : check-list des 33 indicateurs, modèles T01 et T07</p>
    </div>
  </div>
</section>

<section class="wrap section" id="changements" aria-labelledby="changes-h">
  <p class="kicker">Ce qui change</p>
  <h2 id="changes-h">Au 1er novembre 2026, ${modifiedNums.length + 1} indicateurs évoluent</h2>
  <ul class="stats">
    <li><strong>33</strong><span>indicateurs, contre 32</span></li>
    <li><strong>${modifiedNums.length}</strong><span>modifiés sur le fond</span></li>
    <li><strong>1</strong><span>nouveau : l'indicateur 33</span></li>
    <li><strong>7</strong><span>critères, inchangés</span></li>
  </ul>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Indicateurs modifiés ou nouveaux">
  <table class="tbl-changes">
    <caption class="sr">Indicateurs modifiés ou créés par le décret n° 2026-728 (intitulés reformulés)</caption>
    <thead><tr><th scope="col">N°</th><th scope="col">Indicateur (reformulé) et publics concernés</th><th scope="col" class="st">Statut</th></tr></thead>
    <tbody>
    ${changed.map((i) => `<tr><td class="num">${i.n}</td><td><a href="${indicatorHref(i.n)}">${esc(i.titre)}</a><span class="scope">${esc(i.scope)} <span class="badge ${i.change} badge-m">${esc(i.changeLabel)}</span></span></td><td class="st"><span class="badge ${i.change}">${esc(i.changeLabel)}</span></td></tr>`).join('\n    ')}
    </tbody>
  </table>
  </div>
  <p class="small muted">Guide de lecture officiel du référentiel 2026 : ${GUIDE_STATUS}. Le kit sera mis à jour à sa parution. <a href="changements-v9-v10.html">Le tableau détaillé, gratuit, donne pour chacun le texte de 2019, celui de 2026 et ce qu'il faut faire.</a></p>
</section>

<section class="band" id="contenu-kit" aria-labelledby="kit-h">
  <div class="wrap section">
    <p class="kicker">Ce que vous obtenez</p>
    <h2 id="kit-h">${NB_SYNTHESES} synthèses, ${NB_MODELES} modèles et ${SHEETS.length} tableurs, dont ${templatesFree.length} modèles dans l'échantillon gratuit</h2>
    <ul class="gallery">
      ${PREVIEWS.map((p) => `<li>
        <figure>
          <a class="shot" href="img/${p.file}">${img(p)}</a>
          <figcaption><span class="tid">${p.id}</span> <strong>${esc(p.title)}</strong>${p.free ? ' <span class="tag">gratuit</span>' : ''}<br><span class="small muted">${esc(p.text)}</span></figcaption>
        </figure>
      </li>`).join('\n      ')}
    </ul>
    <div class="grid2 contents">
      <div>
        <h3>${NB_SYNTHESES} synthèses (DOCX, ODT, PDF)</h3>
        <ul class="checks">
          ${DATA.docs.filter((d) => d.id !== 'D00').map((d) => `<li id="doc-${d.id.toLowerCase()}"><span class="tid">${d.id}</span> ${esc(d.title)}</li>`).join('\n          ')}
        </ul>
        <h3>${SHEETS.length} tableurs avec formules (Excel et LibreOffice)</h3>
        <ul class="tpl">
          ${SHEETS.map((t) => `<li id="doc-${t.id.toLowerCase()}"><span class="tid">${t.id}</span> ${esc(t.title)} <span class="small muted">· ${t.indicators.length ? `ind. ${t.indicators.join(', ')}` : 'les 33 indicateurs'}</span></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h3>${NB_MODELES} modèles éditables (Word et LibreOffice)</h3>
        <p class="small muted">Procédures et outils qualité</p>
        <ul class="tpl">
          ${DATA.templates.map((t) => `<li id="doc-${t.id.toLowerCase()}"><span class="tid">${t.id}</span> ${esc(t.title)} <span class="small muted">· ind. ${t.indicators.join(', ')}</span>${t.sample ? ' <span class="tag">gratuit</span>' : ''}</li>`).join('\n          ')}
        </ul>
        <p class="small muted">Documents administratifs, bilans de compétences, VAE et CFA</p>
        <ul class="tpl">
          ${PACK.map((t) => `<li id="doc-${t.id.toLowerCase()}"><span class="tid">${t.id}</span> ${esc(t.title)} <span class="small muted">· ind. ${t.indicators.join(', ')}</span></li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="wrap section" id="pour-qui" aria-labelledby="who-h">
  <p class="kicker">Pour qui</p>
  <h2 id="who-h">Pour les structures de 1 à 10 personnes sans responsable qualité</h2>
  <ul class="cards cards-3">
    <li class="card"><h3>Organismes de formation</h3><p>Déjà certifiés et audités après le 1er novembre 2026, ou en préparation d'un audit initial.</p></li>
    <li class="card"><h3>CFA</h3><p>Les indicateurs 14, 15 et 20 sont renforcés et l'indicateur 33 est créé. Trois modèles leur sont propres : T08 livret de l'apprenti, T19 gouvernance et partenaires, T17 évaluation des enseignements.</p></li>
    <li class="card"><h3>Bilans de compétences et VAE</h3><p>Les indicateurs communs modifiés (1, 2, 12, 19, 27, 32) vous concernent aussi. La check-list indique ce qui ne s'applique pas à votre activité.</p></li>
  </ul>
  <p class="small muted">Le kit vous servira peu si un responsable qualité ou un consultant a déjà mis vos procédures à jour du décret n° 2026-728 : le tableau des changements, gratuit, suffira pour vérifier son travail.</p>
</section>

<section class="band" id="offre" aria-labelledby="price-h">
  <div class="wrap section offer-grid">
    <div class="offer-copy">
      <p class="kicker">Tarif</p>
      <h2 id="price-h">${PRICE_TAG} une fois, pour tout le kit</h2>
      <p class="lead">Pas d'abonnement ni de rendez-vous. Vous remplissez les modèles vous-même ; le plan d'action compte 1 à 2 heures par jour pendant 21 jours.</p>
    </div>
    ${offerCard}
    <div class="sample-box">
        <p>Avant d'acheter, l'échantillon gratuit contient le tableau des changements et ${templatesFree.length} modèles complets (indicateurs 12, 27 et 32). Sans inscription, sans e-mail.</p>
        <a class="btn btn-ghost" href="${SAMPLE_URL}" download data-mesure="free_download">Télécharger l'échantillon gratuit<span class="btn-sub">ZIP · DOCX, ODT, PDF</span></a>
    </div>
  </div>
</section>

<section class="wrap section" id="faq" aria-labelledby="faq-h">
  <p class="kicker">Questions fréquentes</p>
  <h2 id="faq-h">Avant d'acheter</h2>
  <div class="faq">
    ${faq.map(([q, a], i) => `<details id="faq-${i + 1}"><summary>${esc(q)}</summary><p>${a}</p></details>`).join('\n    ')}
  </div>
  <p>Vous répondez aussi à des marchés publics de formation ? <a href="https://ao-formation.jalonel.com/">Liste gratuite des appels d’offres de formation ouverts</a> (BOAMP et TED).</p>
</section>

<section class="band" id="qui" aria-labelledby="qui-h">
  <div class="wrap section about">
    <div class="about-intro">
      <p class="kicker">Qui sommes-nous</p>
      <h2 id="qui-h">Jalonel, Paris</h2>
      <p>Nous avons écrit ce kit à partir du décret n° 2026-728 et de son annexe, comparés indicateur par indicateur au référentiel de 2019. Le tableau des changements qui en sort est en accès libre depuis le 11 octobre 2026.</p>
    </div>
    <ul class="founders" aria-label="Fondateurs">
      <li class="founder">
        <img class="founder-photo" src="img/tanguy-warsmann.webp" width="112" height="112" alt="Portrait de Tanguy Warsmann" loading="lazy" decoding="async">
        <div><h3 class="founder-name">Tanguy Warsmann</h3><p class="founder-role">Fondateur &amp; CEO</p></div>
        <p class="founder-bio">Formé aux lettres à la Sorbonne puis à emlyon business school, il a travaillé chez Cartier, puis chez AR/Factory, où il a piloté la stratégie de contenus shopping de médias comme Ouest-France, 20 Minutes et Le Figaro.</p>
      </li>
      <li class="founder">
        <img class="founder-photo" src="img/vincent-cance.webp" width="112" height="112" alt="Portrait de Vincent Cance" loading="lazy" decoding="async">
        <div><h3 class="founder-name">Vincent Cance</h3><p class="founder-role">Cofondateur &amp; CTO</p></div>
        <p class="founder-bio">Développeur full stack web et mobile, il a été cofondateur et CTO de Genipatient, un logiciel de gestion de cabinet pour ostéopathes.</p>
      </li>
    </ul>
    <div class="about-foot">
      <p class="small muted">Jalonel est une marque de READ FRANCE SAS, SAS au capital de 1 000 € · 11 rue Rouvet, 75019 Paris · SIREN 988 741 773 · <a href="mentions-legales.html">mentions légales</a></p>
      <div class="contact-card">
        <p>Une question avant d'acheter ? Écrivez-nous. Octave, l'assistant IA de Jalonel, répond ou transmet votre message à l'un des deux fondateurs.</p>
        <a class="btn btn-ghost" href="${MAILTO}">${CONTACT}</a>
      </div>
    </div>
  </div>
</section>

<section class="wrap section" id="sources" aria-labelledby="src-h">
  <h2 id="src-h">Sources officielles</h2>
  ${sourcesList()}
  <p class="small muted">Contenu vérifié le 11 octobre 2026 ; statut du guide de lecture vérifié le 12 octobre 2026.</p>
</section>
<script>
(function () {
  // J-xx jusqu'au 1er novembre 2026, compté en jours calendaires à Paris.
  var el = document.getElementById('jours');
  if (!el) return;
  var parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-');
  var today = Date.UTC(+parts[0], +parts[1] - 1, +parts[2]);
  var d = Math.round((Date.UTC(2026, 10, 1) - today) / 86400000);
  if (d > 0) { el.innerHTML = 'J-' + d + '<span class="sr"> (dans ' + d + (d > 1 ? ' jours' : ' jour') + ')</span>'; }
  else { el.textContent = 'En vigueur'; }
  el.hidden = false;
})();
</script>
`;

// Organisation : la marque Jalonel (hub https://jalonel.com/), marque de READ FRANCE SAS, référencée par son @id.
const ORG_ID = 'https://jalonel.com/#org';
const ORG_REF = { '@type': 'Organization', '@id': ORG_ID, name: 'Jalonel', url: 'https://jalonel.com/', parentOrganization: { '@type': 'Organization', name: 'READ FRANCE SAS', identifier: 'SIREN 988741773' } };
const webPageLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE}#webpage`,
  url: SITE,
  name: 'Kit Qualiopi V10 : modèles du nouveau référentiel Qualiopi 2026',
  inLanguage: 'fr',
  publisher: ORG_REF,
};
// Product + Offer seulement quand la vente est ouverte (pas de prix « disponible » dans les résultats de recherche sinon).
// Prix dérivé de sales.config.json (montant en centimes) ; franchise en base : prix net, pas de valueAddedTaxIncluded.
const productLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: BRAND,
  description: `Kit documentaire pour le nouveau référentiel national qualité Qualiopi applicable au 1er novembre 2026 (décret n° 2026-728, 33 indicateurs) : check-list des preuves, tableau des changements V9 → V10, ${NB_MODELES} modèles DOCX et ODT, ${SHEETS.length} tableurs XLSX et ODS. Vendu aux professionnels.${PRICE.std ? '' : ' Prix net, TVA non applicable (art. 293 B du CGI).'}`,
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
const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: stripTags(a) } })) };

// ---------------------------------------------------------------- Tableau des changements
// Table row → detail: the indicator page once it exists (indicateurs/indicateur-N.html), else the section on this page.
const indicatorLink = (i) => {
  if (INDICATOR_PAGES.has(i.n)) return `<a href="${indicatorHref(i.n)}">${esc(i.titre)}</a>`;
  return changed.includes(i) ? `<a href="#indicateur-${i.n}">${esc(i.titre)}</a>` : esc(i.titre);
};
const changesBody = `
<section class="wrap section">
  <p class="eyebrow"><a href="./">${BRAND}</a> › Ce qui change</p>
  <h1>Référentiel Qualiopi 2026&nbsp;: ce qui change au 1er novembre, indicateur par indicateur</h1>
  <p class="lead">Le décret n° 2026-728 du 1er août 2026 remplace la liste des indicateurs du référentiel national qualité, souvent appelé « Qualiopi V10 ». Les 7 critères sont inchangés ; on passe de 32 à 33 indicateurs. Ce tableau V9 → V10 donne, pour chaque indicateur modifié, le texte de 2019, celui de 2026 et ce qu'il faut faire.</p>
  <div class="callout" role="note"><p><strong>À savoir.</strong> « V9 » et « V10 » sont des appellations courantes, pas des termes officiels. Les libellés ci-dessous sont des reformulations : le texte publié sur <a href="${esc(DATA.sources[0].url)}" rel="noopener">Légifrance</a> fait foi.</p></div>
  <h2>En bref</h2>
  <ul>
    <li><strong>${modifiedNums.length} indicateurs modifiés sur le fond</strong> : ${modifiedNums.join(', ')}.</li>
    <li><strong>1 indicateur nouveau</strong> : 33, évaluation des contenus et des enseignements par les apprenants.</li>
    <li>1 ajustement mineur (30) ; les autres indicateurs sont inchangés sur le fond.</li>
    <li>Nouveau guide de lecture officiel : ${GUIDE_STATUS}. Arrêtés fixant les seuils des indicateurs 19 et 20 : non publiés au 11 octobre 2026.</li>
  </ul>
  <p>${downloadBtn('Télécharger ce tableau (DOCX, ODT, PDF) + 3 modèles')}</p>

  <h2>Indicateurs modifiés ou nouveaux</h2>
  ${changed.map((i) => `
  <article class="change" id="indicateur-${i.n}">
    <h3><span class="badge ${i.change}">${esc(i.changeLabel)}</span> Indicateur ${i.n}. ${esc(i.titre)}</h3>
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
    <caption class="sr">Statut de chaque indicateur au 1er novembre 2026 (référentiel V9 → V10)</caption>
    <thead><tr><th scope="col">N°</th><th scope="col">Critère</th><th scope="col">Intitulé (reformulé)</th><th scope="col">Concerne</th><th scope="col">Statut</th></tr></thead>
    <tbody>
    ${DATA.indicators.map((i) => `<tr><td>${i.n}</td><td>${i.critere}</td><td>${indicatorLink(i)}</td><td>${esc(i.scope)}</td><td><span class="badge ${i.change}">${esc(i.changeLabel)}</span></td></tr>`).join('\n    ')}
    </tbody>
  </table>
  </div>

  <h2>Les 7 critères (inchangés)</h2>
  <ol>${DATA.criteria.map((c) => `<li>${esc(c.title)} (indicateurs ${c.range[0]} à ${c.range[1]})</li>`).join('')}</ol>

  <h2>Guides pratiques</h2>
  ${guideLinksHtml()}

  <h2>Points encore en attente</h2>
  <ul>${DATA.pending.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>

  <h2>Sources officielles</h2>
  ${sourcesList()}
  <p class="small muted">Analyse établie le 11 octobre 2026 par Jalonel (READ FRANCE SAS). Information, pas un conseil juridique.</p>
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
  Contact : <a href="${MAILTO}">${CONTACT}</a><!-- TODO phone --></p>
  <p>Jalonel est une marque de READ FRANCE SAS.</p>
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
  <p><strong>En résumé : ce site ne collecte aucune donnée personnelle.</strong> Il n'utilise ni cookie, ni traceur tiers, ni formulaire ; la seule mesure, de l'audience et de l'utilisation du site, est anonyme, agrégée et sans cookie (voir ci-dessous). C'est pourquoi aucun bandeau de consentement n'est affiché.</p>
  <h2>Ce que fait l'éditeur</h2>
  <p>READ FRANCE SAS ne dépose aucun cookie et ne reçoit aucune donnée personnelle vous concernant lorsque vous consultez ce site ou téléchargez l'échantillon. Nous consultons le <strong>nombre total de téléchargements</strong> du fichier, fourni par GitHub de manière agrégée et anonyme, et la mesure d'audience et du comportement, anonyme et agrégée, décrite ci-dessous.</p>
  <h2>Mesure d'audience et du comportement sur le site</h2>
  <p>Nous mesurons la fréquentation de ce site et la façon dont il est utilisé, de façon agrégée, pour l'améliorer : pages vues, clics vers la page de commande et étapes de la commande, avec le domaine du site d'origine et les paramètres de campagne (utm) éventuels ; profondeur de défilement, sections de la page atteintes, temps écoulé avant le premier clic sur un bouton, formulaires commencés ou envoyés et le <strong>nom</strong> du dernier champ utilisé (jamais son contenu), questions de la FAQ ouvertes, liens sortants (seulement le nom de domaine du site visé), erreurs techniques (une empreinte anonyme du message d'erreur), vitesse d'affichage (Core Web Vitals) et clics répétés au même endroit. Seuls des <strong>totaux journaliers</strong> sont conservés, dans un tableur de READ FRANCE hébergé par Google.</p>
  <p>Cette mesure ne dépose aucun cookie, n'utilise aucun identifiant, ne conserve pas votre adresse IP et ne collecte aucune donnée personnelle. Elle ne vous suit pas d'un site à l'autre, n'est ni partagée ni vendue, et ne sert qu'aux statistiques propres à ce site. Les robots d'indexation et les navigateurs automatisés (reconnus dans votre navigateur, sans que sa signature soit transmise) sont comptés à part ou pas du tout, et une page préchargée n'est comptée que si vous l'ouvrez.</p>
  <p><strong>Tests A/B.</strong> Il peut arriver que des visiteurs voient une version différente d'un titre, d'un bouton ou d'un prix, pour comparer les versions. La lettre de la version affichée est gardée dans le stockage de session de l'onglet (<em>sessionStorage</em>, effacé à la fermeture de l'onglet) ou choisie selon la date (sans rien stocker) ; elle n'est jamais rattachée à une personne. Le prix facturé est toujours celui qui est affiché.</p>
  <p><strong>Vous opposer à la mesure.</strong> Si votre navigateur envoie le signal « Do Not Track » ou « Global Privacy Control », aucune mesure n'est faite.</p>
  <p><strong>Exemption de consentement.</strong> Strictement limitée à des statistiques agrégées propres à ce site, sans suivi d'un site à l'autre, sans recoupement avec d'autres traitements et sans transmission à des tiers, cette mesure entre dans l'exemption prévue pour la mesure d'audience par l'article 82 de la loi Informatique et Libertés, telle que précisée par les lignes directrices et la recommandation de la CNIL du 17 septembre 2020 relatives aux cookies et autres traceurs. C'est pourquoi aucun bandeau de consentement n'est affiché.</p>
  <h2>Ce que fait l'hébergeur</h2>
  <p>Le site est hébergé par GitHub Pages et le fichier est distribué par GitHub Releases (GitHub, Inc.). Comme tout hébergeur, GitHub traite des données techniques de connexion (dont l'adresse IP) pour fournir le service et en assurer la sécurité, selon sa propre <a href="https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement">déclaration de confidentialité</a>.</p>
  <h2>Contact par e-mail</h2>
  <p>Si vous nous écrivez à <a href="${MAILTO}">${CONTACT}</a>, votre adresse et votre message servent uniquement à vous répondre. Vous pouvez demander leur suppression à la même adresse.</p>
  ${OPEN ? `<h2>Commandes du kit complet</h2>
  <p>La page <a href="commander.html">Commander</a> est la seule à collecter des données, lors d'une commande par carte ou d'une demande de devis : adresse e-mail, raison sociale, SIREN et adresse de facturation de l'entreprise acheteuse, et sa référence interne éventuelle, pour établir et suivre le devis, exécuter la commande, établir la facture et effectuer les remboursements. Le paiement par carte est traité par Stripe, qui charge son module de paiement (et ses cookies de sécurité anti-fraude) sur cette page uniquement.</p>
  <p>En cas de paiement par virement sur devis, nous recevons de Stripe les données que votre banque transmet avec le virement : nom du titulaire du compte émetteur, BIC, quatre derniers chiffres de l'IBAN, date, montant et libellé du virement. Stripe traite aussi certaines de ces données pour son propre compte (prévention de la fraude, lutte contre le blanchiment), selon sa politique de confidentialité.</p>
  <p>Durées de conservation : factures et pièces comptables, y compris les données du virement qui s'y rapportent, 10 ans ; autres données de commande, 5 ans après la commande ; devis non suivis de commande, 1 an après leur expiration. Destinataires, bases légales et droits : voir l'article 13 des <a href="cgv-pro.html">CGV professionnels</a>.</p>` : `<h2>Ventes futures</h2>
  <p>La vente du kit complet n'est pas ouverte. Les traitements prévus pour les devis et les commandes (données de devis, de commande et de facturation, données de virement transmises par Stripe, prestataire de paiement Stripe, durées de conservation, dont 1 an après leur expiration pour les devis non suivis de commande, droits d'accès, de rectification et d'effacement, réclamation auprès de la CNIL) sont décrits à l'article 13 des <a href="cgv-pro.html">CGV professionnels</a>.</p>`}
  <p class="small muted">Dernière mise à jour : 13 octobre 2026.</p>
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
  payLabel: PAY_LABEL,
  contact: `par e-mail à <a href="${MAILTO}">${CONTACT}</a>, ou en répondant à l'e-mail de livraison de la commande`,
  legalUrl: 'mentions-legales.html',
  privacyUrl: 'confidentialite.html',
  productDescription: `« ${BRAND} » : kit documentaire relatif au référentiel national qualité applicable au 1er novembre 2026 (décret n° 2026-728 du 1er août 2026, 33 indicateurs), comprenant ${NB_SYNTHESES} synthèses (DOCX, ODT, PDF), dont une check-list des 33 indicateurs et un tableau des changements, ${NB_MODELES} modèles éditables (DOCX, ODT) et ${SHEETS.length} tableurs (XLSX, ODS), tels que décrits sur la <a href="./#contenu-kit">page de présentation</a> à la date de la commande.`,
  licenceScope: `l'Acheteur peut copier les fichiers, modifier les modèles et les utiliser dans tous ses établissements, pour son propre organisme de formation, CFA ou centre de bilans de compétences ou de VAE.`,
  updates: `Une mise à jour du kit établie après la publication du guide de lecture officiel du référentiel 2026 est envoyée sans frais à l'adresse électronique de commande si elle paraît dans les 12 mois suivant la commande.`,
  disclaimer: [
    `Le kit est un <strong>outil d'information et d'organisation</strong>. Il ne constitue ni un conseil juridique, ni une prestation d'accompagnement, de conseil ou d'audit, et <strong>ne garantit pas l'obtention, le maintien ou le renouvellement de la certification Qualiopi</strong> : seul l'organisme certificateur décide, après audit.`,
    `Le kit est indépendant : il n'est ni édité, ni validé, ni approuvé par l'État, France compétences, le COFRAC ou un organisme certificateur. « Qualiopi » est une marque de l'État ; le kit n'en utilise pas le logo. Les libellés des indicateurs sont des reformulations : le texte publié au Journal officiel et le guide de lecture officiel font foi.`,
    `Le contenu est à jour à sa date de version. Le guide de lecture officiel et les arrêtés d'application attendus peuvent préciser ou modifier les attentes ; il appartient à l'Acheteur de vérifier les textes applicables et de les confirmer avec son organisme certificateur.`,
  ],
})}
</section>`;

// Page Commander : récapitulatif (aperçu réel, contenu, échantillon), vendeur, garantie de l'article 10 près du bouton,
// trois questions d'achat. Textes de garantie et de licence repris des CGV (articles 7, 8 et 10), sans ajout.
const recapShot = PREVIEWS.find((p) => p.id === "D02") || PREVIEWS[0];
const commanderPage = `
<section class="wrap section" id="commande">
  <p class="eyebrow"><a href="./">${BRAND}</a> › Commander</p>
  <h1>Commander le ${BRAND}</h1>
  <p class="lead">${NB_SYNTHESES} synthèses (DOCX, ODT, PDF), ${NB_MODELES} modèles éditables (DOCX, ODT) et ${SHEETS.length} tableurs (XLSX, ODS) pour le référentiel Qualiopi applicable au 1er novembre 2026. ${PRICE.sentence}.</p>
  <div class="card order-recap" data-section="recap">
    <a class="order-recap-shot" href="img/${recapShot.file}">${img(recapShot, { lazy: false })}</a>
    <div>
      <p><strong>Ce que vous recevez par e-mail, dès le paiement</strong></p>
      <ul class="checks">
        <li>La check-list des preuves des 33 indicateurs (page ci-contre) et le plan d'action en 21 jours</li>
        <li>${NB_MODELES} modèles Word et LibreOffice, ${SHEETS.length} tableurs avec formules</li>
        <li>La mise à jour sans frais si le guide de lecture officiel paraît dans les 12 mois</li>
        <li>La facture acquittée au nom et au SIREN de votre organisme</li>
      </ul>
      <p class="small muted">Pas encore sûr ? <a href="${SAMPLE_URL}" download data-mesure="free_download">Téléchargez l'échantillon gratuit</a> : tableau des changements et ${templatesFree.length} modèles complets, sans e-mail.</p>
    </div>
  </div>
  ${orderFormHtml({ config: SALES, productName: BRAND, cgvUrl: 'cgv-pro.html', payLabel: PAY_LABEL,
    afterTermsHtml: `  <p class="small order-guarantee">Fichier illisible, incomplet ou non conforme à la description ? Signalez-le sous 30 jours : nous le remplaçons ou, à défaut, vous remboursons (<a href="cgv-pro.html">article 10 des CGV</a>). Vente entre professionnels : pas de droit de rétractation (article 7).</p>\n` })}
  <p class="small muted order-seller">Vendeur : READ FRANCE SAS (marque Jalonel), 11 rue Rouvet, 75019 Paris, SIREN 988 741 773 · <a href="mentions-legales.html">mentions légales</a> · contact ${mail}</p>
</section>
<section class="wrap section" id="questions-commande" aria-labelledby="qc-h">
  <h2 id="qc-h">Trois questions avant de payer</h2>
  <details><summary>Combien de personnes peuvent utiliser le kit ?</summary><p>Tout votre organisme : vous pouvez copier les fichiers, modifier les modèles et les utiliser dans tous vos établissements. La revente et la diffusion à d'autres entreprises sont exclues (article 8 des CGV).</p></details>
  <details><summary>Et quand le guide de lecture officiel paraîtra ?</summary><p>La mise à jour du kit établie après sa publication vous est envoyée sans frais, à l'adresse e-mail de commande, si elle paraît dans les 12 mois suivant votre achat (article 10 des CGV).</p></details>
  <details><summary>Mon service achats veut un devis ou une facture.</summary><p>${QUOTES ? 'Le bloc « Besoin d’un devis ou paiement par virement ? » ci-dessus envoie un devis PDF valable 30 jours, avec IBAN et référence de virement. ' : ''}La facture acquittée part par e-mail avec les fichiers, au nom et au SIREN indiqués (articles 5 et 12 des CGV).</p></details>
</section>`;

const orderPage = `
<section class="wrap section" id="confirmation">
  ${orderPageBody()}
  <p class="small muted">Une question sur la commande : répondez à l'e-mail de livraison ou écrivez à ${mail}. <a href="./">Retour à l'accueil du ${BRAND}</a></p>
</section>`;

const notFoundBody = `<section class="wrap section"><h1>Page introuvable</h1><p><a href="./">Retour à l'accueil du ${BRAND}</a></p></section>`;

// ---------------------------------------------------------------- Écriture
mkdirSync(OUT, { recursive: true });
const pages = [
  { path: '', file: 'index.html', title: 'Kit Qualiopi V10 : modèles du nouveau référentiel Qualiopi 2026', description: `Nouveau référentiel Qualiopi 2026 : check-list des 33 indicateurs, tableau V9 → V10, ${NB_MODELES} modèles Word et LibreOffice et ${SHEETS.length} tableurs prêts à adapter. Échantillon gratuit.`, body: indexBody, jsonld: OPEN ? [webPageLd, productLd, faqLd] : [webPageLd, faqLd], priority: '1.0' },
  { path: 'changements-v9-v10.html', file: 'changements-v9-v10.html', title: 'Nouveau référentiel Qualiopi 2026 : ce qui change au 1er novembre (V10)', description: `Nouveau référentiel Qualiopi 2026 : les ${modifiedNums.length} indicateurs modifiés et le nouvel indicateur 33, avant / après et actions à mener. Source : décret n° 2026-728.`, body: changesBody, jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'Référentiel Qualiopi 2026 : ce qui change au 1er novembre, indicateur par indicateur', datePublished: PUBLISHED, dateModified: LASTMOD, inLanguage: 'fr', author: ORG_REF, publisher: ORG_REF }], priority: '0.9' },
  { path: 'mentions-legales.html', file: 'mentions-legales.html', title: 'Mentions légales — Kit Qualiopi V10', description: 'Éditeur, hébergeur et propriété intellectuelle du site Kit Qualiopi V10 (READ FRANCE SAS).', body: mentionsBody, priority: '0.2' },
  { path: 'confidentialite.html', file: 'confidentialite.html', title: 'Confidentialité — Kit Qualiopi V10', description: 'Aucun cookie, aucune donnée personnelle collectée par le site Kit Qualiopi V10, mesure d\'audience anonyme uniquement.', body: privacyBody, priority: '0.2' },
  { path: 'cgv-pro.html', file: 'cgv-pro.html', title: 'Conditions générales de vente aux professionnels — Kit Qualiopi V10', description: 'CGV B2B du Kit Qualiopi V10 (READ FRANCE SAS), version du 13 octobre 2026 : vente aux professionnels, prix, paiement par carte ou par virement sur devis (Stripe), livraison par e-mail, licence, facturation.', body: cgvProPage, priority: '0.2', noindex: !OPEN },
  { path: 'cgv.html', file: 'cgv.html', title: 'Conditions générales de vente — Kit Qualiopi V10', description: 'Le Kit Qualiopi V10 est vendu uniquement aux professionnels : voir les conditions générales de vente aux professionnels.', body: cgvBody, priority: '0.1', noindex: true },
  ...(OPEN
    ? [
        { path: 'commander.html', file: 'commander.html', title: 'Commander le Kit Qualiopi V10 (vente aux professionnels)', description: `Commande du Kit Qualiopi V10 par les entreprises (SIREN) : ${PRICE.sentence}, paiement par carte avec Stripe${QUOTES ? ' ou par virement sur devis' : ''}, fichier et facture par e-mail.`, body: commanderPage, noindex: true, head: `<meta http-equiv="Content-Security-Policy" content="${checkoutCsp(SALES)}">\n`, tail: `<script src="checkout/checkout-config.js"></script>\n<script src="https://js.stripe.com/v3/"></script>\n<script src="checkout/pay.js"></script>\n${QUOTES ? '<script src="checkout/devis.js"></script>\n' : ''}` },
        { path: 'commande.html', file: 'commande.html', title: 'Votre commande du Kit Qualiopi V10', description: 'Confirmation de la commande du Kit Qualiopi V10 : envoi du fichier et de la facture par e-mail.', body: orderPage, noindex: true, head: `<meta http-equiv="Content-Security-Policy" content="${orderCsp(SALES)}">\n<meta name="referrer" content="no-referrer">\n`, tail: '<script src="checkout/checkout-config.js"></script>\n<script src="checkout/order.js"></script>\n' },
      ]
    : []),
];
// Clean previous buy-UI output so that closing the sales removes it from docs/.
for (const f of ['commander.html', 'commande.html', 'checkout']) rmSync(join(OUT, f), { recursive: true, force: true });
pages.push(...seoPages({ DATA, SITE, OPEN, PRICE_TAG, PRICE_NOTE: priceNote, ORG_ID, ORG_REF, MAILTO, CONTACT, SAMPLE_URL, esc }));
rmSync(join(OUT, 'indicateurs'), { recursive: true, force: true });
for (const p of pages) {
  if (p.file.includes('/')) mkdirSync(join(OUT, p.file, '..'), { recursive: true });
  writeFileSync(join(OUT, p.file), rebase(layout(p), p.prefix));
}
if (OPEN) {
  mkdirSync(join(OUT, 'checkout'), { recursive: true });
  for (const f of ['pay.js', 'order.js', 'devis.js']) copyFileSync(join(ROOT, 'src', 'checkout', f), join(OUT, 'checkout', f));
  writeFileSync(join(OUT, 'checkout', 'checkout-config.js'), checkoutConfigJs(SALES, { termsUrl: `${SITE}cgv-pro.html`, orderPage: 'commande.html', payLabel: PAY_LABEL }));
}
writeFileSync(join(OUT, '404.html'), layout({ path: '404.html', title: 'Page introuvable — Kit Qualiopi V10', description: 'Page introuvable.', body: notFoundBody, noindex: true }));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${p.lastmod ?? LASTMOD}</lastmod><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
writeFileSync(join(OUT, '.nojekyll'), '');
// Domaine personnalisé GitHub Pages (build legacy, dossier /docs) et clé IndexNow servie à la racine.
writeFileSync(join(OUT, 'CNAME'), `${new URL(SITE).host}\n`);
const INDEXNOW_KEY = '5be19f56d46ca3d2553bee28ebfa8edd';
writeFileSync(join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
for (const f of ['styles.css', 'favicon.svg', 'mesure.js', 'cro.js', 'cro-goals.js', 'guides.css', 'guides.js']) copyFileSync(join(ROOT, 'src', f), join(OUT, f));
// Échantillon gratuit servi depuis le site (page modeles-qualiopi-gratuits.html), en plus de la Release GitHub.
rmSync(join(OUT, 'telechargements'), { recursive: true, force: true });
mkdirSync(join(OUT, 'telechargements'), { recursive: true });
for (const f of FREE_FILES) copyFileSync(join(ROOT, 'src/telechargements', f), join(OUT, 'telechargements', f));
if (existsSync(join(ROOT, 'src/og.png'))) copyFileSync(join(ROOT, 'src/og.png'), join(OUT, 'og.png'));
// Aperçus du kit (WebP rendus depuis les vrais documents du dépôt de contenu).
cpSync(join(ROOT, 'src/img'), join(OUT, 'img'), { recursive: true });
console.log(`site généré dans ${OUT} (${pages.length + 1} pages, ventes ${OPEN ? 'OUVERTES' : 'fermées'}) — échantillon : ${SAMPLE_URL}`);
