// P2 : une page par indicateur modifié (et le 30, ajustement mineur). Contenu propre : seo-indicateurs-data.mjs.
// Texte 2019 / 2026 et colonnes d'application : src/data/referentiel-2026.json (Légifrance, relevé le 13/10/2026).
// Règles d'audit : arrêté du 6 juin 2019 (articles 1er, 2 et 5) et préambule du guide de lecture V9.
import { INDICATOR_PAGES_CONTENT } from './seo-indicateurs-data.mjs';
import { SRC, STATUT, frDate, CHECKED, GUIDE_IS, refOf, catsLabel, indicatorHref, guideLinksHtml, INDICATOR_PAGES } from './seo-pages.mjs';
import { MAJ_ONLY, SURV_FIXED, NEW_ENTRANTS, GRADED_V9 } from './seo-page-audit.mjs';

const COND = { certifiant: 'lorsque la prestation conduit à une certification professionnelle', alternance: 'pour les formations en alternance', 'sous-traitance': 'lorsque le prestataire fait appel à la sous-traitance ou au portage salarial', travail: 'lorsque la prestation comprend des périodes de formation en situation de travail' };

// Différence mot à mot entre deux rédactions (plus longue sous-séquence commune).
export function wordDiff(a, b) {
  const x = a.split(/\s+/), y = b.split(/\s+/);
  const L = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const ops = []; let i = 0, j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { ops.push(['=', x[i]]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) { ops.push(['-', x[i]]); i++; } else { ops.push(['+', y[j]]); j++; }
  }
  while (i < x.length) ops.push(['-', x[i++]]);
  while (j < y.length) ops.push(['+', y[j++]]);
  return ops;
}
const render = (ops, keep, tag, esc) => {
  const out = []; let run = [];
  const flush = () => { if (run.length) { out.push(`<${tag}>${esc(run.join(' '))}</${tag}>`); run = []; } };
  for (const [op, w] of ops) { if (op === '=') { flush(); out.push(esc(w)); } else if (op === keep) run.push(w); }
  flush();
  return out.join(' ');
};

export function pagesIndicateurs(ctx, kit) {
  const { DATA, esc } = ctx;
  const nums = Object.keys(INDICATOR_PAGES_CONTENT).map(Number).sort((a, b) => a - b);
  const titleOf = (n) => DATA.indicators.find((i) => i.n === n).titre;
  const relHref = (n) => (INDICATOR_PAGES.has(n) ? indicatorHref(n) : `preparer-audit-qualiopi-2026.html#q-${n}`);
  return nums.map((n) => {
    const c = INDICATOR_PAGES_CONTENT[n];
    const r = refOf(n);
    const d = DATA.indicators.find((i) => i.n === n);
    const crit = DATA.criteria.find((k) => k.n === d.critere);
    const path = `indicateurs/indicateur-${n}.html`;
    const ops = wordDiff(r.texte2019, r.texte2026);
    const tpls = DATA.templates.filter((t) => t.indicators.includes(n));
    const arrete = c.arrete ? STATUT.arretes.find((a) => a.indicator === c.arrete) : null;
    const surv = SURV_FIXED.includes(n) || MAJ_ONLY.includes(n);
    const facts = [
      `Critère ${crit.n} : ${esc(crit.title.charAt(0).toLowerCase() + crit.title.slice(1))}.`,
      `Catégories d'actions cochées dans l'annexe : ${catsLabel(r)}${r.cond ? ` ; il ne s'applique que ${COND[r.cond]}` : ''}.`,
      `Statut au 1er novembre 2026 : ${esc(d.changeLabel.toLowerCase())}${d.change === 'mineur' ? ' (selon notre lecture)' : ''}.`,
      MAJ_ONLY.includes(n) ? 'Non-conformité possible : majeure seulement (arrêté du 6 juin 2019, article 5).' : GRADED_V9.includes(n) ? 'Non-conformité possible : mineure ou majeure (guide de lecture V9, préambule).' : '',
      surv ? `Audit de surveillance : fait partie de la revue minimale${n === 3 ? ' pour les organismes concernés' : ''} (arrêté, article 2).` : 'Audit de surveillance : hors de la revue minimale fixée par l\'arrêté ; il peut être vérifié sur les actions échantillonnées.',
      NEW_ENTRANTS.includes(n) ? 'Nouvel entrant : l\'audit initial vérifie la formalisation du processus, l\'audit de surveillance sa mise en œuvre (arrêté, article 1er).' : '',
      arrete ? (arrete.published ? `Arrêté d'application : <a href="${esc(arrete.url)}" rel="noopener">${esc(arrete.title)}</a>${arrete.value ? ` (${esc(arrete.value)})` : ''}.` : `Arrêté d'application : non publié au ${frDate(CHECKED)} ; il doit fixer ${esc(arrete.object)}.`) : '',
    ].filter(Boolean);

    const body = `
<article class="wrap section article">
  ${kit.crumbs([['Kit Qualiopi V10', './'], ['Référentiel 2026', 'changements-v9-v10.html'], [`Indicateur ${n}`, '']])}
  <h1>Indicateur ${n} Qualiopi : ${esc(c.label)}</h1>
  ${kit.byline()}
  <p class="answer">${c.answer}</p>

  <h2 id="texte">Le texte de 2019 et celui de 2026</h2>
  <p>Rédaction officielle, mot pour mot. ${ops.some(([o]) => o === '-') ? 'Ce que le décret retire est barré dans la première citation ; ce' : 'Ce'} qu'il ajoute est surligné dans la seconde.</p>
  <blockquote class="official diff"><p>« ${n}) ${render(ops, '-', 'del', esc)} »</p><footer>Annexe du code du travail, <a href="${SRC.annexe2019.url}" rel="noopener">version en vigueur jusqu'au 1er novembre 2026</a> (référentiel de 2019).</footer></blockquote>
  <blockquote class="official diff"><p>« ${n}) ${render(ops, '+', 'ins', esc)} »</p><footer>Rédaction issue du <a href="${SRC.decret.url}" rel="noopener">décret n° 2026-728 du 1er août 2026</a>, en vigueur le 1er novembre 2026.</footer></blockquote>

  <h2 id="champ">À qui il s'applique, et comment il est audité</h2>
  <ul>${facts.map((f) => `<li>${f}</li>`).join('')}</ul>

  <h2 id="pratique">Ce qui change en pratique</h2>
  ${c.pratique}

  <h2 id="exemple">${esc(c.exempleTitle)}</h2>
  ${c.exemple}

  <h2 id="preuves">Preuves possibles</h2>
  <p>Notre liste, à confronter au guide de lecture du référentiel 2026, qui ${GUIDE_IS}. Une même preuve peut servir à plusieurs indicateurs.</p>
  <ul>${c.preuves.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>

  <h2 id="pieges">Pièges fréquents</h2>
  <ul>${c.pieges.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>

  ${kit.kitCta({ title: `Le modèle ${tpls.map((t) => t.id).join(' et ')} pour l'indicateur ${n}`, text: `${tpls.map((t) => `${t.id} « ${esc(t.title)} »`).join(' ; ')}, en Word et LibreOffice, à compléter avec vos informations.${c.freeTemplate ? ` ${c.freeTemplate} fait partie des <a href="modeles-qualiopi-gratuits.html">modèles gratuits</a>.` : ''} Le kit complet couvre les 33 indicateurs : ${DATA.templates.length} modèles, la check-list des preuves et un plan d'action en 21 jours.` })}

  <h2 id="lies">Indicateurs liés</h2>
  <ul class="related">
    ${c.related.map((k) => `<li><a href="${relHref(k)}">${esc(titleOf(k))}<span>Indicateur ${k}${INDICATOR_PAGES.has(k) ? '' : ', inchangé en 2026 (question et texte officiel dans l\'auto-diagnostic)'}</span></a></li>`).join('\n    ')}
  </ul>
  <p class="small">Les autres indicateurs qui changent au 1er novembre 2026 : ${[...nums, 33].filter((k) => k !== n).sort((a, b) => a - b).map((k) => `<a href="${indicatorHref(k)}">${k}</a>`).join(', ')}. Vue d'ensemble : <a href="changements-v9-v10.html">le tableau des changements</a>.</p>

  <h2>Pour préparer l'audit</h2>
  ${guideLinksHtml()}

  ${kit.sources([SRC.decret, SRC.annexe2019, SRC.arrete, SRC.guideV9])}
  ${kit.about()}
</article>`;

    return {
      path, file: path, priority: '0.7',
      title: c.title,
      description: c.description,
      body,
      jsonld: [
        kit.articleLd({ path, headline: `Indicateur ${n} Qualiopi : ${c.label}`, description: c.description, citation: [SRC.decret, SRC.annexe2019, SRC.arrete] }),
        kit.breadcrumbLd([['Kit Qualiopi V10', ''], ['Référentiel 2026 : ce qui change', 'changements-v9-v10.html'], [`Indicateur ${n}`, path]]),
      ],
    };
  });
}
