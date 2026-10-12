# Kit Qualiopi V10 — site public

Site : https://vread-corp.github.io/kit-qualiopi-v10/ (GitHub Pages, branche `main`, dossier `/docs`).

Préparation au référentiel national qualité applicable au **1er novembre 2026** (décret n° 2026-728 du 1er août 2026, 33 indicateurs) : tableau des changements V9 → V10, échantillon gratuit (Release), présentation du kit complet (79 €, TVA non applicable, art. 293 B du CGI ; vente aux professionnels sur la page « Commander » quand `SALES_OPEN=true` dans `sales.config.json`).

Un produit de READ FRANCE SAS. Produit indépendant : ni édité ni validé par l'État, France compétences ou un organisme certificateur. Information, pas un conseil juridique.

## Développement

```bash
npm ci
npm run build        # génère docs/ à partir de scripts/build.mjs et src/
npm test             # build + tests Playwright (rendu, console, 390 px, liens)
npm run check:live   # mêmes tests contre le site en ligne
```

`src/data/changements.json` est exporté depuis le dépôt privé du contenu (seules les données déjà présentes dans l'échantillon gratuit). Aucun cookie, aucun traceur, aucune donnée personnelle collectée.

## Contact

Ouvrez un ticket (issue). N'y mettez pas de données personnelles.

## Vente (B2B) : interrupteur `SALES_OPEN`

`sales.config.json` contrôle la vente. Avec `"SALES_OPEN": false` (valeur actuelle), le site généré ne contient **aucun** élément d'achat : pas de page Commander ni de page de commande, pas de Stripe.js, rien dans le sitemap. Le message « pas encore en vente » reste affiché. `tests/sales-gate.test.mjs` le vérifie sur la sortie de build et sur `docs/`.

Les CGV professionnels sont dans `cgv-pro.html` (version du 12 octobre 2026, à faire relire). Avec `"SALES_OPEN": true`, la configuration doit aussi contenir l'URL `/exec` du web app Apps Script et une clé publique `pk_live_`.

L'ouverture se fait uniquement par `octave-checkout/gas/scripts/go-live.sh`. `src/checkout/pay.js` et `src/checkout/order.js` sont des copies exactes de `octave-checkout/gas/web/` : go-live refuse de continuer si elles diffèrent. `scripts/checkout-pages.mjs` est identique dans les deux sites de kits.
