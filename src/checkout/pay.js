/* octave-pay-gas: product page. Stripe "deferred intent" flow with the Payment Element:
 * catalog (price from the Apps Script server) -> mount Payment Element -> on submit: browser checks,
 * elements.submit(), POST createIntent (text/plain: no CORS preflight) -> confirmPayment -> order page.
 * Stripe.js is loaded from https://js.stripe.com/v3/ (required by Stripe, never self-hosted). */
(function () {
  'use strict';
  var cfg = window.OCTAVE_PAY || {};
  var form = document.getElementById('octave-pay');
  var btn = document.getElementById('pay-button');
  var errBox = document.getElementById('pay-error');
  var attempt = randomId();
  var pending = null;
  var catalog = null;

  function randomId() {
    var a = new Uint8Array(16);
    window.crypto.getRandomValues(a);
    return 'att_' + Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }
  /** SIREN: 9 digits + Luhn (same rule as the server; La Poste 356000000 is the documented exception). */
  function sirenOk(v) {
    if (!/^\d{9}$/.test(v) || v === '000000000') return false;
    if (v === '356000000') return true;
    var sum = 0;
    for (var i = 0; i < 9; i++) {
      var d = Number(v.charAt(8 - i));
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum % 10 === 0;
  }
  window.OCTAVE_SIREN_OK = sirenOk;
  var sirenInput = form.elements.siren;
  function checkSiren() {
    var v = sirenInput.value.replace(/[\s.]/g, '');
    sirenInput.setCustomValidity(v && !sirenOk(v) ? 'SIREN invalide : vérifiez les 9 chiffres (contrôle de Luhn).' : '');
  }
  sirenInput.addEventListener('input', checkSiren);
  sirenInput.addEventListener('change', checkSiren);

  function showError(msg) { errBox.textContent = msg; errBox.hidden = false; btn.disabled = false; btn.removeAttribute('aria-busy'); }
  function call(body) {
    return fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' })
      .then(function (r) { return r.json(); });
  }

  var termsLink = document.getElementById('terms-link');
  if (cfg.termsUrl) termsLink.href = cfg.termsUrl;
  if (typeof window.Stripe !== 'function') { showError('Le module de paiement Stripe n’a pas pu être chargé.'); btn.disabled = true; return; }

  fetch(cfg.endpoint + '?action=catalog&product=' + encodeURIComponent(cfg.product), { redirect: 'follow' })
    .then(function (r) { return r.json(); })
    .then(function (c) {
      if (!c.ok) throw new Error(c.message || 'Produit indisponible.');
      catalog = c;
      var nameEl = document.getElementById('product-name');
      var priceEl = document.getElementById('product-price');
      if (nameEl && nameEl.getAttribute('data-static') !== '1') { nameEl.textContent = c.name; document.title = c.name + ' – commande'; }
      if (priceEl) priceEl.textContent = c.label;
      if (!cfg.termsUrl && c.termsUrl) termsLink.href = c.termsUrl;
      var stripe = window.Stripe(cfg.publishableKey, { locale: 'fr' });
      var elements = stripe.elements({ mode: 'payment', amount: c.amount, currency: c.currency, locale: 'fr' });
      var pe = elements.create('payment', { layout: 'tabs' });
      pe.on('ready', function () { btn.disabled = false; form.setAttribute('data-ready', '1'); });
      pe.mount('#payment-element');
      btn.textContent = 'Commander avec obligation de paiement – ' + c.label.split(' – ').pop().replace(/ \(.*\)$/, '');
      form.addEventListener('submit', function (e) { e.preventDefault(); submit(stripe, elements); });
    })
    .catch(function (e) { showError(e.message || 'Service indisponible.'); btn.disabled = true; });

  function submit(stripe, elements) {
    errBox.hidden = true;
    checkSiren();
    if (!form.reportValidity()) return;
    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    var body = {
      action: 'createIntent',
      product: cfg.product,
      email: form.elements.email.value.trim(),
      company: form.elements.company.value.trim(),
      siren: form.elements.siren.value.replace(/[\s.]/g, ''),
      addressLine1: form.elements.addressLine1.value.trim(),
      addressLine2: form.elements.addressLine2.value.trim(),
      postalCode: form.elements.postalCode.value.replace(/\s/g, ''),
      city: form.elements.city.value.trim(),
      termsAccepted: form.elements.terms.checked === true,
      termsVersion: catalog.termsVersion,
      attempt: attempt
    };
    var key = JSON.stringify(body);
    elements.submit().then(function (r) {
      if (r.error) throw r.error;
      if (pending && pending.key === key) return pending;
      return call(body).then(function (j) {
        if (!j.ok || !j.client_secret) throw new Error(j.message || 'Commande impossible.');
        pending = { key: key, clientSecret: j.client_secret };
        return pending;
      });
    }).then(function (p) {
      var returnUrl = new URL(cfg.orderPage || 'order.html', window.location.href).toString();
      return stripe.confirmPayment({ elements: elements, clientSecret: p.clientSecret, confirmParams: { return_url: returnUrl } });
    }).then(function (r) {
      if (r && r.error) showError(r.error.message || 'Paiement refusé.');
    }).catch(function (err) { showError((err && err.message) || 'Paiement impossible.'); });
  }
})();
