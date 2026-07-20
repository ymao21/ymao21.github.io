/* ==========================================================
   About Me — cursor-responsive "wrap text" effect.
   The real paragraphs stay in the DOM for screen readers. When
   a fine pointer enters the copy, words are measured once (DOM
   Range — no dependency) into an aria-hidden layer and gently
   part around an invisible circular zone that follows the
   cursor, then settle back exactly when the pointer leaves.
   Disabled on touch and for prefers-reduced-motion.
   ========================================================== */
(function aboutWrapText() {
  const about = document.getElementById('about');
  const copy = about && about.querySelector('.about-copy');
  if (!about || !copy) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || reduce.matches) return;   // touch / reduced-motion → paragraph stays static

  const paras = Array.from(copy.querySelectorAll('p'));
  if (!paras.length) return;

  // circular exclusion zone (radius R) with a soft falloff out to F
  const coarse = window.matchMedia('(pointer: coarse)');
  const R = 74;          // main exclusion radius
  const F = 132;         // falloff radius
  const MAXX = 58;       // max horizontal displacement
  const MAXY = 28;       // max vertical displacement

  let layer = null;
  let words = [];
  let rafId = null;
  let inside = false;
  let tgtX = 0, tgtY = 0, curX = 0, curY = 0;   // pointer (relative to copy)

  /* ---- build the aria-hidden word layer, measured from the real text ---- */
  function build() {
    const cr = copy.getBoundingClientRect();
    const base = getComputedStyle(paras[0]);
    layer = document.createElement('div');
    layer.className = 'about-wrap';
    layer.setAttribute('aria-hidden', 'true');
    layer.style.fontFamily = base.fontFamily;
    layer.style.fontSize = base.fontSize;
    layer.style.fontWeight = base.fontWeight;
    layer.style.lineHeight = base.lineHeight;
    layer.style.letterSpacing = base.letterSpacing;
    layer.style.color = base.color;

    words = [];
    paras.forEach((p) => {
      p.childNodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        const text = node.nodeValue;
        const re = /\S+/g; let m;
        while ((m = re.exec(text))) {
          const range = document.createRange();
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          if (!r.width) continue;
          const x = r.left - cr.left;
          const y = r.top - cr.top;
          const span = document.createElement('span');
          span.className = 'about-wword';
          span.textContent = m[0];
          span.style.left = x + 'px';
          span.style.top = y + 'px';
          layer.appendChild(span);
          words.push({ el: span, cx: x + r.width / 2, cy: y + r.height / 2, dx: 0, dy: 0 });
        }
      });
    });
    copy.appendChild(layer);
    copy.classList.add('wrapping');   // hides the real <p> text; shows the layer — seamless swap
  }

  function teardown() {
    if (layer) { layer.remove(); layer = null; }
    words = [];
    copy.classList.remove('wrapping');
  }

  /* ---- pointer (targets only; the rAF loop does the interpolation) ---- */
  function localPoint(e) {
    const cr = copy.getBoundingClientRect();
    return [e.clientX - cr.left, e.clientY - cr.top];
  }
  function onEnter(e) {
    const [px, py] = localPoint(e);
    tgtX = px; tgtY = py;
    if (!inside) { inside = true; curX = px; curY = py; }
    if (!layer) build();
    if (!rafId) rafId = requestAnimationFrame(loop);
  }
  function onMove(e) {
    if (!inside) return;
    const [px, py] = localPoint(e);
    tgtX = px; tgtY = py;
  }
  function onLeave() { inside = false; }   // targets fall to 0; loop settles then tears down

  /* ---- wrap-style displacement for one word around the cursor ---- */
  function displace(w) {
    const dx = w.cx - curX;
    const dy = w.cy - curY;
    const dist = Math.hypot(dx, dy);
    if (dist >= F) return [0, 0];
    const ux = dx / (dist || 1);
    const uy = dy / (dist || 1);
    // radial magnitude: clears the exclusion circle, with a small drift out to F
    const mag = dist < R ? (R - dist) + 8 : (1 - (dist - R) / (F - R)) * 10;
    // radial (horizontal favoured, vertical damped) + a tangential term so the
    // words flow *around* the circle instead of bursting straight outward
    let tx = ux * mag + (-uy) * mag * 0.32;
    let ty = uy * mag * 0.5 + ux * mag * 0.16;
    if (tx > MAXX) tx = MAXX; else if (tx < -MAXX) tx = -MAXX;
    if (ty > MAXY) ty = MAXY; else if (ty < -MAXY) ty = -MAXY;
    return [tx, ty];
  }

  function loop() {
    curX += (tgtX - curX) * 0.16;
    curY += (tgtY - curY) * 0.16;
    let moving = false;
    for (const w of words) {
      const [tx, ty] = inside ? displace(w) : [0, 0];
      w.dx += (tx - w.dx) * 0.12;
      w.dy += (ty - w.dy) * 0.12;
      if (Math.abs(tx - w.dx) > 0.08 || Math.abs(ty - w.dy) > 0.08 ||
          Math.abs(w.dx) > 0.08 || Math.abs(w.dy) > 0.08) moving = true;
      w.el.style.transform = `translate3d(${w.dx.toFixed(2)}px, ${w.dy.toFixed(2)}px, 0)`;
    }
    if (inside || moving) rafId = requestAnimationFrame(loop);
    else { rafId = null; teardown(); }     // settled and pointer gone → restore real text
  }

  copy.addEventListener('pointerenter', onEnter);
  copy.addEventListener('pointermove', onMove);
  copy.addEventListener('pointerleave', onLeave);

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    teardown();
  }, { once: true });
})();
