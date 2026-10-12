// P5 : Qualiopi au 1er novembre 2026 (date d'application, certificats en cours, guide de lecture).
// L'état des textes vient de src/data/statut-textes.json : le jour où le guide paraît, on met ce fichier à jour,
// la page bascule seule (encadré d'état, chronologie, section guide). Procédure : README.md.
import { SRC, STATUT, frDate, CHECKED, GUIDE_PUBLISHED, GUIDE_STATUS, indicatorHref, guideLinksHtml } from './seo-pages.mjs';

const addMonths = (iso, m) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10); };

export function pageNovembre(ctx, kit) {
  const { esc, DATA } = ctx;
  const path = 'qualiopi-1er-novembre-2026.html';
  const count = (c) => DATA.indicators.filter((i) => i.change === c).length;
  const g = STATUT.guide;
  const pill = (ok, txt) => `<span class="pill ${ok ? 'pill-ok' : 'pill-wait'}">${txt}</span>`;
  const arr = STATUT.arretes;
  const lastmod = STATUT.checked > '2026-10-13' ? STATUT.checked : '2026-10-13';

  const statusRows = [
    ['Décret n° 2026-728 (nouveau référentiel)', `${pill(true, 'publié')} JORF n° 0180 du 4 août 2026, en vigueur le 1er novembre 2026`],
    ['Guide de lecture du référentiel 2026', GUIDE_PUBLISHED
      ? `${pill(true, 'publié')} <a href="${esc(g.url)}" rel="noopener">${esc(g.label)}</a>, diffusé le ${frDate(g.date)}`
      : `${pill(false, 'non publié')} La dernière version officielle reste le <a href="${g.previous.url}" rel="noopener">guide V9 du 8 janvier 2024</a> (page du ministère mise à jour le ${frDate(g.pageUpdated)})`],
    ...arr.map((a) => [`Arrêté prévu par l'indicateur ${a.indicator}`, a.published
      ? `${pill(true, 'publié')} <a href="${esc(a.url)}" rel="noopener">${esc(a.title)}</a>${a.value ? ` : ${esc(a.value)}` : ''}`
      : `${pill(false, 'non publié')} Il doit fixer ${esc(a.object)}`]),
    ['Arrêté sur les modalités d\'audit', STATUT.arreteAudit.amendedFor2026 ? `${pill(true, 'modifié')} <a href="${STATUT.arreteAudit.url}" rel="noopener">voir la version en vigueur</a>` : `${pill(false, 'inchangé')} Dernière modification par l'arrêté du 1er juillet 2025 ; aucune mention de l'indicateur 33`],
  ];

  const guideSection = GUIDE_PUBLISHED
    ? `<p>Le ministère du Travail a publié le ${frDate(g.date)} le <a href="${esc(g.url)}" rel="noopener">${esc(g.label)}</a>. Le guide V9 prévoyait qu'une nouvelle version s'applique aux audits « 2 mois maximum » après sa diffusion ; si le nouveau guide reprend cette règle, il s'applique au plus tard le ${frDate(addMonths(g.date, 2))}. Vérifiez la règle dans son préambule.</p>
  ${g.notes.length ? `<p>Ce qu'il précise, d'après notre première lecture :</p><ul>${g.notes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''}`
    : `<p>Au ${frDate(CHECKED)}, la <a href="${g.page}" rel="noopener">page du ministère du Travail consacrée au guide de lecture</a> propose toujours la V9 du 8 janvier 2024. Cette version commente les 32 indicateurs dans leur rédaction de 2019 : elle ne dit rien de l'indicateur 33, ni des phrases ajoutées en 2026 (violences et harcèlement à l'indicateur 12, traçabilité dans les contrats à l'indicateur 27, analyse des risques à l'indicateur 32…).</p>
  <p>Un guide de lecture donne, pour chaque indicateur, « le niveau attendu », « des exemples de preuves » et des précisions selon les catégories d'actions (préambule du guide V9). Il précise aussi quels indicateurs peuvent donner lieu à une non-conformité mineure. Tant qu'il n'est pas publié, c'est le texte du décret qui fixe ce que l'auditeur peut exiger.</p>
  <p>Quand paraîtra-t-il ? Aucune date n'a été annoncée sur les pages officielles que nous suivons. Le guide V9 prévoyait qu'une nouvelle version s'applique aux audits « 2 mois maximum » après sa diffusion sur le site du ministère. Nous mettrons cette page à jour le jour de la publication.</p>`;

  const mail = `Objet : audit Qualiopi du [date] : référentiel et guide de lecture applicables

Bonjour,

Notre prochain audit [de surveillance / de renouvellement] est prévu le [date]. Pouvez-vous nous confirmer par écrit :

1. le référentiel appliqué : annexe issue du décret n° 2026-728 du 1er août 2026 (en vigueur le 1er novembre 2026) ou annexe de 2019 ;
2. la version du guide de lecture qu'utilisera l'auditeur ;
3. la façon dont seront audités les indicateurs 19 et 20 tant que les arrêtés fixant leurs seuils ne sont pas publiés ;
4. [CFA] le traitement de l'indicateur 33 : peut-il donner lieu à une non-conformité mineure, ou seulement majeure ?
5. les consignes de transition éventuelles pour les certificats en cours.

Merci d'avance,
[Nom, organisme, numéro de certificat]`;

  const faq = [
    ['Le nouveau référentiel Qualiopi s\'applique-t-il dès maintenant ?', 'Non. Le décret n° 2026-728 entre en vigueur le 1er novembre 2026 (article 2). Jusqu\'au 31 octobre 2026, les audits se font sur le référentiel de 2019 et ses 32 indicateurs.'],
    ['Mon certificat Qualiopi reste-t-il valable après le 1er novembre ?', 'Le décret ne touche pas à la durée des certificats ; la certification est délivrée pour trois ans après l\'audit initial. Aucun texte publié ne prévoit de nouvel audit initial du fait du nouveau référentiel. Vos prochains audits de surveillance et de renouvellement se feront en revanche sur le référentiel 2026.'],
    ['Faut-il refaire tous ses documents ?', `Non. Selon notre lecture du décret, ${count('identique')} indicateurs sont inchangés sur le fond et l'indicateur 30 ne change qu'à la marge. Le travail porte sur les ${count('modifie')} indicateurs réécrits et, pour les CFA, sur le nouvel indicateur 33. Le tableau des changements dit, pour chacun, ce qu'il faut ajouter.`],
    ['« Qualiopi V10 », c\'est officiel ?', 'Non. Le décret parle du « référentiel national » ; aucun texte officiel ne l\'appelle « V10 ». L\'expression vient de la numérotation du guide de lecture, dont la dernière version est la V9 du 8 janvier 2024.'],
  ];

  const body = `
<article class="wrap section article">
  ${kit.crumbs([['Kit Qualiopi V10', './'], ['Référentiel 2026', 'changements-v9-v10.html'], ['1er novembre 2026', '']])}
  <h1>Nouveau référentiel Qualiopi : ce qui s'applique, et à partir de quand</h1>
  ${kit.byline(lastmod)}
  <p class="answer">Le référentiel Qualiopi du décret n° 2026-728 s'applique à partir du <strong>1er novembre 2026</strong> (article 2 du décret). Un audit réalisé jusqu'au 31 octobre se fait sur le référentiel de 2019 ; à partir du 1er novembre, sur celui de 2026, audits de surveillance compris. Le décret ne contient aucune mesure transitoire. ${GUIDE_PUBLISHED ? `Le nouveau guide de lecture a été publié le ${frDate(g.date)}.` : `Au ${frDate(CHECKED)}, le nouveau guide de lecture n'est pas publié.`} ${arr.some((a) => !a.published) ? `Les arrêtés prévus par les indicateurs ${arr.filter((a) => !a.published).map((a) => a.indicator).join(' et ')} ne le sont pas non plus.` : ''}</p>

  <section class="statut" aria-labelledby="statut-h">
    <h2 id="statut-h">État des textes au ${frDate(CHECKED)}</h2>
    <table>
      <tbody>
        ${statusRows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('\n        ')}
      </tbody>
    </table>
  </section>

  <h2 id="chronologie">Chronologie</h2>
  <ol class="timeline">
    <li><span class="when">8 juillet 2026</span>Avis de la Commission nationale de la négociation collective, de l'emploi et de la formation professionnelle (visé par le décret).</li>
    <li><span class="when">15 juillet 2026</span>Avis favorable du conseil d'administration de France compétences, après une consultation électronique ouverte le 8 juillet (<a href="${SRC.fc.url}" rel="noopener">délibération n° 2026-07-26</a>).</li>
    <li><span class="when">1er août 2026</span>Signature du décret n° 2026-728.</li>
    <li><span class="when">4 août 2026</span>Publication au Journal officiel n° 0180, texte n° 11 (<a href="${SRC.decret.url}" rel="noopener">Légifrance</a>).</li>
    <li><span class="when">16 septembre 2026</span>Dernière mise à jour de la page « guide de lecture » du ministère du Travail. Au ${frDate(CHECKED)}, elle publie le décret en PDF et propose toujours le guide V9.</li>
    <li><span class="when">1er novembre 2026</span>Entrée en vigueur du nouveau référentiel.</li>
    <li class="${GUIDE_PUBLISHED ? '' : 'todo'}"><span class="when">${GUIDE_PUBLISHED ? frDate(g.date) : 'Date inconnue'}</span>${GUIDE_PUBLISHED ? `Publication du ${esc(g.label)}.` : 'Publication du guide de lecture du référentiel 2026 : aucune date annoncée au jour de notre vérification.'}</li>
  </ol>

  <h2 id="votre-audit">Votre audit est en octobre, en novembre ou en 2027 : quel référentiel ?</h2>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Référentiel selon la date et le type d'audit">
  <table>
    <thead><tr><th scope="col">Votre situation</th><th scope="col">Référentiel appliqué</th><th scope="col">Ce qu'il faut préparer</th></tr></thead>
    <tbody>
      <tr><td>Audit (initial, surveillance, renouvellement) jusqu'au 31 octobre 2026</td><td>2019, 32 indicateurs, guide V9</td><td>Vos preuves habituelles. Commencez les nouveaux documents pour l'audit suivant.</td></tr>
      <tr><td>Audit de surveillance à partir du 1er novembre 2026</td><td>2026, 33 indicateurs</td><td>L'audit vérifie que « le référentiel en vigueur est toujours appliqué » (arrêté du 6 juin 2019, article 2). Les indicateurs 1 et 19, réécrits, font partie de la revue minimale.</td></tr>
      <tr><td>Audit de renouvellement à partir du 1er novembre 2026</td><td>2026, 33 indicateurs</td><td>Il suit le déroulement d'un audit initial : tous les indicateurs applicables sont audités.</td></tr>
      <tr><td>Audit initial à partir du 1er novembre 2026</td><td>2026, 33 indicateurs</td><td>Tous les indicateurs applicables, avec les règles adaptées aux nouveaux entrants pour certains d'entre eux.</td></tr>
    </tbody>
  </table>
  </div>
  <p>Ce que l'auditeur regarde à chaque type d'audit, et le calendrier de préparation : <a href="preparer-audit-qualiopi-2026.html">préparer son audit après le 1er novembre</a>.</p>

  <h2 id="certificats">Votre certificat en cours</h2>
  <p>Le décret remplace la liste des indicateurs (le I de l'annexe du code du travail). Il ne dit rien de la durée des certificats, et aucun autre texte publié au ${frDate(CHECKED)} ne prévoit de recertification. La certification reste délivrée pour trois ans après l'audit initial, avec un audit de surveillance entre le 14e et le 22e mois et un audit de renouvellement avant l'échéance (arrêté du 6 juin 2019).</p>
  <p>Ce qui change, c'est la grille appliquée à votre prochain audit. Si votre audit de surveillance tombe en décembre 2026, il porte sur le référentiel 2026, même si votre certificat a été délivré sur celui de 2019. Les points à traiter en priorité : <a href="${indicatorHref(12)}">indicateur 12</a> (procédure violences et harcèlement), <a href="${indicatorHref(19)}">19</a> (suivi réel à distance), <a href="${indicatorHref(27)}">27</a> (clause qualité dans les contrats de sous-traitance), <a href="${indicatorHref(32)}">32</a> (analyse des risques) et, pour les CFA, <a href="${indicatorHref(33)}">33</a>.</p>

  <h2 id="guide">Le guide de lecture du référentiel 2026</h2>
  ${guideSection}

  <h2 id="certificateur">Les questions à envoyer à votre certificateur</h2>
  <p>Votre organisme certificateur décide de la conduite de l'audit. Posez-lui ces questions par écrit, et gardez sa réponse dans votre dossier de preuves. Supprimez la question 4 si vous n'êtes pas un CFA.</p>
  <pre class="mail-copy" id="mail-certificateur">${esc(mail)}</pre>
  <button type="button" class="copy-btn" data-copy="mail-certificateur" hidden>Copier le message</button>

  <h2 id="faq">Questions fréquentes</h2>
  ${kit.faqHtml(faq)}

  ${kit.kitCta({ title: 'Le kit, mis à jour quand le guide paraît', text: `Le kit couvre les 33 indicateurs du référentiel 2026 : check-list des preuves, plan d'action en 21 jours et ${ctx.DATA.templates.length} modèles. Une mise à jour établie après la publication du guide de lecture officiel vous est envoyée sans frais si elle paraît dans les 12 mois suivant l'achat (article 10 des <a href="cgv-pro.html">CGV professionnels</a>).` })}

  <h2>À lire aussi</h2>
  ${guideLinksHtml(path)}

  ${kit.sources([SRC.decret, SRC.decretPdf, SRC.guidePage, SRC.guideV9, SRC.arrete, SRC.fc, SRC.marque])}
  ${kit.about()}
</article>`;

  return {
    path, file: path, priority: '0.8', lastmod,
    title: 'Qualiopi 1er novembre 2026 : date d\'application et guide de lecture',
    description: 'Nouveau référentiel Qualiopi au 1er novembre 2026 : quel référentiel pour votre audit, certificats en cours, état du guide de lecture et des arrêtés, questions au certificateur.',
    body,
    jsonld: [
      kit.articleLd({ path, modified: lastmod, headline: 'Nouveau référentiel Qualiopi : ce qui s\'applique, et à partir de quand', description: 'Date d\'application du référentiel Qualiopi 2026, audits et certificats en cours, état du guide de lecture et des arrêtés d\'application.', citation: [SRC.decret, SRC.guidePage, SRC.arrete, SRC.fc] }),
      kit.breadcrumbLd([['Kit Qualiopi V10', ''], ['Référentiel 2026 : ce qui change', 'changements-v9-v10.html'], ['Qualiopi au 1er novembre 2026', path]]),
      kit.faqLd(faq),
    ],
  };
}
