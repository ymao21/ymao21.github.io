/* ==========================================================
   Yining Mao — Portfolio
   1. Navigation (scroll state + mobile menu)
   2. Scroll reveals
   3. Project bookshelf, preview panel, detail dialog, project index
   4. Custom cursor (dot + easing halo)
   ========================================================== */

import { projects, defaultProjectSlug } from './js/data/projects.js';

const coarsePointer = window.matchMedia('(pointer: coarse)');

/* ---------- 1. Navigation ---------- */
(function navigation() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!nav || !toggle || !links) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setOpen = (open) => {
    links.classList.toggle('open', open);
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) setOpen(false);
  });
})();

/* ---------- 2. Scroll reveals ---------- */
(function reveals() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));   // never hide content
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  items.forEach((el) => io.observe(el));
})();

/* ---------- 3. Bookshelf ---------- */
(function bookshelf() {
  const shelf = document.getElementById('shelf');
  const preview = document.getElementById('bookPreview');
  const hint = document.getElementById('shelfHint');
  const modal = document.getElementById('projectModal');
  if (!shelf || !preview || !modal) return;

  const panel = modal.querySelector('.pm-panel');
  const pmType = document.getElementById('pmType');
  const pmTitle = document.getElementById('pmTitle');
  const pmSubtitle = document.getElementById('pmSubtitle');
  const pmBadge = document.getElementById('pmBadge');
  const pmTeam = document.getElementById('pmTeam');
  const pmLinks = document.getElementById('pmLinks');
  const pmBody = document.getElementById('pmBody');

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  if (coarsePointer.matches && hint) {
    hint.textContent = 'Tap a book to preview · tap again to open the full write-up';
  }

  /* ----- build the shelf ----- */
  const bookEls = new Map();

  projects.forEach((p) => {
    const book = document.createElement('button');
    book.type = 'button';
    book.className = 'book';
    book.setAttribute('aria-haspopup', 'dialog');
    book.setAttribute(
      'aria-label',
      `${p.title} — ${p.type}${p.featured ? ', featured' : ''}. Open project details.`
    );
    book.dataset.slug = p.slug;
    book.style.setProperty('--w', `${p.dimensions.width}px`);
    book.style.setProperty('--h', `${p.dimensions.height}px`);
    book.style.setProperty('--cover', p.cover);
    book.style.setProperty('--foil', p.foil);
    book.innerHTML = `
      <span class="book-spine">
        <span class="spine-title">${esc(p.spineTitle)}</span>
        <span class="spine-rule" aria-hidden="true"></span>
        <span class="spine-author">YINING MAO</span>
      </span>
      <span class="book-cover" aria-hidden="true">
        <span class="cover-type">${esc(p.type)}</span>
        <span class="cover-title">${esc(p.title)}</span>
        <span class="cover-sub">${esc(p.subtitle)}</span>
        <span class="cover-stack">${esc(p.stack.slice(0, 4).join(' · '))}</span>
        <span class="cover-author">YINING MAO</span>
      </span>`;

    shelf.appendChild(book);
    bookEls.set(p.slug, book);

    /* open the cover toward whichever side has room */
    const pickCoverSide = () => {
      const r = book.getBoundingClientRect();
      book.classList.toggle(
        'open-left',
        r.right + 230 > document.documentElement.clientWidth && r.left - 230 > 0
      );
    };

    const activate = () => {
      pickCoverSide();
      renderPreview(p);
      const prev = book.previousElementSibling;
      const next = book.nextElementSibling;
      clearShift();
      if (prev) prev.classList.add('shift-left');
      if (next) next.classList.add('shift-right');
    };

    book.addEventListener('mouseenter', activate);
    book.addEventListener('focus', activate);
    book.addEventListener('mouseleave', clearShift);
    book.addEventListener('blur', clearShift);

    book.addEventListener('click', () => {
      // touch: first tap previews, second tap opens
      if (coarsePointer.matches && !book.classList.contains('is-active')) {
        shelf.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
        book.classList.add('is-active');
        activate();
        return;
      }
      openProject(p, book);
    });
  });

  function clearShift() {
    shelf.querySelectorAll('.shift-left, .shift-right')
      .forEach((el) => el.classList.remove('shift-left', 'shift-right'));
  }

  /* ----- preview panel (never empty) ----- */
  let previewSlug = null;

  function renderPreview(p) {
    if (previewSlug === p.slug) return;
    previewSlug = p.slug;
    preview.innerHTML = `
      <div class="pv-main">
        <p class="pv-type">${esc(p.type)}</p>
        <h3 class="pv-title">${esc(p.title)}</h3>
        <p class="pv-sub">${esc(p.subtitle)}</p>
        ${p.badge ? `<p class="pv-badge">${esc(p.badge)}</p>` : ''}
        <p class="pv-result"><b>Result</b>${esc(p.result)}</p>
      </div>
      <div class="pv-aside">
        <ul class="pv-stack">${p.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="pv-actions">
          <button class="btn btn-primary btn-small" type="button" data-open="${esc(p.slug)}">
            Full write-up
          </button>
          <a class="btn btn-outline btn-small" href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>`;
    preview.classList.add('flash');
    setTimeout(() => preview.classList.remove('flash'), 350);
  }

  preview.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open]');
    if (!trigger) return;
    const p = projects.find((item) => item.slug === trigger.dataset.open);
    if (p) openProject(p, bookEls.get(p.slug));
  });

  /* ----- readable index: every project as plain horizontal text ----- */
  const index = document.getElementById('projIndex');
  if (index) {
    const ordered = [...projects].sort(
      (a, b) => Number(b.featured) - Number(a.featured)
    );
    index.innerHTML = ordered.map((p) => `
      <li>
        <button type="button" data-open="${esc(p.slug)}" aria-haspopup="dialog">
          <span class="pi-name">${esc(p.title)}${
            p.featured ? '<span class="pi-star">Featured</span>' : ''
          }</span>
          <span class="pi-meta">${esc(p.type.split(' · ')[0])} · ${esc(p.year)}</span>
        </button>
      </li>`).join('');

    index.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open]');
      if (!trigger) return;
      const p = projects.find((item) => item.slug === trigger.dataset.open);
      if (p) openProject(p, bookEls.get(p.slug));
    });
  }

  const initial = projects.find((p) => p.slug === defaultProjectSlug) || projects[0];
  renderPreview(initial);

  /* ----- detail dialog ----- */
  let lastFocused = null;
  const pageRegions = [
    document.getElementById('nav'),
    document.querySelector('main'),
    document.querySelector('.footer')
  ].filter(Boolean);

  function setPageInert(inert) {
    pageRegions.forEach((el) => {
      el.inert = inert;
      el.toggleAttribute('aria-hidden', inert);
    });
  }

  function openProject(p, bookEl) {
    lastFocused = bookEl || document.activeElement;

    pmType.textContent = p.type;
    pmTitle.textContent = p.title;
    pmSubtitle.textContent = p.subtitle;

    pmBadge.hidden = !p.badge;
    if (p.badge) pmBadge.textContent = p.badge;

    pmTeam.hidden = !(p.team || p.year);
    if (p.team || p.year) {
      pmTeam.textContent = [p.year, p.team].filter(Boolean).join(' · ');
    }

    const links = [
      `<a class="btn btn-primary btn-small" href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">
         View on GitHub</a>`
    ];
    (p.links || []).forEach((l) => {
      links.push(`<a class="btn btn-outline btn-small" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
        ${esc(l.label)}</a>`);
    });
    pmLinks.innerHTML = links.join('');

    pmBody.innerHTML = `
      <div class="pm-block">
        <h4>The problem</h4>
        <p>${esc(p.problem)}</p>
      </div>
      <div class="pm-block">
        <h4>${p.myRole ? 'What the team built' : 'What I built'}</h4>
        <p>${esc(p.built)}</p>
      </div>
      ${p.myRole ? `
      <div class="pm-block pm-block--role">
        <h4>My role</h4>
        <p>${esc(p.myRole)}</p>
      </div>` : ''}
      <div class="pm-block pm-block--result">
        <h4>Result</h4>
        <p>${esc(p.result)}</p>
      </div>
      <div class="pm-block">
        <h4>Technology</h4>
        <ul class="pm-stack">${p.stack.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>`;

    panel.style.setProperty('--pm-cover', p.cover);
    if (bookEl) {
      const r = bookEl.getBoundingClientRect();
      panel.style.setProperty(
        '--pm-origin',
        `${((r.left + r.width / 2) / window.innerWidth) * 100}% ${((r.top + r.height / 2) / window.innerHeight) * 100}%`
      );
    }

    modal.hidden = false;
    modal.classList.remove('closing');
    setPageInert(true);
    document.body.style.overflow = 'hidden';
    pmBody.scrollTop = 0;
    modal.querySelector('.pm-close').focus();
  }

  function closeProject() {
    modal.classList.add('closing');
    setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('closing');
      setPageInert(false);
      document.body.style.overflow = '';
      shelf.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
    }, 220);
  }

  modal.querySelectorAll('[data-close]').forEach((el) =>
    el.addEventListener('click', closeProject));

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeProject();
      return;
    }
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ----- deep links from the homepage open that project directly -----
     Runs last: openProject touches consts declared above, so calling it
     any earlier hits their temporal dead zone. */
  const fromHash = () => {
    const slug = decodeURIComponent(location.hash.replace('#', ''));
    const p = projects.find((item) => item.slug === slug);
    if (p) openProject(p, bookEls.get(p.slug));
  };
  if (location.hash) fromHash();
  window.addEventListener('hashchange', fromHash);

  // tapping away clears the mobile preview state
  document.addEventListener('click', (e) => {
    if (e.target.closest('.book') || e.target.closest('.preview')) return;
    shelf.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
  });
})();

/* ---------- 4. Custom cursor ---------- */
(function customCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  // touch devices and reduced-motion users keep the system cursor
  if (!fine.matches || reduce.matches) return;

  const dot = document.createElement('div');
  const halo = document.createElement('div');
  dot.className = 'cursor-dot';
  halo.className = 'cursor-halo';
  dot.setAttribute('aria-hidden', 'true');
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(halo, dot);
  document.documentElement.classList.add('has-cursor');

  const HOT = 'a[href], button, [role="button"], input, textarea, select, summary, .book';

  // pointer position is the source of truth; the halo chases it
  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let hx = x;
  let hy = y;
  let visible = false;
  let raf = null;

  const frame = () => {
    hx += (x - hx) * 0.18;
    hy += (y - hy) * 0.18;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    halo.style.transform = `translate(${hx}px, ${hy}px)`;
    raf = requestAnimationFrame(frame);
  };

  const start = () => { if (raf === null) raf = requestAnimationFrame(frame); };
  const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX;
    y = e.clientY;
    if (!visible) {
      visible = true;
      hx = x; hy = y;
      dot.classList.add('is-visible');
      halo.classList.add('is-visible');
      start();
    }
    const hot = !!e.target.closest(HOT);
    dot.classList.toggle('is-hot', hot);
    halo.classList.toggle('is-hot', hot);
  }, { passive: true });

  document.addEventListener('pointerdown', () => halo.classList.add('is-down'), { passive: true });
  document.addEventListener('pointerup', () => halo.classList.remove('is-down'), { passive: true });

  const hide = () => {
    visible = false;
    dot.classList.remove('is-visible', 'is-hot');
    halo.classList.remove('is-visible', 'is-hot', 'is-down');
    stop();
  };
  document.addEventListener('pointerleave', hide);
  document.addEventListener('mouseleave', hide);
  window.addEventListener('blur', hide);

  // a touch on a hybrid device hands control back to the system cursor
  window.addEventListener('touchstart', () => {
    hide();
    document.documentElement.classList.remove('has-cursor');
  }, { once: true, passive: true });

  // never leave a rAF running behind a hidden tab
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (visible) start();
  });
})();
