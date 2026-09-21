/* ─── Garde-fous ─── */
    if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.innerHTML = ''; } }
    document.querySelectorAll('a[href^="http"]').forEach(a => { a.rel = 'noopener noreferrer'; a.target = '_blank'; });

    /* ─── CONFIG ─── */
    const BOOKING_URL = 'https://cal.com/team/made-academie/appel-coaching-academie';
    const EMBED_BOOKING = false;
    const RESULTS = ['R12','R1','R3','R4','R5','R6','R7','R8','R9','R10','R11','R13','R14','R15','R16','R17','R18','R19','R20','R21','R2aniv'];
    const TOUR = [
      ['Accueil', 'Tu sais quoi faire chaque semaine', 'Tes chiffres et le prochain pas, validé avec ton coach.'],
      ['Formations', 'Tout le parcours, toujours à jour', 'De la recherche produit au scale, en vidéos courtes.'],
      ['Lives', 'Tes questions, en direct', 'Chaque semaine, on analyse vos boutiques et vos pubs.'],
      ['Storia', 'Ta marque prend forme', 'Boutique et pubs prêtes, avec tes vraies photos.'],
      ['Outils', 'Les outils des pros', 'Storia, TrendTrack et nos agents en Chine.']
    ];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = matchMedia('(max-width: 640px)').matches;
    const isTouch = matchMedia('(hover: none)').matches;
    const vh = () => window.innerHeight;

    /* ─── Tous les boutons d'appel ouvrent directement la réservation ─── */
    /* Chaque bouton porte sa provenance : sur cal.com tu vois quel bloc a déclenché la réservation. */
    const zoneOf = el => {
      if (el.closest('.m-cta')) return 'barre-mobile';
      if (el.closest('.nav')) return 'menu';
      if (el.closest('.mmenu')) return 'menu-mobile';
      if (el.closest('.hero')) return 'haut-de-page';
      if (el.closest('#offres')) return el.closest('.feat') ? 'offre-coaching' : 'offre-formation';
      const sec = el.closest('section');
      return (sec && (sec.id || sec.className.split(' ')[0])) || 'page';
    };
    const withSource = (url, zone) => {
      try {
        const u = new URL(url);
        u.searchParams.set('utm_source', 'academie');
        u.searchParams.set('utm_medium', zone);
        u.searchParams.set('utm_campaign', 'landing');
        return u.toString();
      } catch (e) { return url; }
    };
    if (BOOKING_URL) {
      document.querySelectorAll('a[href="#appel"]').forEach(a => {
        const zone = zoneOf(a);
        a.href = withSource(BOOKING_URL, zone);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.zone = zone;
      });
    }

    /* ─── Scroll fluide (desktop souris uniquement) ─── */
    const lenis = reduced || isTouch || isMobile || typeof Lenis === 'undefined' ? null : new Lenis({ lerp: .12, smoothWheel: true, autoRaf: false });
    if (lenis) { const loop = t => { lenis.raf(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(t, { offset: id === '#tour' ? 0 : -90, duration: 1.1 }) : t.scrollIntoView({ behavior: 'smooth' });
    }));

    /* ─── Planète d'origine ─── */
    MadeGlobeOriginal(document.getElementById('globe'), [...document.querySelectorAll('.planet .bags img')]);

    /* ─── Visite de l'académie ─── */
    const tour = document.getElementById('tour');
    const panels = [...tour.querySelectorAll('.panel')];
    const head = document.getElementById('tourHead');
    const floor = tour.querySelector('.floor');
    const navBtns = [...document.querySelectorAll('#tourNav button')], prog = document.getElementById('tourProg');
    const capText = document.getElementById('capText');
    navBtns.forEach((b, i) => b.addEventListener('click', () => {
      const total = tour.offsetHeight - vh();
      const y = tour.offsetTop + total * Math.min(1, (i + .15) / (panels.length - .6));
      lenis ? lenis.scrollTo(y, { duration: .9 }) : window.scrollTo({ top: y, behavior: 'smooth' });
    }));
    let capIdx = 0;
    function renderTour() {
      if (isMobile) return;
      const r = tour.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh()) return;
      const total = r.height - vh();
      const p = Math.min(Math.max(-r.top / total, 0), 1);
      const t = p * (panels.length - .6) - .15;
      const fit = Math.min(1.05, (window.innerWidth * .62) / 1000, (vh() * .58) / 580);
      panels.forEach((el, i) => {
        const d = i - t;
        let z, y, op;
        if (d >= 0) { z = -d * 900 - 60; y = d * 60; op = d < .45 ? 1 : Math.max(0, 1 - (d - .45) / .35); }
        else { z = -60 + d * 120; y = d * 260; op = Math.max(0, 1 + d / .22); }
        const x = (+el.dataset.x) * Math.min(1, Math.abs(d)) * .6;
        const ry = (+el.dataset.ry) * Math.min(1, Math.abs(d));
        el.style.opacity = op.toFixed(3);
        el.style.visibility = op < .01 ? 'hidden' : 'visible';
        el.style.zIndex = Math.round(100 - d * 10);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) rotateX(${(d * 4).toFixed(2)}deg) scale(${fit.toFixed(3)})`;
      });
      floor.style.setProperty('--fy', (t * 400).toFixed(1) + 'px');
      prog.style.width = (p * 100).toFixed(2) + '%';
      prog.style.opacity = p > .97 || p < .01 ? 0 : 1;
      const ho = Math.max(0, 1 - p * 7); head.style.opacity = ho.toFixed(2); capText.parentElement.style.opacity = (1 - ho).toFixed(2);
      const idx = Math.min(panels.length - 1, Math.max(0, Math.round(t)));
      if (idx !== capIdx) {
        capIdx = idx;
        capText.style.opacity = 0;
        setTimeout(() => {
          const [k, h, d] = TOUR[capIdx];
          document.getElementById('capK').textContent = `0${capIdx + 1} · ${k}`;
          document.getElementById('capH').textContent = h;
          document.getElementById('capP').textContent = d;
          capText.style.opacity = 1;
        }, 120);
        navBtns.forEach((b, j) => b.classList.toggle('on', j === idx));
      }
    }
    let ticking = false;
    const kick = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; renderTour(); }); } };
    if (!isMobile) { addEventListener('scroll', kick, { passive: true }); addEventListener('resize', kick, { passive: true }); if (lenis) lenis.on('scroll', kick); kick(); }


    /* ─── Storia : chapitres qui défilent ─── */
    const stApp = document.getElementById('stApp');
    const stoChap = document.getElementById('stoChap');
    if (stApp && stoChap) {
      const items = [...stoChap.querySelectorAll('li[data-v]')];
      const views = [...stApp.querySelectorAll('.sto-v')];
      const tag = document.getElementById('stoTag');
      let cur = 0, timer = null, visible = false, manual = false;
      const show = i => {
        cur = i;
        items.forEach((el, j) => el.classList.toggle('on', j === i));
        views.forEach((v, j) => v.classList.toggle('on', j === i));
        if (tag) tag.textContent = 'Chapitre 0' + (i + 1);
        clearTimeout(timer);
        if (!manual && visible && !reduced) timer = setTimeout(() => show((cur + 1) % views.length), 4200);
      };
      items.forEach((el, i) => el.addEventListener('click', () => { manual = true; show(i); }));
      new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) show(cur); else clearTimeout(timer); }, { threshold: .3 }).observe(stApp);
      show(0);
    }

    /* ─── Ruban résultats ─── */
    const fig = (c, inner) => `<figure class="${c}">${inner}</figure>`;
    const r1 = ['R5','R12','R3','R1','R15','R14','R8','R4'].map(n => fig('sq', `<img src="assets/dash/${n}.webp" alt="" loading="lazy" decoding="async">`)).join('');
    const r2 = [
      fig('pt', '<img src="assets/avis/roas10.webp" alt="" loading="lazy" decoding="async"><figcaption>Ilias · 10 de ROAS</figcaption>'),
      fig('pt', '<video src="assets/chine/carte-produit.mp4" muted loop playsinline preload="none"></video>'),
      fig('pt', '<img src="assets/avis/avis.webp" alt="" loading="lazy" decoding="async"><figcaption>Son retour sur la formation</figcaption>'),
      fig('pt', '<img src="assets/avis/vente1.webp" alt="" loading="lazy" decoding="async"><figcaption>Sa première vente</figcaption>'),
      fig('pt', '<video src="assets/chine/showroom-parfum2.mp4" muted loop playsinline preload="none"></video>'),
      fig('pt', '<img src="assets/avis/accomp2.webp" alt="" loading="lazy" decoding="async"><figcaption>1 000 € par jour, stabilisés</figcaption>'),
      fig('pt', '<img src="assets/avis/eleve4.webp" alt="" loading="lazy" decoding="async"><figcaption>Rayan · sa première journée</figcaption>'),
      fig('pt', '<img src="assets/avis/accomp1.webp" alt="" loading="lazy" decoding="async"><figcaption>Suivi avec son coach</figcaption>')
    ].join('');
    document.getElementById('rb1').innerHTML = r1 + r1;
    document.getElementById('rb2').innerHTML = r2 + r2;

    /* ─── Zoom des vidéos au scroll ─── */
    const pzEls = [...document.querySelectorAll('.pz')];
    let pzT = false;
    const pz = () => { pzT = false; pzEls.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh()) return; const k = Math.min(Math.max((vh() - r.top) / (vh() + r.height), 0), 1); el.style.setProperty('--z', (1.18 - k * .18).toFixed(3)); }); };
    if (!isMobile) addEventListener('scroll', () => { if (!pzT) { pzT = true; requestAnimationFrame(pz); } }, { passive: true });

    /* ─── Barre d'appel mobile ─── */
    const mCta = document.getElementById('mCta');
    if (mCta) {
      let pastHero = false, atEnd = false;
      const upd = () => mCta.classList.toggle('show', pastHero && !atEnd);
      new IntersectionObserver(e => { pastHero = !e[0].isIntersecting; upd(); }).observe(document.querySelector('.hero .cta-row'));
      new IntersectionObserver(e => { atEnd = e[0].isIntersecting; upd(); }, { rootMargin: '0px 0px -30% 0px' }).observe(document.getElementById('appel'));
    }

    /* ─── Vidéos : lecture seulement à l'écran ─── */
    const vio = new IntersectionObserver(es => es.forEach(en => en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause()), { rootMargin: isMobile ? '0px' : '150px', threshold: isMobile ? .2 : 0 });
    document.querySelectorAll('video').forEach(v => vio.observe(v));

    /* ─── Animations CSS en pause hors écran ─── */
    const pio = new IntersectionObserver(es => es.forEach(en => en.target.classList.toggle('paused', !en.isIntersecting)), { rootMargin: '200px' });
    document.querySelectorAll('main > section, .ticker').forEach(sec => pio.observe(sec));

    /* ─── Réservation ─── */
    const bookBtn = document.getElementById('book-btn');
    bookBtn.addEventListener('click', e => {
      e.preventDefault();
      if (!BOOKING_URL) { bookBtn.textContent = 'Calendrier bientôt disponible'; return; }
      if (EMBED_BOOKING) document.getElementById('booking').innerHTML = `<iframe src="${BOOKING_URL}" title="Réserver un appel" loading="lazy" decoding="async" data-lenis-prevent></iframe>`;
      else window.open(withSource(BOOKING_URL, 'bloc-final'), '_blank', 'noopener');
    });

    /* ─── Tableaux de ventes + logos ─── */
    const DASH = ['R5','R12','R3','R1','R15','R14','R8','R4'];
    const logos = [1,2,3,4,5,7,8,10,11].map(i => `<img src="assets/made/partners/p${i}.webp" alt="" loading="lazy" decoding="async" width="138" height="46">`).join('') + '<img src="assets/made/partners/beautymarts.webp" alt="Beauty Mart\'s" loading="lazy" decoding="async" style="height:24px">';
    document.getElementById('logos').innerHTML = logos + logos;

    /* ─── Menu mobile ─── */
    const burger = document.querySelector('.burger'), mmenu = document.getElementById('mmenu');
    const toggle = open => { burger.classList.toggle('open', open); mmenu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); };
    burger.addEventListener('click', () => toggle(!mmenu.classList.contains('open')));
    mmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));

    /* ─── Onglets méthode ─── */
    document.querySelectorAll('.tabs button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('.tabs button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); });
      document.getElementById('road-deb').hidden = b.dataset.tab !== 'deb';
      const conf = document.getElementById('road-conf');
      conf.hidden = b.dataset.tab !== 'conf';
      conf.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
    }));

    /* ─── Compteurs ─── */
    const cio = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, to = +el.dataset.count, t0 = performance.now();
      const tick = now => { const k = Math.min((now - t0) / 1400, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick); cio.unobserve(el);
    }), { threshold: .6 });
    document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

    /* ─── Titres mot par mot ─── */
    document.querySelectorAll('h2.rv').forEach(h => {
      let i = 0;
      const wrap = node => [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(part);
            const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = part;
            sp.style.transitionDelay = (i++ * 45) + 'ms'; frag.append(sp);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
      wrap(h);
    });

    /* ─── Apparition au scroll ─── */
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      const sibs = [...en.target.parentElement.children].filter(c => c.classList.contains('rv'));
      en.target.style.transitionDelay = Math.min(sibs.indexOf(en.target), 5) * 60 + 'ms';
      en.target.classList.add('in');
      setTimeout(() => { en.target.style.transitionDelay = ''; }, 1400);
      io.unobserve(en.target);
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv').forEach(el => io.observe(el));
