// P4 : modèles Qualiopi gratuits. Les fichiers de l'échantillon (dépôt qualiopi-kit-content, dist/, identiques à la Release
// GitHub echantillon-v1.1.0) sont servis depuis outils.vread.fr/kit-qualiopi-v10/telechargements/.
// Les PDF des modèles T07, T13 et T16 sont convertis des DOCX par LibreOffice (voir README).
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { SRC, frDate, CHECKED, GUIDE_IS, indicatorHref, guideLinksHtml, kitInventory, docLink } from './seo-pages.mjs';

const DL = 'telechargements/';
const ROOT = join(import.meta.dirname, '..');
const size = (f) => { const k = statSync(join(ROOT, 'src', DL, f)).size / 1024; return k >= 1000 ? `${(k / 1024).toFixed(1).replace('.', ',')} Mo` : `${Math.round(k)} Ko`; };
const FORMATS = { pdf: 'PDF', docx: 'Word', odt: 'LibreOffice' };

export const FREE_FILES = [
  'D01-tableau-changements-v9-v10.pdf', 'D01-tableau-changements-v9-v10.docx', 'D01-tableau-changements-v9-v10.odt',
  ...['T07-procedure-violences-ruptures', 'T13-clause-qualite-sous-traitance', 'T16-amelioration-continue-risques'].flatMap((b) => ['docx', 'odt', 'pdf'].map((e) => `${b}.${e}`)),
];

export function pageModeles(ctx, kit) {
  const { DATA, SAMPLE_URL, esc } = ctx;
  const path = 'modeles-qualiopi-gratuits.html';
  const links = (base, order = ['docx', 'odt', 'pdf']) => `<p class="dl-links">${order.map((e) => `<a href="${DL}${base}.${e}" download data-mesure="free_download">${FORMATS[e]} <small>.${e} · ${size(`${base}.${e}`)}</small></a>`).join('')}</p>`;
  const inv = kitInventory(DATA);
  const paidQuality = DATA.templates.filter((t) => !t.sample);
  const pack = DATA.pack ?? [];
  const nbPaid = inv.models.filter((t) => !t.sample).length;
  const lc = (t) => `${t.id} ${esc(t.title.charAt(0).toLowerCase() + t.title.slice(1))}`;
  const img = (file, alt, w, h) => `<figure><a href="img/${file}"><img src="img/${file}" width="${w}" height="${h}" alt="${esc(alt)}" loading="lazy" decoding="async"></a></figure>`;

  const body = `
<article class="wrap section article">
  ${kit.crumbs([['Kit Qualiopi V10', './'], ['Modèles gratuits', '']])}
  <h1>Modèles Qualiopi gratuits, à jour du référentiel 2026</h1>
  ${kit.byline()}
  <p class="answer">Trois modèles complets et notre tableau des changements du référentiel 2026, en Word, LibreOffice et PDF, à télécharger ici sans inscription ni adresse e-mail. Les trois modèles couvrent des indicateurs réécrits par le décret du 1er août 2026 : <a href="${indicatorHref(12)}">12</a> (violences, harcèlement, discriminations), <a href="${indicatorHref(27)}">27</a> (sous-traitance et portage) et <a href="${indicatorHref(32)}">32</a> (amélioration continue et analyse des risques).</p>
  <p>Ce sont les fichiers de l'échantillon gratuit, version 1.1.0 du 13 octobre 2026. Vous pouvez les utiliser et les adapter librement pour votre organisme ; merci de ne pas les revendre.</p>

  <h2 id="tableau">Le tableau des changements 2019 → 2026</h2>
  <div class="dl">
    ${img('apercu-d01-tableau-changements.webp', 'Tableau des changements D01, page 1 : encadré « À lire d\'abord », synthèse en 5 points, puis le tableau avant / après de l\'indicateur 1.', 760, 538)}
    <div>
      <p>9 pages au format paysage. Pour chacun des 12 indicateurs qui évoluent : l'avant (2019), l'après (2026), ce qu'il faut faire et à qui l'indicateur s'applique. Suivent la vue d'ensemble des 33 indicateurs, les 7 critères et les points encore en attente au 11 octobre 2026.</p>
      ${links('D01-tableau-changements-v9-v10', ['pdf', 'docx', 'odt'])}
      <p class="small muted">Ce tableau est notre lecture, avec des libellés reformulés. Il ne remplace pas le texte officiel : le <a href="${SRC.decret.url}" rel="noopener">décret n° 2026-728 sur Légifrance</a>, ou <a href="${SRC.decretPdf.url}" rel="noopener">sa version PDF sur le site du ministère du Travail</a>, fait foi. La même analyse se lit en ligne : <a href="changements-v9-v10.html">ce qui change au 1er novembre</a>.</p>
    </div>
  </div>

  <h2 id="t07">T07 · Procédure violences, harcèlement, discriminations et ruptures (indicateur 12)</h2>
  <div class="dl">
    ${img('apercu-t07-procedure-violences.webp', 'Modèle T07 ouvert à la page 1 : objet, champ d\'application, rôles et prévention.', 760, 1075)}
    <div>
      <p>Le décret ajoute à l'indicateur 12 une phrase nouvelle : le prestataire « s'assure de la prévention et du traitement de toute situation de violence, dont les violences sexistes et sexuelles, de harcèlement ou de discrimination ». Il faut donc une procédure écrite, connue des bénéficiaires.</p>
      <p>Le modèle en 9 parties : objet, rôles, prévention (information, sensibilisation des intervenants, prévention des abandons), signalement, traitement, recours externes, confidentialité, registre confidentiel des signalements, revue. Le tableau des recours donne les numéros nationaux (17, 112, 114, 3919, 119, 3928) ; vérifiez-les à chaque mise à jour.</p>
      ${links('T07-procedure-violences-ruptures')}
      <p class="small">À adapter avant tout : le nom du référent, un second canal de signalement qui ne passe pas par une personne mise en cause, vos délais de traitement.</p>
    </div>
  </div>

  <h2 id="t13">T13 · Clause et annexe qualité pour la sous-traitance (indicateur 27)</h2>
  <div class="dl">
    ${img('apercu-t13-clause-qualite.webp', 'Début du modèle T13 : clause « Qualité des prestations » en 6 points, puis le tableau des obligations et preuves attendues.', 760, 1075)}
    <div>
      <p>En 2019, le donneur d'ordre devait s'assurer que son sous-traitant respectait le référentiel. Depuis le décret de 2026, il doit aussi « en assure[r] la traçabilité dans les contrats de sous-traitance ». Le modèle contient :</p>
      <ul>
        <li>une clause en 6 points à insérer dans chaque contrat (ou par avenant) ;</li>
        <li>une annexe qui liste, exigence par exigence, l'indicateur concerné, qui fait quoi, la preuve à fournir et le délai ;</li>
        <li>les modalités de contrôle et un tableau interne de vos sous-traitants et salariés portés.</li>
      </ul>
      ${links('T13-clause-qualite-sous-traitance')}
      <p class="small">Faites relire la version finale par votre conseil, en particulier les clauses de responsabilité et de résiliation.</p>
    </div>
  </div>

  <h2 id="t16">T16 · Plan d'amélioration continue et analyse des risques (indicateur 32)</h2>
  <div class="dl">
    ${img('apercu-t16-amelioration-continue.webp', 'Plan d\'amélioration du modèle T16 au format paysage, avec les colonnes « indicateur d\'efficacité » et « efficacité vérifiée ».', 760, 538)}
    <div>
      <p>Le décret fait passer l'indicateur 32 des « mesures d'amélioration » à « une démarche d'amélioration continue », complétée par « une analyse des risques sur la qualité des formations ». Le modèle réunit les deux, au format paysage :</p>
      <p>un plan d'amélioration dont les deux dernières colonnes (efficacité vérifiée, résultat) sont celles que l'auditeur regarde ; une cartographie de 10 risques déjà rédigés, du risque d'information publiée inexacte au risque d'évolution réglementaire non prise en compte, avec une cotation probabilité × gravité ; une revue des risques et un bilan annuel.</p>
      ${links('T16-amelioration-continue-risques')}
    </div>
  </div>
  <p>Tout l'échantillon en un fichier, avec un lisez-moi : <a href="${SAMPLE_URL}" download data-mesure="free_download">archive ZIP de l'échantillon</a> (hébergée sur GitHub).</p>

  <h2 id="officiel">Les ressources officielles, gratuites elles aussi</h2>
  <p>Avant tout modèle, ces textes font référence. Tous sont publics.</p>
  <ul>
    <li><a href="${SRC.decret.url}" rel="noopener">Décret n° 2026-728 du 1er août 2026</a> sur Légifrance, avec le tableau officiel des 33 indicateurs. C'est le « référentiel Qualiopi 2026 en PDF » que beaucoup cherchent : le ministère du Travail en publie une <a href="${SRC.decretPdf.url}" rel="noopener">version PDF</a>.</li>
    <li><a href="${SRC.guideV9.url}" rel="noopener">Guide de lecture V9 du 8 janvier 2024</a> (PDF) : niveau attendu et exemples de preuves pour chaque indicateur du référentiel de 2019. Le guide du référentiel 2026 ${GUIDE_IS}.</li>
    <li><a href="${SRC.qr.url}" rel="noopener">Questions-réponses du ministère sur la certification qualité</a>, version 2 (PDF).</li>
    <li><a href="${SRC.arrete.url}" rel="noopener">Arrêté du 6 juin 2019 sur les modalités d'audit</a> : durées, audits de surveillance et de renouvellement, traitement des non-conformités.</li>
    <li><a href="${SRC.liste.url}" rel="noopener">Liste publique des organismes de formation</a> sur data.gouv.fr, pour vérifier les catégories d'actions inscrites sur votre certificat.</li>
  </ul>

  <h2 id="kit">Ce que le kit payant ajoute</h2>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Comparaison échantillon gratuit et kit complet">
  <table class="cmp">
    <thead><tr><th scope="col">Contenu</th><th scope="col">Gratuit</th><th scope="col">Kit complet</th></tr></thead>
    <tbody>
      <tr><td>Tableau des changements 2019 → 2026 (D01)</td><td>inclus</td><td>inclus</td></tr>
      <tr><td>Modèles T07, T13, T16 (indicateurs 12, 27, 32)</td><td>inclus</td><td>inclus</td></tr>
      <tr><td>${paidQuality.length} autres procédures et outils qualité, dont T17 pour l'<a href="${indicatorHref(33)}">indicateur 33</a></td><td>–</td><td>inclus</td></tr>
      <tr><td>${pack.length} documents administratifs et variantes : convention, ${docLink(inv, 'T24', esc).replace(/>T24 /, '>')}, ${docLink(inv, 'T26', esc).replace(/>T26 /, '>')}, bilans de compétences, VAE, CFA</td><td>–</td><td>inclus</td></tr>
      <tr><td>${inv.nbSheets} tableurs avec formules, Excel et LibreOffice (${inv.sheets[0].id} à ${inv.sheets.at(-1).id})</td><td>–</td><td>inclus</td></tr>
      <tr><td>Check-list des preuves des 33 indicateurs (D02)</td><td>–</td><td>inclus</td></tr>
      <tr><td>Check-list de préparation de l'audit (D03)</td><td>–</td><td>inclus</td></tr>
      <tr><td>Plan d'action en 21 jours (D04)</td><td>–</td><td>inclus</td></tr>
      <tr><td>Index des documents par indicateur (D05)</td><td>–</td><td>inclus</td></tr>
      <tr><td>Mise à jour après la publication du guide de lecture 2026 (si elle paraît dans les 12 mois)</td><td>–</td><td>inclus</td></tr>
    </tbody>
  </table>
  </div>
  <p class="small muted">Les ${nbPaid} autres modèles et les ${inv.nbSheets} tableurs. Procédures et outils qualité : ${paidQuality.map(lc).join(' ; ')}. Documents administratifs et variantes : ${pack.map(lc).join(' ; ')}. Tableurs : ${inv.sheets.map(lc).join(' ; ')}. <a href="./#contenu-kit">Le contenu complet du kit</a>.</p>

  <h2 id="adapter">Adapter un modèle : ce que l'auditeur vérifiera</h2>
  <p>Un modèle recopié n'est pas une preuve. L'auditeur regarde la mise en œuvre : le registre des signalements tenu à jour, le contrat de sous-traitance signé avec son annexe, le plan d'amélioration dont la colonne « efficacité vérifiée » est remplie. Quatre réglages suffisent pour partir du bon pied :</p>
  <ol>
    <li>Remplacez chaque zone surlignée « [À compléter] » par vos informations, et supprimez les rubriques qui ne vous concernent pas.</li>
    <li>Datez le document et donnez-lui un numéro de version : c'est ce qui montre qu'il est à jour.</li>
    <li>Diffusez-le à ceux qui doivent l'appliquer (bénéficiaires, intervenants, sous-traitants) et gardez la trace de cette diffusion.</li>
    <li>Prévoyez la date de la prochaine revue, et tenez-la.</li>
  </ol>
  <p>Pour savoir quels indicateurs travailler en premier, faites l'<a href="preparer-audit-qualiopi-2026.html#auto-diagnostic">auto-diagnostic des 33 indicateurs</a> (gratuit, sans inscription).</p>

  ${kit.kitCta({ title: `Les ${inv.nbModels} modèles, ${inv.nbSheets} tableurs et la check-list des 33 indicateurs`, text: `L'échantillon couvre 3 indicateurs. Le kit complet couvre les 33 : ${inv.nbModels} modèles Word et LibreOffice, ${inv.nbSheets} tableurs Excel et LibreOffice, la check-list des preuves indicateur par indicateur, la check-list d'audit et un plan d'action en 21 jours.` })}

  <h2>À lire aussi</h2>
  ${guideLinksHtml(path)}

  ${kit.sources([SRC.decret, SRC.decretPdf, SRC.guideV9, SRC.qr, SRC.arrete])}
  <p class="small muted">Fichiers vérifiés le ${frDate(CHECKED)} : métadonnées limitées à « READ FRANCE SAS », aucune donnée personnelle.</p>
  ${kit.about()}
</article>`;

  return {
    path, file: path, priority: '0.8',
    title: 'Modèles Qualiopi gratuits 2026 : 3 modèles Word et tableau PDF',
    description: 'Modèles Qualiopi gratuits à jour du référentiel 2026 : procédure violences (ind. 12), clause sous-traitance (27), amélioration continue (32) et tableau des changements.',
    body,
    jsonld: [
      kit.articleLd({ path, headline: 'Modèles Qualiopi gratuits, à jour du référentiel 2026', description: 'Trois modèles et le tableau des changements du référentiel Qualiopi 2026 en DOCX, ODT et PDF, sans inscription.', citation: [SRC.decret, SRC.guideV9] }),
      { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Modèles Qualiopi gratuits (référentiel 2026)', itemListElement: [
        ['Tableau des changements 2019 → 2026', 'D01-tableau-changements-v9-v10.pdf', 'application/pdf'],
        ['T07 Procédure violences, harcèlement, discriminations et ruptures', 'T07-procedure-violences-ruptures.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ['T13 Clause et annexe qualité pour la sous-traitance', 'T13-clause-qualite-sous-traitance.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ['T16 Plan d\'amélioration continue et analyse des risques', 'T16-amelioration-continue-risques.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      ].map(([name, f, type], k) => ({ '@type': 'ListItem', position: k + 1, item: { '@type': 'DigitalDocument', name, url: `${ctx.SITE}${DL}${f}`, encodingFormat: type, isAccessibleForFree: true, inLanguage: 'fr', publisher: { '@id': ctx.ORG_ID } } })) },
      kit.breadcrumbLd([['Kit Qualiopi V10', ''], ['Modèles Qualiopi gratuits', path]]),
    ],
  };
}
