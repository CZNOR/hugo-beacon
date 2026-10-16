/* ─── Garde-fous ─── */
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.innerHTML = ''; } }

const BOOKING_URL = 'https://cal.com/team/made-academie/appel-coaching-academie';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 640px)').matches;

/* Tous les boutons d'appel ouvrent la réservation, avec la provenance */
document.querySelectorAll('a[href="#appel"]').forEach(a => {
  const zone = a.closest('.nav') ? 'chine-menu' : a.closest('.hero') ? 'chine-haut' : 'chine-final';
  try {
    const u = new URL(BOOKING_URL);
    u.searchParams.set('utm_source', 'academie');
    u.searchParams.set('utm_medium', zone);
    u.searchParams.set('utm_campaign', 'chine');
    a.href = u.toString();
  } catch (e) { a.href = BOOKING_URL; }
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
});

document.querySelectorAll('a[href^="http"]').forEach(a => { a.rel = 'noopener noreferrer'; a.target = '_blank'; });

/* Statistiques : voir assets/stats.js, un seul endroit à renseigner */
var track = function (nom, props) { try { window.MADE.track(nom, props || {}); } catch (e) {} };
document.querySelectorAll('a[href*="cal.com"]').forEach(function (a) {
  var zone = a.closest('.nav') ? 'chine-menu' : a.closest('.hero') ? 'chine-haut' : 'chine-final';
  a.addEventListener('click', function () {
    track('reservation', { zone: zone, page: 'chine' });
    try { var u = new URL(a.href); u.searchParams.set('utm_content', 'lecture-' + window.MADE.profondeur()); a.href = u.toString(); } catch (e) {}
  });
});
document.querySelectorAll('a[href$="/academie/"], a[href="../"], a[href^="../#"]').forEach(function (a) {
  a.addEventListener('click', function () { track('retour-academie', { page: 'chine' }); });
});

/* ─── Vidéos : jamais de plein écran ─────────────────────────────────────
   Les navigateurs intégrés des applis (TikTok, Instagram, Facebook) sont des
   WKWebView où la lecture en ligne est désactivée côté application : playsinline
   y est ignoré et toute lecture bascule en plein écran. On ne peut que refermer
   après coup, l'utilisateur voit quand même l'écran noir. La seule solution
   fiable est de ne jamais lancer de vidéo là bas : on retire la source, le poster
   reste affiché, et plus rien ne peut s'ouvrir. Ailleurs, rien ne change. */
var videos = [].slice.call(document.querySelectorAll('video'));
var ua = navigator.userAgent || '';
var appliIntegree = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|BytedanceWebview|musical_ly|Trill|TikTok|aweme|Snapchat|LinkedInApp|Line\/|Pinterest|Twitter|MicroMessenger|GSA\//i.test(ua);
var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
/* Sur iOS, un WKWebView d'appli n'a pas "Safari/" dans sa signature, Safari et
   les vrais navigateurs si. C'est le filet pour les applis non listées. */
var horsSafari = iOS && !/Safari\//.test(ua);
/* Le bridage est propre à iOS : sur Android la lecture en ligne marche, on garde les vidéos. */
var modeImages = iOS && (appliIntegree || horsSafari);

function refermer(v) {
  try { if (v.webkitDisplayingFullscreen && v.webkitExitFullscreen) v.webkitExitFullscreen(); } catch (e) {}
  try { if (document.fullscreenElement === v && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
  try { if (document.webkitFullscreenElement === v && document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch (e) {}
}

var vio = new IntersectionObserver(function (es) {
  es.forEach(function (en) {
    if (modeImages) return;
    if (en.isIntersecting) { var p = en.target.play(); if (p && p.catch) p.catch(function () {}); }
    else en.target.pause();
  });
}, { rootMargin: isMobile ? '0px' : '150px', threshold: isMobile ? .2 : 0 });

function passerEnImages() {
  modeImages = true;
  document.documentElement.classList.add('sans-video');
  try { vio.disconnect(); } catch (e) {}
  videos.forEach(function (v) {
    try {
      refermer(v);
      v.pause();
      v.removeAttribute('autoplay');
      if (v.getAttribute('src')) { v.setAttribute('data-src', v.getAttribute('src')); v.removeAttribute('src'); }
      v.load();           /* sans source, le poster reste affiché et rien ne peut démarrer */
    } catch (e) {}
  });
}

videos.forEach(function (v) {
  v.muted = true; v.playsInline = true; v.controls = false;
  v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
  v.setAttribute('disablepictureinpicture', ''); v.setAttribute('disableremoteplayback', '');
  v.removeAttribute('controls');
  /* filet de sécurité si une appli inconnue force quand même le plein écran */
  v.addEventListener('webkitbeginfullscreen', function () { refermer(v); if (!modeImages) passerEnImages(); });
  v.addEventListener('enterpictureinpicture', function () { try { document.exitPictureInPicture(); } catch (e) {} });
});
document.addEventListener('fullscreenchange', function () {
  var el = document.fullscreenElement;
  if (el && el.tagName === 'VIDEO') { refermer(el); if (!modeImages) passerEnImages(); }
});
document.addEventListener('webkitfullscreenchange', function () {
  var el = document.webkitFullscreenElement;
  if (el && el.tagName === 'VIDEO') { refermer(el); if (!modeImages) passerEnImages(); }
});

if (modeImages) passerEnImages();
else {
  videos.forEach(function (v) { vio.observe(v); });
  /* Le fond liquide n'a pas de hauteur mesurable : on le lance à la main. */
  var fond = document.querySelector('.bg-fx video');
  if (fond && !reduced) { var pf = fond.play(); if (pf && pf.catch) pf.catch(function () {}); }
}


/* Apparition au scroll */
if (!reduced) {
  document.querySelectorAll('section > .wrap > *').forEach(el => el.classList.add('rv'));
  const st = document.createElement('style');
  st.textContent = '.rv{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}.rv.in{opacity:1;transform:none}';
  document.head.appendChild(st);
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
}


/* Bande défilante */
var piste = document.getElementById('piste');
if (piste) {
  var mots = ['Guangzhou', '广州', 'Foire de Canton', 'Usines', 'Sourcing', 'Fournisseurs', 'Packaging', 'Négociation', 'Nuits blanches', '10 jours'];
  var bloc = mots.map(function (m, i) { return '<span>' + (i % 3 === 0 ? '<b>' + m + '</b>' : m) + '</span>'; }).join('');
  piste.innerHTML = bloc + bloc;
}
