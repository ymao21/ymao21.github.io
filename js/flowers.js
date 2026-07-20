/* ==========================================================
   Scroll-bloom botanical flowers around the bookshelf.
   Builds two distinct inline-SVG arrangements (left/right),
   injects them behind the books, and drives their bloom from
   the Projects section's scroll progress via one rAF loop that
   only writes a single CSS custom property (--flower-progress).
   Decorative only — never touches bookshelf logic or data.
   ========================================================== */
(function scrollFlowers() {
  const zone = document.querySelector('.shelf-zone');
  if (!zone) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- shape primitives (drawn pointing "up" from a base at 0,0) ---------- */
  const LEAF        = 'M0 0 C -13 -13 -11 -33 0 -42 C 11 -33 13 -13 0 0 Z';
  const LEAF_NARROW = 'M0 0 C -7 -16 -6 -34 0 -46 C 6 -34 7 -16 0 0 Z';
  const VEIN        = 'M0 -4 L0 -37';
  const P_COSMOS    = 'M0 0 C -5 -11 -5 -26 0 -34 C 5 -26 5 -11 0 0 Z';
  const P_DAISY     = 'M0 0 C -3.2 -10 -3.2 -25 0 -31 C 3.2 -25 3.2 -10 0 0 Z';
  const P_ROSE      = 'M0 0 C -10 -7 -11 -21 0 -26 C 11 -21 10 -7 0 0 Z';
  const P_SMALL     = 'M0 0 C -4 -4 -4 -12 0 -15 C 4 -12 4 -4 0 0 Z';
  const BUD         = 'M0 0 C -6 -6 -6 -19 0 -23 C 6 -19 6 -6 0 0 Z';

  const f = (n) => (+n).toFixed(3);

  function stem(d, s, e, w, color, cls) {
    return `<path class="sfx sf-stem ${cls || ''}" style="--s:${f(s)};--e:${f(e)}" ` +
           `pathLength="1" d="${d}" stroke="${color}" stroke-width="${w}"/>`;
  }
  function leaf(x, y, ang, sc, s, e, settle, fill, cls) {
    return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${sc})">` +
      `<path class="sfx sf-leaf ${cls || ''}" style="--s:${f(s)};--e:${f(e)};--settle:${settle}deg" d="${LEAF}" fill="${fill}"/>` +
      `<path class="sfx sf-leaf-vein ${cls || ''}" style="--s:${f(s)};--e:${f(e)};--settle:${settle}deg" d="${VEIN}" stroke="rgba(81,70,83,0.28)" stroke-width="1" fill="none"/>` +
      `</g>`;
  }
  function narrowLeaf(x, y, ang, sc, s, e, settle, fill, cls) {
    return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${sc})">` +
      `<path class="sfx sf-leaf ${cls || ''}" style="--s:${f(s)};--e:${f(e)};--settle:${settle}deg" d="${LEAF_NARROW}" fill="${fill}"/>` +
      `</g>`;
  }
  function bud(x, y, ang, sc, s, e, fill, cls) {
    return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${sc})">` +
      `<path class="sfx sf-bud ${cls || ''}" style="--s:${f(s)};--e:${f(e)}" d="${BUD}" fill="${fill}"/>` +
      `<path class="sfx sf-bud ${cls || ''}" style="--s:${f(s)};--e:${f(e)}" d="M0 0 C -3 4 -3 9 0 8 C 3 9 3 4 0 0 Z" fill="#74806A"/>` +
      `</g>`;
  }
  function dot(x, y, r, s, e, fill, cls) {
    return `<circle class="sfx sf-dot ${cls || ''}" style="--s:${f(s)};--e:${f(e)}" cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  }
  // a full flower: petals bloom individually, gold centre appears last, gentle breeze head
  function flower(x, y, sc, opt) {
    const { petal, fill, fill2, n, s0, sStep, cR, cColor, bd, cls } = opt;
    let petals = '';
    for (let i = 0; i < n; i++) {
      const ang = (360 / n) * i;
      const s = s0 + i * sStep;
      petals += `<g transform="rotate(${ang})">` +
        `<path class="sfx sf-petal" style="--s:${f(s)};--e:${f(s + 0.16)}" d="${petal}" fill="${i % 2 ? fill2 : fill}"/></g>`;
    }
    const cs = s0 + n * sStep + 0.04;
    const center = `<circle class="sfx sf-center" style="--s:${f(cs)};--e:${f(cs + 0.12)}" r="${cR}" fill="${cColor}"/>`;
    const centerDot = `<circle class="sfx sf-center" style="--s:${f(cs + 0.02)};--e:${f(cs + 0.14)}" r="${cR * 0.45}" fill="#8f6f37"/>`;
    return `<g transform="translate(${x} ${y})"><g class="sf-head ${cls || ''}" style="--bd:${bd}">` +
      `<g transform="scale(${sc})">${petals}${center}${centerDot}</g></g></g>`;
  }

  /* ---------- LEFT: dusty-pink cosmos + cream daisy + lavender buds, low & full ---------- */
  function buildLeft() {
    const stemCol = '#74806A';
    let g = '';
    // main curved stem + a branch
    g += stem('M168 400 C 150 320 120 270 96 210 C 78 165 70 120 82 74', 0.10, 0.42, 3.4, stemCol, 'sf-main');
    g += stem('M120 268 C 150 250 176 214 186 168', 0.30, 0.55, 2.4, stemCol, 'sf-minor');
    g += stem('M104 196 C 86 178 74 150 78 118', 0.34, 0.58, 2.2, stemCol, 'sf-minor');
    // leaves (staggered by height)
    g += leaf(150, 322, -46, 1.05, 0.30, 0.50, -14, '#87927A');
    g += leaf(120, 262, 40, 0.95, 0.36, 0.56, 14, '#7f8b73');
    g += leaf(96, 196, -34, 0.9, 0.42, 0.62, -12, '#87927A', 'sf-minor');
    g += leaf(180, 176, 44, 0.72, 0.46, 0.64, 12, '#74806A', 'sf-minor');
    // lavender buds on the little branch
    g += bud(188, 166, 18, 0.9, 0.44, 0.62, '#A38DC2');
    g += bud(176, 150, 6, 0.8, 0.48, 0.66, '#A38DC2', 'sf-minor');
    g += bud(198, 150, 30, 0.7, 0.50, 0.68, '#b6a2d0', 'sf-minor');
    // cream daisy (mid)
    g += flower(120, 120, 0.9, { petal: P_DAISY, fill: '#F5E6D7', fill2: '#efe0cf', n: 12, s0: 0.56, sStep: 0.012, cR: 6, cColor: '#B89962', bd: '7.4s' });
    // dusty-pink cosmos (top)
    g += flower(82, 74, 1.06, { petal: P_COSMOS, fill: '#D98FA3', fill2: '#E9B5BE', n: 8, s0: 0.6, sStep: 0.016, cR: 6.5, cColor: '#B89962', bd: '6.2s' });
    // baby's breath
    g += dot(150, 132, 2.4, 0.8, 0.95, '#F2C3CD', 'sf-minor');
    g += dot(60, 108, 2.2, 0.82, 0.98, '#efe0cf', 'sf-minor');
    g += dot(104, 92, 2, 0.85, 1.0, '#F2C3CD', 'sf-tertiary');
    return `<svg class="sf sf-left" viewBox="0 0 240 400" fill="none" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g>${g}</g></svg>`;
  }

  /* ---------- RIGHT: pale rose + periwinkle blossoms, tall & vertical ---------- */
  function buildRight() {
    const stemCol = '#74806A';
    let g = '';
    g += stem('M70 460 C 82 380 96 320 108 258 C 120 196 128 140 150 92', 0.10, 0.44, 3.2, stemCol, 'sf-main');
    g += stem('M112 244 C 90 226 74 196 72 160', 0.32, 0.56, 2.2, stemCol, 'sf-minor');
    g += stem('M126 176 C 108 150 100 118 108 84', 0.36, 0.60, 2.0, stemCol, 'sf-minor');
    // narrow olive leaves
    g += narrowLeaf(96, 350, 30, 1.0, 0.30, 0.50, 12, '#74806A');
    g += narrowLeaf(104, 288, -34, 0.95, 0.36, 0.56, -12, '#7f8b73');
    g += narrowLeaf(120, 214, 36, 0.85, 0.42, 0.62, 12, '#74806A', 'sf-minor');
    g += narrowLeaf(74, 176, -40, 0.72, 0.46, 0.64, -12, '#87927A', 'sf-minor');
    // muted-coral bud
    g += bud(70, 150, -20, 0.95, 0.44, 0.62, '#D98B78');
    // periwinkle blossom cluster
    g += flower(78, 140, 0.5, { petal: P_SMALL, fill: '#9FA9CF', fill2: '#b3bcda', n: 5, s0: 0.62, sStep: 0.014, cR: 3.2, cColor: '#B89962', bd: '7.8s', cls: 'sf-minor' });
    g += flower(96, 116, 0.42, { petal: P_SMALL, fill: '#9FA9CF', fill2: '#b3bcda', n: 5, s0: 0.66, sStep: 0.014, cR: 2.8, cColor: '#B89962', bd: '8s', cls: 'sf-tertiary' });
    // pale-rose flower (top)
    g += flower(150, 92, 1.0, { petal: P_ROSE, fill: '#F2C3CD', fill2: '#E9B5BE', n: 6, s0: 0.58, sStep: 0.016, cR: 5.5, cColor: '#B89962', bd: '6.6s' });
    // trailing tiny leaves + breath
    g += narrowLeaf(150, 250, 60, 0.6, 0.5, 0.7, 16, '#87927A', 'sf-tertiary');
    g += dot(126, 120, 2.2, 0.8, 0.98, '#F2C3CD', 'sf-minor');
    g += dot(64, 118, 2, 0.84, 1.0, '#dfe2ee', 'sf-tertiary');
    return `<svg class="sf sf-right" viewBox="0 0 220 460" fill="none" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><g>${g}</g></svg>`;
  }

  const container = document.createElement('div');
  container.className = 'shelf-flowers';
  container.setAttribute('aria-hidden', 'true');
  container.innerHTML = buildLeft() + buildRight();
  zone.insertBefore(container, zone.firstChild);   // first child → painted behind the books

  /* ---------- align the flower base with the shelf board ---------- */
  const board = zone.querySelector('.shelf-board');
  function measure() {
    if (!board) return;
    const base = board.getBoundingClientRect().top - zone.getBoundingClientRect().top;
    container.style.setProperty('--sf-base', Math.max(0, base) + 'px');
  }
  measure();
  let resizeTimer = null;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(measure, 120); };
  window.addEventListener('resize', onResize, { passive: true });

  /* ---------- reduced motion: show fully bloomed once visible, no scroll drive ---------- */
  if (reduce.matches) {
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        measure();
        container.style.setProperty('--flower-progress', '1');
        container.classList.add('bloomed');
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(zone);
    return;
  }

  /* ---------- scroll-progress engine: one rAF loop, active only while visible ---------- */
  const ref = zone.querySelector('.shelf-scroll') || zone;
  let cur = 0, rafId = null, running = false, bloomed = false;

  function targetProgress() {
    const r = ref.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const start = vh * 0.85;   // bloom begins as the shelf enters the lower viewport
    const end = vh * 0.28;     // bloom completes before it reaches the upper third
    return Math.min(1, Math.max(0, (start - r.top) / (start - end)));
  }

  function loop() {
    const target = targetProgress();
    cur += (target - cur) * 0.14;                 // light interpolation, no pixel-lock
    if (Math.abs(target - cur) < 0.0008) cur = target;
    container.style.setProperty('--flower-progress', cur.toFixed(4));
    const nb = cur >= 0.9;
    if (nb !== bloomed) { bloomed = nb; container.classList.toggle('bloomed', nb); }
    rafId = requestAnimationFrame(loop);
  }

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (!running) { running = true; measure(); if (!rafId) rafId = requestAnimationFrame(loop); }
    } else if (rafId) {
      cancelAnimationFrame(rafId); rafId = null; running = false;
    }
  }, { threshold: 0 });
  io.observe(zone);

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(resizeTimer);
    io.disconnect();
    window.removeEventListener('resize', onResize);
  }, { once: true });
})();
