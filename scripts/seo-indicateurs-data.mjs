// Contenu des pages « un indicateur modifié = une page » (P2). Données pures, sans import.
// Le texte officiel 2019 / 2026, le champ d'application et les règles d'audit sont ajoutés par seo-indicateurs.mjs
// à partir de src/data/referentiel-2026.json et de l'arrêté du 6 juin 2019 : ici, seulement ce qui est propre à chaque indicateur.
// preuves / pieges : repris de qualiopi-kit-content/content/indicators.mjs (notre lecture, en attendant le guide de lecture 2026).
export const INDICATOR_PAGES_CONTENT = {
  1: {
    label: 'information du public non trompeuse',
    title: 'Indicateur 1 Qualiopi (2026) : information du public, ce qui change',
    description: 'Indicateur 1 du référentiel Qualiopi 2026 : 3 rubriques ajoutées, interdiction des mentions trompeuses, preuves à garder et pièges, texte 2019 et 2026 comparés.',
    answer: 'L\'indicateur 1 garde son socle de 2019 : une information publique, détaillée et vérifiable sur chaque prestation. À partir du 1er novembre 2026, il s\'enrichit de trois rubriques (le type de reconnaissance de la formation, les modalités pédagogiques et les modalités de financement) et d\'une phrase nouvelle : la communication du prestataire ne doit comporter « aucune mention de nature à induire le public en erreur ».',
    pratique: `<p>Reprenez chaque fiche programme, rubrique par rubrique. Le type de reconnaissance dit ce que la personne obtient à la fin : une certification inscrite au RNCP ou au répertoire spécifique, avec son numéro, ou une simple attestation de formation. Les modalités pédagogiques précisent si la formation a lieu en présentiel, à distance, en mixte ou en situation de travail. Les modalités de financement ne listent que les financements réellement mobilisables pour cette formation-là.</p>
<p>La phrase sur la communication trompeuse vise tous vos supports publics, pas seulement la fiche : site, réseaux sociaux, plaquettes, annonces sur des plateformes. Le texte cite cinq sujets : les conditions d'accès, le contenu, les modalités pédagogiques, le financement, et « les droits ou l'absence de droits de poursuite d'études conférés par la formation préparée ». Une formation qui n'ouvre aucun droit à poursuivre des études ne doit pas le laisser entendre.</p>
<p>Notre conseil de méthode : pour chaque chiffre ou promesse affichés, gardez la pièce qui le prouve, datée. Un taux sans source, un « 100 % financé » sans vérification ou un délai d'accès vague sont les écarts les plus faciles à constater pour un auditeur, puisqu'il lui suffit de lire votre site.</p>`,
    exempleTitle: 'Les mentions à relire avant l\'audit',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Mentions à vérifier et preuves à garder">
<table><thead><tr><th scope="col">Mention publiée</th><th scope="col">Pièce à garder (datée)</th></tr></thead><tbody>
<tr><td>« Éligible au CPF »</td><td>Capture de la fiche de la formation sur Mon Compte Formation</td></tr>
<tr><td>« 95 % de réussite »</td><td>Note de calcul : période, présentés, certifiés (voir l'indicateur 2)</td></tr>
<tr><td>« Démarrage sous 15 jours »</td><td>Délais réellement constatés sur les dernières sessions</td></tr>
<tr><td>« Formation certifiante »</td><td>Numéro de la fiche RNCP ou RS et sa date de fin d'enregistrement</td></tr>
<tr><td>« Accessible aux personnes en situation de handicap »</td><td>Procédure d'accueil et nom du référent handicap (indicateur 26)</td></tr>
</tbody></table></div>
<p class="small muted">Tableau d'exemple rédigé pour cette page. Le modèle T01 du kit reprend toutes les rubriques de l'indicateur 1 dans une fiche programme à compléter.</p>`,
    preuves: ['Fiche programme publiée pour chaque prestation (site, catalogue, plateforme), à jour et datée', 'Rubriques présentes : public et prérequis, objectifs, durée, modalités et délais d\'accès, tarifs, contacts, méthodes et modalités pédagogiques, modalités d\'évaluation, accessibilité handicap, type de reconnaissance, financements mobilisables', 'Dossier de justification des chiffres et mentions affichés (source, date, mode de calcul)', 'Procédure ou check-list de relecture des supports de communication avant publication', 'Historique des versions des fiches (pour montrer la mise à jour)'],
    pieges: ['Délai d\'accès absent ou vague (« nous contacter »)', 'Mention de financement CPF, OPCO ou France Travail non vérifiée pour la formation concernée', 'Promesse implicite de certification ou de poursuite d\'études non justifiée'],
    related: [2, 3, 32],
  },
  2: {
    label: 'indicateurs de résultats et mode de calcul',
    title: 'Indicateur 2 Qualiopi (2026) : résultats et mode de calcul',
    description: 'Indicateur 2 du référentiel Qualiopi 2026 : publier ses taux avec leur mode de calcul ou un dispositif existant. Texte comparé, exemple de note de calcul, preuves.',
    answer: 'Depuis 2019, l\'indicateur 2 impose de publier des indicateurs de résultats adaptés à vos prestations et à vos publics. Le décret de 2026 précise comment : « en précisant de manière transparente leurs modalités de calcul ou en s\'appuyant sur des dispositifs existants ». À partir du 1er novembre 2026, un taux publié sans sa méthode ne répond plus à la lettre du texte.',
    pratique: `<p>Pour chaque chiffre affiché, écrivez à côté la période, l'effectif, le numérateur et le dénominateur. Sur un exemple fictif, « 96 % de satisfaction » devient : « 96 % des 48 répondants (sur 61 stagiaires) se disent satisfaits ou très satisfaits ; sessions de janvier à juin 2026 ; questionnaire de fin de formation ». Le lecteur voit la taille de l'échantillon, et l'auditeur peut refaire le calcul à partir de votre fichier source.</p>
<p>Le texte ne dit pas quels « dispositifs existants » peuvent servir. Pour les CFA, le guide de lecture V9 renvoyait déjà aux indicateurs officiels de l'article L. 6111-8 du code du travail, calculés par les ministères et diffusés sur <a href="https://www.inserjeunes.education.gouv.fr/diffusion/accueil" rel="noopener">InserJeunes</a>. Publier le lien vers ces chiffres est, selon notre lecture, une façon de s'appuyer sur un dispositif existant.</p>
<p>Vous débutez ? Pour les nouveaux entrants, le guide V9 prévoyait que des indicateurs soient « pré-identifiés au moment de l'audit initial » et audités à l'audit de surveillance. En attendant, écrivez sur votre site quand paraîtront les premiers résultats plutôt que de laisser la rubrique vide.</p>`,
    exempleTitle: 'Exemple de note de calcul (extrait du modèle T02)',
    exemple: `<blockquote class="official"><p><strong>Taux d'abandon.</strong> Nombre de participants sortis avant la fin sans motif de force majeure / nombre d'entrants. [Précisez ce que vous comptez comme abandon.]</p>
<p><strong>Taux d'obtention.</strong> Nombre de candidats ayant obtenu la certification complète / nombre de candidats présentés à l'examen. [Indiquez aussi, si possible, le nombre d'inscrits en formation pour éviter toute présentation trompeuse.]</p>
<footer>Extrait du modèle T02 « Tableau des indicateurs de résultats et note de calcul » du kit. Les crochets sont les zones à compléter.</footer></blockquote>`,
    preuves: ['Page ou document public listant les indicateurs de résultats (satisfaction, réussite, abandon, insertion selon les cas)', 'Note méthodologique : définition, période, effectif, formule, source des données', 'Fichier source (tableur) permettant de recalculer chaque chiffre publié', 'Date de dernière mise à jour visible'],
    pieges: ['Taux affiché sans effectif (« 98 % de satisfaction » sur 6 répondants)', 'Indicateur publié une fois et jamais actualisé', 'Nouvel organisme : ne rien afficher au lieu d\'expliquer que les premiers résultats seront publiés après les premières sessions'],
    related: [1, 3, 30],
  },
  3: {
    label: 'certification préparée et poursuites d\'études',
    title: 'Indicateur 3 Qualiopi (2026) : certification et poursuites d\'études',
    description: 'Indicateur 3 du référentiel Qualiopi 2026 : formations certifiantes, taux d\'obtention, blocs, passerelles et poursuites d\'études. Texte comparé, encadré type, preuves.',
    answer: 'L\'indicateur 3 ne concerne que les prestations qui conduisent à une certification professionnelle. Sa liste d\'informations à publier ne change presque pas : le décret de 2026 ajoute, parmi les suites de parcours, « en particulier les poursuites d\'études ». Cet ajout se lit avec l\'indicateur 1, qui interdit désormais toute mention trompeuse sur les droits, ou l\'absence de droits, de poursuite d\'études.',
    pratique: `<p>Dans l'annexe, l'indicateur 3 est coché pour les actions de formation, la VAE et l'apprentissage, pas pour les bilans de compétences. S'il vous concerne, il fait partie des indicateurs revus à chaque audit de surveillance (« pour les organismes concernés », article 2 de l'arrêté du 6 juin 2019).</p>
<p>Le plus simple est un encadré « Après la formation » sur chaque fiche certifiante, alimenté par la fiche officielle de la certification sur le site de France compétences : blocs de compétences, équivalences, passerelles, poursuites d'études possibles, débouchés. Ne promettez pas une poursuite d'études que la fiche ne mentionne pas.</p>
<p>Pour le taux d'obtention, dites sur quelle base il est calculé. Un taux sur les seuls candidats présentés à l'examen peut être très supérieur à un taux sur les inscrits en formation : les deux sont acceptables si la base est écrite.</p>`,
    exempleTitle: 'Exemple d\'encadré « Après la formation »',
    exemple: `<div class="callout"><p><strong>Après la formation.</strong> Certification [intitulé], fiche RNCP [n°] (enregistrée jusqu'au [date]), délivrée par [certificateur]. Taux d'obtention [année] : [x] % ([n] certifiés sur [N] candidats présentés). Validation possible par blocs : [liste]. Équivalences et passerelles : [selon la fiche]. Poursuites d'études possibles : [selon la fiche, ou « aucune poursuite d'études n'est ouverte de droit »]. Métiers visés : [liste].</p></div>
<p class="small muted">Gabarit rédigé pour cette page ; les crochets sont à remplacer par les informations de la fiche officielle.</p>`,
    preuves: ['Fiche programme avec numéro et lien de la fiche RNCP/RS et nom du certificateur', 'Taux d\'obtention par session ou par année, avec effectif', 'Description des blocs de compétences et de leur validation partielle', 'Équivalences, passerelles et poursuites d\'études possibles (issues de la fiche officielle)', 'Débouchés : métiers visés, codes ROME le cas échéant'],
    pieges: ['Taux d\'obtention calculé sur les seuls présents à l\'examen sans le dire', 'Poursuites d\'études affirmées alors que la certification ne les permet pas'],
    related: [1, 2, 7],
  },
  7: {
    label: 'adéquation à la certification et capacité à l\'assurer',
    title: 'Indicateur 7 Qualiopi (2026) : capacité à assurer la certification',
    description: 'Indicateur 7 du référentiel Qualiopi 2026 : correspondance contenus et certification, preuve de la capacité à l\'assurer, organisme habilité. Texte comparé, preuves.',
    answer: 'Pour les formations qui préparent à une certification professionnelle, l\'indicateur 7 exigeait déjà que les contenus correspondent aux exigences de la certification visée. Le décret de 2026 ajoute que le prestataire « peut prouver sa capacité à assurer cette certification, y compris en qualité d\'organisme habilité ». Il s\'applique aux actions de formation et à l\'apprentissage, pas aux bilans ni à la VAE.',
    pratique: `<p>Montez un dossier par certification préparée. Il contient la fiche RNCP ou RS et sa date de fin d'enregistrement, un tableau de correspondance entre vos modules et les blocs ou compétences du référentiel, la convention ou l'habilitation qui vous lie au certificateur si ce n'est pas vous, et la preuve des moyens d'évaluation qu'il exige (évaluateurs, jury, plateau technique).</p>
<p>L'enjeu est élevé : l'indicateur 7 fait partie de ceux qui ne peuvent donner lieu qu'à une non-conformité majeure (article 5 de l'arrêté du 6 juin 2019), et il est donc revu à chaque audit de surveillance. Une habilitation arrivée à échéance, ou une certification sortie du répertoire sans que votre offre soit mise à jour, suffit à le faire tomber.</p>`,
    exempleTitle: 'Exemple de tableau de correspondance',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Exemple de tableau de correspondance">
<table><thead><tr><th scope="col">Bloc / compétence du référentiel</th><th scope="col">Module(s)</th><th scope="col">Durée</th><th scope="col">Évaluation interne</th><th scope="col">Évaluation certificative</th></tr></thead><tbody>
<tr><td>[Bloc 1 : intitulé de la fiche]</td><td>[M1, M2]</td><td>[35 h]</td><td>[cas pratique]</td><td>[mise en situation devant jury]</td></tr>
<tr><td>[Bloc 2]</td><td>[M3]</td><td>[21 h]</td><td>[QCM + exercice]</td><td>[dossier professionnel]</td></tr>
</tbody></table></div>
<p class="small muted">Colonnes du modèle T18 « Dossier certification » du kit ; contenu d'exemple.</p>`,
    preuves: ['Référentiel de compétences et d\'évaluation de la certification (fiche RNCP/RS)', 'Tableau de correspondance entre modules et compétences ou blocs visés', 'Convention de partenariat ou d\'habilitation avec le certificateur, à jour et en cours de validité', 'Preuve des moyens d\'évaluation exigés par le certificateur (jury, plateau technique, évaluateurs habilités)'],
    pieges: ['Habilitation expirée ou certification sortie du répertoire sans mise à jour de l\'offre', 'Correspondance contenus/compétences inexistante'],
    related: [3, 1, 16],
  },
  12: {
    label: 'violences, harcèlement et discriminations',
    title: 'Indicateur 12 Qualiopi (2026) : violences, harcèlement, ruptures',
    description: 'Indicateur 12 du référentiel Qualiopi 2026 : prévention et traitement des violences, du harcèlement et des discriminations. Texte comparé, procédure type, preuves, modèle gratuit.',
    answer: 'L\'indicateur 12 demandait des mesures pour favoriser l\'engagement des bénéficiaires et prévenir les abandons. Le décret de 2026 lui ajoute une phrase : le prestataire « s\'assure de la prévention et du traitement de toute situation de violence, dont les violences sexistes et sexuelles, de harcèlement ou de discrimination dans le cadre de leur formation ». Il s\'applique à tous les prestataires, toutes catégories d\'actions confondues.',
    pratique: `<p>« Prévention et traitement » appellent une procédure écrite, connue des bénéficiaires et des intervenants. Elle dit qui reçoit un signalement, par quel canal, dans quel délai il est traité, quelles mesures de protection sont possibles, et où la trace est conservée.</p>
<p>Deux points font la différence à l'audit, selon notre lecture. D'abord un second canal de signalement, qui ne passe pas par une personne qui pourrait être mise en cause (un formateur seul, le dirigeant d'une petite structure). Ensuite un registre confidentiel des signalements : même vide, il montre que le dispositif existe et qu'il est revu. Si vous formez à distance, prévoyez les situations en ligne (messagerie, classes virtuelles, forums).</p>
<p>La partie « engagement et prévention des ruptures » reste exigée : relances, entretiens, alertes d'absentéisme, avec leur trace.</p>`,
    exempleTitle: 'Extrait du modèle gratuit T07 : les recours à communiquer',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Recours externes à communiquer aux bénéficiaires">
<table><thead><tr><th scope="col">Situation</th><th scope="col">Contact</th></tr></thead><tbody>
<tr><td>Urgence, danger immédiat</td><td>17 (police / gendarmerie), 112 (urgence européenne), 114 par SMS</td></tr>
<tr><td>Violences faites aux femmes</td><td>3919 (écoute, anonyme et gratuit)</td></tr>
<tr><td>Enfant ou mineur en danger</td><td>119</td></tr>
<tr><td>Discriminations</td><td>Défenseur des droits : 3928 ou antidiscriminations.fr</td></tr>
</tbody></table></div>
<p class="small muted">Extrait du modèle T07, que vous pouvez <a href="modeles-qualiopi-gratuits.html#t07">télécharger gratuitement</a> en Word, LibreOffice ou PDF. Vérifiez ces numéros à chaque mise à jour de votre procédure.</p>`,
    preuves: ['Procédure de prévention et de traitement des violences, harcèlement et discriminations, datée et diffusée', 'Information des bénéficiaires (livret d\'accueil, règlement intérieur, affichage, plateforme)', 'Désignation d\'une personne référente et de son suppléant', 'Registre confidentiel des signalements et des suites données (même vide, il doit exister)', 'Mesures de prévention des abandons : relances, entretiens, alertes d\'absentéisme, et leur trace', 'Sensibilisation des formateurs (date, contenu, liste des participants)'],
    pieges: ['Procédure copiée qui ne nomme personne et ne dit pas comment signaler', 'Aucun canal permettant de signaler un formateur ou un dirigeant', 'Données de signalement conservées sans confidentialité'],
    related: [14, 15, 31],
    freeTemplate: 'T07',
  },
  14: {
    label: 'CFA : ruptures liées à des violences ou discriminations',
    title: 'Indicateur 14 Qualiopi (2026) : CFA, ruptures sensibles',
    description: 'Indicateur 14 du référentiel Qualiopi 2026, propre aux CFA : procédure de traitement sans délai des ruptures liées à des difficultés, violences ou discriminations. Texte, preuves.',
    answer: 'L\'indicateur 14 ne concerne que l\'apprentissage. Il demandait un accompagnement socio-professionnel, éducatif et relatif à l\'exercice de la citoyenneté. Le décret de 2026 ajoute que le CFA « dispose d\'une procédure de traitement sans délai des situations de rupture liées à des difficultés, violences ou discriminations subies par l\'apprenant en formation ou dans l\'entreprise d\'accueil ».',
    pratique: `<p>La nouveauté porte sur trois mots : « sans délai », et sur un lieu : l'entreprise d'accueil. La procédure doit donc couvrir ce qui arrive chez l'employeur, pas seulement au CFA. Écrivez qui est alerté, en combien de temps, quelles mesures conservatoires sont possibles (changement de groupe, suspension d'une mise en situation, recherche d'une autre entreprise), comment l'apprenti est suivi ensuite, et quand le CFA informe l'entreprise et les autorités compétentes.</p>
<p>L'indicateur 14 se prépare avec deux voisins : le 12, qui impose à tous les prestataires une procédure violences et harcèlement, et le 15, qui oblige le CFA à informer l'apprenti des dispositifs de signalement. Une seule procédure peut servir aux trois si elle traite explicitement le cas de l'entreprise d'accueil.</p>
<p>Côté audit, l'indicateur 14 ne peut donner lieu qu'à une non-conformité majeure (article 5 de l'arrêté du 6 juin 2019) et il est revu à chaque audit de surveillance. Pour un CFA nouvel entrant, l'audit initial vérifie la formalisation du processus et l'audit de surveillance sa mise en œuvre (article 1er).</p>`,
    exempleTitle: 'Exemple de déroulé « rupture sensible »',
    exemple: `<ol class="steps">
<li><h3>Jour du signalement</h3><p>Le référent [nom] reçoit le signalement (apprenti, formateur, maître d'apprentissage) et l'inscrit au registre confidentiel.</p></li>
<li><h3>Sous [24 h]</h3><p>Entretien avec l'apprenti ; mesures conservatoires si besoin ; information de la direction du CFA.</p></li>
<li><h3>Sous [5 jours]</h3><p>Échange avec l'entreprise d'accueil si la situation la concerne ; orientation vers le médiateur de l'apprentissage ou signalement à l'inspection du travail selon le cas.</p></li>
<li><h3>Suivi</h3><p>Point avec l'apprenti à [1 mois] ; clôture au registre avec la suite donnée.</p></li>
</ol>
<p class="small muted">Déroulé d'exemple rédigé pour cette page : les délais entre crochets sont les vôtres. Le kit le décline dans les modèles T07 et T08.</p>`,
    preuves: ['Procédure de traitement sans délai des ruptures liées à des difficultés, violences ou discriminations', 'Actions d\'accompagnement socio-professionnel (logement, transport, santé, aides) et leurs traces', 'Actions éducatives et citoyennes réalisées', 'Registre des situations traitées et délais effectifs'],
    pieges: ['Procédure sans délai chiffré ni responsable', 'Procédure limitée aux faits survenus au CFA, muette sur l\'entreprise d\'accueil'],
    related: [12, 15, 33],
  },
  15: {
    label: 'CFA : information des apprentis et signalement',
    title: 'Indicateur 15 Qualiopi (2026) : CFA, droits et signalement',
    description: 'Indicateur 15 du référentiel Qualiopi 2026 : informer les apprentis (mineurs, signalement, médiateur de l\'apprentissage, inspection du travail). Texte comparé, page type, preuves.',
    answer: 'L\'indicateur 15, propre aux CFA, imposait d\'informer les apprentis de leurs droits et devoirs et des règles de santé et de sécurité. Le décret de 2026 le complète : information renforcée pour les mineurs, dispositifs de signalement des violences, du harcèlement et des discriminations, interlocuteurs à contacter, coordonnées du médiateur de l\'apprentissage, et signalement des dysfonctionnements à l\'inspection du travail.',
    pratique: `<p>Le support naturel est le livret de l'apprenti. Ajoutez-y une page « En cas de problème » qui nomme les personnes, donne leurs coordonnées et dit dans quel cas s'adresser à qui. Le médiateur de l'apprentissage est désigné par les chambres consulaires (article L. 6222-39 du code du travail) : indiquez celui de la chambre dont relève l'entreprise de l'apprenti (CCI, chambre de métiers et de l'artisanat ou chambre d'agriculture).</p>
<p>Le texte dit aussi que le CFA « veille à signaler les dysfonctionnements à l'inspection du travail ». Écrivez qui, au CFA, fait ce signalement et comment il est tracé.</p>
<p>Gardez la preuve de remise du livret à chaque apprenti (émargement ou accusé de lecture). L'indicateur 15 ne peut donner lieu qu'à une non-conformité majeure (article 5 de l'arrêté du 6 juin 2019).</p>`,
    exempleTitle: 'Exemple de page « En cas de problème » (extrait du modèle T08)',
    exemple: `<div class="callout"><ol>
<li>Parlez-en à [référent] ou à tout formateur.</li>
<li>En cas de violence, harcèlement ou discrimination, au CFA ou en entreprise : [procédure, traitement sans délai].</li>
<li>Litige avec l'employeur : médiateur de l'apprentissage [coordonnées].</li>
<li>Dysfonctionnement grave dans l'entreprise (sécurité, conditions de travail) : le CFA le signale à l'inspection du travail.</li>
</ol></div>
<p class="small muted">Extrait du livret de l'apprenti T08 du kit ; les crochets sont à compléter.</p>`,
    preuves: ['Livret de l\'apprenti à jour (droits, devoirs, rémunération, temps de travail, sécurité, règles spécifiques aux mineurs)', 'Coordonnées du médiateur de l\'apprentissage et des interlocuteurs internes', 'Procédure de signalement des dysfonctionnements à l\'inspection du travail', 'Preuve de remise ou de présentation à chaque apprenti (émargement, accusé)'],
    pieges: ['Livret générique sans les coordonnées du médiateur compétent', 'Règles propres aux apprentis mineurs absentes ou renvoyées à « la réglementation »'],
    related: [14, 12, 20],
  },
  19: {
    label: 'ressources, suivi à distance et référent pédagogique',
    title: 'Indicateur 19 Qualiopi (2026) : distanciel et référent pédagogique',
    description: 'Indicateur 19 du référentiel Qualiopi 2026 : vérifier le suivi réel des modules à distance, référent pédagogique au-delà d\'un seuil (arrêté attendu). Texte comparé, preuves.',
    answer: 'L\'indicateur 19 demandait de mettre des ressources pédagogiques à disposition et de permettre leur appropriation. Le décret de 2026 ajoute deux obligations : pour les modules à distance, le prestataire « vérifie l\'effectivité de leur suivi par les apprenants » ; au-delà d\'un nombre d\'intervenants par formation fixé par arrêté, il dispose d\'un référent pédagogique par formation. Il concerne tous les prestataires.',
    pratique: `<p>« Effectivité du suivi » : un relevé de connexion montre une présence, pas un apprentissage. Retenez pour chaque module à distance au moins une preuve de progression (quiz réussi, exercice rendu et corrigé, échange avec un tuteur, production finale), et une règle de relance des inactifs.</p>
<p>Le référent pédagogique dépend d'un seuil que l'arrêté doit fixer. Tant qu'il n'est pas publié, personne ne sait à partir de combien d'intervenants le référent devient obligatoire. Désigner dès maintenant un référent pour chaque formation à plusieurs intervenants coûte peu et se prouve par une simple lettre de désignation.</p>
<p>L'indicateur 19 est revu à chaque audit de surveillance (article 2 de l'arrêté du 6 juin 2019). Il peut donner lieu à une non-conformité mineure ou majeure selon le guide V9, et il fait partie des indicateurs audités sur la seule formalisation pour les nouveaux entrants.</p>`,
    exempleTitle: 'Exemple de protocole de suivi à distance (extrait du modèle T09)',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Protocole de suivi du distanciel">
<table><thead><tr><th scope="col">Étape</th><th scope="col">Règle</th></tr></thead><tbody>
<tr><td>Démarrage</td><td>Premier contact tutoral sous [48 h] après l'ouverture des accès</td></tr>
<tr><td>Suivi</td><td>Revue hebdomadaire de l'activité et de la progression</td></tr>
<tr><td>Inactivité</td><td>Relance après [7] jours sans activité, appel après [14] jours</td></tr>
<tr><td>Assistance technique</td><td>Délai de réponse [24 h ouvrées]</td></tr>
<tr><td>Fin</td><td>Vérification de l'atteinte des objectifs</td></tr>
</tbody></table></div>
<p class="small muted">Extrait du modèle T09 du kit ; les valeurs entre crochets sont à fixer par vous.</p>`,
    preuves: ['Liste des ressources par prestation et modalités d\'accès (pendant et après la formation)', 'Traces d\'appropriation : exercices réalisés, quiz, productions, échanges avec le tuteur', 'Pour le distanciel : relevés d\'activité ET preuves de progression, procédure de relance des inactifs', 'Désignation écrite d\'un référent pédagogique par formation (si le seuil fixé par arrêté est atteint)'],
    pieges: ['Relevés de connexion présentés comme seule preuve du suivi à distance', 'Plusieurs formateurs sur une même formation sans coordination pédagogique identifiée'],
    related: [18, 21, 32],
    arrete: 19,
  },
  20: {
    label: 'CFA : gouvernance et supervision pédagogique',
    title: 'Indicateur 20 Qualiopi (2026) : CFA, gouvernance et supervision',
    description: 'Indicateur 20 du référentiel Qualiopi 2026, propre aux CFA : gouvernance avec apprentis, formateurs et entreprises, part d\'heures des permanents (seuil attendu). Texte, preuves.',
    answer: 'L\'indicateur 20, propre aux CFA, exigeait un personnel dédié à la mobilité, un référent handicap et un conseil de perfectionnement. Le décret de 2026 ajoute la qualité du pilotage, la participation des apprentis, des formateurs et des entreprises à la gouvernance, et une supervision pédagogique renforcée lorsque la part d\'heures d\'enseignement assurées par des intervenants permanents passe sous un seuil fixé par arrêté.',
    pratique: `<p>Calculez dès maintenant, formation par formation, la part d'heures assurées par vos intervenants permanents. Exemple fictif : 1 200 heures d'enseignement, dont 420 assurées par des permanents, soit 35 %. Le seuil n'est pas connu tant que l'arrêté n'est pas publié ; si vous êtes loin des 100 %, documentez déjà la supervision des vacataires (observations de séances, réunions de coordination, accompagnement des nouveaux intervenants).</p>
<p>Pour la gouvernance, le texte vise la participation « des apprentis, formateurs et entreprises ». Un conseil de perfectionnement qui les réunit, avec des comptes rendus et des décisions suivies dans le plan d'amélioration, en est la preuve la plus directe. Un conseil constitué mais jamais réuni n'en est pas une.</p>
<p>L'indicateur 20 ne peut donner lieu qu'à une non-conformité majeure (article 5 de l'arrêté du 6 juin 2019) et il est revu à chaque audit de surveillance.</p>`,
    exempleTitle: 'Exemple de calcul (colonnes du modèle T19)',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Part d'heures assurées par des intervenants permanents">
<table><thead><tr><th scope="col">Formation</th><th scope="col">Heures totales</th><th scope="col">Heures par des permanents</th><th scope="col">Part</th><th scope="col">Seuil (arrêté)</th></tr></thead><tbody>
<tr><td>[BTS, exemple]</td><td>1 200</td><td>420</td><td>35 %</td><td>non publié</td></tr>
<tr><td>[CAP, exemple]</td><td>800</td><td>560</td><td>70 %</td><td>non publié</td></tr>
</tbody></table></div>
<p class="small muted">Chiffres fictifs. Le modèle T19 du kit ajoute la colonne « supervision renforcée nécessaire » et le dispositif de supervision.</p>`,
    preuves: ['Désignation du référent mobilité et du référent handicap (fiche de mission)', 'Composition, calendrier et comptes rendus du conseil de perfectionnement', 'Preuve de participation des parties prenantes (entreprises, apprentis, formateurs) à la gouvernance', 'Calcul de la part d\'heures assurées par des intervenants permanents', 'Dispositif de supervision pédagogique (si sous le seuil)'],
    pieges: ['Conseil de perfectionnement constitué mais jamais réuni', 'Part d\'heures des permanents jamais calculée en attendant l\'arrêté'],
    related: [15, 26, 29],
    arrete: 20,
  },
  27: {
    label: 'sous-traitance et portage salarial',
    title: 'Indicateur 27 Qualiopi (2026) : sous-traitance tracée dans les contrats',
    description: 'Indicateur 27 du référentiel Qualiopi 2026 : la conformité des sous-traitants et portés doit être tracée dans les contrats. Texte comparé, clause type gratuite, preuves.',
    answer: 'Quand un organisme fait appel à la sous-traitance ou au portage salarial, l\'indicateur 27 lui demandait déjà de s\'assurer que le référentiel est respecté. Le décret de 2026 ajoute qu\'il « en assure la traçabilité dans les contrats de sous-traitance ». À partir du 1er novembre 2026, la preuve attendue est écrite dans le contrat lui-même.',
    pratique: `<p>Chaque contrat de sous-traitance ou de portage, nouveau ou en cours, doit porter la trace des obligations qualité : une clause qui renvoie au référentiel et une annexe qui liste, exigence par exigence, ce que fait le sous-traitant et la preuve qu'il fournit. Pour les contrats en cours, un avenant suffit.</p>
<p>Le cadre existait déjà en partie. Le guide de lecture V9 indique qu'un contrat entre l'organisme et son sous-traitant « est nécessaire pour formaliser les missions confiées », et rappelle que, pour les formations financées par le CPF, le contrat de sous-traitance est écrit et précise les missions, le contenu, les moyens, la durée, la période et le montant (article R. 6333-6-2 du code du travail). Le ministère du Travail précise aussi que le donneur d'ordre doit s'assurer du respect du référentiel par son sous-traitant ou le salarié porté.</p>
<p>L'indicateur 27 ne peut donner lieu qu'à une non-conformité majeure (article 5 de l'arrêté du 6 juin 2019) et il est revu à chaque audit de surveillance s'il vous est applicable.</p>`,
    exempleTitle: 'Extrait du modèle gratuit T13 : la clause',
    exemple: `<blockquote class="official"><p>Le [Sous-traitant / Consultant porté] s'engage à réaliser les prestations qui lui sont confiées dans le respect des exigences de ce référentiel applicables aux missions décrites à l'annexe qualité, et à fournir les éléments de preuve qui y sont listés.</p>
<footer>Point 2 de la clause « Qualité des prestations » du modèle T13, à <a href="modeles-qualiopi-gratuits.html#t13">télécharger gratuitement</a> avec son annexe. Faites relire la version finale par votre conseil.</footer></blockquote>`,
    preuves: ['Contrats de sous-traitance ou de portage comportant une clause relative au référentiel qualité', 'Annexe qualité : obligations, documents à fournir, modalités de contrôle', 'Contrôles réalisés (évaluations, observations, revues de documents) et leurs dates', 'Liste à jour des sous-traitants et portés'],
    pieges: ['Contrats anciens sans aucune mention du référentiel', 'Sous-traitant lui-même certifié présenté comme dispense de tout contrôle'],
    related: [12, 21, 32],
    freeTemplate: 'T13',
  },
  30: {
    label: 'appréciations des parties prenantes',
    title: 'Indicateur 30 Qualiopi (2026) : recueil des appréciations',
    description: 'Indicateur 30 du référentiel Qualiopi 2026 : qui interroger (bénéficiaires, financeurs le cas échéant, équipes, entreprises), le seul changement de texte, et le lien avec l\'indicateur 33.',
    answer: 'L\'indicateur 30 change à peine en 2026 : le prestataire recueille toujours les appréciations des bénéficiaires, des financeurs, des équipes pédagogiques et des entreprises concernées. Le décret ajoute seulement « (le cas échéant) » après les financeurs. Ce qui change autour de lui compte davantage : les CFA ont désormais un indicateur 33 distinct pour l\'évaluation des enseignements.',
    pratique: `<p>« Le cas échéant » : selon notre lecture, un financeur n'est interrogé que s'il y en a un. Un particulier qui paie lui-même sa formation n'a pas de financeur tiers à solliciter. Pour une action financée par un OPCO, une entreprise ou une région, l'appréciation du financeur reste attendue.</p>
<p>Les autres parties prenantes restent : bénéficiaires (souvent à chaud, en fin de prestation, et à froid quelques mois plus tard), équipes pédagogiques, entreprises concernées. Gardez le taux de réponse avec chaque synthèse : il sert aussi aux indicateurs de résultats que vous publiez (indicateur 2), et les synthèses alimentent votre démarche d'amélioration continue (indicateur 32).</p>
<p>Si votre certificat couvre l'apprentissage, l'indicateur 33 demande en plus un dispositif d'évaluation des contenus et des enseignements « distinct du recueil général de satisfaction ». Le questionnaire de l'indicateur 30 ne peut donc pas servir aux deux. Selon le guide V9, l'indicateur 30 peut donner lieu à une non-conformité mineure ou majeure.</p>`,
    exempleTitle: 'Qui interroger, et quand',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Parties prenantes à interroger">
<table><thead><tr><th scope="col">Partie prenante</th><th scope="col">Moment</th><th scope="col">Exemple de question</th></tr></thead><tbody>
<tr><td>Bénéficiaire</td><td>Fin de prestation, puis 3 à 6 mois après</td><td>« Utilisez-vous ce que vous avez appris dans votre travail ? »</td></tr>
<tr><td>Financeur (le cas échéant)</td><td>Fin d'action ou bilan annuel</td><td>« Les documents de suivi vous ont-ils été transmis dans les délais ? »</td></tr>
<tr><td>Équipe pédagogique</td><td>Fin de session</td><td>« Les moyens prévus étaient-ils disponibles ? »</td></tr>
<tr><td>Entreprise concernée</td><td>Quelques mois après</td><td>« Avez-vous constaté une évolution des pratiques ? »</td></tr>
</tbody></table></div>
<p class="small muted">Tableau d'exemple rédigé pour cette page. Le kit fournit les questionnaires complets par partie prenante (modèle T14).</p>`,
    preuves: ['Questionnaires (à chaud, à froid) par partie prenante', 'Taux de réponse et synthèse des résultats', 'Diffusion de la synthèse en interne'],
    pieges: ['Seuls les stagiaires sont interrogés', 'Un financeur sollicité « par principe » alors qu\'il n\'y en a pas, ou oublié alors qu\'il y en a un'],
    related: [33, 32, 2],
  },
  32: {
    label: 'amélioration continue et analyse des risques',
    title: 'Indicateur 32 Qualiopi (2026) : amélioration continue et risques',
    description: 'Indicateur 32 du référentiel Qualiopi 2026 : démarche d\'amélioration continue et analyse des risques sur la qualité des formations. Texte comparé, cartographie type gratuite, preuves.',
    answer: 'L\'indicateur 32 demandait des « mesures d\'amélioration » tirées des appréciations et des réclamations. Le décret de 2026 exige « une démarche d\'amélioration continue », complétée par « une analyse des risques sur la qualité des formations délivrées ». Il s\'applique à tous les prestataires à partir du 1er novembre 2026.',
    pratique: `<p>Une démarche se voit dans la durée : un plan qui dit d'où vient chaque action (appréciation, réclamation, audit, veille, risque), qui la porte, pour quand, et si elle a eu l'effet attendu. La colonne « efficacité vérifiée » est celle qui distingue une démarche d'une liste de bonnes intentions.</p>
<p>L'analyse des risques est nouvelle. Elle porte sur la qualité des formations, pas sur les finances de l'organisme : information publiée inexacte, prérequis non vérifiés, décrochage à distance non détecté, sous-traitant qui ne respecte pas le référentiel, habilitation expirée… Cotez chaque risque (probabilité et gravité pour les bénéficiaires), notez les mesures de maîtrise, et revoyez la cartographie au moins une fois par an.</p>
<p>L'indicateur 32 ne peut donner lieu qu'à une non-conformité majeure (article 5 de l'arrêté du 6 juin 2019) et il est revu à chaque audit de surveillance. Pour un nouvel entrant, l'audit initial vérifie la formalisation du processus (article 1er). Si vous êtes un CFA, l'<a href="indicateurs/indicateur-33.html">indicateur 33</a> l'alimente directement.</p>`,
    exempleTitle: 'Extrait du modèle gratuit T16 : la cartographie des risques',
    exemple: `<div class="table-wrap" tabindex="0" role="region" aria-label="Extrait de cartographie des risques qualité">
<table><thead><tr><th scope="col">N°</th><th scope="col">Processus</th><th scope="col">Risque</th><th scope="col">Conséquence pour les bénéficiaires</th><th scope="col">Mesure de maîtrise</th></tr></thead><tbody>
<tr><td>R1</td><td>Information du public</td><td>Information publiée inexacte (financement, délai, débouchés)</td><td>Engagement sur une base erronée</td><td>Relecture avant publication</td></tr>
<tr><td>R4</td><td>Distanciel</td><td>Décrochage non détecté</td><td>Abandon, objectifs non atteints</td><td>Protocole de suivi</td></tr>
<tr><td>R6</td><td>Sous-traitance</td><td>Sous-traitant ne respectant pas le référentiel</td><td>Qualité dégradée, non-conformité</td><td>Clause et annexe qualité</td></tr>
</tbody></table></div>
<p class="small muted">Extrait du modèle T16 (10 risques rédigés, cotation probabilité × gravité), à <a href="modeles-qualiopi-gratuits.html#t16">télécharger gratuitement</a>.</p>`,
    preuves: ['Plan d\'amélioration continue daté, avec origine de chaque action (appréciation, réclamation, audit, veille, risque)', 'Analyse des risques qualité : risques identifiés, cotation, mesures de maîtrise, revue', 'Vérification de l\'efficacité des actions menées', 'Revue de direction ou bilan annuel qualité'],
    pieges: ['Liste d\'actions sans suivi de leur efficacité', 'Analyse des risques purement financière, sans lien avec la qualité des formations'],
    related: [30, 33, 31],
    freeTemplate: 'T16',
  },
};
