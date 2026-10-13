/* Objectifs de conversion pour cro.js (tests A/B) : mêmes événements que mesure.js.
 * Téléchargement de l'échantillon gratuit (lien data-mesure="free_download") → 'download' ;
 * envoi du formulaire de commande (#octave-pay, « checkout_start » de mesure.js) → 'checkout'.
 * Aucune donnée saisie n'est lue. */
(function (d) {
  'use strict';
  function goal(name) { if (window.octaveCro) window.octaveCro.goal(name); }
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('[data-mesure="free_download"]');
    if (a) goal('download');
  }, true);
  d.addEventListener('submit', function (e) { if (e.target && e.target.id === 'octave-pay') goal('checkout'); }, true);
})(document);
