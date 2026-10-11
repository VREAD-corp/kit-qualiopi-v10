# Kit Qualiopi V10 — site public

Site : https://vread-corp.github.io/kit-qualiopi-v10/ (GitHub Pages, branche `main`, dossier `/docs`).

Préparation au référentiel national qualité applicable au **1er novembre 2026** (décret n° 2026-728 du 1er août 2026, 33 indicateurs) : tableau des changements V9 → V10, échantillon gratuit (Release), présentation du kit complet (79 € TTC, ventes pas encore ouvertes).

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
