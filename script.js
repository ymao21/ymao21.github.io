/* ==========================================================
   Yining Mao — Portfolio Scripts
   1. Navbar + scroll reveals
   2. Constellation hero background
   3. Global flower-planting layer
   4. Project bookshelf (data-driven) + open-book modal
   5. Flowering-vine Experience timeline
   6. Cinematic hero video loop
   (About photo gallery lives in js/gallery.js)
   ========================================================== */

import { projects } from './js/data/projects.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const coarsePointer = window.matchMedia('(pointer: coarse)');

/* ---------- 1. Navbar ---------- */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Scroll reveals ---------- */
const revealIO = new IntersectionObserver((entries) => {
  for (const en of entries) {
    if (en.isIntersecting) {
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
    }
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

/* ---------- 2. Constellation background ---------- */
(function constellation() {
  const canvas = document.getElementById('constellation');
  const ctx = canvas.getContext('2d');
  let nodes = [], cw = 0, ch = 0, raf = 0, running = false;
  const mouse = { x: 0.5, y: 0.5 };
  const DPR = Math.min(devicePixelRatio || 1, 1.5);

  function resize() {
    const r = canvas.getBoundingClientRect();
    canvas.width = r.width * DPR;
    canvas.height = r.height * DPR;
    cw = r.width; ch = r.height;
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = cw < 720 ? 34 : 54;
  for (let i = 0; i < COUNT; i++) {
    nodes.push({
      x: Math.random() * cw, y: Math.random() * ch,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      r: 1 + Math.random() * 1.7,
      depth: 0.4 + Math.random() * 0.6,
      hue: Math.random() < 0.75 ? [201, 138, 147] : [169, 155, 198]
    });
  }
  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX / innerWidth; mouse.y = e.clientY / innerHeight;
  }, { passive: true });

  function draw() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    const px = (mouse.x - 0.5) * 14, py = (mouse.y - 0.5) * 14;
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = cw + 20; if (n.x > cw + 20) n.x = -20;
      if (n.y < -20) n.y = ch + 20; if (n.y > ch + 20) n.y = -20;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 150 * 150) {
          const alpha = (1 - Math.sqrt(d2) / 150) * 0.13;
          ctx.strokeStyle = `rgba(${a.hue[0]},${a.hue[1]},${a.hue[2]},${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x + px * a.depth, a.y + py * a.depth);
          ctx.lineTo(b.x + px * b.depth, b.y + py * b.depth);
          ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.fillStyle = `rgba(${n.hue[0]},${n.hue[1]},${n.hue[2]},${0.25 + n.depth * 0.3})`;
      ctx.shadowColor = `rgba(${n.hue[0]},${n.hue[1]},${n.hue[2]},0.5)`;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(n.x + px * n.depth, n.y + py * n.depth, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
  function loop() { draw(); raf = requestAnimationFrame(loop); }

  if (reducedMotion.matches) { draw(); return; }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !running) { running = true; loop(); }
    else if (!en.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  });
  io.observe(canvas);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running) { cancelAnimationFrame(raf); running = false; }
    else if (!document.hidden && !running) {
      const r = canvas.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) { running = true; loop(); }
    }
  });
})();

/* ---------- 3. Global flower planting ---------- */
(function flowers() {
  const layer = document.getElementById('flowerLayer');
  const MAX = 36;
  const planted = [];
  const petalColors = ['#E8B4B8', '#E07A5F', '#F3E0D0', '#C3B2D9', '#C98A93', '#F0C7B8'];
  const centerColors = ['#F7D9A8', '#FFF2E2', '#EFC3A4'];

  function syncHeight() {
    layer.style.height = document.documentElement.scrollHeight + 'px';
  }
  window.addEventListener('resize', syncHeight);
  window.addEventListener('load', syncHeight);
  syncHeight();

  function makeFlowerSVG() {
    const petal = petalColors[Math.floor(Math.random() * petalColors.length)];
    const center = centerColors[Math.floor(Math.random() * centerColors.length)];
    const petals = 5 + Math.floor(Math.random() * 2);
    const stemH = 16 + Math.random() * 22;
    const R = 9 + Math.random() * 5;
    const leaf = Math.random() < 0.55;
    let petalsMarkup = '';
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2;
      petalsMarkup += `<ellipse cx="${Math.cos(a) * R * 0.62}" cy="${Math.sin(a) * R * 0.62}"
        rx="${R * 0.58}" ry="${R * 0.38}" fill="${petal}"
        transform="rotate(${(a * 180 / Math.PI)} ${Math.cos(a) * R * 0.62} ${Math.sin(a) * R * 0.62})"/>`;
    }
    const W = R * 2.6, H = R * 2.2 + stemH;
    return `<svg width="${W}" height="${H}" viewBox="${-W / 2} ${-R * 1.4} ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,${R * 0.5} q ${Math.random() < 0.5 ? 3 : -3},${stemH * 0.5} 0,${stemH}" stroke="#9CAF97" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${leaf ? `<ellipse cx="${Math.random() < 0.5 ? 5 : -5}" cy="${R * 0.5 + stemH * 0.55}" rx="5" ry="2.6" fill="#9CAF97" opacity="0.9"/>` : ''}
      <g>${petalsMarkup}<circle r="${R * 0.34}" fill="${center}"/></g>
    </svg>`;
  }

  let downPos = null;
  document.addEventListener('pointerdown', (e) => { downPos = { x: e.clientX, y: e.clientY }; }, { passive: true });

  document.addEventListener('click', (e) => {
    // never plant on interactive or media elements
    if (e.target.closest('a, button, input, textarea, select, label, canvas, dialog, [role="dialog"], .book, .polaroid, .nav, .hero-copy, .shelf-scroll, .about-gallery, .tl-item')) return;
    // skip drags and text selection
    if (downPos && Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 8) return;
    const sel = window.getSelection();
    if (sel && sel.type === 'Range' && String(sel).length) return;

    const fl = document.createElement('div');
    fl.className = 'flower';
    fl.style.setProperty('--rot', (Math.random() * 14 - 7).toFixed(1) + 'deg');
    fl.style.left = e.pageX + 'px';
    fl.style.top = 'auto';
    const scale = 0.8 + Math.random() * 0.7;
    fl.style.width = 'auto';
    fl.innerHTML = makeFlowerSVG();
    const svg = fl.firstElementChild;
    svg.style.display = 'block';
    svg.style.transform = `scale(${scale})`;
    // anchor bottom of stem at click point (document coords)
    fl.style.top = e.pageY + 'px';
    fl.style.marginTop = -parseFloat(svg.getAttribute('height')) * scale + 'px';
    layer.appendChild(fl);
    planted.push(fl);
    if (planted.length > MAX) {
      const old = planted.shift();
      old.classList.add('leaving');
      setTimeout(() => old.remove(), 650);
    }
    syncHeight();
  });
})();

/* ---------- 4. Bookshelf ---------- */
(function bookshelf() {
  const shelf = document.getElementById('shelf');
  const info = document.getElementById('bookInfo');
  const modal = document.getElementById('bookModal');
  const bmKicker = document.getElementById('bmKicker');
  const bmTitle = document.getElementById('bmTitle');
  const bmSubtitle = document.getElementById('bmSubtitle');
  const bmBadge = document.getElementById('bmBadge');
  const bmPage = document.getElementById('bmPage');
  const bmPrev = document.getElementById('bmPrev');
  const bmNext = document.getElementById('bmNext');
  const bmIndicator = document.getElementById('bmIndicator');
  const bmBook = modal.querySelector('.bm-book');

  // featured books in the center of the shelf
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const half = Math.ceil(rest.length / 2);
  const ordered = [...rest.slice(0, half), ...featured, ...rest.slice(half)];

  const leans = [0, -1.6, 0, 0, 1.8, 0, -1.2, 0, 0, 1.4, 0, -1.5, 0];

  ordered.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'book';
    b.type = 'button';
    b.setAttribute('role', 'listitem');
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-label', `${p.title} — open project details`);
    b.dataset.slug = p.slug;
    b.style.setProperty('--w', p.dimensions.width + 'px');
    b.style.setProperty('--h', p.dimensions.height + 'px');
    b.style.setProperty('--cover', p.coverColor);
    b.style.setProperty('--accent', p.accentColor);
    b.style.setProperty('--lean', (leans[i % leans.length] || 0) + 'deg');
    b.innerHTML = `
      <span class="book-spine">
        ${p.featured ? '<span class="spine-star" aria-hidden="true">✦</span>' : ''}
        <span class="spine-title">${p.spineTitle}</span>
        <span class="spine-author">YINING MAO</span>
      </span>
      <span class="book-cover" aria-hidden="true">
        <span class="cover-title">${p.title}</span>
        <span class="cover-sub">${p.subtitle}</span>
        ${p.badge ? `<span class="cover-badge">🏆 ${p.badge}</span>` : ''}
        <span class="cover-stack">${p.stack.slice(0, 4).join(' · ')}</span>
        <span class="cover-author">YINING MAO</span>
      </span>`;
    shelf.appendChild(b);

    // open the cover toward whichever side has more viewport space
    const pickCoverSide = () => {
      const r = b.getBoundingClientRect();
      b.classList.toggle('open-left',
        r.right + 220 > document.documentElement.clientWidth && r.left - 220 > 0);
    };

    const showInfo = () => {
      pickCoverSide();
      info.innerHTML = `
        ${p.badge ? `<span class="bi-badge">🏆 ${p.badge}</span><br>` : ''}
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="bi-tags">${p.stack.map((t) => `<span>${t}</span>`).join('')}</div>
        <button class="bi-open" type="button">View Project →</button>`;
      info.classList.add('show');
      info.querySelector('.bi-open').addEventListener('click', () => openBook(p, b));
      const prev = b.previousElementSibling, next = b.nextElementSibling;
      prev && prev.classList.add('shift-left');
      next && next.classList.add('shift-right');
    };
    const hideInfo = () => {
      shelf.querySelectorAll('.shift-left, .shift-right').forEach((el) =>
        el.classList.remove('shift-left', 'shift-right'));
    };

    b.addEventListener('mouseenter', showInfo);
    b.addEventListener('mouseleave', hideInfo);
    b.addEventListener('focus', showInfo);
    b.addEventListener('blur', hideInfo);
    b.addEventListener('click', () => {
      // on touch devices, first tap previews the cover; second tap opens
      if (coarsePointer.matches && !b.classList.contains('previewed')) {
        shelf.querySelectorAll('.previewed').forEach((el) => el.classList.remove('previewed'));
        b.classList.add('previewed');
        showInfo();
        return;
      }
      openBook(p, b);
    });
  });

  /* ----- open-book modal ----- */
  let activeBook = null;
  let pages = [];
  let pageIdx = 0;

  function buildPages(p) {
    const list = [];
    list.push({
      title: 'OVERVIEW',
      html: `<p class="bm-lede">${p.subtitle}</p>
        ${p.badge ? `<span class="bm-callout">🏆 ${p.badge}</span>` : ''}
        <p>${p.description}</p>
        ${p.role ? `<p><strong>Role:</strong> ${p.role}</p>` : ''}
        ${p.impact ? `<p><strong>Impact:</strong> ${p.impact}</p>` : ''}
        <div class="bm-tags">${p.stack.slice(0, 5).map((t) => `<span>${t}</span>`).join('')}</div>`
    });
    list.push({
      title: 'TECHNOLOGY STACK',
      html: `<div class="bm-tags">${p.stack.map((t) => `<span>${t}</span>`).join('')}</div>`
    });
    const links = [
      `<a class="bm-link" href="${p.github}" target="_blank" rel="noopener noreferrer">View GitHub ↗</a>`
    ];
    if (p.liveDemo) links.push(`<a class="bm-link" href="${p.liveDemo}" target="_blank" rel="noopener noreferrer">Live Demo ↗</a>`);
    (p.articleLinks || []).forEach((a) =>
      links.push(`<a class="bm-link" href="${a.url}" target="_blank" rel="noopener noreferrer">${a.label} ↗</a>`));
    list.push({ title: 'LINKS', html: links.join('<br>') });
    return list;
  }

  function renderPage() {
    const pg = pages[pageIdx];
    bmPage.innerHTML = `<h4>${pg.title}</h4>${pg.html}`;
    bmIndicator.textContent = `Page ${pageIdx + 1} of ${pages.length}`;
    bmPrev.disabled = pageIdx === 0;
    bmNext.disabled = pageIdx === pages.length - 1;
  }

  function openBook(p, bookEl) {
    activeBook = bookEl;
    pages = buildPages(p);
    pageIdx = 0;
    bmKicker.textContent = 'FROM THE LIBRARY OF YINING MAO';
    bmTitle.textContent = p.title;
    bmSubtitle.textContent = p.subtitle;
    if (p.badge) { bmBadge.hidden = false; bmBadge.textContent = `🏆 ${p.badge}`; } else { bmBadge.hidden = true; }
    bmBook.style.setProperty('--bm-cover', p.coverColor);
    bmBook.style.setProperty('--bm-accent', p.accentColor);
    const r = bookEl.getBoundingClientRect();
    bmBook.style.setProperty('--bm-origin', `${((r.left + r.width / 2) / innerWidth) * 100}% ${((r.top + r.height / 2) / innerHeight) * 100}%`);
    renderPage();
    modal.hidden = false;
    modal.classList.remove('closing');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.bm-close').focus();
  }

  function closeBook() {
    modal.classList.add('closing');
    const done = () => {
      modal.hidden = true;
      modal.classList.remove('closing');
      document.body.style.overflow = '';
      if (activeBook) { activeBook.classList.remove('previewed'); activeBook.focus(); }
    };
    if (reducedMotion.matches) setTimeout(done, 250);
    else setTimeout(done, 420);
  }

  bmPrev.addEventListener('click', () => { if (pageIdx > 0) { pageIdx--; renderPage(); } });
  bmNext.addEventListener('click', () => { if (pageIdx < pages.length - 1) { pageIdx++; renderPage(); } });
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeBook));

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeBook(); return; }
    if (e.key === 'ArrowLeft' && pageIdx > 0) { pageIdx--; renderPage(); }
    if (e.key === 'ArrowRight' && pageIdx < pages.length - 1) { pageIdx++; renderPage(); }
    if (e.key === 'Tab') {
      // trap focus inside the dialog
      const focusables = modal.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]');
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // clear mobile preview state when tapping elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.book') && !e.target.closest('.book-info')) {
      shelf.querySelectorAll('.previewed').forEach((el) => el.classList.remove('previewed'));
    }
  });
})();

/* ---------- 6. Flowering-vine Experience timeline ---------- */
(function vineTimeline() {
  const wrap = document.getElementById('vineWrap');
  const svg = document.getElementById('vineSvg');
  if (!wrap || !svg) return;

  const flowers = [...wrap.querySelectorAll('.tl-flower')];
  const FLOWER = `
    <svg viewBox="-11 -11 22 22" xmlns="http://www.w3.org/2000/svg">
      ${[0, 72, 144, 216, 288].map((a) =>
        `<ellipse cx="0" cy="-5.6" rx="3.2" ry="5.1" fill="currentColor" transform="rotate(${a})"/>`).join('')}
      <circle r="3" fill="#F7D9A8"/>
    </svg>`;
  flowers.forEach((f) => { f.innerHTML = FLOWER; });

  const NS = 'http://www.w3.org/2000/svg';

  function build() {
    try {
      const wr = wrap.getBoundingClientRect();
      if (!wr.width || !wr.height) return;
      svg.innerHTML = '';
      svg.setAttribute('viewBox', `0 0 ${wr.width} ${wr.height}`);
      svg.setAttribute('preserveAspectRatio', 'none');

      // stem gradient: sage at the roots, dusty rose at the tip
      const defs = document.createElementNS(NS, 'defs');
      defs.innerHTML = `
        <linearGradient id="vineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9CAF97"/>
          <stop offset="0.55" stop-color="#A9A292"/>
          <stop offset="1" stop-color="#C98A93"/>
        </linearGradient>`;
      svg.appendChild(defs);

      // wind the stem through every blossom
      const pts = flowers.map((f) => {
        const r = f.getBoundingClientRect();
        return { x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2 };
      });
      const all = [{ x: pts[0].x - 26, y: 4 }, ...pts,
        { x: pts[pts.length - 1].x + 22, y: wr.height - 8 }];
      let d = `M ${all[0].x},${all[0].y}`;
      for (let i = 1; i < all.length; i++) {
        const p0 = all[i - 1], p1 = all[i];
        const my = (p0.y + p1.y) / 2;
        d += ` C ${p0.x},${my} ${p1.x},${my} ${p1.x},${p1.y}`;
      }
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('class', 'vine-path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', 'url(#vineGrad)');
      svg.appendChild(path);

      const len = path.getTotalLength();
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = wrap.classList.contains('in') ? 0 : len;

      // small leaves and buds along the stem
      const leafAt = [0.06, 0.16, 0.27, 0.4, 0.52, 0.64, 0.77, 0.88];
      leafAt.forEach((k, i) => {
        const p = path.getPointAtLength(len * k);
        const q = path.getPointAtLength(Math.min(len, len * k + 8));
        const angle = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
        const side = i % 2 ? 55 : -55;
        const leaf = document.createElementNS(NS, 'ellipse');
        leaf.setAttribute('class', 'vine-leaf');
        leaf.setAttribute('cx', p.x); leaf.setAttribute('cy', p.y);
        leaf.setAttribute('rx', 7); leaf.setAttribute('ry', 3.2);
        leaf.setAttribute('fill', i % 3 ? '#9CAF97' : '#B5C4A9');
        leaf.setAttribute('transform', `rotate(${angle + side} ${p.x} ${p.y}) translate(0 ${i % 2 ? 6 : -6})`);
        leaf.style.transitionDelay = (0.25 + k * 1.1) + 's';
        svg.appendChild(leaf);
      });
      [0.22, 0.47, 0.71, 0.93].forEach((k) => {
        const p = path.getPointAtLength(len * k);
        const bud = document.createElementNS(NS, 'circle');
        bud.setAttribute('class', 'vine-bud');
        bud.setAttribute('cx', p.x); bud.setAttribute('cy', p.y);
        bud.setAttribute('r', 3.4);
        bud.setAttribute('fill', '#E8B4B8');
        bud.style.transitionDelay = (0.35 + k * 1.1) + 's';
        svg.appendChild(bud);
      });
    } catch (err) {
      console.warn('Vine decoration unavailable:', err);
      wrap.classList.add('in');
    }
  }

  build();

  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    wrap.classList.add('in');
    const p = svg.querySelector('.vine-path');
    if (p) p.style.strokeDashoffset = 0;
    io.disconnect();
  }, { threshold: 0.2 });
  io.observe(wrap);

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(build, 180);
  });
})();

/* ---------- 7. Cinematic hero video — double-buffered crossfade ----------
   Two overlapping <video> elements alternate as active / standby. About
   0.8s before the active clip ends we start the standby from 0 and swap the
   .is-active class on both in the same frame. Because both use the identical
   opacity transition (same easing), their opacities sum to ~1 throughout the
   crossfade, so the page background is never exposed (no white/black/pink
   flash). Only opacity is ever animated; filters/position never change.
   All state is held in closure variables (no re-render churn); a single rAF
   loop only *reads* playback time. */
(function heroVideo() {
  const media = document.getElementById('heroMedia');
  if (!media) return;
  const videos = Array.from(media.querySelectorAll('.hero-video'));
  if (videos.length < 2) return;

  const CROSSFADE_LEAD = 0.8;   // seconds before end to start the next clip
  const FADE_MS = 850;          // >= CSS transition (800ms) before we reset outgoing
  const READY_FUTURE = 3;       // HTMLMediaElement.HAVE_FUTURE_DATA

  let activeIdx = 0;            // ref: which video is currently shown
  let transitioning = false;   // ref: guard against duplicate transitions
  let rafId = null;            // ref: single monitoring loop
  let resetTimer = null;

  const safePlay = (v) => {
    v.playbackRate = 1;
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {}); // ignore autoplay rejection
  };

  videos.forEach((v) => { v.playbackRate = 1; v.loop = false; });

  /* ----- reduced motion: keep one clip looping, no crossfade churn ----- */
  if (reducedMotion.matches) {
    const v = videos[0];
    v.loop = true;
    v.classList.add('is-active');
    const revealRM = () => v.classList.add('is-active');
    if (v.readyState >= READY_FUTURE) safePlay(v);
    else v.addEventListener('canplay', () => { safePlay(v); revealRM(); }, { once: true });
    safePlay(v);
    return;
  }

  const beginCrossfade = (active, standby) => {
    if (transitioning) return;
    transitioning = true;

    const run = () => {
      try { standby.currentTime = 0; } catch { /* noop */ }
      safePlay(standby);
      // Swap both classes in the same frame → transitions start together →
      // combined opacity stays ~1 (identical easing) → no background flash.
      requestAnimationFrame(() => {
        standby.classList.add('is-active');
        active.classList.remove('is-active');
      });
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        // outgoing is now fully hidden — safe to pause + rewind for reuse
        active.pause();
        try { active.currentTime = 0; } catch { /* noop */ }
        activeIdx = 1 - activeIdx;
        transitioning = false;
      }, FADE_MS);
    };

    if (standby.readyState >= READY_FUTURE) {
      run();
    } else {
      standby.load();
      standby.addEventListener('canplay', run, { once: true });
    }
  };

  const tick = () => {
    const active = videos[activeIdx];
    const standby = videos[1 - activeIdx];
    const d = active.duration;
    if (!transitioning && d && !Number.isNaN(d) && d > CROSSFADE_LEAD * 2) {
      if (active.currentTime >= d - CROSSFADE_LEAD) beginCrossfade(active, standby);
    }
    rafId = requestAnimationFrame(tick);
  };

  /* ----- reveal the first clip only once it can actually play ----- */
  const first = videos[0];
  const standby = videos[1];
  const start = () => {
    first.classList.add('is-active');   // fades in from the warm ivory background
    safePlay(first);
    standby.pause();
    try { standby.currentTime = 0; } catch { /* noop */ }
    if (rafId === null) rafId = requestAnimationFrame(tick);
  };
  if (first.readyState >= READY_FUTURE) start();
  else { first.addEventListener('canplay', start, { once: true }); safePlay(first); }

  const cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    clearTimeout(resetTimer);
    videos.forEach((v) => v.pause());
  };
  window.addEventListener('pagehide', cleanup, { once: true });
})();
