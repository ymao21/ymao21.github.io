/* ==========================================================
   Rotating Polaroid gallery (About section).
   An elliptical carousel: cards travel left→right across the
   front, shrinking/fading toward the back. One rAF loop drives
   transform + opacity from a single running angle (kept in a
   ref, never framework state). Cards flip on click to reveal a
   caption. Decorative motion pauses on hover/focus/flip and for
   prefers-reduced-motion.
   ========================================================== */
import { galleryPhotos } from './data/galleryPhotos.js';

(function polaroidGallery() {
  const stage = document.getElementById('photoGallery');
  if (!stage) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const N = galleryPhotos.length;
  const CYCLE = 28;                    // seconds for one full revolution
  const omega = (Math.PI * 2) / CYCLE; // rad/sec
  const RY = 30;                       // vertical ellipse radius (px)

  /* ---------- build cards ---------- */
  const cards = galleryPhotos.map((ph, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `polaroid polaroid--${ph.orientation || 'landscape'}`;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `Show caption for ${ph.alt}`);
    btn.innerHTML =
      `<span class="polaroid-inner">` +
        `<span class="polaroid-face polaroid-front">` +
          `<span class="polaroid-photo"><img src="${ph.src}" alt="${ph.alt}" loading="lazy" decoding="async"></span>` +
          `<span class="polaroid-hint" aria-hidden="true">✿ click to flip</span>` +
        `</span>` +
        `<span class="polaroid-face polaroid-back" aria-hidden="true">` +
          `<span class="pb-flourish pb-flourish--top">✦</span>` +
          `<span class="pb-title">${ph.title}</span>` +
          `<span class="pb-caption">${ph.caption}</span>` +
        `</span>` +
      `</span>`;
    stage.appendChild(btn);

    const card = { btn, ph, base: (i / N) * Math.PI * 2, hover: false };

    // authoritative orientation from the real (EXIF-corrected) pixel size
    const img = btn.querySelector('img');
    const applyOrient = () => {
      if (!img.naturalWidth) return;
      const o = img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
      btn.classList.remove('polaroid--portrait', 'polaroid--landscape');
      btn.classList.add(`polaroid--${o}`);
    };
    if (img.complete) applyOrient();
    else img.addEventListener('load', applyOrient, { once: true });

    btn.addEventListener('pointerenter', () => { card.hover = true; btn.classList.add('is-hover'); });
    btn.addEventListener('pointerleave', () => { card.hover = false; btn.classList.remove('is-hover'); });
    return card;
  });

  /* ---------- flip: only one card flipped at a time ---------- */
  let flipped = null;
  function unflip(card) {
    card.btn.classList.remove('flipped');
    card.btn.setAttribute('aria-pressed', 'false');
    card.btn.setAttribute('aria-label', `Show caption for ${card.ph.alt}`);
  }
  function flip(card) {
    card.btn.classList.add('flipped');
    card.btn.setAttribute('aria-pressed', 'true');
    card.btn.setAttribute('aria-label', `Show photo for ${card.ph.alt}`);
  }
  function toggle(card) {
    if (flipped && flipped !== card) unflip(flipped);
    if (flipped === card) { unflip(card); flipped = null; }
    else { flip(card); flipped = card; }
  }
  cards.forEach((card) => {
    card.btn.addEventListener('click', () => {
      if (swipeMoved) { swipeMoved = false; return; }  // a touch-swipe shouldn't also flip
      toggle(card);                                     // toggling never scrolls (no default action)
    });
  });

  /* ---------- pause state ---------- */
  let hovering = false, focusInside = false, swiping = false, swipeMoved = false, resumeAt = 0;
  const paused = () =>
    reduce.matches || hovering || focusInside || swiping || !!flipped || performance.now() < resumeAt;

  // hover-pause is for mouse only (touch taps must not leave it stuck paused)
  stage.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') hovering = true; });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') hovering = false; });
  // focus-pause is for KEYBOARD focus only — a mouse click focuses the button
  // too, but must not leave the carousel stuck paused.
  stage.addEventListener('focusin', (e) => {
    focusInside = !!(e.target && e.target.matches && e.target.matches(':focus-visible'));
  });
  stage.addEventListener('focusout', (e) => { if (!stage.contains(e.relatedTarget)) focusInside = false; });

  /* ---------- elliptical layout ---------- */
  let angle = 0;
  const radiusX = () => Math.min(stage.clientWidth * 0.34, 340);

  function layout() {
    const rx = radiusX();
    for (const c of cards) {
      const th = c.base + angle;
      const d = (Math.cos(th) + 1) / 2;          // 1 = front/centre, 0 = back
      const x = Math.sin(th) * rx;               // left → right across the front
      const y = -(1 - d) * RY;                   // back cards sit slightly higher
      const s = (0.66 + 0.34 * d) * (c.hover ? 1.05 : 1);
      c.btn.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      c.btn.style.opacity = (0.42 + 0.58 * d).toFixed(3);
      c.btn.style.zIndex = String(Math.round(d * 100));
      c.btn.style.pointerEvents = d < 0.14 ? 'none' : 'auto';   // don't let deep-back cards catch clicks
    }
  }

  /* ---------- animation loop (one rAF, active only while visible) ---------- */
  let rafId = null, last = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!paused()) angle += omega * dt;
    layout();
    rafId = requestAnimationFrame(frame);
  }
  function startLoop() { if (rafId == null) { last = performance.now(); rafId = requestAnimationFrame(frame); } }
  function stopLoop() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

  /* ---------- touch swipe (touch only — never uses pointer capture, so it
       cannot swallow mouse clicks or block hover tracking) ---------- */
  let touchX = null, touchAngle = 0;
  stage.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX; touchAngle = angle; swiping = true; swipeMoved = false;
  }, { passive: true });
  stage.addEventListener('touchmove', (e) => {
    if (touchX == null) return;
    const dx = e.touches[0].clientX - touchX;
    if (Math.abs(dx) > 6) swipeMoved = true;
    angle = touchAngle - dx * 0.006;
    if (reduce.matches) layout();                // no rAF running under reduced motion
  }, { passive: true });
  function endSwipe() {
    if (touchX == null) return;
    touchX = null; swiping = false;
    if (swipeMoved) resumeAt = performance.now() + 1600;  // brief delay before auto-resume
  }
  stage.addEventListener('touchend', endSwipe, { passive: true });
  stage.addEventListener('touchcancel', endSwipe, { passive: true });

  /* ---------- run ---------- */
  layout();  // position immediately (also the static layout for reduced motion)

  if (reduce.matches) {
    // no automatic rotation; cards stay in a gentle static arc, flip still works
    return;
  }

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) startLoop();
    else stopLoop();
  }, { threshold: 0 });
  io.observe(stage);

  let resizeTimer = null;
  const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); };
  window.addEventListener('resize', onResize, { passive: true });

  window.addEventListener('pagehide', () => {
    stopLoop();
    clearTimeout(resizeTimer);
    io.disconnect();
    window.removeEventListener('resize', onResize);
  }, { once: true });
})();
