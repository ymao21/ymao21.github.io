/* ==========================================================
   Flower cursor — a cute pink five-petal blossom that follows
   the pointer. Fine-pointer devices only; native cursor is the
   fallback until this mounts. One rAF loop, no per-move re-render.
   ========================================================== */
(function flowerCursor() {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!finePointer.matches) return;                 // touch / coarse → keep native cursor
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const FLOWER = `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <g>
        <ellipse cx="24" cy="13" rx="7.2" ry="11" fill="#E7A1B5" transform="rotate(0 24 24)"/>
        <ellipse cx="24" cy="13" rx="7.2" ry="11" fill="#F4C4CF" transform="rotate(72 24 24)"/>
        <ellipse cx="24" cy="13" rx="7.2" ry="11" fill="#E7A1B5" transform="rotate(144 24 24)"/>
        <ellipse cx="24" cy="13" rx="7.2" ry="11" fill="#F4C4CF" transform="rotate(216 24 24)"/>
        <ellipse cx="24" cy="13" rx="7.2" ry="11" fill="#E7A1B5" transform="rotate(288 24 24)"/>
        <ellipse cx="24" cy="19" rx="3.4" ry="4.6" fill="#C97891" opacity="0.32" transform="rotate(36 24 24)"/>
        <ellipse cx="24" cy="19" rx="3.4" ry="4.6" fill="#C97891" opacity="0.32" transform="rotate(180 24 24)"/>
        <ellipse cx="24" cy="8.5" rx="2.4" ry="3.6" fill="#FFF7F4" opacity="0.55" transform="rotate(0 24 24)"/>
        <ellipse cx="24" cy="8.5" rx="2.4" ry="3.6" fill="#FFF7F4" opacity="0.5" transform="rotate(72 24 24)"/>
        <ellipse cx="24" cy="8.5" rx="2.4" ry="3.6" fill="#FFF7F4" opacity="0.5" transform="rotate(144 24 24)"/>
        <ellipse cx="24" cy="8.5" rx="2.4" ry="3.6" fill="#FFF7F4" opacity="0.5" transform="rotate(216 24 24)"/>
        <ellipse cx="24" cy="8.5" rx="2.4" ry="3.6" fill="#FFF7F4" opacity="0.5" transform="rotate(288 24 24)"/>
        <circle cx="24" cy="24" r="6" fill="#D8A85D"/>
        <circle cx="24" cy="24" r="6" fill="none" stroke="#C97891" stroke-width="1.1" opacity="0.5"/>
        <circle cx="24" cy="24" r="1.4" fill="#B8863F"/>
      </g>
    </svg>`;

  const SPARKLE = `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1 L13.7 9.4 L22 12 L13.7 14.6 L12 23 L10.3 14.6 L2 12 L10.3 9.4 Z" fill="#B89962"/>
    </svg>`;

  const el = document.createElement('div');
  el.className = 'flower-cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="fc-ring"></div>
    <div class="fc-sparkle">${SPARKLE}</div>
    <div class="fc-scale"><div class="fc-flower">${FLOWER}</div></div>`;
  document.body.appendChild(el);
  document.documentElement.classList.add('flower-cursor-active');   // now safe to hide native cursor

  // interactive / editable target matchers
  const INTERACTIVE =
    'a, button, [role="button"], label[for], summary, select, ' +
    'input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], ' +
    '.nav-cta, .bi-open, .bm-link, .bm-nav, .bm-close, [data-close]';
  const TEXTY =
    'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), ' +
    'textarea, [contenteditable="true"]';

  // --- pointer tracking: refs only, single rAF, no per-move DOM state ---
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;   // target
  let cx = tx, cy = ty;                                          // current (interpolated)
  const EASE = reduce.matches ? 1 : 0.4;
  let rafId = null;
  let shown = false;

  function onMove(e) {
    tx = e.clientX;
    ty = e.clientY;
    if (!shown) { shown = true; el.classList.add('visible'); }
  }

  function loop() {
    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    rafId = requestAnimationFrame(loop);
  }

  // --- hover state: recomputed only when the element under the pointer changes ---
  function updateState(target) {
    if (!target || !target.closest) return;
    const onText = !!target.closest(TEXTY);
    el.classList.toggle('over-text', onText);
    if (onText) { el.classList.remove('is-hover', 'on-book'); return; }
    const onBook = !!target.closest('.book');
    el.classList.toggle('on-book', onBook);
    el.classList.toggle('is-hover', !onBook && !!target.closest(INTERACTIVE));
  }
  const onOver = (e) => updateState(e.target);

  // --- click feedback (< 250ms) ---
  let upTimer = null;
  const onDown = () => { el.classList.add('is-down'); el.classList.remove('is-up'); };
  const onUp = () => {
    el.classList.remove('is-down');
    el.classList.add('is-up');
    clearTimeout(upTimer);
    upTimer = setTimeout(() => el.classList.remove('is-up'), 240);
  };

  // --- hide when the pointer leaves the window, restore when it returns ---
  const hide = () => el.classList.remove('visible');
  const show = () => { if (shown) el.classList.add('visible'); };
  const onDocOut = (e) => { if (!e.relatedTarget && !e.toElement) hide(); };

  // --- opened-project (modal) → minimal cursor ---
  const modal = document.getElementById('bookModal');
  let mo = null;
  if (modal) {
    mo = new MutationObserver(() => el.classList.toggle('cursor-modal-open', !modal.hidden));
    mo.observe(modal, { attributes: true, attributeFilter: ['hidden'] });
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerover', onOver, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  document.addEventListener('mouseleave', onDocOut);
  document.addEventListener('mouseenter', show);
  window.addEventListener('blur', hide);
  window.addEventListener('focus', show);

  rafId = requestAnimationFrame(loop);

  // --- cleanup ---
  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(upTimer);
    if (mo) mo.disconnect();
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerover', onOver);
    window.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    document.removeEventListener('mouseleave', onDocOut);
    document.removeEventListener('mouseenter', show);
  }, { once: true });
})();
