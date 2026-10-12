// P1 : indicateur 33 (nouveau). Faits : texte officiel (referentiel-2026.json), colonnes de l'annexe relevées sur Légifrance,
// arrêté du 6 juin 2019 (version en vigueur), guide de lecture V9. Ce qui relève de notre lecture est signalé comme tel.
import { REF, SRC, frDate, CHECKED, GUIDE_IS, GUIDE_PUBLISHED, refOf, countByCat, guideLinksHtml, indicatorHref, INDICATOR_PAGES } from './seo-pages.mjs';

export function page33(ctx, kit) {
  const { DATA, esc } = ctx;
  const path = 'indicateurs/indicateur-33.html';
  const i33 = refOf(33);
  const t17 = DATA.templates.find((t) => t.id === 'T17');
  const cfaOnly = REF.indicators.filter((i) => i.cats.length === 1 && i.cats[0] === 4).map((i) => i.n);
  // Liens écrits depuis la racine du site : rebase() les fait remonter d'un dossier à l'écriture.
  const link = (n, label = `indicateur ${n}`) => `<a href="${indicatorHref(n)}">${label}</a>`;

  const faq = [
    ['Un organisme de formation continue doit-il appliquer l\'indicateur 33 ?', `Non, si son certificat ne couvre pas l'apprentissage. Dans l'annexe du décret n° 2026-728, l'indicateur 33 n'est coché que dans la colonne des actions de formation par apprentissage (article L. 6313-1, 4° du code du travail). Si votre certificat couvre aussi l'apprentissage, l'indicateur s'applique à vos actions par apprentissage.`],
    ['Peut-on garder un seul questionnaire pour la satisfaction et l\'évaluation des enseignements ?', `Le texte exige un dispositif « distinct du recueil général de satisfaction ». Un questionnaire de satisfaction renommé ne répond donc pas à la lettre de l'indicateur. Deux questionnaires passés au même moment peuvent convenir, à condition que l'évaluation des enseignements porte sur les contenus et les enseignements, module par module. Le guide de lecture du référentiel 2026 pourra préciser ce point ; il ${GUIDE_IS}.`],
    ['À quelle fréquence faut-il évaluer les enseignements ?', 'Le décret ne fixe pas de fréquence. Il demande de mesurer « périodiquement » l\'efficacité de la démarche d\'amélioration. Une passation à la fin de chaque module, ou de chaque semestre, donne assez de points de comparaison pour montrer cette mesure à l\'auditeur.'],
    ['Une absence de dispositif est-elle une non-conformité majeure ?', `Aucun texte publié au ${frDate(CHECKED)} ne le dit. L'arrêté du 6 juin 2019, qui fixe la liste des indicateurs ne pouvant donner lieu qu'à une non-conformité majeure, n'a pas été modifié depuis le 1er juillet 2025 : il ne cite pas l'indicateur 33. Demandez à votre certificateur comment il le traitera.`],
  ];

  const body = `
<article class="wrap section article">
  ${kit.crumbs([['Kit Qualiopi V10', './'], ['Référentiel 2026', 'changements-v9-v10.html'], ['Indicateur 33', '']])}
  <h1>Indicateur 33 Qualiopi : le nouvel indicateur du référentiel 2026</h1>
  ${kit.byline()}
  <p class="answer">L'indicateur 33 est le seul indicateur créé par le décret n° 2026-728 du 1er août 2026. À partir du <strong>1er novembre 2026</strong>, il demande un dispositif d'évaluation des contenus et des enseignements par les apprenants, distinct du questionnaire de satisfaction. Ses résultats doivent être partagés avec les équipes pédagogiques et suivis d'actions dont l'efficacité est mesurée. Dans l'annexe officielle, il ne s'applique qu'aux actions de formation par apprentissage : il concerne donc les CFA et les organismes certifiés pour l'apprentissage.</p>

  <nav class="toc" aria-label="Sommaire"><p>Sur cette page</p><ol>
    <li><a href="#texte">Le texte officiel</a></li>
    <li><a href="#qui">Qui est concerné</a></li>
    <li><a href="#30-32-33">Indicateurs 30, 32 et 33 : la différence</a></li>
    <li><a href="#exemple">Exemple de grille par module</a></li>
    <li><a href="#preuves">Ce que l'auditeur peut demander</a></li>
    <li><a href="#erreurs">Erreurs à éviter</a></li>
    <li><a href="#audit">Votre audit avant ou après le 1er novembre</a></li>
  </ol></nav>

  <h2 id="texte">Le texte officiel, mot pour mot</h2>
  <blockquote class="official">
    <p>« 33) ${esc(i33.texte2026)} »</p>
    <footer>Annexe au chapitre VI du titre Ier du livre III de la sixième partie du code du travail, dans sa rédaction issue de l'article 1er du <a href="${SRC.decret.url}" rel="noopener">décret n° 2026-728 du 1er août 2026</a> (JORF n° 0180 du 4 août 2026). Critère 7.</footer>
  </blockquote>
  <p>La phrase contient quatre obligations. Les deux premières décrivent le dispositif, les deux suivantes ce qu'on en fait. La colonne de droite est notre lecture : le guide de lecture qui détaillera les attendus ${GUIDE_IS}.</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Les obligations de l'indicateur 33">
  <table>
    <thead><tr><th scope="col">Ce que dit le texte</th><th scope="col">Ce que vous pouvez montrer (notre lecture)</th></tr></thead>
    <tbody>
      <tr><td>« un dispositif d'évaluation des contenus et des enseignements par les apprenants »</td><td>Une règle écrite : quels modules, à quel moment, sous quelle forme (anonyme, en ligne ou papier), avec quel seuil de réponses.</td></tr>
      <tr><td>« distinct du recueil général de satisfaction »</td><td>Un questionnaire séparé, qui porte sur ce qui a été enseigné et sur la façon de l'enseigner, pas sur l'accueil, les locaux ou l'organisation.</td></tr>
      <tr><td>« dont les résultats sont partagés avec les équipes pédagogiques »</td><td>Un compte rendu daté de réunion pédagogique, ou l'envoi des résultats à chaque formateur, avec la liste des destinataires.</td></tr>
      <tr><td>« et donnent lieu à la formalisation d'une démarche d'amélioration continue, dont il mesure périodiquement l'efficacité »</td><td>Des actions écrites dans le plan d'amélioration (celui de l'${link(32)}), puis la comparaison des résultats d'une passation à la suivante.</td></tr>
    </tbody>
  </table>
  </div>

  <h2 id="qui">Qui est concerné ?</h2>
  <p>L'annexe du code du travail présente chaque indicateur avec quatre colonnes, une par catégorie d'actions de l'article L. 6313-1 : actions de formation (1°), bilans de compétences (2°), validation des acquis de l'expérience (3°) et actions de formation par apprentissage (4°). Une croix indique que l'indicateur s'applique à la catégorie.</p>
  <p>Nous avons relevé ces colonnes sur Légifrance le ${frDate(CHECKED)}. Pour l'indicateur 33, <strong>la seule croix est dans la colonne de l'apprentissage</strong>. Il rejoint les ${cfaOnly.length - 1} autres indicateurs propres à l'apprentissage : ${cfaOnly.filter((n) => n !== 33).map((n) => (INDICATOR_PAGES.has(n) ? link(n, String(n)) : n)).join(', ')}.</p>
  <ul>
    <li>Votre certificat ne couvre que des actions de formation, des bilans ou de la VAE : l'indicateur 33 ne vous est pas applicable. Votre questionnaire de satisfaction (${link(30)}) reste exigé.</li>
    <li>Vous êtes un CFA, ou un organisme certifié pour plusieurs catégories dont l'apprentissage : l'indicateur s'applique à vos actions par apprentissage.</li>
  </ul>
  <p>On lit parfois que les organismes qui ne sont pas des CFA « restent à 32 indicateurs ». Le compte réel dépend des colonnes cochées. D'après l'annexe, avant même les conditions du type « lorsque le prestataire met en œuvre des prestations conduisant à une certification professionnelle », une catégorie compte :</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Nombre d'indicateurs par catégorie d'actions">
  <table>
    <thead><tr><th scope="col">Catégorie d'actions (article L. 6313-1)</th><th scope="col">Indicateurs cochés dans l'annexe 2026</th></tr></thead>
    <tbody>
      <tr><td>Actions de formation (1°)</td><td>${countByCat(1)}</td></tr>
      <tr><td>Bilans de compétences (2°)</td><td>${countByCat(2)}</td></tr>
      <tr><td>VAE (3°)</td><td>${countByCat(3)}</td></tr>
      <tr><td>Apprentissage (4°)</td><td>${countByCat(4)}</td></tr>
    </tbody>
  </table>
  </div>
  <p>Notre <a href="preparer-audit-qualiopi-2026.html#auto-diagnostic">auto-diagnostic</a> applique ces colonnes et les conditions de chaque indicateur à votre activité.</p>

  <h2 id="30-32-33">Indicateurs 30, 32 et 33 : la différence</h2>
  <p>Les trois indicateurs sont dans le critère 7 et se répondent. Les colonnes « qui répond » et « pour qui » viennent du texte de 2026 et de son annexe ; la colonne « sur quoi » est notre lecture.</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Comparaison des indicateurs 30, 32 et 33">
  <table>
    <thead><tr><th scope="col">Indicateur</th><th scope="col">Qui répond</th><th scope="col">Sur quoi</th><th scope="col">Pour qui</th></tr></thead>
    <tbody>
      <tr><td>${link(30, '30')} Appréciations</td><td>Bénéficiaires, financeurs (le cas échéant), équipes pédagogiques, entreprises</td><td>La prestation dans son ensemble : satisfaction</td><td>Toutes les catégories</td></tr>
      <tr><td>${link(32, '32')} Amélioration continue</td><td>Personne : c'est votre démarche</td><td>Analyse des appréciations et des réclamations, plus une analyse des risques sur la qualité des formations</td><td>Toutes les catégories</td></tr>
      <tr><td><strong>33</strong> Évaluation des enseignements</td><td>Les apprenants</td><td>Les contenus et les enseignements, module par module</td><td>Apprentissage</td></tr>
    </tbody>
  </table>
  </div>
  <p>En pratique, l'indicateur 33 alimente le 32 : une note basse sur un module devient une action du plan d'amélioration, et la passation suivante dit si l'action a marché.</p>

  <h2 id="exemple">Exemple de grille d'évaluation par module</h2>
  <p>Voici les 11 affirmations du questionnaire de notre modèle ${t17.id} (« ${esc(t17.title)} »). L'apprenant répond de 1 (pas du tout d'accord) à 5 (tout à fait d'accord), avec une case « sans avis ». Aucune question ne porte sur l'accueil ou les locaux : c'est ce qui distingue cette grille d'un questionnaire de satisfaction.</p>
  <div class="table-wrap" tabindex="0" role="region" aria-label="Exemple de grille d'évaluation des enseignements">
  <table class="ex-table">
    <thead><tr><th scope="col">N°</th><th scope="col">Affirmation</th></tr></thead>
    <tbody>
      <tr><th scope="rowgroup" colspan="2">Contenus</th></tr>
      <tr><td>C1</td><td>Les objectifs du module ont été présentés clairement</td></tr>
      <tr><td>C2</td><td>Le contenu est utile pour mon métier et mes missions en entreprise</td></tr>
      <tr><td>C3</td><td>Le niveau de difficulté était adapté</td></tr>
      <tr><td>C4</td><td>Les supports et ressources m'ont aidé à apprendre</td></tr>
      <tr><td>C5</td><td>Les évaluations portaient sur ce qui a été enseigné</td></tr>
      <tr><th scope="rowgroup" colspan="2">Enseignement</th></tr>
      <tr><td>E1</td><td>Les explications étaient claires</td></tr>
      <tr><td>E2</td><td>Le rythme me permettait de suivre</td></tr>
      <tr><td>E3</td><td>Les activités pratiques étaient suffisantes</td></tr>
      <tr><td>E4</td><td>J'ai pu poser mes questions et obtenir des réponses</td></tr>
      <tr><td>E5</td><td>J'ai reçu des retours utiles sur mon travail</td></tr>
      <tr><th scope="rowgroup" colspan="2">Lien avec l'entreprise</th></tr>
      <tr><td>L1</td><td>J'ai pu faire le lien entre ce module et mes missions en entreprise</td></tr>
    </tbody>
  </table>
  </div>
  <p>Deux questions ouvertes complètent la grille : « Ce qui m'a le plus aidé à apprendre » et « Ce qu'il faudrait changer dans ce module ».</p>
  <p>Le cycle complet, sur un exemple fictif : le module « Gestion des stocks » obtient 2,6 sur 5 à l'affirmation E2 (rythme), avec 14 réponses sur 18 apprentis. Les résultats sont présentés en réunion pédagogique trois semaines plus tard. L'équipe décide d'ajouter deux séances de travaux pratiques et inscrit l'action au plan d'amélioration. À la passation suivante, E2 monte à 3,8 : l'écart est noté dans le tableau de suivi de l'efficacité. C'est cette trace, du score à la décision puis au nouveau score, qu'un auditeur peut suivre.</p>

  <h2 id="preuves">Ce que l'auditeur peut demander</h2>
  <p>${GUIDE_PUBLISHED ? `Le guide de lecture du référentiel 2026 donne désormais des exemples de preuves : comparez-les à cette liste.` : `Le guide de lecture du référentiel 2026 n'étant pas publié, aucune liste officielle de preuves n'existe pour l'indicateur 33.`} D'après notre lecture du texte, un dossier complet contient :</p>
  <ul>
    <li>le questionnaire d'évaluation des contenus et des enseignements, distinct de celui de satisfaction ;</li>
    <li>le calendrier de passation (par module, semestre ou année) et les taux de réponse ;</li>
    <li>la restitution aux équipes pédagogiques : compte rendu de réunion daté, ou envoi des résultats ;</li>
    <li>les actions décidées, reportées dans le plan d'amélioration ;</li>
    <li>la mesure de leur efficacité, d'une passation à l'autre.</li>
  </ul>
  <p>L'arrêté du 6 juin 2019 rappelle que « l'absence de preuve le jour de l'audit fait l'objet d'une non-conformité ». Préparez ces pièces avant la date, pas pendant l'audit.</p>

  <h2 id="erreurs">Erreurs à éviter</h2>
  <ul>
    <li><strong>Renommer le questionnaire de satisfaction</strong> en « évaluation des enseignements ». Le texte exige un dispositif distinct.</li>
    <li>Collecter les réponses sans jamais les montrer aux formateurs : la restitution aux équipes fait partie de l'indicateur.</li>
    <li>Décider des actions sans mesurer leur effet. Le texte demande de mesurer « périodiquement l'efficacité » de la démarche.</li>
    <li>Un seul questionnaire global par an, sans détail par module ni par intervenant : les résultats ne disent pas quoi changer, ni où.</li>
  </ul>

  <h2 id="audit">Votre audit est avant ou après le 1er novembre 2026 ?</h2>
  <p>Le décret entre en vigueur le 1er novembre 2026 (article 2). Un audit réalisé jusqu'au 31 octobre se fait sur le référentiel de 2019, qui n'a pas d'indicateur 33. À partir du 1er novembre, l'indicateur s'applique, y compris lors d'un audit de surveillance : l'arrêté du 6 juin 2019 précise que cet audit vérifie que « le référentiel en vigueur est toujours appliqué ».</p>
  <p>Deux points restent ouverts au ${frDate(CHECKED)}. Le guide de lecture du référentiel 2026 ${GUIDE_IS}. Et l'arrêté sur les modalités d'audit, qui classe les indicateurs selon le type de non-conformité possible, n'a pas été modifié depuis le 1er juillet 2025 : il ne mentionne pas l'indicateur 33. Le détail, et les questions à poser à votre certificateur : <a href="qualiopi-1er-novembre-2026.html">Qualiopi au 1er novembre 2026</a>.</p>

  <h2 id="faq">Questions fréquentes</h2>
  ${kit.faqHtml(faq)}

  ${kit.kitCta({ title: 'Le modèle T17 complet, prêt à adapter', text: `Le kit contient le modèle ${t17.id} en Word et LibreOffice : organisation du dispositif, questionnaire par module, synthèse, tableau de restitution aux équipes et suivi de l'efficacité des actions. Avec les ${DATA.templates.length - 1} autres modèles et la check-list des preuves des 33 indicateurs.` })}

  <h2>À lire aussi</h2>
  <ul class="related">
    <li><a href="changements-v9-v10.html#indicateur-33">Tableau des changements<span>Les 12 indicateurs qui évoluent, avant et après</span></a></li>
    ${guideLinksHtml('indicateurs/indicateur-33.html').replace(/^<ul class="related">|<\/ul>$/g, '')}
  </ul>

  ${kit.sources([SRC.decret, SRC.decretPdf, SRC.annexe2019, SRC.arrete, SRC.guidePage])}
  ${kit.about()}
</article>`;

  return {
    path, file: path, priority: '0.8',
    title: 'Indicateur 33 Qualiopi (2026) : évaluation des enseignements',
    description: 'Le nouvel indicateur Qualiopi au 1er novembre 2026 : texte officiel, CFA concernés, différence avec les indicateurs 30 et 32, preuves et grille d\'exemple.',
    body,
    jsonld: [
      kit.articleLd({ path, headline: 'Indicateur 33 Qualiopi : le nouvel indicateur du référentiel 2026', description: 'Texte officiel, champ d\'application, preuves et exemple de grille pour l\'indicateur 33 du référentiel national qualité applicable au 1er novembre 2026.', citation: [SRC.decret, SRC.annexe2019, SRC.arrete] }),
      kit.breadcrumbLd([['Kit Qualiopi V10', ''], ['Référentiel 2026 : ce qui change', 'changements-v9-v10.html'], ['Indicateur 33', path]]),
      kit.faqLd(faq),
    ],
  };
}
