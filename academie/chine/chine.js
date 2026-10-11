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

/* ─── Vidéos : toujours en ligne, jamais en plein écran ─── */
/* Certains navigateurs intégrés (TikTok, Instagram) ignorent playsinline et ouvrent
   la vidéo en plein écran toutes seules. On le détecte, on referme, et on bascule
   la page en mode images pour que ça n'arrive plus. */
var videos = [].slice.call(document.querySelectorAll('video'));
var modeImages = false;
function refermer(v) {
  try { if (v.webkitDisplayingFullscreen && v.webkitExitFullscreen) v.webkitExitFullscreen(); } catch (e) {}
  try { if (document.fullscreenElement === v && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
  try { if (document.webkitFullscreenElement === v && document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch (e) {}
}
function basculerImages(v) {
  if (modeImages) { refermer(v); return; }
  modeImages = true;
  videos.forEach(function (x) { refermer(x); try { x.pause(); x.removeAttribute('autoplay'); x.load(); } catch (e) {} });
  try { vio.disconnect(); } catch (e) {}
}
videos.forEach(function (v) {
  v.muted = true; v.playsInline = true; v.controls = false;
  v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
  v.setAttribute('disablepictureinpicture', ''); v.setAttribute('disableremoteplayback', '');
  v.removeAttribute('controls');
  v.addEventListener('webkitbeginfullscreen', function () { basculerImages(v); });
  v.addEventListener('enterpictureinpicture', function () { try { document.exitPictureInPicture(); } catch (e) {} });
});
document.addEventListener('fullscreenchange', function () {
  var el = document.fullscreenElement;
  if (el && el.tagName === 'VIDEO') basculerImages(el);
});
document.addEventListener('webkitfullscreenchange', function () {
  var el = document.webkitFullscreenElement;
  if (el && el.tagName === 'VIDEO') basculerImages(el);
});

/* ─── Vidéos : lecture seulement à l'écran ─── */
var vio = new IntersectionObserver(function (es) {
  es.forEach(function (en) {
    if (modeImages) return;
    if (en.isIntersecting) { var p = en.target.play(); if (p && p.catch) p.catch(function () {}); }
    else en.target.pause();
  });
}, { rootMargin: isMobile ? '0px' : '150px', threshold: isMobile ? .2 : 0 });
videos.forEach(function (v) { vio.observe(v); });

/* Le fond liquide n'a pas de hauteur mesurable : on le lance à la main. */
var fond = document.querySelector('.bg-fx video');
if (fond && !reduced) { var pf = fond.play(); if (pf && pf.catch) pf.catch(function () {}); }


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
