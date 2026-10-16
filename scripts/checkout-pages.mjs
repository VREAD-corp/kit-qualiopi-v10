// Shared by the sites that sell through octave-pay-gas (kit-qualiopi-v10, kit-gpsr-vendeurs,
// declaration-accessibilite): identical file in every repository.
// Generates, at build time only:
//   - the B2B terms page body (cgv-pro.html, « version du 13 octobre 2026 »: card payment or bank transfer on quote),
//   - when SALES_OPEN is true: the « Commander » page (Stripe Payment Element form), the order page
//     (Stripe return_url) and checkout-config.js,
//   - when SALES_OPEN and quotesEnabled are both true: the quote / bank-transfer block (#octave-devis-box)
//     after the card form; the build then adds checkout/devis.js after pay.js.
// The gate: loadSalesConfig() reads sales.config.json; with SALES_OPEN=false the build emits NO buy UI,
// with quotesEnabled=false (or absent) NO quote block and NO devis.js script tag.
// The checkout scripts (pay.js, order.js, devis.js) are verbatim copies of VREAD-corp/octave-checkout gas/web/
// (scripts/go-live.sh there refuses to go live if they differ).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const TERMS_VERSION = 'cgv-pro-2026-10-13';
export const TERMS_DATE = '13 octobre 2026';

export const SELLER = {
  name: 'READ FRANCE SAS',
  form: 'société par actions simplifiée (SAS)',
  // Share capital: societe.com / RNE (SASU created on 07/05/2025), set on 2026-10-12.
  capital: '1 000 €',
  address: '11 rue Rouvet, 75019 Paris, France',
  siren: '988 741 773',
  rcs: 'RCS Paris 988 741 773',
  vatNumber: 'FR57988741773',
  president: 'Tanguy Warsmann',
};

const ENDPOINT_RE = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/;

/**
 * Reads and validates sales.config.json (path overridable with SALES_CONFIG for test builds).
 * SALES_OPEN=true requires the Apps Script /exec URL and a LIVE publishable key, unless
 * SALES_ALLOW_TEST=1 (test builds only: any https endpoint and a pk_test_ key are then accepted).
 */
export function loadSalesConfig(root) {
  const file = process.env.SALES_CONFIG || join(root, 'sales.config.json');
  const c = JSON.parse(readFileSync(file, 'utf8'));
  const fail = (m) => {
    throw new Error(`${file}: ${m}`);
  };
  if (typeof c.SALES_OPEN !== 'boolean') fail('SALES_OPEN must be true or false');
  if (!['standard20', 'franchise293B'].includes(c.VAT)) fail("VAT must be 'standard20' or 'franchise293B'");
  if (!Number.isInteger(c.amount) || c.amount <= 0) fail('amount must be the price charged, in cents');
  if (typeof c.product !== 'string' || !/^[a-z0-9-]+$/.test(c.product)) fail('product id missing');
  if (c.quotesEnabled !== undefined && typeof c.quotesEnabled !== 'boolean') fail('quotesEnabled must be true or false');
  if (c.SALES_OPEN) {
    const test = process.env.SALES_ALLOW_TEST === '1';
    if (!ENDPOINT_RE.test(c.endpoint ?? '') && !(test && /^https?:\/\/[^\s"'<>]+\/exec$/.test(c.endpoint ?? ''))) fail('SALES_OPEN=true needs endpoint = https://script.google.com/macros/s/<deployment id>/exec');
    if (!/^pk_live_[A-Za-z0-9]+$/.test(c.publishableKey ?? '') && !(test && /^pk_test_[A-Za-z0-9]+$/.test(c.publishableKey ?? ''))) fail('SALES_OPEN=true needs a live publishable key (pk_live_…)');
  }
  return c;
}

const eur = (cents) => (cents / 100).toFixed(2).replace('.', ',') + ' €';

/** HT / TVA / TTC split, same rounding as the Apps Script backend (HT rounded, TVA = remainder). */
export function prices(c) {
  const std = c.VAT === 'standard20';
  const ht = std ? Math.round(c.amount / 1.2) : c.amount;
  const vat = c.amount - ht;
  return {
    std,
    ht: eur(ht),
    vat: eur(vat),
    ttc: eur(c.amount),
    short: std ? `${eur(c.amount)} TTC` : `${eur(c.amount)} net`,
    sentence: std
      ? `${eur(c.amount)} TTC, soit ${eur(ht)} HT et ${eur(vat)} de TVA au taux de 20 %`
      : `${eur(c.amount)} net de taxe (TVA non applicable, art. 293 B du CGI)`,
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Body of cgv-pro.html (French, B2B). `p`: { config, productName, productDescription, disclaimer[],
 * licenceScope, updates, legalUrl, privacyUrl, contact, payLabel? } (`payLabel`: the pay button text, cited in article 5).
 * Articles 2, 4, 5, 6, 12, 13 and 15 (card payment or bank transfer on quote): wording of
 * vread-revenue-lab legal/REVUE-CGV-VIREMENT.md §3 (kit numbering, « [kits : …] » variants).
 */
export function cgvProBody(p) {
  const pr = prices(p.config);
  const closed = !p.config.SALES_OPEN;
  return `<!--
  CGV B2B rédigées par Octave (assistant IA de READ FRANCE SAS) le 12 octobre 2026.
  CE N'EST PAS UN CONSEIL JURIDIQUE : texte à faire relire par un avocat ou un juriste avant
  l'ouverture des ventes (notamment : clauses de responsabilité et de licence). Statut TVA (franchise en base,
  art. 293 B du CGI) et capital social (1 000 €) renseignés le 12 octobre 2026 sur décision du dirigeant.
  Version du 13 octobre 2026 : paiement par virement sur devis (articles 2, 4, 5, 6, 12, 13 et 15), rédigée d'après la
  revue IA « REVUE-CGV-VIREMENT » (vread-revenue-lab) ; publiée le 16 octobre 2026 avec l'accord du dirigeant. Une
  relecture par un avocat ou un juriste reste recommandée.
-->
<h1>Conditions générales de vente aux professionnels</h1>
<p class="small muted">${esc(p.productName)} — version du ${TERMS_DATE} (référence ${TERMS_VERSION}).</p>
${closed ? `<div class="callout callout-warn" role="note"><p><strong>Les ventes ne sont pas encore ouvertes.</strong> Ces conditions s’appliqueront aux commandes passées après leur ouverture. Aucune commande ni aucun paiement n’est possible pour l’instant.</p></div>` : ''}
<h2>1. Vendeur</h2>
<p>${SELLER.name}, ${SELLER.form} au capital de ${SELLER.capital}, dont le siège social est situé ${SELLER.address}, immatriculée sous le numéro SIREN ${SELLER.siren} (${SELLER.rcs})${pr.std ? `, numéro de TVA intracommunautaire ${SELLER.vatNumber}` : ', bénéficiant de la franchise en base de TVA (TVA non applicable, art. 293 B du CGI)'}, représentée par ${SELLER.president}, président (ci-après « le Vendeur »).</p>
<p>Contact : ${p.contact}. Voir aussi les <a href="${p.legalUrl}">mentions légales</a>.</p>
<h2>2. Champ d’application et acceptation</h2>
<p>Les présentes conditions générales de vente (« CGV ») s’appliquent exclusivement aux ventes du produit « ${esc(p.productName)} » conclues en ligne entre le Vendeur et un <strong>professionnel</strong> (ci-après « l’Acheteur ») : une entreprise immatriculée en France, identifiée par son numéro SIREN, qui commande pour les besoins de son activité professionnelle. Les ventes aux consommateurs ne sont pas proposées.</p>
<p>La personne qui passe commande déclare agir au nom et pour le compte de l’entreprise indiquée et avoir le pouvoir de l’engager. Avant de payer par carte ou de demander un devis, l’Acheteur accepte expressément les présentes CGV en cochant la case prévue à cet effet ; la version acceptée est conservée avec la commande. Les CGV prévalent sur toute condition d’achat de l’Acheteur, sauf accord écrit contraire du Vendeur.</p>
<h2>3. Produit</h2>
<p>${p.productDescription}</p>
<p>Le produit est un <strong>fichier numérique</strong> (archive ZIP) livré par courrier électronique. Il ne comporte aucun support matériel ni dispositif technique de protection (DRM). L’Acheteur dispose du matériel et des logiciels courants nécessaires pour l’ouvrir (logiciel de décompression, traitement de texte).</p>
<h2>4. Prix</h2>
<p>Le prix est de <strong>${pr.sentence}</strong>, pour une licence (article 8). Il est payable en une fois, sans abonnement. Le prix applicable est celui affiché sur la page de commande au moment de la validation du paiement par carte ou, en cas de paiement par virement, celui indiqué sur le devis, ferme pendant sa durée de validité de trente (30) jours (article 5) ; ${pr.std ? 'il est rappelé hors taxes et toutes taxes comprises avant le paiement ou sur le devis et figure sur la facture' : 'il est rappelé avant le paiement ou sur le devis et figure sur la facture, qui porte la mention « TVA non applicable, art. 293 B du CGI » ; aucune TVA n’est facturée'}.</p>
<h2>5. Commande et paiement</h2>
<p>L’Acheteur renseigne sur la page « Commander » : son adresse électronique, la raison sociale et le SIREN de l’entreprise, son adresse de facturation, puis choisit son mode de paiement.</p>
<p>Le prix est payable comptant et d’avance, en une fois, au choix de l’Acheteur :</p>
<ul>
<li>par carte bancaire : l’Acheteur saisit ses données de carte dans un module sécurisé de Stripe, auxquelles le Vendeur n’a jamais accès, et valide en cliquant sur le bouton de paiement (par exemple « ${payButtonText(p.payLabel || 'Payer {prix} et recevoir le fichier', p.config.amount)} ») ; le contrat est formé à la confirmation du paiement par Stripe ; en cas de refus du paiement, la commande n’est pas enregistrée ;</li>
<li>par virement bancaire SEPA en euros, après demande de devis sur la même page, dans les conditions ci-dessous.</li>
</ul>
<p>Les paiements sont traités par le prestataire de services de paiement Stripe (pour l’Espace économique européen : Stripe Payments Europe, Limited et Stripe Technology Europe, Limited, sociétés de droit irlandais).</p>
<p><strong>Devis.</strong> Le devis est adressé à l’Acheteur par courrier électronique. Il indique le produit, le prix, sa date de fin de validité, l’IBAN et le BIC à utiliser — un numéro de compte bancaire virtuel attribué par Stripe, dont le bénéficiaire est le Vendeur, propre à l’Acheteur et identique pour tous ses devis — et une référence propre au devis, à reporter dans le libellé du virement. Le devis constitue une offre du Vendeur, valable trente (30) jours à compter de son émission ; le prix y est ferme pendant cette durée.</p>
<p><strong>Formation du contrat.</strong> Le contrat est formé, et la commande devient ferme, à la réception par Stripe, pendant la durée de validité du devis, de l’intégralité de son montant : ce paiement vaut acceptation du devis. Les présentes CGV, acceptées lors de la demande de devis et rappelées sur celui-ci, s’appliquent au contrat. Un paiement partiel ne forme pas le contrat et ne déclenche ni la livraison ni le début du service ; l’Acheteur est informé du solde restant à virer avec la même référence. Les frais bancaires éventuels de l’Acheteur restent à sa charge : le montant reçu par Stripe doit être égal au montant du devis.</p>
<p><strong>Expiration.</strong> À défaut de paiement intégral pendant sa durée de validité, le devis devient caduc. Si le paiement reste partiel à l’expiration, le Vendeur invite l’Acheteur à le compléter ; à défaut de paiement intégral dans les trente (30) jours suivant l’expiration, les sommes reçues lui sont remboursées. Un paiement reçu après l’expiration est, au choix du Vendeur, accepté aux conditions du devis — le contrat est alors formé à l’envoi par le Vendeur de la livraison ou de la confirmation de commande — ou remboursé.</p>
<p><strong>Affectation des paiements.</strong> Le paiement est affecté au devis dont la référence figure dans le libellé du virement. À défaut de référence exploitable, il est affecté au devis en cours de l’Acheteur dont le montant correspond, le plus ancien en premier ; une somme reçue au-delà du montant d’un devis peut être affectée aux autres devis en cours de l’Acheteur. L’Acheteur, qui a demandé ces devis, accepte que cette affectation vaille paiement et acceptation du devis concerné.</p>
<p><strong>Remboursements.</strong> Toute somme reçue qui n’est pas affectée à une commande (excédent, paiement en double, paiement partiel ou tardif non accepté) est remboursée à l’Acheteur dans un délai de trente (30) jours suivant sa réception ou, pour un paiement partiel, suivant le terme prévu ci-dessus. Tout remboursement dû en application des présentes CGV est effectué par le moyen de paiement utilisé : sur la carte débitée, ou par virement sur le compte bancaire d’origine. Lorsque Stripe ne dispose pas des coordonnées bancaires de l’Acheteur, elle les lui demande par courrier électronique ; le délai court alors à compter de leur communication.</p>
<p><strong>Définition.</strong> Dans les présentes CGV, la « confirmation du paiement » désigne la confirmation par Stripe d’un paiement par carte ou la réception par Stripe de l’intégralité du montant d’un devis pendant sa durée de validité, ou, pour un paiement tardif, son acceptation par le Vendeur.</p>
<h2>6. Livraison et délai</h2>
<p>Dès la confirmation du paiement (article 5), le fichier ZIP et la facture acquittée sont envoyés à l’adresse électronique indiquée lors de la commande ou de la demande de devis. L’envoi a lieu en principe dans les minutes qui suivent un paiement par carte, et dans l’heure qui suit la réception d’un virement, y compris si l’Acheteur ferme la page de confirmation, et au plus tard dans les 24 heures. La livraison est réputée effectuée à l’envoi du courrier électronique.</p>
<p>L’Acheteur veille à indiquer une adresse exacte et à consulter ses courriers indésirables. S’il n’a rien reçu dans les 24 heures, il contacte le Vendeur, qui renvoie le fichier sans frais.</p>
<h2>7. Absence de droit de rétractation</h2>
<p>La vente étant conclue entre professionnels, pour les besoins de l’activité de l’Acheteur, le droit de rétractation prévu par le code de la consommation pour les consommateurs <strong>ne s’applique pas</strong>. Le fichier étant livré immédiatement, la commande est ferme et définitive dès la confirmation du paiement, sous réserve de l’article 10.</p>
<h2>8. Licence d’utilisation</h2>
<p>Le Vendeur reste titulaire de tous les droits de propriété intellectuelle sur le produit. Le paiement du prix confère à l’Acheteur une <strong>licence non exclusive, non cessible et non transférable</strong>, pour la durée de protection des droits, d’utiliser le produit <strong>pour ses besoins internes</strong> : ${p.licenceScope}</p>
<p>Sont interdits, sauf accord écrit du Vendeur : la revente, la location, la cession ou la sous-licence du produit ou d’un de ses fichiers ; sa diffusion ou sa mise à disposition à des tiers, y compris en ligne ou au sein d’un réseau d’entreprises distinctes ; son utilisation pour fournir à des clients une prestation dont il constituerait l’essentiel. Les documents que l’Acheteur établit pour lui-même à partir des modèles lui appartiennent.</p>
<h2>9. Avertissement</h2>
${p.disclaimer.map((d) => `<p>${d}</p>`).join('\n')}
<h2>10. Conformité du fichier et mises à jour</h2>
<p>Si le fichier livré est illisible, incomplet ou ne correspond pas à la description, l’Acheteur le signale au Vendeur dans les 30 jours suivant la livraison : le Vendeur fournit un fichier conforme ou, à défaut, rembourse le prix. ${p.updates}</p>
<h2>11. Responsabilité</h2>
<p>Le Vendeur est tenu d’une obligation de moyens. Sa responsabilité ne peut être engagée qu’en cas de faute prouvée et pour les seuls dommages directs. Elle est en tout état de cause <strong>limitée au prix payé</strong> pour la commande concernée. Le Vendeur n’est pas responsable des dommages indirects (notamment perte de chiffre d’affaires, de clientèle, de certification ou d’agrément, sanction administrative), ni de l’usage que l’Acheteur fait du produit, ni des évolutions des textes postérieures à la date de version du produit. Ces limitations ne s’appliquent pas en cas de faute lourde ou dolosive.</p>
<h2>12. Facturation et pénalités de retard</h2>
<p>Une facture conforme à l’article L441-9 du code de commerce et à l’article 242 nonies A de l’annexe II du code général des impôts est établie pour chaque commande et envoyée en PDF par courrier électronique avec le fichier. À compter de la date à laquelle le Vendeur y sera tenu, la facture est émise et transmise sous forme électronique dans les conditions prévues par la réglementation sur la facturation électronique. L’Acheteur garantit l’exactitude des données de facturation qu’il fournit.</p>
<p>Le prix est payable comptant et d’avance, en une fois : à la commande en cas de paiement par carte, pendant la durée de validité du devis en cas de paiement par virement (article 5). La facture, établie à la confirmation du paiement, est acquittée. Escompte pour paiement anticipé : néant.</p>
<p>Conformément à l’article L441-10 du code de commerce, toute somme non payée à son échéance entraîne de plein droit, sans rappel préalable, des <strong>pénalités de retard au taux égal à trois fois le taux d’intérêt légal</strong>, ainsi qu’une <strong>indemnité forfaitaire pour frais de recouvrement de 40 €</strong> (article D441-5 du code de commerce), sans préjudice d’une indemnisation complémentaire sur justificatifs si les frais de recouvrement exposés sont supérieurs.</p>
<h2>13. Données personnelles</h2>
<p>Le Vendeur, responsable de traitement, traite les données fournies lors de la demande de devis ou de la commande (adresse électronique, raison sociale, SIREN, adresse de facturation, référence interne éventuelle, données de commande et de paiement, à l’exclusion des données de carte, traitées par Stripe). En cas de paiement par virement, il traite également les données que la banque de l’Acheteur transmet avec le virement et que Stripe lui communique : nom du titulaire du compte émetteur, BIC, quatre derniers chiffres de l’IBAN, date, montant et libellé du virement.</p>
<p>Ces données servent à établir et suivre le devis, exécuter la commande, établir la facture, effectuer les remboursements, tenir la comptabilité et prévenir la fraude. Bases légales : mesures précontractuelles et exécution du contrat ; obligations légales (comptables et fiscales).</p>
<p>Destinataires : Stripe (paiement par carte ; pour le virement, attribution du numéro de compte virtuel, réception et rapprochement des fonds, remboursements), qui traite aussi certaines de ces données pour son propre compte, notamment pour la prévention de la fraude et la lutte contre le blanchiment, selon sa politique de confidentialité ; Google (envoi des courriers électroniques et tenue du registre des devis, des commandes et des factures, au moyen de Google Apps Script, Gmail, Sheets et Drive) ; et le cas échéant l’expert-comptable du Vendeur. Ces prestataires peuvent traiter des données hors de l’Union européenne, dans le cadre des garanties prévues par le RGPD (décision d’adéquation ou clauses contractuelles types).</p>
<p>Durées : factures et pièces comptables, y compris les données du virement qui s’y rapportent, 10 ans (article L123-22 du code de commerce) ; autres données de commande, 5 ans après la commande ; devis non suivis de commande, 1 an après leur expiration.</p>
<p>Toute personne concernée dispose de droits d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité, qu’elle exerce auprès du Vendeur (contact ci-dessus) ; elle peut introduire une réclamation auprès de la <a href="https://www.cnil.fr/fr/plaintes">CNIL</a>. Voir aussi la <a href="${p.privacyUrl}">politique de confidentialité</a>.</p>
<h2>14. Droit applicable et juridiction</h2>
<p>Les présentes CGV et les ventes qu’elles régissent sont soumises au <strong>droit français</strong>. Les parties recherchent d’abord une solution amiable. À défaut, tout litige relatif à leur formation, leur interprétation ou leur exécution relève de la <strong>compétence exclusive des tribunaux de Paris</strong>, y compris en cas de pluralité de défendeurs ou d’appel en garantie.</p>
<h2>15. Dispositions diverses</h2>
<p>Le Vendeur peut modifier les présentes CGV ; la version applicable est celle acceptée par l’Acheteur lors de sa commande ou de sa demande de devis, rappelée sur le devis. Si une clause est déclarée nulle, les autres demeurent applicables. Le fait de ne pas se prévaloir d’une clause ne vaut pas renonciation à s’en prévaloir ultérieurement.</p>
<p class="small muted">Version du ${TERMS_DATE}.</p>`;
}

/** Pay button text: `payLabel` with {prix} = the price (« 29 € », « 129,50 € »), same format as pay.js. */
export function payButtonText(payLabel, cents) {
  const s = cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2).replace('.', ',');
  return (payLabel || 'Payer {prix}').replace('{prix}', `${s.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')}\u00a0€`);
}

/**
 * The « Commander » form, same field names and ids as octave-checkout gas/web/index.html.
 * `payLabel`: button text, {prix} replaced by the price (e.g. « Payer {prix} et recevoir le kit … »).
 * Optional (services): `intro` (sentence under the title), `emailLabel`, `extraFieldsHtml` (fields with a
 * data-octave-extra attribute, sent to the server by pay.js), `afterTermsHtml` (e.g. an attestation box),
 * `termsDate` (CGV version date shown in both checkboxes, for a site with its own CGV; default TERMS_DATE).
 */
export function orderFormHtml(p) {
  const pr = prices(p.config);
  const intro = p.intro ?? 'Vente réservée aux professionnels (entreprises immatriculées en France, SIREN obligatoire). Le fichier ZIP et la facture acquittée sont envoyés par e-mail dès le paiement confirmé.';
  return `<section class="checkout" aria-labelledby="commander-h">
<h2 id="commander-h">Commander</h2>
<p>${intro}</p>
<div class="checkout-price card"><span class="small muted">Prix</span><br><strong id="product-name" data-static="1">${esc(p.productName)}</strong> — <span class="price-inline" id="product-price">${pr.std ? `${pr.ht} HT – ${pr.ttc} TTC (TVA 20 %)` : `${pr.ttc} net (TVA non applicable, art. 293 B du CGI)`}</span></div>
<form id="octave-pay" class="checkout-form card" novalidate>
${p.extraFieldsHtml ?? ''}  <label class="field"><span>${p.emailLabel ?? 'E-mail professionnel (réception du fichier et de la facture)'}</span>
    <input type="email" name="email" autocomplete="email" required maxlength="254"></label>
  <label class="field"><span>Raison sociale</span>
    <input type="text" name="company" autocomplete="organization" required minlength="2" maxlength="200"></label>
  <label class="field"><span>SIREN (9 chiffres)</span>
    <input type="text" name="siren" inputmode="numeric" required pattern="\\s*(\\d\\s*){9}" maxlength="11" aria-describedby="siren-help"></label>
  <p id="siren-help" class="small muted">Le numéro est contrôlé (clé de Luhn) avant tout paiement.</p>
  <fieldset class="field-group"><legend>Adresse de facturation (figure sur la facture)</legend>
    <label class="field"><span>Adresse</span>
      <input type="text" name="addressLine1" autocomplete="address-line1" required minlength="3" maxlength="200"></label>
    <label class="field"><span>Complément d’adresse (facultatif)</span>
      <input type="text" name="addressLine2" autocomplete="address-line2" maxlength="200"></label>
    <label class="field"><span>Code postal</span>
      <input type="text" name="postalCode" autocomplete="postal-code" inputmode="numeric" required pattern="\\s*\\d{5}\\s*" maxlength="7"></label>
    <label class="field"><span>Ville</span>
      <input type="text" name="city" autocomplete="address-level2" required maxlength="100"></label>
    <p class="small muted">Pays : France.</p>
  </fieldset>
  <label class="check"><input type="checkbox" name="terms" required>
    <span>Je commande au nom et pour le compte de l’entreprise ci-dessus, pour un usage professionnel, et j’accepte les <a id="terms-link" href="${p.cgvUrl}" target="_blank" rel="noopener">conditions générales de vente aux professionnels</a> (version du ${p.termsDate ?? TERMS_DATE}).</span></label>
${p.afterTermsHtml ?? ''}  <p id="payment-loading" class="small muted" role="status">Chargement du paiement sécurisé…</p>
  <div id="payment-element"></div>
  <p id="pay-error" class="status err" role="alert" hidden></p>
  <button type="submit" id="pay-button" class="pay-button" disabled>${esc(payButtonText(p.payLabel, p.config.amount))}</button>
  <p class="small muted">Paiement sécurisé par carte bancaire avec Stripe : vos données de carte sont saisies dans un cadre Stripe et ne transitent pas par nos serveurs.</p>
  <noscript><p class="status err">Le paiement nécessite JavaScript.</p></noscript>
</form>
${p.config.quotesEnabled === true ? `${devisFormHtml({ cgvUrl: p.cgvUrl, termsDate: p.termsDate, extraFieldsHtml: p.devisExtraFieldsHtml })}\n` : ''}</section>`;
}

/**
 * Quote / bank-transfer block (octave-checkout gas/web/devis-form.html), rendered by orderFormHtml() right
 * after form#octave-pay only when config.quotesEnabled is true; devis.js also keeps it hidden unless
 * window.OCTAVE_PAY.quotesEnabled === true. `extraFieldsHtml`: the same product radios / [data-octave-extra]
 * fields as the card form, with every id / for / aria-describedby suffixed « -devis ». `termsDate`: as in
 * orderFormHtml() (default TERMS_DATE).
 */
export function devisFormHtml(p) {
  return `<details id="octave-devis-box" class="card devis-box" hidden>
  <summary><strong>Besoin d’un devis ou paiement par virement ?</strong></summary>
  <p class="small muted">Recevez immédiatement par e-mail un devis PDF (valable 30 jours) avec les coordonnées bancaires à utiliser et la référence de virement propre à ce devis. La livraison et la facture partent automatiquement dès réception du virement. Pour un bon de commande ou une demande particulière, répondez à l’e-mail du devis.</p>
  <form id="octave-devis" class="checkout-form" novalidate>
${p.extraFieldsHtml ?? ''}    <label class="field"><span>E-mail professionnel (réception du devis, puis du produit et de la facture)</span>
      <input type="email" name="email" autocomplete="email" required maxlength="254"></label>
    <label class="field"><span>Raison sociale</span>
      <input type="text" name="company" autocomplete="organization" required minlength="2" maxlength="200"></label>
    <label class="field"><span>SIREN (9 chiffres)</span>
      <input type="text" name="siren" inputmode="numeric" required pattern="\\s*(\\d\\s*){9}" maxlength="11"></label>
    <fieldset class="field-group"><legend>Adresse de facturation (figure sur le devis et la facture)</legend>
      <label class="field"><span>Adresse</span>
        <input type="text" name="addressLine1" autocomplete="address-line1" required minlength="3" maxlength="200"></label>
      <label class="field"><span>Complément d’adresse (facultatif)</span>
        <input type="text" name="addressLine2" autocomplete="address-line2" maxlength="200"></label>
      <label class="field"><span>Code postal</span>
        <input type="text" name="postalCode" autocomplete="postal-code" inputmode="numeric" required pattern="\\s*\\d{5}\\s*" maxlength="7"></label>
      <label class="field"><span>Ville</span>
        <input type="text" name="city" autocomplete="address-level2" required maxlength="100"></label>
      <p class="small muted">Pays : France.</p>
    </fieldset>
    <label class="field"><span>Votre référence interne / n° de bon de commande (facultatif, reporté sur le devis et la facture)</span>
      <input type="text" name="buyerRef" maxlength="60"></label>
    <!-- Honeypot: hidden from humans, bots fill it; the server drops the request silently. -->
    <div class="hp" aria-hidden="true"><label>Site web <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
    <label class="check"><input type="checkbox" name="terms" required>
      <span>Je demande ce devis au nom et pour le compte de l’entreprise ci-dessus, pour un usage professionnel, et j’accepte les <a class="terms-link" href="${p.cgvUrl}" target="_blank" rel="noopener">conditions générales de vente aux professionnels</a> (version du ${p.termsDate ?? TERMS_DATE}). La commande devient ferme au paiement du devis.</span></label>
    <p id="devis-error" class="status err" role="alert" hidden></p>
    <p id="devis-ok" class="status ok" role="status" hidden></p>
    <button type="submit" id="devis-button" class="pay-button secondary">Recevoir mon devis par e-mail</button>
    <p class="small muted">Paiement par virement SEPA sur un numéro de compte bancaire virtuel attribué par notre prestataire de paiement Stripe (bénéficiaire READ FRANCE SAS), propre à votre entreprise et identique pour tous vos devis ; la référence propre à chaque devis permet d’affecter votre virement. Aucun paiement n’est demandé à cette étape.</p>
  </form>
</details>`;
}

/** Order page body (Stripe return_url): order.js calls the Apps Script `fulfil` action. */
export function orderPageBody() {
  return `<h1>Votre commande</h1>
<p id="order-status" class="status" role="status" aria-live="polite">Confirmation du paiement…</p>
<p id="order-help" class="muted"></p>`;
}

/** CSP of the buy pages: Stripe.js + the configured Apps Script endpoint only. */
const endpointOrigin = (c) => {
  const o = new URL(c.endpoint).origin;
  return o === 'https://script.google.com' ? '' : ` ${o}`;
};
export const checkoutCsp = (c) =>
  `default-src 'self'; script-src 'self' https://js.stripe.com https://*.js.stripe.com; frame-src https://js.stripe.com https://*.js.stripe.com https://hooks.stripe.com https://link.com https://*.link.com; connect-src 'self' https://script.google.com https://script.googleusercontent.com${endpointOrigin(c)} https://api.stripe.com https://link.com https://*.link.com; img-src 'self' data: https://*.stripe.com https://*.link.com; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'`;
export const orderCsp = (c) =>
  `default-src 'self'; script-src 'self'; connect-src 'self' https://script.google.com https://script.googleusercontent.com${endpointOrigin(c)}; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'`;

/**
 * checkout-config.js (public by design: endpoint + publishable key). `laterText`: order page, tab closed.
 * `amount` + `termsVersion` let pay.js mount the Payment Element at once (display only: the Apps Script
 * catalog stays the price authority and refuses a different expectedAmount). `payLabel`: button text.
 * `quotesEnabled` (sales.config.json, default false): devis.js shows the quote block only when it is true.
 */
export function checkoutConfigJs(c, { termsUrl, orderPage, laterText, termsVersion = TERMS_VERSION, payLabel }) {
  return `// Generated by the site build from sales.config.json. Public by design.\nwindow.OCTAVE_PAY = ${JSON.stringify({ endpoint: c.endpoint, publishableKey: c.publishableKey, product: c.product, amount: c.amount, currency: 'eur', termsVersion, termsUrl, orderPage, ...(payLabel ? { payLabel } : {}), ...(laterText ? { laterText } : {}), quotesEnabled: c.quotesEnabled === true })};\n`;
}
