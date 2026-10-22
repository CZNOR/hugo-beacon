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

  /* ── Journal de visite pour Dring (l'app d'appels d'Hugo) ───────────────────
     Au clic sur un lien de réservation Cal, on envoie un résumé anonyme de la
     visite : pages vues et part lue, temps passé, questions de FAQ ouvertes,
     provenance, appareil. Dring le rattache à la réservation par l'heure et
     l'affiche sur la fiche du prospect. Aucun cookie, aucune donnée personnelle. */
  var DRING = 'https://hugo-s-command-center-99.vercel.app/api/visite';
  var page0 = Date.now();

  function lire(store, cle) { try { return JSON.parse(store.getItem(cle) || 'null'); } catch (e) { return null; } }
  function ecrire(store, cle, v) { try { store.setItem(cle, JSON.stringify(v)); } catch (e) {} }

  function appareil() {
    var ua = navigator.userAgent;
    var os = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'PC' : 'autre';
    var app = /musical_ly|BytedanceWebview|TikTok/i.test(ua) ? 'TikTok' : /Instagram/.test(ua) ? 'Instagram' : /FBAN|FBAV/.test(ua) ? 'Facebook' : '';
    return app ? os + ' (dans ' + app + ')' : os;
  }

  /* Journal de la session : gardé d'une page à l'autre du site */
  var j = lire(sessionStorage, 'made_j');
  if (!j) {
    var utm = {};
    try { new URL(location.href).searchParams.forEach(function (v, k) { if (/^utm_/.test(k)) utm[k] = v; }); } catch (e) {}
    var ref = '';
    try { ref = d.referrer ? new URL(d.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
    if (ref === location.hostname) ref = '';
    var ua = navigator.userAgent;
    j = { debut: Date.now(), utm: utm, faq: [], pages: [],
          provenance: ref || (/musical_ly|BytedanceWebview|TikTok/i.test(ua) ? 'tiktok.com' : /Instagram/.test(ua) ? 'instagram.com' : 'direct') };
    var v = lire(localStorage, 'made_v') || { premiere: new Date().toISOString().slice(0, 10), visites: 0 };
    v.visites++;
    ecrire(localStorage, 'made_v', v);
  }
  var nomPage = location.pathname.replace(/\/index\.html$/, '/').replace(/^\/$/, 'accueil').replace(/^\/|\/$/g, '') || 'accueil';
  var ici = { page: nomPage, lu: 0, s: 0 };
  j.pages.push(ici);
  if (j.pages.length > 8) j.pages.shift();

  function maj() {
    ici.lu = Math.max(ici.lu, profondeur);
    ici.s = Math.round((Date.now() - page0) / 1000);
    ecrire(sessionStorage, 'made_j', j);
  }
  w.addEventListener('pagehide', maj);
  d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') maj(); });

  function envoyerVisite(bouton) {
    maj();
    var v = lire(localStorage, 'made_v') || {};
    var corps = JSON.stringify({
      bouton: bouton, pages: j.pages, faq: j.faq, provenance: j.provenance, utm: j.utm,
      duree_s: Math.round((Date.now() - j.debut) / 1000), appareil: appareil(),
      visites: v.visites || 1, premiere: v.premiere || ''
    });
    try {
      if (!(navigator.sendBeacon && navigator.sendBeacon(DRING, new Blob([corps], { type: 'text/plain' }))))
        fetch(DRING, { method: 'POST', body: corps, keepalive: true, mode: 'no-cors' });
    } catch (e) {}
  }

  /* Tout clic vers Cal (quel que soit le bouton) envoie le journal */
  d.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="cal.com"]') : null;
    if (a) envoyerVisite(a.dataset.zone || (a.closest('section') && a.closest('section').id) || nomPage);
  }, true);

  /* Les questions de FAQ ouvertes vont aussi dans le journal */
  var trackBrut = track;
  track = function (nom, props) {
    if (nom === 'faq' && props) {
      var q = props.question || props.titre || props.q || '';
      if (q && j.faq.indexOf(q) < 0) { j.faq.push(String(q).slice(0, 80)); if (j.faq.length > 6) j.faq.shift(); }
    }
    trackBrut(nom, props);
  };

  w.MADE = {
    track: track,
    profondeur: function () { return profondeur; },
    actif: function () { return !!CLE; }
  };

  charger();
  lecture();
  duree();
})(window, document);
