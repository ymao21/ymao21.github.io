/* ==========================================================
   Yining Mao — Portfolio
   1. Navigation (scroll state, active section, back to top)
   2. Scroll reveals
   3. Project bookshelf, preview panel, detail dialog, project index
   4. Custom cursor (dot + easing halo)
   ========================================================== */

import { projects, defaultProjectSlug } from './js/data/projects.js';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reduceMotion.matches ? 'instant' : 'smooth');

/* ---------- 1. Navigation ---------- */
(function navigation() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // "Yining Mao" and "Back to top" return to the very top and drop the hash
  document.querySelectorAll('a[href="#top"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      history.replaceState(null, '', location.pathname + location.search);
    }));

  // arriving on /#about (e.g. from the old about.html) lands on the section
  // instantly, once web fonts have settled the layout
  const landing = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
  if (landing) {
    const land = () => landing.scrollIntoView({ behavior: 'instant' });
    (document.fonts?.ready || Promise.resolve()).then(() => requestAnimationFrame(land));
    setTimeout(land, 60);
  }

  // active-section highlight: the last section whose top has passed the
  // line just below the nav; the bottom of the page always means Contact
  const links = [...nav.querySelectorAll('.nav-link[href^="#"]')];
  const sections = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  let ticking = false;
  const spy = () => {
    ticking = false;
    const line = nav.offsetHeight + window.innerHeight * 0.3;
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    if (atBottom) current = sections[sections.length - 1];
    links.forEach((a) => {
      const on = current && a.getAttribute('href') === `#${current.id}`;
      a.classList.toggle('is-current', !!on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  spy();
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

/* ---------- 3. Bookshelf ----------
   One piece of state drives everything: `active`, the index of the selected
   book. Hover, arrow keys, the step buttons and taps all go through select(),
   which is the only place the shelf, preview and counter are updated.

   Hover is resolved from each book's *layout* slot (offsetLeft/offsetWidth),
   never from what happens to be under the pointer. Lifted and shifted books
   and the swung-open cover are transformed, so their painted position is not
   where they sit; hit-testing those transformed boxes is what used to let the
   open cover swallow the pointer and skip three or four books when moving
   left to right. Covers are also pointer-transparent, so they can never
   capture the pointer at all. */
(function bookshelf() {
  const zone = document.getElementById('shelfZone');
  const shelf = document.getElementById('shelf');
  const scroller = document.getElementById('shelfScroll');
  const preview = document.getElementById('bookPreview');
  const hint = document.getElementById('shelfHint');
  const prevBtn = document.getElementById('shelfPrev');
  const nextBtn = document.getElementById('shelfNext');
  const count = document.getElementById('shelfCount');
  const status = document.getElementById('shelfStatus');
  const modal = document.getElementById('projectModal');
  if (!zone || !shelf || !preview || !modal) return;

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
  const pad = (n) => String(n).padStart(2, '0');
  const tags = (list, cls = '') =>
    `<ul class="tags ${cls}">${list.map((t) => `<li class="tag">${esc(t)}</li>`).join('')}</ul>`;

  const touchFirst = window.matchMedia('(hover: none)').matches;
  if (touchFirst && hint) {
    hint.textContent = 'Tap a book to preview it · tap it again to open the project';
  }

  /* ----- build the shelf ----- */
  const books = projects.map((p, i) => {
    const book = document.createElement('button');
    book.type = 'button';
    book.className = 'book';
    book.tabIndex = -1;
    book.dataset.index = String(i);
    book.setAttribute('aria-haspopup', 'dialog');
    book.setAttribute('aria-label', `${p.title}, ${p.type}. Open project details.`);
    book.style.setProperty('--w', `${p.dimensions.width}px`);
    book.style.setProperty('--h', `${p.dimensions.height}px`);
    book.style.setProperty('--cover', p.cover);
    book.style.setProperty('--foil', p.foil);
    book.innerHTML = `
      <span class="book-spine" aria-hidden="true">
        <span class="spine-title">${esc(p.spineTitle)}</span>
        <span class="spine-rule"></span>
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
    return book;
  });

  const slugIndex = (slug) => projects.findIndex((p) => p.slug === slug);
  let active = -1;

  /* ----- the one state transition ----- */
  function select(i, { scroll = false, focus = false, announce = false } = {}) {
    const next = Math.max(0, Math.min(projects.length - 1, i));
    const changed = next !== active;

    if (changed) {
      if (active >= 0) {
        const old = books[active];
        old.classList.remove('is-active');
        old.tabIndex = -1;
        books[active - 1]?.classList.remove('shift-left');
        books[active + 1]?.classList.remove('shift-right');
      }
      active = next;
      const book = books[active];
      book.classList.add('is-active');
      book.tabIndex = 0;                       // roving tabindex: one tab stop
      books[active - 1]?.classList.add('shift-left');
      books[active + 1]?.classList.add('shift-right');
      pickCoverSide(book);
      renderPreview(projects[active]);

      if (count) count.textContent = `${pad(active + 1)} / ${pad(projects.length)}`;
      if (prevBtn) prevBtn.disabled = active === 0;
      if (nextBtn) nextBtn.disabled = active === projects.length - 1;
    }
    if (announce && status) {
      status.textContent = `${active + 1} of ${projects.length}: ${projects[active].title}`;
    }
    if (scroll) scrollIntoShelf(books[active]);
    if (focus) books[active].focus({ preventScroll: true });
  }

  const step = (dir, opts) => select(active + dir, { scroll: true, announce: true, ...opts });

  /* open the cover toward whichever side has room inside the visible shelf */
  function pickCoverSide(book) {
    const view = scroller.getBoundingClientRect();
    const r = book.getBoundingClientRect();
    const coverW = 230;
    const roomRight = Math.min(view.right, document.documentElement.clientWidth) - r.right;
    const roomLeft = r.left - Math.max(view.left, 0);
    book.classList.toggle('open-left', roomRight < coverW && roomLeft > roomRight);
  }

  /* horizontal scroll only, so the page never jumps vertically */
  function scrollIntoShelf(book) {
    if (scroller.scrollWidth <= scroller.clientWidth) return;
    const left = shelf.offsetLeft + book.offsetLeft + book.offsetWidth / 2 - scroller.clientWidth / 2;
    scroller.scrollTo({ left, behavior: scrollBehavior() });
  }

  /* which book's slot is under this x? gaps count toward the nearer book */
  function indexAt(clientX) {
    const x = clientX - shelf.getBoundingClientRect().left;
    for (let i = 0; i < books.length; i++) {
      const b = books[i];
      const left = b.offsetLeft;
      const right = left + b.offsetWidth;
      const nextLeft = books[i + 1] ? books[i + 1].offsetLeft : right;
      const prevRight = books[i - 1] ? books[i - 1].offsetLeft + books[i - 1].offsetWidth : left;
      if (x >= (prevRight + left) / 2 && x < (right + nextLeft) / 2) return i;
      if (i === 0 && x < left) return -1;
    }
    return -1;
  }

  /* ----- "browsing": covers swing open only while someone is using the shelf ----- */
  let pointerInside = false;
  let touchBrowsing = false;
  const setBrowsing = () => {
    const focused = document.activeElement;
    const on = pointerInside || touchBrowsing ||
      (zone.contains(focused) && !!focused.closest('.shelf, .shelf-nav'));
    shelf.classList.toggle('is-browsing', on);
    if (on && active >= 0) pickCoverSide(books[active]);
  };

  shelf.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointerInside = true;
    const i = indexAt(e.clientX);
    if (i >= 0) select(i);
    setBrowsing();
  });
  shelf.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointerInside = false;
    setBrowsing();
  });
  zone.addEventListener('focusin', setBrowsing);
  zone.addEventListener('focusout', () => requestAnimationFrame(setBrowsing));

  /* clicks: keyboard activation targets the focused book; pointer clicks are
     resolved by slot, so the gap under a lifted book still opens it */
  let lastPointer = 'mouse';
  shelf.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType; });
  shelf.addEventListener('click', (e) => {
    const keyboard = e.detail === 0;
    const target = e.target.closest('.book');
    const touched = target ? Number(target.dataset.index) : indexAt(e.clientX);
    const i = keyboard ? (target ? Number(target.dataset.index) : active)
      : lastPointer === 'mouse' ? indexAt(e.clientX)
      : touched;
    if (i < 0) return;

    // touch: the first tap selects and previews, a second tap on the same book opens it
    if (!keyboard && lastPointer !== 'mouse' && (i !== active || !touchBrowsing)) {
      touchBrowsing = true;
      select(i, { scroll: true, announce: true });
      setBrowsing();
      return;
    }
    select(i);
    openProject(projects[i], books[i]);
  });

  shelf.addEventListener('keydown', (e) => {
    const keys = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -1, ArrowDown: 1 };
    if (e.key in keys) {
      e.preventDefault();
      step(keys[e.key], { focus: true });
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      select(e.key === 'Home' ? 0 : projects.length - 1, { scroll: true, focus: true, announce: true });
    }
  });

  // repeated fast clicks each move exactly one book: state is updated
  // synchronously and CSS transitions simply retarget from where they are
  prevBtn?.addEventListener('click', () => step(-1));
  nextBtn?.addEventListener('click', () => step(1));

  // tapping away from the shelf closes the open cover on touch screens
  document.addEventListener('click', (e) => {
    if (!touchBrowsing || e.target.closest('.shelf, .shelf-nav, .preview')) return;
    touchBrowsing = false;
    setBrowsing();
  });

  window.addEventListener('resize', () => {
    if (active >= 0) pickCoverSide(books[active]);
  });

  /* ----- preview panel: always mirrors the selected book ----- */
  function renderPreview(p) {
    const v = p.visuals?.[0];
    const more = (p.visuals?.length || 0) - 1;
    const meta = [p.year, p.team].filter(Boolean).join(' · ');
    preview.classList.toggle('has-visual', !!v);
    preview.innerHTML = `
      <div class="pv-main">
        <p class="pv-type">${esc(p.type)}</p>
        <h3 class="pv-title">${esc(p.title)}</h3>
        <p class="pv-sub">${esc(p.subtitle)}</p>
        ${p.badge ? `<p class="pv-badge">${esc(p.badge)}</p>` : ''}
        <p class="pv-result"><b class="label">Result</b>${esc(p.result)}</p>
        ${meta ? `<p class="pv-meta">${esc(meta)}</p>` : ''}
        ${tags(p.stack, 'pv-stack')}
        <div class="pv-actions">
          <button class="btn btn-primary btn-small" type="button" data-open="${esc(p.slug)}" aria-haspopup="dialog">
            Open project <span class="btn-arrow" aria-hidden="true">→</span>
          </button>
          <a class="btn btn-outline btn-small" href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
      ${v ? `
      <figure class="pv-figure">
        <button class="plate" type="button" data-open="${esc(p.slug)}" aria-haspopup="dialog"
                aria-label="Open ${esc(p.title)}">
          <img src="${esc(v.src)}" alt="${esc(v.alt)}" width="1440" height="810" decoding="async" />
        </button>
        <figcaption>${esc(v.caption)}${more > 0 ? ` <span class="pv-more">+${more} more in the project</span>` : ''}</figcaption>
      </figure>` : ''}`;

    // restart the swap animation even when selection changes rapidly
    preview.classList.remove('swap');
    void preview.offsetWidth;
    preview.classList.add('swap');
  }

  preview.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open]');
    if (!trigger) return;
    const i = slugIndex(trigger.dataset.open);
    if (i >= 0) openProject(projects[i], books[i], trigger);
  });

  /* warm the image cache once the page is idle so previews never flash empty */
  const warm = () => projects.forEach((p) => { if (p.visuals) new Image().src = p.visuals[0].src; });
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 3000 });
  else setTimeout(warm, 1500);

  /* ----- readable index: every project as plain horizontal text ----- */
  const index = document.getElementById('projIndex');
  if (index) {
    // featured first, then most recent by the date the work ended
    const ordered = [...projects].sort((a, b) =>
      Number(b.featured) - Number(a.featured) ||
      String(b.ended).localeCompare(String(a.ended))
    );
    index.innerHTML = ordered.map((p) => `
      <li>
        <button type="button" class="row-link" data-open="${esc(p.slug)}" aria-haspopup="dialog">
          <span class="pi-name">${esc(p.title)}${
            p.featured ? '<span class="pi-star">Featured</span>' : ''
          }</span>
          <span class="pi-meta">${esc(p.type.split(' · ')[0])} · ${esc(p.year)}</span>
        </button>
      </li>`).join('');

    index.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open]');
      if (!trigger) return;
      const i = slugIndex(trigger.dataset.open);
      if (i < 0) return;
      select(i, { scroll: true });
      openProject(projects[i], books[i], trigger);
    });
  }

  /* ----- "All projects" disclosure: closed until asked for ----- */
  const archiveToggle = document.getElementById('archiveToggle');
  const archivePanel = document.getElementById('archivePanel');
  if (archiveToggle && archivePanel) {
    const closedLabel = `All projects as a list <span class="archive-count">${projects.length}</span>`;
    archiveToggle.innerHTML = closedLabel;
    archiveToggle.addEventListener('click', () => {
      const open = archiveToggle.getAttribute('aria-expanded') === 'true';
      archiveToggle.setAttribute('aria-expanded', String(!open));
      archiveToggle.innerHTML = open ? closedLabel : 'Hide the list';
      archivePanel.classList.toggle('is-open', !open);
      // keep collapsed rows out of the tab order and the a11y tree
      archivePanel.inert = open;
    });
  }

  select(Math.max(0, slugIndex(defaultProjectSlug)));

  /* one gentle demonstration: the selected book's cover swings open the
     first time the shelf comes into view, then settles back */
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      setTimeout(() => {
        shelf.classList.add('is-browsing');
        pickCoverSide(books[active]);
        setTimeout(setBrowsing, 1400);
      }, 500);
    }, { threshold: 0.6 });
    io.observe(shelf);
  }

  /* ----- detail dialog ----- */
  let lastFocused = null;
  let openProjectData = null;
  let closeTimer = null;
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

  function openProject(p, bookEl, returnTo) {
    clearTimeout(closeTimer);
    lastFocused = returnTo || bookEl || document.activeElement;
    openProjectData = p;

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
      `<a class="btn btn-primary btn-small" href="${esc(p.github)}" target="_blank" rel="noopener noreferrer">View on GitHub</a>`
    ];
    (p.links || []).forEach((l) => {
      links.push(`<a class="btn btn-outline btn-small" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`);
    });
    pmLinks.innerHTML = links.join('');

    const vs = p.visuals || [];
    pmBody.innerHTML = `
      ${vs.length ? `
      <div class="pm-gallery">
        <figure class="pm-figure">
          <a class="pm-full" href="${esc(vs[0].src)}" target="_blank" rel="noopener" aria-label="Open this figure full size">
            <img src="${esc(vs[0].src)}" alt="${esc(vs[0].alt)}" width="1440" height="810" decoding="async" />
          </a>
          <figcaption><span class="pm-cap">${esc(vs[0].caption)}</span>${vs.length > 1 ? ` <span class="pm-count">1 / ${vs.length}</span>` : ''}</figcaption>
        </figure>
        ${vs.length > 1 ? `
        <div class="pm-thumbs" role="group" aria-label="Project figures">
          ${vs.map((f, k) => `
          <button class="pm-thumb" type="button" data-fig="${k}" aria-label="Show figure ${k + 1}: ${esc(f.caption)}"${k === 0 ? ' aria-current="true"' : ''}>
            <img src="${esc(f.src)}" alt="" width="1440" height="810" loading="lazy" decoding="async" />
          </button>`).join('')}
        </div>` : ''}
      </div>` : ''}
      <div class="pm-block">
        <h4 class="label">The problem</h4>
        <p>${esc(p.problem)}</p>
      </div>
      <div class="pm-block">
        <h4 class="label">${p.myRole ? 'What the team built' : 'What I built'}</h4>
        <p>${esc(p.built)}</p>
      </div>
      ${p.myRole ? `
      <div class="pm-block pm-block--role">
        <h4 class="label">My role</h4>
        <p>${esc(p.myRole)}</p>
      </div>` : ''}
      <div class="pm-block pm-block--result">
        <h4 class="label">Result</h4>
        <p>${esc(p.result)}</p>
      </div>
      <div class="pm-block">
        <h4 class="label">Technology</h4>
        ${tags(p.stack)}
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
    modal.querySelector('.pm-grid').scrollTop = 0;
    modal.querySelector('.pm-close').focus();

    // shareable deep link without adding a history entry
    history.replaceState(null, '', `#${p.slug}`);
  }

  function closeProject() {
    if (modal.hidden || modal.classList.contains('closing')) return;
    modal.classList.add('closing');
    closeTimer = setTimeout(() => {
      modal.hidden = true;
      modal.classList.remove('closing');
      setPageInert(false);
      document.body.style.overflow = '';
      history.replaceState(null, '', '#projects');
      if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll: true });
    }, reduceMotion.matches ? 0 : 220);
  }

  /* dialog gallery: thumbnails swap the main figure in place */
  pmBody.addEventListener('click', (e) => {
    const thumb = e.target.closest('[data-fig]');
    if (!thumb) return;
    const p = openProjectData;
    const f = p?.visuals?.[Number(thumb.dataset.fig)];
    if (!f) return;
    const fig = pmBody.querySelector('.pm-figure');
    const img = fig.querySelector('img');
    img.src = f.src;
    img.alt = f.alt;
    fig.querySelector('.pm-full').href = f.src;
    fig.querySelector('.pm-cap').textContent = f.caption;
    fig.querySelector('.pm-count').textContent = `${Number(thumb.dataset.fig) + 1} / ${p.visuals.length}`;
    pmBody.querySelectorAll('[data-fig]').forEach((b) => {
      if (b === thumb) b.setAttribute('aria-current', 'true');
      else b.removeAttribute('aria-current');
    });
  });

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

  /* ----- deep links (#slug, including old projects.html#slug links) ----- */
  const fromHash = () => {
    const i = slugIndex(decodeURIComponent(location.hash.slice(1)));
    if (i < 0) return;
    document.getElementById('projects')?.scrollIntoView({ behavior: 'instant' });
    select(i, { scroll: true });
    openProject(projects[i], books[i]);
  };
  if (location.hash) fromHash();
  window.addEventListener('hashchange', fromHash);
})();

/* ---------- 4. Custom cursor ---------- */
(function customCursor() {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  // touch devices and reduced-motion users keep the system cursor
  if (!fine.matches || reduceMotion.matches) return;

  const dot = document.createElement('div');
  const halo = document.createElement('div');
  dot.className = 'cursor-dot';
  halo.className = 'cursor-halo';
  dot.setAttribute('aria-hidden', 'true');
  halo.setAttribute('aria-hidden', 'true');
  document.body.append(halo, dot);
  document.documentElement.classList.add('has-cursor');

  // anything clickable; the whole shelf counts because every slot opens a book
  const HOT = 'a[href], button:not(:disabled), [role="button"], input, textarea, select, summary, .shelf, .card';

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
