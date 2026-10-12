/* ─────────────────────────────────────────────────────────────────────────────
   Statistiques MADE — un seul endroit à renseigner, pour tout le site.

   À FAIRE UNE FOIS :
     1. créer un compte sur https://cloud.umami.is (gratuit, sans carte)
     2. Settings → Websites → Add website, domaine : hugo-bnls.fr
     3. copier le Website ID et le coller dans CLE ci dessous
     4. redéployer

   Tant que CLE est vide, aucun script tiers n'est chargé et le site ne
   contacte personne. Les événements sont quand même comptés en local,
   lisibles dans la console avec MADE_STATS.

   Umami ne pose aucun cookie et ne stocke aucune donnée personnelle :
   pas de bandeau de consentement à afficher.
   ───────────────────────────────────────────────────────────────────────────── */
(function (w, d) {
  'use strict';

  var CLE = 'c03e119c-1552-4474-9eb0-45488fb6d723';                              /* ← le Website ID Umami */
  var FOURNISSEUR = 'umami';                 /* 'umami' | 'plausible' | 'ga4' */
  var HOTE = 'https://cloud.umami.is';       /* instance Umami (cloud ou perso) */

  var compteurs = Object.create(null);
  var file = [];
  var profondeur = 0;

  w.MADE_STATS = compteurs;

  function charger() {
    if (!CLE) return;
    var sc = d.createElement('script');
    sc.defer = true;
    if (FOURNISSEUR === 'umami') {
      sc.src = HOTE + '/script.js';
      sc.setAttribute('data-website-id', CLE);
    } else if (FOURNISSEUR === 'plausible') {
      sc.src = (HOTE || 'https://plausible.io') + '/js/script.tagged-events.js';
      sc.setAttribute('data-domain', CLE);
    } else if (FOURNISSEUR === 'ga4') {
      sc.src = 'https://www.googletagmanager.com/gtag/js?id=' + CLE;
      w.dataLayer = w.dataLayer || [];
      w.gtag = function () { w.dataLayer.push(arguments); };
      w.gtag('js', new Date());
      w.gtag('config', CLE);
    }
    sc.addEventListener('load', vider);
    d.head.appendChild(sc);
  }

  function pret() {
    if (FOURNISSEUR === 'umami') return !!(w.umami && w.umami.track);
    if (FOURNISSEUR === 'plausible') return !!w.plausible;
    if (FOURNISSEUR === 'ga4') return !!w.gtag;
    return false;
  }

  function envoyer(nom, props) {
    try {
      if (FOURNISSEUR === 'umami') w.umami.track(nom, props);
      else if (FOURNISSEUR === 'plausible') w.plausible(nom, { props: props });
      else if (FOURNISSEUR === 'ga4') w.gtag('event', nom, props);
    } catch (e) {}
  }

  /* Les événements déclenchés avant le chargement du script sont gardés
     de côté, puis envoyés d'un coup. Rien n'est perdu au premier clic. */
  function vider() {
    if (!pret()) return;
    while (file.length) { var e = file.shift(); envoyer(e[0], e[1]); }
  }

  function track(nom, props) {
    props = props || {};
    compteurs[nom] = (compteurs[nom] || 0) + 1;
    if (!CLE) return;
    if (pret()) { vider(); envoyer(nom, props); }
    else { file.push([nom, props]); if (file.length > 40) file.shift(); }
  }

  /* Profondeur de lecture : 25 / 50 / 75 / 100 % */
  function lecture() {
    var paliers = [25, 50, 75, 100], faits = 0;
    function auScroll() {
      var h = d.documentElement.scrollHeight - w.innerHeight;
      var p = h > 0 ? Math.round((w.scrollY / h) * 100) : 100;
      if (p > profondeur) profondeur = p;
      while (faits < paliers.length && p >= paliers[faits]) {
        track('lecture', { profondeur: paliers[faits] + ' %', page: d.title });
        faits++;
      }
    }
    w.addEventListener('scroll', auScroll, { passive: true });
    auScroll();
  }

  /* Temps passé, envoyé au départ de la page. sendBeacon survit à la navigation. */
  function duree() {
    var t0 = Date.now(), envoye = false;
    function partir() {
      if (envoye) return;
      envoye = true;
      var s = Math.round((Date.now() - t0) / 1000);
      var palier = s < 10 ? 'moins de 10 s' : s < 30 ? '10 à 30 s' : s < 60 ? '30 à 60 s' : s < 180 ? '1 à 3 min' : 'plus de 3 min';
      track('visite', { duree: palier, profondeur: profondeur + ' %' });
    }
    d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') partir(); });
    w.addEventListener('pagehide', partir);
  }

  w.MADE = {
    track: track,
    profondeur: function () { return profondeur; },
    actif: function () { return !!CLE; }
  };

  charger();
  lecture();
  duree();
})(window, document);
