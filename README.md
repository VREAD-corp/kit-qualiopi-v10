# Kit Qualiopi V10 — site public

Site : https://qualiopi.jalonel.com/ (GitHub Pages, branche `main`, dossier `/docs`, domaine personnalisé : `docs/CNAME` écrit par le build).

2026-10-16: moved to https://qualiopi.jalonel.com/ (brand Jalonel, a brand of READ FRANCE SAS). L'ancienne adresse https://outils.vread.fr/kit-qualiopi-v10/ redirige (301) vers la nouvelle.

Préparation au référentiel national qualité applicable au **1er novembre 2026** (décret n° 2026-728 du 1er août 2026, 33 indicateurs) : tableau des changements V9 → V10, échantillon gratuit (Release), présentation du kit complet (129 €, TVA non applicable, art. 293 B du CGI ; vente aux professionnels sur la page « Commander » quand `SALES_OPEN=true` dans `sales.config.json`).

Une marque Jalonel (https://jalonel.com/), marque de READ FRANCE SAS. Produit indépendant : ni édité ni validé par l'État, France compétences ou un organisme certificateur. Information, pas un conseil juridique.

## Développement

```bash
npm ci
npm run build        # génère docs/ à partir de scripts/build.mjs et src/
npm test             # build + tests Playwright (rendu, console, 390 px, liens)
npm run check:live   # mêmes tests contre le site en ligne
```

`src/data/changements.json` est exporté depuis le dépôt privé du contenu (seules les données déjà présentes dans l'échantillon gratuit). Aucun cookie, aucune donnée personnelle collectée ; mesure d'audience anonyme sans cookie (`src/mesure.js`, copie exacte de `octave-checkout/gas/web/jalonel/mesure.js`) et mesure agrégée du comportement / tests A/B (`src/cro.js`, copie exacte de `octave-checkout/gas/web/jalonel/cro.js`, testée par `tests/cro.check.mjs` ; objectifs `download` et `checkout` dans `src/cro-goals.js`). Aucune expérience A/B en cours (`window.OCTAVE_XP` non défini).

## Contact

Par e-mail : contact@jalonel.com.

## Vente (B2B) : interrupteur `SALES_OPEN`

`sales.config.json` contrôle la vente. Avec `"SALES_OPEN": false` (valeur actuelle), le site généré ne contient **aucun** élément d'achat : pas de page Commander ni de page de commande, pas de Stripe.js, rien dans le sitemap. Le message « pas encore en vente » reste affiché. `tests/sales-gate.test.mjs` le vérifie sur la sortie de build et sur `docs/`.

Les CGV professionnels sont dans `cgv-pro.html` (version du 12 octobre 2026, à faire relire). Avec `"SALES_OPEN": true`, la configuration doit aussi contenir l'URL `/exec` du web app Apps Script et une clé publique `pk_live_`.

L'ouverture se fait uniquement par `octave-checkout/gas/scripts/go-live.sh`. `src/checkout/pay.js` et `src/checkout/order.js` sont des copies exactes de `octave-checkout/gas/web/` : go-live refuse de continuer si elles diffèrent. `scripts/checkout-pages.mjs` est identique dans les deux sites de kits.

## Pages guides (SEO)

Générées par `scripts/seo-pages.mjs` (un module par page : `seo-page-33.mjs`, `seo-page-audit.mjs`, `seo-page-modeles.mjs`, `seo-page-novembre.mjs`, `seo-indicateurs.mjs`), testées par `tests/guides.test.mjs` :

| Page | Contenu |
|---|---|
| `indicateurs/indicateur-33.html` | Le nouvel indicateur 33 : texte officiel, champ d'application (colonnes de l'annexe), différence avec 30 et 32, grille d'exemple |
| `preparer-audit-qualiopi-2026.html` | Règles d'audit (arrêté du 6 juin 2019), calendrier J-60, auto-diagnostic des 33 indicateurs (`src/guides.js`, stockage local, impression), audit à blanc |
| `modeles-qualiopi-gratuits.html` | L'échantillon gratuit servi depuis le site (`src/telechargements/`, copie de `qualiopi-kit-content/dist/kit-qualiopi-v10-echantillon-1.1.0/` ; PDF de T07, T13, T16 convertis des DOCX par `soffice --headless --convert-to pdf`) |
| `indicateurs/indicateur-N.html` (N = 1, 2, 3, 7, 12, 14, 15, 19, 20, 27, 30, 32) | Une page par indicateur réécrit : texte 2019 et 2026 avec les ajouts surlignés (diff calculé), champ d'application, règles d'audit, pratique, exemple, preuves et pièges. Contenu propre dans `scripts/seo-indicateurs-data.mjs`, rendu par `scripts/seo-indicateurs.mjs` |
| `qualiopi-1er-novembre-2026.html` | Date d'application, certificats en cours, état du guide de lecture et des arrêtés, e-mail à copier pour le certificateur |

Sources de faits : `src/data/referentiel-2026.json` (texte officiel des 33 indicateurs et colonnes d'application, relevés sur Légifrance) et `src/data/statut-textes.json` (état des textes d'application). Les dates « vérifié le » des pages viennent de `statut-textes.json` → `checked`.

### Le jour où le guide de lecture paraît

1. Télécharger le guide depuis https://travail-emploi.gouv.fr/referentiel-national-qualite-guide-de-lecture-qualiopi et le lire (préambule : délai d'application, indicateurs gradués mineure / majeure ; indicateurs 12, 19, 27, 32, 33).
2. Dans `src/data/statut-textes.json` : `checked` = la date du jour ; `guide.published` = `true` ; `guide.label` (ex. « Guide de lecture V10 du 2 décembre 2026 »), `guide.date` (AAAA-MM-JJ), `guide.url` (PDF) ; `guide.notes` = 3 à 6 phrases sourcées sur ce que le guide précise (HTML autorisé). Même chose pour `arretes[]` si un arrêté (indicateurs 19 et 20) paraît : `published`, `title`, `url`, `value`.
3. `npm test`. L'encadré d'état, la chronologie et la section « guide » de `qualiopi-1er-novembre-2026.html` basculent seuls, ainsi que la phrase d'état reprise sur l'accueil, la page « Ce qui change » et les guides.
4. À relire à la main (texte non piloté par le JSON) : la FAQ de l'accueil « Le guide de lecture officiel est-il publié ? » et la liste « Points encore en attente » (`src/data/changements.json`, `pending`), la FAQ et la section « Ce que l'auditeur peut demander » de l'indicateur 33, le tableau « Indicateurs réécrits et règles d'audit » de la page audit (liste des indicateurs gradués du guide V9).
5. Pousser sur `main`, puis signaler les URL modifiées à IndexNow (clé `5be19f56d46ca3d2553bee28ebfa8edd.txt` à la racine de qualiopi.jalonel.com, écrite par le build) et demander l'indexation dans la Search Console (propriété `sc-domain:jalonel.com`), page `qualiopi-1er-novembre-2026.html` en premier.
