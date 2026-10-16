/* Pages guides du Kit Qualiopi V10 (Jalonel) : bouton « copier » et auto-diagnostic des 33 indicateurs.
   Aucune donnée n'est envoyée : les réponses restent dans le stockage local du navigateur. */
(function () {
  'use strict';

  // Boutons « Copier »
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var el = document.getElementById(btn.getAttribute('data-copy'));
      if (!el) return;
      var text = el.innerText;
      var done = function () { btn.textContent = 'Copié'; setTimeout(function () { btn.textContent = label; }, 2000); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(el); });
      } else { selectText(el); }
    });
  });
  function selectText(el) {
    var r = document.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  // Auto-diagnostic (un simple conteneur div : rien n'est soumis ni envoyé)
  var form = document.getElementById('ad');
  if (!form) return;
  var KEY = 'kit-qualiopi-autodiag-2026-v1';
  var qs = Array.prototype.slice.call(form.querySelectorAll('.ad-q'));
  var LABEL = { oui: 'Oui', partiel: 'En partie', non: 'Non' };
  var CAT = { 1: 'actions de formation', 2: 'bilans de compétences', 3: 'VAE', 4: 'apprentissage' };
  var COND = { certifiant: 'formations certifiantes', alternance: 'alternance', 'sous-traitance': 'sous-traitance ou portage', travail: 'formation en situation de travail' };

  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function save(st) { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* navigation privée : on continue sans sauvegarde */ } }
  function checked(name) { return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return i.value; }); }
  function read() {
    var answers = {};
    qs.forEach(function (q) { var r = q.querySelector('input[type=radio]:checked'); if (r) answers[q.dataset.n] = r.value; });
    return { cats: checked('cat'), cond: checked('cond'), answers: answers, updated: new Date().toISOString() };
  }
  function applies(q, st) {
    var cats = q.dataset.cats.split('');
    var catOk = cats.some(function (c) { return st.cats.indexOf(c) !== -1; });
    var cond = q.dataset.cond;
    return catOk && (!cond || st.cond.indexOf(cond) !== -1);
  }
  function restore(st) {
    if (!st) return;
    form.querySelectorAll('input[name=cat], input[name=cond]').forEach(function (i) { i.checked = (i.name === 'cat' ? st.cats : st.cond).indexOf(i.value) !== -1; });
    Object.keys(st.answers || {}).forEach(function (n) { var r = form.querySelector('input[name="i' + n + '"][value="' + st.answers[n] + '"]'); if (r) r.checked = true; });
  }
  function questionText(q) { var l = q.querySelector('legend').cloneNode(true); l.querySelectorAll('.ad-n, .badge').forEach(function (x) { x.remove(); }); return l.textContent.trim(); }
  function meta(q) { var m = q.querySelector('.ad-meta'); return m ? m : null; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render(st) {
    var per = {}, total = { app: 0, oui: 0, partiel: 0, non: 0 }, todo = [];
    qs.forEach(function (q) {
      var ok = applies(q, st), n = q.dataset.n, a = st.answers[n];
      q.classList.toggle('is-na', !ok);
      q.querySelector('.ad-na').hidden = ok;
      if (ok && a) q.setAttribute('data-answer', a); else q.removeAttribute('data-answer');
      if (!ok) return;
      var c = q.dataset.crit; per[c] = per[c] || { app: 0, pts: 0, answered: 0 };
      per[c].app++; total.app++;
      if (a) { per[c].answered++; total[a]++; per[c].pts += a === 'oui' ? 1 : a === 'partiel' ? 0.5 : 0; }
      if (a === 'non' || a === 'partiel') todo.push({ n: +n, a: a, q: q });
    });
    var answered = total.oui + total.partiel + total.non;
    var sum = document.getElementById('ad-summary');
    if (!st.cats.length) { sum.textContent = 'Cochez au moins une catégorie d\'actions pour commencer.'; }
    else if (!answered) { sum.textContent = total.app + ' indicateurs s\'appliquent à l\'activité cochée. Répondez aux questions : le résultat se met à jour ici.'; }
    else {
      var pct = Math.round(100 * (total.oui + total.partiel / 2) / total.app);
      sum.innerHTML = '<strong>' + answered + (answered > 1 ? ' réponses' : ' réponse') + ' sur ' + total.app + ' indicateurs applicables.</strong> Oui : ' + total.oui + ' · En partie : ' + total.partiel + ' · Non : ' + total.non + (answered < total.app ? ' · Sans réponse : ' + (total.app - answered) : '') + '. Indicateurs couverts, en comptant « en partie » pour moitié : ' + pct + ' %.';
    }
    var bars = document.getElementById('ad-bars');
    bars.innerHTML = Object.keys(per).sort().map(function (c) {
      var p = per[c], v = Math.round(100 * p.pts / p.app);
      return '<li><span>Critère ' + c + '</span><span class="ad-bar" role="img" aria-label="Critère ' + c + ' : ' + v + ' %"><span style="width:' + v + '%"></span></span><span>' + v + ' %</span></li>';
    }).join('');
    todo.sort(function (x, y) { return (x.a === 'non' ? 0 : 1) - (y.a === 'non' ? 0 : 1) || x.n - y.n; });
    var box = document.getElementById('ad-todo');
    box.innerHTML = todo.length ? '<h4>À traiter en priorité (' + todo.length + ')</h4><ol class="ad-todo">' + todo.map(function (t) {
      var m = meta(t.q);
      return '<li><a href="#q-' + t.n + '">Indicateur ' + t.n + '</a> (' + LABEL[t.a].toLowerCase() + ') : ' + esc(questionText(t.q)) + (m ? ' <span class="small muted">' + m.innerHTML + '</span>' : '') + '</li>';
    }).join('') + '</ol>' : '';
    return { per: per, total: total, todo: todo };
  }

  function update() { var st = read(); save(st); render(st); }
  var saved = load();
  restore(saved);
  render(read());
  form.addEventListener('change', update);

  document.getElementById('ad-reset').addEventListener('click', function () {
    if (!window.confirm('Effacer toutes vos réponses ?')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* rien */ }
    form.querySelectorAll('input').forEach(function (i) { i.checked = i.name === 'cat' && i.value === '1'; });
    render(read());
  });

  // Impression : une page dédiée, construite à la volée
  document.getElementById('ad-print-btn').addEventListener('click', function () {
    var st = read(), res = render(st), out = document.getElementById('ad-print');
    var d = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    var rows = qs.map(function (q) {
      var ok = applies(q, st), a = st.answers[q.dataset.n];
      return '<tr><td>' + q.dataset.n + '</td><td>' + esc(questionText(q)) + '</td><td>' + (ok ? (a ? LABEL[a] : '–') : 'Non applicable') + '</td></tr>';
    }).join('');
    out.innerHTML = '<h2>Auto-diagnostic Qualiopi, référentiel 2026</h2>' +
      '<p>Rempli le ' + d + '. Activité : ' + (st.cats.map(function (c) { return CAT[c]; }).join(', ') || 'non précisée') + (st.cond.length ? ' ; ' + st.cond.map(function (c) { return COND[c]; }).join(', ') : '') + '.</p>' +
      '<p>' + document.getElementById('ad-summary').textContent + '</p>' +
      '<p>' + Object.keys(res.per).sort().map(function (c) { var p = res.per[c]; return 'Critère ' + c + ' : ' + Math.round(100 * p.pts / p.app) + ' %'; }).join(' · ') + '</p>' +
      '<table><thead><tr><th>N°</th><th>Indicateur (reformulé)</th><th>Réponse</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p>Outil gratuit Jalonel : qualiopi.jalonel.com/preparer-audit-qualiopi-2026.html. Information, pas un conseil juridique ; le texte du décret n° 2026-728 fait foi.</p>';
    document.body.classList.add('print-ad');
    var clear = function () { document.body.classList.remove('print-ad'); window.removeEventListener('afterprint', clear); };
    window.addEventListener('afterprint', clear);
    window.print();
    setTimeout(clear, 1000);
  });

  // Audit à blanc : 5 indicateurs applicables tirés au hasard
  var drawBtn = document.getElementById('ad-draw-btn');
  if (drawBtn) drawBtn.addEventListener('click', function () {
    var st = read();
    var pool = qs.filter(function (q) { return applies(q, st); });
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    document.getElementById('ad-draw-list').innerHTML = pool.slice(0, 5).sort(function (x, y) { return x.dataset.n - y.dataset.n; }).map(function (q) {
      return '<li><a href="#q-' + q.dataset.n + '">Indicateur ' + q.dataset.n + '</a> : ' + esc(questionText(q)) + ' <span class="small muted">' + esc(q.querySelector('.ad-hint').textContent) + '</span></li>';
    }).join('');
    drawBtn.textContent = 'Tirer 5 autres indicateurs';
  });
})();
