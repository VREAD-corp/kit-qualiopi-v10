// P3 : préparer un audit Qualiopi après le 1er novembre 2026, avec l'auto-diagnostic des 33 indicateurs (P12).
// Règles d'audit : arrêté du 6 juin 2019 modifié (version en vigueur relevée sur Légifrance le 13/10/2026).
// Gradation mineure / majeure : guide de lecture V9 (préambule). Les questions de l'auto-diagnostic sont nos reformulations.
import { REF, SRC, frDate, CHECKED, GUIDE_STATUS, GUIDE_IS, GUIDE_PUBLISHED, indicatorHref, guideLinksHtml, catsLabel, kitInventory, docLink } from './seo-pages.mjs';

// Listes de l'arrêté du 6 juin 2019 (numéros de l'annexe, inchangés de 1 à 32 en 2026).
export const MAJ_ONLY = [4, 5, 6, 7, 10, 11, 14, 15, 16, 20, 21, 22, 26, 27, 29, 31, 32]; // art. 5
export const SURV_FIXED = [1, 17, 19, 3]; // art. 2 (3 « pour les organismes concernés »)
export const NEW_ENTRANTS = [2, 3, 11, 13, 14, 19, 22, 24, 25, 26, 32]; // art. 1
export const GRADED_V9 = [1, 2, 3, 8, 9, 12, 13, 17, 18, 19, 23, 24, 25, 28, 30]; // guide V9, préambule

// Auto-diagnostic : une question par indicateur (notre reformulation du texte 2026) et ce qu'on peut montrer.
export const QUESTIONS = {
  1: ['Chaque prestation a une fiche publique à jour (prérequis, objectifs, type de reconnaissance, durée, modalités pédagogiques et de financement, délais d\'accès, tarifs, contacts, méthodes, évaluation, accessibilité), et aucune mention ne peut induire en erreur.', 'Fiches programme datées, justificatifs de chaque mention de financement ou de taux affichée.'],
  2: ['Vous publiez des indicateurs de résultats adaptés à vos prestations, avec leur mode de calcul.', 'Page « résultats » avec période, effectif, numérateur et dénominateur ; pour un CFA, les indicateurs diffusés sur InserJeunes.'],
  3: ['Pour chaque formation certifiante, vous publiez taux d\'obtention, blocs de compétences, équivalences, passerelles, suites de parcours (dont poursuites d\'études) et débouchés.', 'Encadré « après la formation » sur chaque fiche, lien vers la fiche RNCP ou RS.'],
  4: ['Le besoin de chaque bénéficiaire est analysé avec l\'entreprise ou le financeur, et cette analyse est conservée.', 'Questionnaire ou compte rendu d\'analyse du besoin, daté, dans chaque dossier.'],
  5: ['Chaque prestation a des objectifs opérationnels et évaluables.', 'Objectifs rédigés avec un verbe d\'action et un critère d\'évaluation.'],
  6: ['Les contenus et les modalités de mise en œuvre sont adaptés aux objectifs et aux publics.', 'Programme détaillé, déroulé, exemples d\'adaptation à un public.'],
  7: ['Pour chaque certification préparée, les contenus correspondent au référentiel de la certification, et vous pouvez prouver votre capacité à l\'assurer.', 'Tableau de correspondance contenus / compétences, convention ou habilitation du certificateur.'],
  8: ['Vous avez une procédure de positionnement et d\'évaluation des acquis à l\'entrée.', 'Test ou entretien de positionnement, résultats dans les dossiers.'],
  9: ['Les bénéficiaires sont informés des conditions de déroulement de la prestation.', 'Convocation, livret d\'accueil, règlement intérieur.'],
  10: ['La prestation, l\'accompagnement et le suivi sont adaptés à chaque public, avec des traces.', 'Fiches de suivi individuel, adaptations notées, feuilles d\'émargement et certificats de réalisation.'],
  11: ['L\'atteinte des objectifs est évaluée pour chaque bénéficiaire.', 'Évaluations de fin de prestation, grilles, résultats.'],
  12: ['Vous avez des mesures contre les abandons, et une procédure de prévention et de traitement des violences (dont sexistes et sexuelles), du harcèlement et des discriminations.', 'Procédure écrite et diffusée, référent nommé, canal de signalement, registre confidentiel.'],
  13: ['En alternance, les missions confiées sont anticipées avec l\'entreprise et l\'apprenant, et la coordination centre / entreprise est suivie.', 'Livret ou fiche de liaison, comptes rendus d\'entretiens tripartites.'],
  14: ['Vous assurez l\'accompagnement socio-professionnel, éducatif et citoyen des apprentis, et une procédure traite sans délai les ruptures liées à des difficultés, violences ou discriminations, en centre ou en entreprise.', 'Procédure « rupture sensible » avec délais, personnes alertées, mesures conservatoires.'],
  15: ['Les apprentis connaissent leurs droits et devoirs, les règles de santé et sécurité (renforcées pour les mineurs), les dispositifs de signalement et le médiateur de l\'apprentissage ; les dysfonctionnements sont signalés à l\'inspection du travail.', 'Livret de l\'apprenti avec une page « En cas de problème » et les coordonnées du médiateur.'],
  16: ['Les conditions de présentation à la certification respectent les exigences formelles du certificateur.', 'Inscriptions aux examens, règlement du certificateur, convocations.'],
  17: ['Les moyens humains et techniques, les locaux et les équipements sont adaptés, y compris quand un tiers les fournit.', 'Inventaire des moyens, conventions de mise à disposition, conditions d\'accès.'],
  18: ['Vous coordonnez les intervenants internes et externes (pédagogiques, administratifs, logistiques, commerciaux).', 'Organigramme fonctionnel, planning, réunions de coordination.'],
  19: ['Les ressources pédagogiques sont mises à disposition et appropriées ; à distance, le suivi réel est vérifié ; au-delà du nombre d\'intervenants fixé par arrêté, chaque formation a un référent pédagogique.', 'Preuves de progression à distance (exercices rendus, quiz), pas seulement des temps de connexion ; nom du référent.'],
  20: ['Vous avez le personnel mobilité, le référent handicap et le conseil de perfectionnement ; apprentis, formateurs et entreprises participent à la gouvernance ; une supervision renforcée est prévue si la part d\'heures des permanents est sous le seuil fixé par arrêté.', 'Comptes rendus du conseil de perfectionnement, calcul de la part d\'heures des intervenants permanents.'],
  21: ['Les compétences des intervenants sont définies, mobilisées et évaluées.', 'CV, fiches de poste, grilles d\'évaluation des intervenants.'],
  22: ['Les compétences de vos salariés sont entretenues et développées.', 'Plan de développement des compétences, formations suivies.'],
  23: ['Vous faites une veille légale et réglementaire sur la formation professionnelle et vous en tirez des décisions.', 'Registre de veille daté, avec la décision prise pour chaque information utile.'],
  24: ['Vous faites une veille sur les compétences, les métiers et les emplois de vos secteurs, et vous l\'exploitez.', 'Registre de veille, programmes modifiés à la suite.'],
  25: ['Vous faites une veille sur les innovations pédagogiques et technologiques, et vous l\'exploitez.', 'Registre de veille, outils ou méthodes adoptés.'],
  26: ['Vous mobilisez les expertises, outils et réseaux nécessaires pour accueillir, accompagner ou orienter les personnes en situation de handicap.', 'Référent handicap, contacts des partenaires spécialisés, adaptations réalisées.'],
  27: ['Chaque contrat de sous-traitance ou de portage salarial trace le respect du référentiel.', 'Clause qualité et annexe dans chaque contrat, preuves fournies par le sous-traitant.'],
  28: ['Pour les périodes de formation en situation de travail, vous mobilisez un réseau de partenaires socio-économiques pour l\'ingénierie et l\'accueil en entreprise.', 'Conventions de partenariat, liste des entreprises d\'accueil.'],
  29: ['Vous menez des actions pour l\'insertion professionnelle ou la poursuite d\'études des apprentis.', 'Ateliers, suivi de l\'insertion, partenariats.'],
  30: ['Vous recueillez les appréciations des bénéficiaires, des financeurs (le cas échéant), des équipes pédagogiques et des entreprises.', 'Questionnaires par partie prenante, taux de retour, synthèses.'],
  31: ['Les difficultés, réclamations et aléas sont traités selon une procédure, avec un registre.', 'Procédure et registre des réclamations, réponses apportées.'],
  32: ['Vous avez une démarche d\'amélioration continue fondée sur les appréciations et les réclamations, et une analyse des risques sur la qualité des formations.', 'Plan d\'amélioration avec vérification de l\'efficacité, cartographie des risques revue.'],
  33: ['Les apprenants évaluent les contenus et les enseignements, séparément de la satisfaction ; les résultats sont restitués aux équipes et suivis d\'actions dont l\'efficacité est mesurée.', 'Questionnaire par module, compte rendu de restitution, actions et mesure avant / après.'],
};
const COND_LABEL = { certifiant: 'formations préparant à une certification professionnelle', alternance: 'formations en alternance', 'sous-traitance': 'sous-traitance ou portage salarial', travail: 'périodes de formation en situation de travail' };

export function pageAudit(ctx, kit) {
  const { DATA, esc } = ctx;
  const path = 'preparer-audit-qualiopi-2026.html';
  const status = (n) => DATA.indicators.find((i) => i.n === n);
  const modified = DATA.indicators.filter((i) => i.change === 'modifie').map((i) => i.n);
  const changedSet = new Set(DATA.indicators.filter((i) => i.change === 'modifie' || i.change === 'nouveau').map((i) => i.n));
  const surv = [...new Set([...SURV_FIXED, ...MAJ_ONLY])];
  const modInSurv = modified.filter((n) => surv.includes(n));
  const inv = kitInventory(DATA);
  const tplFor = (n) => inv.forIndicator(n);
  const ilink = (n) => (changedSet.has(n) ? `<a href="${indicatorHref(n)}">${n}</a>` : String(n));

  const howto = [
    ['J-60 à J-30 : cadrer avec le certificateur', ['Demandez par écrit quel référentiel et quelle version du guide de lecture serviront à l\'audit.', 'Confirmez les catégories d\'actions certifiées (formation, bilans, VAE, apprentissage) et les sites.', 'Listez les indicateurs non applicables et la raison de chacun (pas de formation certifiante, pas de sous-traitance…).', 'Vérifiez que chaque écart du dernier audit est soldé, preuve à l\'appui.']],
    ['J-30 à J-10 : réunir les preuves', ['Un dossier par indicateur, numéroté de 01 à 33, et un index « indicateur, document, emplacement ».', 'Deux ou trois parcours complets de bénéficiaires récents, de l\'analyse du besoin à l\'appréciation, convention, feuilles d\'émargement et certificat de réalisation compris : l\'audit analyse « une ou plusieurs actions » conduites depuis le précédent audit (arrêté du 6 juin 2019, article 2).', 'Les pages publiques comparées à la réalité (indicateurs 1 et 2) : délais, tarifs, taux, financements.', 'Les accès prêts : plateforme à distance, logiciel de gestion, registres.']],
    ['J-10 à J-1 : répéter', ['Confirmez le plan d\'audit envoyé par le certificateur : horaires, personnes rencontrées, indicateurs visés.', 'Prévenez les formateurs, référents et, si besoin, les sous-traitants.', 'Faites un audit à blanc : un collègue tire 5 indicateurs et vous demande la preuve de chacun (voir plus bas).', 'Préparez une présentation de 5 minutes de votre organisme : activité, publics, chiffres, organisation.']],
    ['Le jour de l\'audit', ['Répondez à la question posée et montrez la preuve, sans noyer l\'auditeur sous les documents.', 'S\'il manque une pièce, dites-le, expliquez ce qui se fait en pratique et notez le point.', 'À la réunion de clôture, faites préciser chaque écart : indicateur, constat, mineure ou majeure.']],
    ['Après l\'audit', ['Relisez le rapport dès réception et signalez toute erreur de fait.', 'Pour chaque non-conformité : cause, action corrective, preuve, envoi dans le délai fixé.', 'Reportez écarts et observations dans le plan d\'amélioration (indicateur 32), puis revoyez l\'analyse des risques.', 'Fixez la date de la prochaine revue interne, avant l\'audit suivant.']],
  ];

  const faq = [
    ['Mon audit de surveillance a lieu en novembre 2026 : sur quel référentiel ?', 'Sur celui du décret n° 2026-728, en vigueur depuis le 1er novembre 2026. L\'arrêté du 6 juin 2019 précise que l\'audit de surveillance vérifie que « le référentiel en vigueur est toujours appliqué ». Le décret ne prévoit pas de mesure transitoire.'],
    ['L\'audit de surveillance peut-il se faire à distance ?', 'Oui, c\'est la règle : l\'arrêté du 6 juin 2019 prévoit un audit de surveillance à distance. Il se fait sur site en cas de signalement, si l\'analyse de risque issue de l\'audit précédent le justifie, pour l\'échantillonnage des organismes multi-sites, ou à votre demande.'],
    ['Combien de temps pour corriger une non-conformité majeure ?', 'Trois mois à compter de la notification : les actions correctives doivent être effectives dans ce délai, et le certificateur les vérifie dans le mois qui suit. À défaut, la certification n\'est pas délivrée (audit initial) ou elle est suspendue (surveillance, renouvellement). Source : article 5 de l\'arrêté du 6 juin 2019.'],
    ['Et une non-conformité mineure ?', 'Vous envoyez un plan d\'action dans le délai fixé par le certificateur, et vous le mettez en œuvre dans les six mois. La vérification se fait à l\'audit suivant ; une mineure non levée à ce moment devient majeure. À l\'audit initial, cinq mineures non levées au moment de la décision valent une majeure.'],
  ];

  // --------------------------------------------- Auto-diagnostic (rendu côté serveur : les 33 questions sont lisibles sans JavaScript)
  const questionsHtml = DATA.criteria.map((c) => `
    <h3 class="ad-crit" id="critere-${c.n}">Critère ${c.n}<small>${esc(c.title)}</small></h3>
    ${REF.indicators.filter((r) => r.n >= c.range[0] && r.n <= c.range[1]).map((r) => {
      const st = status(r.n);
      const [q, hint] = QUESTIONS[r.n];
      const tpl = tplFor(r.n);
      return `<fieldset class="ad-q" id="q-${r.n}" data-n="${r.n}" data-crit="${c.n}" data-cats="${r.cats.join('')}"${r.cond ? ` data-cond="${r.cond}"` : ''}>
      <legend><span class="ad-n">${r.n}</span>${esc(q)}${st.change !== 'identique' ? ` <span class="badge ${st.change}">${esc(st.changeLabel)}</span>` : ''}</legend>
      <p class="ad-hint">À montrer : ${esc(hint)}</p>
      <div class="ad-opts">
        <label><input type="radio" name="i${r.n}" value="oui"> Oui</label>
        <label><input type="radio" name="i${r.n}" value="partiel"> En partie</label>
        <label><input type="radio" name="i${r.n}" value="non"> Non</label>
      </div>
      <p class="ad-na" hidden>Non applicable à l'activité cochée (annexe : ${esc(catsLabel(r))}${r.cond ? ` ; seulement en cas de ${COND_LABEL[r.cond]}` : ''}).</p>
      <p class="ad-meta">${tpl.length ? `Dans le kit : ${tpl.map((t) => `<a href="${inv.docHref(t.id)}" title="${esc(t.title)}">${t.id}</a>`).join(', ')}` : 'Pas de modèle dédié dans le kit'}${changedSet.has(r.n) ? ` · <a href="${indicatorHref(r.n)}">ce qui change</a>` : ''}</p>
      <details><summary>Texte officiel de l'indicateur ${r.n}</summary><p>« ${esc(r.texte2026)} »</p></details>
    </fieldset>`;
    }).join('')}`).join('');

  const body = `
<article class="wrap section article">
  ${kit.crumbs([['Kit Qualiopi V10', './'], ['Référentiel 2026', 'changements-v9-v10.html'], ['Préparer son audit', '']])}
  <h1>Préparer un audit Qualiopi après le 1er novembre 2026</h1>
  ${kit.byline()}
  <p class="answer">Un audit Qualiopi réalisé à partir du 1er novembre 2026 se fait sur le référentiel du décret n° 2026-728 : 33 indicateurs, dont ${modified.length} réécrits et 1 nouveau. Les règles d'audit, elles, n'ont pas changé : elles restent fixées par l'arrêté du 6 juin 2019, modifié pour la dernière fois le 1er juillet 2025. Cette page donne le calendrier de préparation, ce que l'auditeur regarde à chaque type d'audit, et un <a href="#auto-diagnostic">auto-diagnostic des 33 indicateurs</a> à remplir dans votre navigateur, sans inscription.</p>

  <nav class="toc" aria-label="Sommaire"><p>Sur cette page</p><ol>
    <li><a href="#referentiel">Quel référentiel pour votre audit</a></li>
    <li><a href="#types">Initial, surveillance, renouvellement</a></li>
    <li><a href="#points-2026">Les indicateurs réécrits que l'auditeur verra à coup sûr</a></li>
    <li><a href="#calendrier">Calendrier de J-60 à l'après-audit</a></li>
    <li><a href="#auto-diagnostic">Auto-diagnostic des 33 indicateurs</a></li>
    <li><a href="#audit-blanc">Audit à blanc en 30 minutes</a></li>
    <li><a href="#non-conformites">Non-conformité mineure ou majeure</a></li>
  </ol></nav>

  <h2 id="referentiel">Quel référentiel pour votre audit ?</h2>
  <p>La date de l'audit décide. Le décret n° 2026-728 entre en vigueur le 1er novembre 2026 (article 2) et ne contient aucune mesure transitoire.</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Référentiel applicable selon la date d'audit">
  <table>
    <thead><tr><th scope="col">Date de l'audit</th><th scope="col">Référentiel</th><th scope="col">Guide de lecture</th></tr></thead>
    <tbody>
      <tr><td>Jusqu'au 31 octobre 2026</td><td>Annexe de 2019, 32 indicateurs</td><td>V9 du 8 janvier 2024</td></tr>
      <tr><td>À partir du 1er novembre 2026</td><td>Décret n° 2026-728, 33 indicateurs</td><td>${GUIDE_PUBLISHED ? `Nouveau guide, ${GUIDE_STATUS}` : `Le nouveau guide ${GUIDE_IS} ; la V9 reste la dernière version officielle`}</td></tr>
    </tbody>
  </table>
  </div>
  <p>Le guide V9 précise, dans son préambule, qu'une nouvelle version du guide s'applique aux audits « 2 mois maximum » après sa diffusion sur le site du ministère. Demandez à votre certificateur, par écrit, la version qu'utilisera votre auditeur. Les questions à lui poser : <a href="qualiopi-1er-novembre-2026.html#certificateur">Qualiopi au 1er novembre 2026</a>.</p>

  <h2 id="types">Initial, surveillance, renouvellement : ce que l'auditeur regarde</h2>
  <p>L'arrêté du 6 juin 2019 fixe le déroulement des trois audits du cycle de certification, qui dure trois ans.</p>
  <h3>Audit initial</h3>
  <p>Il a lieu dans vos locaux. L'auditeur choisit un échantillon d'actions représentatif de votre activité, et cet échantillon « n'est pas communiqué à l'organisme audité avant la réunion d'ouverture de l'audit ». Tout doit donc être prêt pour n'importe quelle action. Si vous êtes un nouvel entrant (première année d'activité, ou nouvelle catégorie d'actions), les indicateurs ${NEW_ENTRANTS.join(', ')} sont audités sur la seule formalisation du processus ; leur mise en œuvre est vérifiée à l'audit de surveillance.</p>
  <h3>Audit de surveillance</h3>
  <p>Il a lieu « entre le 14e et le 22e mois suivant la date d'obtention de la certification », à distance sauf exceptions. L'auditeur revoit au minimum :</p>
  <ul>
    <li>les indicateurs qui avaient fait l'objet d'une non-conformité à l'audit initial, en regardant l'efficacité des actions correctives ;</li>
    <li>les indicateurs qui ne peuvent donner lieu qu'à une non-conformité majeure, s'ils vous sont applicables : ${MAJ_ONLY.join(', ')} ;</li>
    <li>les indicateurs 1, 17 et 19, plus le 3 si vous préparez à une certification professionnelle ;</li>
    <li>l'affichage de votre certificat, dont l'absence est une non-conformité majeure.</li>
  </ul>
  <h3>Audit de renouvellement</h3>
  <p>Il a lieu sur place, avant la date d'échéance du certificat, et suit le déroulement d'un audit initial. Le calendrier doit laisser le temps de lever une éventuelle non-conformité majeure avant l'échéance.</p>

  <h2 id="points-2026">Les indicateurs réécrits que l'auditeur verra à coup sûr</h2>
  <p>Notre lecture, à vérifier avec votre certificateur : l'arrêté désigne les indicateurs par leur numéro, et les numéros 1 à 32 n'ont pas changé en 2026. Tant que l'arrêté n'est pas modifié (il ne l'était pas au ${frDate(CHECKED)}), ses listes visent donc les indicateurs dans leur nouvelle rédaction. En croisant ces listes avec les ${modified.length} indicateurs réécrits, <strong>${modInSurv.length} d'entre eux font partie de la revue minimale de tout audit de surveillance</strong>, dès lors qu'ils vous sont applicables.</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Indicateurs réécrits et règles d'audit">
  <table>
    <thead><tr><th scope="col">Indicateur réécrit</th><th scope="col">Revue minimale en surveillance</th><th scope="col">Non-conformité possible</th></tr></thead>
    <tbody>
      ${modified.map((n) => `<tr><td>${ilink(n)} · ${esc(status(n).titre)}</td><td>${surv.includes(n) ? 'oui' : 'pas d\'office'}</td><td>${MAJ_ONLY.includes(n) ? 'majeure seulement' : GRADED_V9.includes(n) ? 'mineure ou majeure' : '?'}</td></tr>`).join('\n      ')}
      <tr><td><a href="${indicatorHref(33)}">33</a> · ${esc(status(33).titre)} (nouveau)</td><td>pas cité par l'arrêté</td><td>pas encore fixée</td></tr>
    </tbody>
  </table>
  </div>
  <p>Sources : articles 2 et 5 de l'arrêté du 6 juin 2019 ; préambule du guide de lecture V9 pour la gradation. Le nouveau guide pourra modifier la liste des indicateurs gradués.</p>

  <h2 id="calendrier">Calendrier de préparation, de J-60 à l'après-audit</h2>
  <ol class="steps">
    ${howto.map(([t, items]) => `<li><h3>${t}</h3><ul>${items.map((x) => `<li>${x}</li>`).join('')}</ul></li>`).join('\n    ')}
  </ol>
  <p>Les cinq indicateurs du référentiel 2026 qui demandent un document que vous n'aviez peut-être pas : ${[12, 19, 27, 32].map((n) => `<a href="${indicatorHref(n)}">${n}</a>`).join(', ')} et <a href="${indicatorHref(33)}">33</a> pour les CFA. Le <a href="changements-v9-v10.html">tableau des changements</a> donne, pour chacun, l'avant, l'après et l'action à mener.</p>

  <section id="auto-diagnostic" aria-labelledby="ad-h">
  <h2 id="ad-h">Auto-diagnostic des 33 indicateurs (référentiel 2026)</h2>
  <div class="ad-intro">
    <p>Cochez votre activité : les indicateurs qui ne vous concernent pas se grisent, d'après les colonnes de l'annexe et les conditions écrites dans chaque indicateur. Répondez ensuite « oui », « en partie » ou « non ». Le résultat s'affiche en bas, par critère, avec la liste des points à traiter.</p>
    <p class="small muted">Vos réponses restent dans ce navigateur (stockage local) : rien n'est envoyé, aucun compte n'est demandé. Les questions sont nos reformulations ; le texte officiel de chaque indicateur est repliable sous la question.</p>
    <noscript><p class="callout callout-warn">Le calcul du résultat demande JavaScript. Les questions restent lisibles, et le texte officiel est sous chacune.</p></noscript>
  </div>
  <div id="ad" class="ad" role="group" aria-labelledby="ad-h">
    <fieldset class="ad-profile">
      <legend>Votre activité</legend>
      <p class="grp-t">Catégories d'actions de votre certificat</p>
      <div class="grp">
        <label><input type="checkbox" name="cat" value="1" checked> Actions de formation</label>
        <label><input type="checkbox" name="cat" value="2"> Bilans de compétences</label>
        <label><input type="checkbox" name="cat" value="3"> Validation des acquis de l'expérience (VAE)</label>
        <label><input type="checkbox" name="cat" value="4"> Apprentissage (CFA)</label>
      </div>
      <p class="grp-t">Vos situations</p>
      <div class="grp">
        <label><input type="checkbox" name="cond" value="certifiant"> Formations qui préparent à une certification professionnelle (RNCP, RS)</label>
        <label><input type="checkbox" name="cond" value="alternance"> Formations en alternance</label>
        <label><input type="checkbox" name="cond" value="sous-traitance"> Sous-traitance ou portage salarial</label>
        <label><input type="checkbox" name="cond" value="travail"> Périodes de formation en situation de travail</label>
      </div>
    </fieldset>
    ${questionsHtml}
  </div>
  <div class="ad-result" id="ad-result" aria-live="polite">
    <h3>Votre résultat</h3>
    <p id="ad-summary">Répondez aux questions : le résultat se met à jour ici.</p>
    <ul class="ad-bars" id="ad-bars"></ul>
    <div id="ad-todo"></div>
    <div class="ad-actions">
      <button type="button" id="ad-print-btn">Imprimer ou enregistrer en PDF</button>
      <button type="button" class="secondary" id="ad-reset">Effacer mes réponses</button>
    </div>
  </div>
  </section>

  <h2 id="audit-blanc">Audit à blanc en 30 minutes</h2>
  <p>Un collègue joue l'auditeur. Il tire 5 indicateurs au hasard parmi ceux qui vous sont applicables et vous demande la preuve de chacun. Comptez au plus 5 minutes par indicateur : une preuve introuvable en 5 minutes le sera aussi le jour de l'audit, et « l'absence de preuve le jour de l'audit fait l'objet d'une non-conformité » (arrêté du 6 juin 2019, article 1er).</p>
  <div class="ad-draw" id="ad-draw">
    <button type="button" class="copy-btn" id="ad-draw-btn">Tirer 5 indicateurs</button>
    <ol id="ad-draw-list" aria-live="polite"></ol>
  </div>

  <h2 id="non-conformites">Après l'audit : non-conformité mineure ou majeure</h2>
  <p>Le guide de lecture V9 définit les deux niveaux : une non-conformité mineure correspond à un « respect partiel de l'attendu », une majeure peut être prononcée « lorsque l'attendu n'est pas du tout respecté ». Seuls certains indicateurs peuvent être gradués : ${GRADED_V9.join(', ')}. Les autres ne connaissent que la non-conformité majeure.</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Délais de traitement des non-conformités">
  <table>
    <thead><tr><th scope="col"></th><th scope="col">Non-conformité mineure</th><th scope="col">Non-conformité majeure</th></tr></thead>
    <tbody>
      <tr><th scope="row">Ce que vous faites</th><td>Plan d'action envoyé dans le délai fixé par le certificateur, mis en œuvre dans les 6 mois</td><td>Actions correctives effectives dans les 3 mois</td></tr>
      <tr><th scope="row">Vérification</th><td>À l'audit suivant</td><td>Par le certificateur, au plus tard 1 mois après ces 3 mois</td></tr>
      <tr><th scope="row">Si ce n'est pas levé</th><td>Elle devient majeure</td><td>Certification refusée (audit initial) ou suspendue (surveillance, renouvellement)</td></tr>
    </tbody>
  </table>
  </div>
  <p>Source : article 5 de l'arrêté du 6 juin 2019. À l'audit initial, cinq non-conformités mineures non levées au moment de la décision constituent une non-conformité majeure (article 1er).</p>

  <h2 id="faq">Questions fréquentes</h2>
  ${kit.faqHtml(faq)}

  ${kit.kitCta({ title: 'La check-list complète des preuves, indicateur par indicateur', text: `L'auto-diagnostic dit où vous en êtes ; le kit donne quoi produire. Pour chacun des 33 indicateurs, la check-list D02 liste les preuves possibles, les pièges fréquents et le modèle à utiliser. S'y ajoutent la check-list de préparation de l'audit (D03), un plan d'action en 21 jours (D04), l'<a href="${inv.docHref('D05')}">index des documents par indicateur (D05)</a>, ${inv.nbModels} modèles Word et LibreOffice (dont ${docLink(inv, 'T24', esc)} et ${docLink(inv, 'T26', esc)}) et ${inv.nbSheets} tableurs avec formules.` })}

  <h2>À lire aussi</h2>
  ${guideLinksHtml(path)}

  ${kit.sources([SRC.arrete, SRC.decret, SRC.guideV9, SRC.guidePage, SRC.marque])}
  ${kit.about()}
</article>
<section id="ad-print" aria-hidden="true"></section>`;

  return {
    path, file: path, priority: '0.8',
    title: 'Préparer son audit Qualiopi 2026 : check-list et auto-diagnostic',
    description: 'Audit Qualiopi après le 1er novembre 2026 : quel référentiel, ce que l\'auditeur vérifie, calendrier J-60 et auto-diagnostic gratuit des 33 indicateurs.',
    body,
    jsonld: [
      kit.articleLd({ path, headline: 'Préparer un audit Qualiopi après le 1er novembre 2026', description: 'Référentiel applicable, règles des audits initial, de surveillance et de renouvellement, calendrier de préparation et auto-diagnostic des 33 indicateurs.', citation: [SRC.arrete, SRC.decret, SRC.guideV9], about: [{ '@type': 'Legislation', name: 'Arrêté du 6 juin 2019 relatif aux modalités d\'audit associées au référentiel national mentionné à l\'article D. 6316-1-1 du code du travail', legislationDate: '2019-06-06', url: SRC.arrete.url }] }),
      { '@context': 'https://schema.org', '@type': 'HowTo', name: 'Préparer un audit Qualiopi après le 1er novembre 2026', inLanguage: 'fr', step: howto.map(([t, items], k) => ({ '@type': 'HowToStep', position: k + 1, name: t, text: items.join(' ') })) },
      { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Auto-diagnostic Qualiopi 2026 (33 indicateurs)', url: `${ctx.SITE}${path}#auto-diagnostic`, applicationCategory: 'BusinessApplication', operatingSystem: 'Navigateur web', inLanguage: 'fr', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, publisher: { '@id': ctx.ORG_ID } },
      kit.breadcrumbLd([['Kit Qualiopi V10', ''], ['Référentiel 2026 : ce qui change', 'changements-v9-v10.html'], ['Préparer son audit', path]]),
      kit.faqLd(faq),
    ],
  };
}
