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

/* Vidéos : lecture seulement à l'écran */
const vio = new IntersectionObserver(es => es.forEach(en => en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause()), { rootMargin: isMobile ? '0px' : '150px', threshold: isMobile ? .2 : 0 });
document.querySelectorAll('video').forEach(v => vio.observe(v));

/* Apparition au scroll */
if (!reduced) {
  document.querySelectorAll('section > .wrap > *').forEach(el => el.classList.add('rv'));
  const st = document.createElement('style');
  st.textContent = '.rv{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}.rv.in{opacity:1;transform:none}';
  document.head.appendChild(st);
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));
}
