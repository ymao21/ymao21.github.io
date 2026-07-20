/* ==========================================================
   About Me — draggable leaf that releases the paragraph so the
   words fall with gravity. No dependency: word positions are
   measured with DOM Range + getClientRects(); physics runs in a
   single requestAnimationFrame loop (values in refs, transforms
   only). The real <p> text stays in the DOM for screen readers;
   falling words are aria-hidden visual duplicates.
   ========================================================== */
(function aboutFallingText() {
  const about = document.getElementById('about');
  const copy = about && about.querySelector('.about-copy');
  if (!about || !copy) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(pointer: coarse)');
  const paras = Array.from(copy.querySelectorAll('p'));
  if (!paras.length) return;

  const THRESHOLD = () => (coarse.matches ? 70 : 90);   // drag distance to release
  const GRAVITY = 1000;                                 // px / s^2

  const LEAF = `
    <span class="leaf-swing">
      <svg viewBox="0 0 32 34" width="28" height="28" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.5 33 C 5 27, 3.5 11, 15 1.5 C 27.5 9, 27 25, 16.5 33 Z" fill="#87927A"/>
        <path d="M16.5 33 C 16 22, 16.5 9, 15 1.5 C 27.5 9, 27 25, 16.5 33 Z" fill="#74806A" opacity="0.45"/>
        <path d="M15.4 2.4 C 15.9 12, 16.2 23, 16.5 32" stroke="#C98A98" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <path d="M15.8 10 L10.5 8.2 M16 15 L10.8 13.4 M16.2 20 L11.4 18.8 M15.9 10 L21 8.6 M16.1 15 L21.4 13.8 M16.3 20 L21 19" stroke="#74806A" stroke-width="0.7" opacity="0.5" fill="none" stroke-linecap="round"/>
        <circle cx="15.2" cy="2.6" r="1.3" fill="#B89962"/>
      </svg>
    </span>`;

  /* ---------- overlay layers ---------- */
  const fallLayer = document.createElement('div');
  fallLayer.className = 'about-fall';
  fallLayer.setAttribute('aria-hidden', 'true');

  const leafLayer = document.createElement('div');
  leafLayer.className = 'about-leaf-layer';

  const tether = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  tether.setAttribute('class', 'about-tether');
  tether.setAttribute('aria-hidden', 'true');
  const tetherPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tether.appendChild(tetherPath);

  const leaf = document.createElement('button');
  leaf.type = 'button';
  leaf.className = 'about-leaf idle';
  leaf.setAttribute('aria-label', 'Drag the leaf to release the About Me text');
  leaf.innerHTML = LEAF;
  const swing = leaf.querySelector('.leaf-swing');

  const hint = document.createElement('span');
  hint.className = 'about-hint';
  hint.textContent = 'drag the leaf';
  hint.setAttribute('aria-hidden', 'true');

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'about-reset';
  resetBtn.textContent = 'put it back';
  resetBtn.hidden = true;

  leafLayer.append(tether, leaf, hint, resetBtn);
  about.append(fallLayer, leafLayer);

  /* ---------- geometry ---------- */
  let homeX = 0, homeY = 0, fallHeight = 0;
  const aboutRect = () => about.getBoundingClientRect();

  function lineHeightPx() {
    const cs = getComputedStyle(paras[0]);
    const lh = parseFloat(cs.lineHeight);
    return Number.isNaN(lh) ? parseFloat(cs.fontSize) * 1.6 : lh;
  }

  function measureHome() {
    const ar = aboutRect();
    const r = document.createRange();
    r.selectNodeContents(paras[paras.length - 1]);
    const rects = r.getClientRects();
    const last = rects[rects.length - 1];
    if (!last) return;
    homeX = last.right - ar.left + 10;
    homeY = last.top - ar.top + last.height / 2;
    // keep the leaf inside the copy width
    homeX = Math.min(homeX, copy.getBoundingClientRect().right - ar.left - 6);
    placeLeaf(homeX, homeY);
    hint.style.left = homeX + 'px';
    hint.style.top = (homeY + 18) + 'px';

    // fall container ends just above the gallery
    const gallery = about.querySelector('.about-gallery');
    const galleryTop = gallery ? gallery.getBoundingClientRect().top - ar.top : ar.height;
    fallHeight = Math.max(copy.getBoundingClientRect().bottom - ar.top + 8, galleryTop - 10);
    fallLayer.style.height = fallHeight + 'px';

    const copyR = copy.getBoundingClientRect();
    resetBtn.style.left = (copyR.left + copyR.width / 2 - ar.left) + 'px';
    resetBtn.style.top = (copyR.bottom - ar.top - 6) + 'px';
  }

  function placeLeaf(x, y) { leaf.style.left = x + 'px'; leaf.style.top = y + 'px'; }
  function setTether(x1, y1, x2, y2) {
    const midx = (x1 + x2) / 2, sag = Math.min(24, Math.hypot(x2 - x1, y2 - y1) * 0.12);
    tetherPath.setAttribute('d', `M ${x1} ${y1} Q ${midx} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`);
  }

  /* ---------- drag ---------- */
  let dragging = false, startX = 0, startY = 0, triggered = false;

  function onDown(e) {
    if (triggered) return;
    dragging = true;
    leaf.classList.remove('idle');
    startX = e.clientX; startY = e.clientY;
    try { leaf.setPointerCapture(e.pointerId); } catch (_) {}
    tether.classList.add('show');
  }
  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - startX, dy = e.clientY - startY;
    const dist = Math.hypot(dx, dy);
    placeLeaf(homeX + dx, homeY + dy);
    setTether(homeX, homeY, homeX + dx, homeY + dy);
    // tilt with drag direction; grows as the threshold nears
    const near = Math.min(1, dist / THRESHOLD());
    swing.style.transform = `rotate(${(dx * 0.12 + near * 8).toFixed(1)}deg)`;
    hint.classList.add('gone');
    // subtle cue on the paragraph as the threshold approaches
    copy.style.transform = `translateY(${(near * 2).toFixed(1)}px)`;
    if (dist >= THRESHOLD()) { release(e); }
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    try { leaf.releasePointerCapture(e.pointerId); } catch (_) {}
    if (triggered) return;
    // returned before threshold — glide the leaf home
    tether.classList.remove('show');
    copy.style.transform = '';
    leaf.style.transition = 'left 420ms cubic-bezier(0.22,1,0.36,1), top 420ms cubic-bezier(0.22,1,0.36,1)';
    placeLeaf(homeX, homeY);
    swing.style.transform = '';
    setTimeout(() => { leaf.style.transition = ''; leaf.classList.add('idle'); hint.classList.remove('gone'); }, 440);
  }

  function release(e) {
    if (triggered) return;
    dragging = false;
    if (e && e.pointerId != null) { try { leaf.releasePointerCapture(e.pointerId); } catch (_) {} }
    trigger();
  }

  leaf.addEventListener('pointerdown', onDown);
  leaf.addEventListener('pointermove', onMove);
  leaf.addEventListener('pointerup', onUp);
  leaf.addEventListener('pointercancel', onUp);
  // keyboard: Enter/Space release, Escape resets
  leaf.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!triggered) trigger(); }
    else if (e.key === 'Escape') { e.preventDefault(); reset(); }
  });
  resetBtn.addEventListener('click', reset);
  document.addEventListener('keydown', (e) => { if (triggered && e.key === 'Escape') reset(); });

  /* ---------- release: measure words, then fall ---------- */
  let words = [], rafId = null, autoTimer = null, startT = 0, lastT = 0;

  function measureWords() {
    const ar = aboutRect();
    const base = getComputedStyle(paras[0]);
    fallLayer.style.font = base.font || `${base.fontWeight} ${base.fontSize}/${base.lineHeight} ${base.fontFamily}`;
    fallLayer.style.color = base.color;
    fallLayer.style.letterSpacing = base.letterSpacing;
    const out = [];
    paras.forEach((p, pi) => {
      p.childNodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        const text = node.nodeValue;
        const re = /\S+/g; let m;
        while ((m = re.exec(text))) {
          const range = document.createRange();
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          const rect = range.getBoundingClientRect();
          if (!rect.width) continue;
          out.push({
            word: m[0],
            x: rect.left - ar.left,
            y: rect.top - ar.top,
            pi
          });
        }
      });
    });
    return out;
  }

  function trigger() {
    if (triggered) return;
    triggered = true;
    tether.classList.remove('show');
    hint.classList.add('gone');
    copy.style.transform = '';
    leaf.classList.remove('idle');

    // release the leaf: drift down and fade
    const lx = parseFloat(leaf.style.left) || homeX;
    leaf.classList.add('released');
    requestAnimationFrame(() => {
      placeLeaf(lx + 26, fallHeight - 4);
      leaf.style.opacity = '0';
    });

    if (reduce.matches) {                 // reduced motion: gentle fade, no physics
      copy.style.transition = 'opacity 600ms ease';
      copy.classList.add('about-falling');
      showReset();
      autoTimer = setTimeout(reset, 2600);
      return;
    }

    const lh = lineHeightPx();
    const measured = measureWords();
    const lineTop = measured.length ? Math.min(...measured.map((w) => w.y)) : 0;
    words = measured.map((w) => {
      const span = document.createElement('span');
      span.className = 'about-word';
      span.textContent = w.word;
      span.style.left = '0px';
      span.style.top = '0px';
      span.style.transform = `translate3d(${w.x}px, ${w.y}px, 0)`;
      fallLayer.appendChild(span);
      const line = Math.round((w.y - lineTop) / lh);
      return {
        el: span, x: w.x, y: w.y,
        vx: (Math.random() * 2 - 1) * 34,
        vy: 10 + Math.random() * 30,
        rot: 0,
        av: (Math.random() * 2 - 1) * 55,
        delay: line * 0.05 + Math.random() * 0.04
      };
    });

    // swap to the falling words with no visible jump (hide the real copy instantly)
    copy.style.transition = 'none';
    copy.classList.add('about-falling');

    startT = lastT = performance.now();
    rafId = requestAnimationFrame(step);
    autoTimer = setTimeout(reset, 5200);   // auto-restore, manual reset also offered
  }

  function step(now) {
    const dt = Math.min(0.032, (now - lastT) / 1000);
    lastT = now;
    const t = (now - startT) / 1000;
    let alive = 0;
    for (const w of words) {
      if (t < w.delay) { alive++; continue; }
      w.vy += GRAVITY * dt;
      w.x += w.vx * dt;
      w.y += w.vy * dt;
      w.rot += w.av * dt;
      const ft = t - w.delay;
      const op = ft < 0.45 ? 1 : Math.max(0, 1 - (ft - 0.45) / 1.5);
      w.el.style.transform = `translate3d(${w.x.toFixed(1)}px, ${w.y.toFixed(1)}px, 0) rotate(${w.rot.toFixed(1)}deg)`;
      w.el.style.opacity = op.toFixed(3);
      if (op > 0.01 && w.y < fallHeight + 60) alive++;
    }
    if (alive > 0 && t < 4) rafId = requestAnimationFrame(step);
    else { rafId = null; showReset(); }
  }

  function showReset() {
    resetBtn.hidden = false;
    resetBtn.style.opacity = '0';
    requestAnimationFrame(() => { resetBtn.style.opacity = '1'; });
  }

  /* ---------- reset ---------- */
  function reset() {
    if (!triggered) return;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    words.forEach((w) => w.el.remove());
    words = [];
    resetBtn.hidden = true;
    resetBtn.style.opacity = '';

    // restore the paragraph with a soft fade
    copy.style.transition = 'opacity 600ms ease';
    copy.classList.remove('about-falling');

    // return the leaf home
    leaf.classList.remove('released');
    leaf.style.transition = 'opacity 500ms ease';
    leaf.style.opacity = '1';
    placeLeaf(homeX, homeY);
    swing.style.transform = '';
    setTimeout(() => { leaf.style.transition = ''; leaf.classList.add('idle'); }, 520);
    hint.classList.remove('gone');
    triggered = false;
  }

  /* ---------- init + lifecycle ---------- */
  let resizeTimer = null;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!triggered) measureHome(); }, 150);
  };

  function init() {
    measureHome();
    window.addEventListener('resize', onResize, { passive: true });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  else window.addEventListener('load', init, { once: true });
  // a settle pass in case layout shifts after first paint
  setTimeout(() => { if (!triggered) measureHome(); }, 600);

  window.addEventListener('pagehide', () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(autoTimer);
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  }, { once: true });
})();
