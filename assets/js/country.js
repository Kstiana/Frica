/**
 * ================================================================
 * FRICA — COUNTRY.JS
 * assets/js/country.js
 * Version: 1.0
 *
 * Shared JavaScript for ALL country pages.
 * Works with any country — nigeria.html, ghana.html, and all
 * future country pages. The country data (NG, GH, etc.) is
 * defined inline in each HTML file; this module reads and
 * renders it uniformly.
 *
 * Table of Contents:
 * 01. Country Page Config
 * 02. Country Data Resolver
 * 03. Section Observer (Sticky Nav)
 * 04. Ethnic Group Tabs
 * 05. Music Toggle (Stars ↔ Legends)
 * 06. Modal System (Food · Festival · Travel · Tradition)
 * 07. Timeline Reveal
 * 08. Proverb Actions (Copy / Share)
 * 09. State / Region Card Interactions
 * 10. Related Countries
 * 11. Bookmark Integration
 * 12. Page Share
 * 13. Reading Progress Bar
 * 14. Keyboard Navigation (Modal + Section)
 * 15. Init & Boot
 * ================================================================
 */

'use strict';

/* ================================================================
   01. COUNTRY PAGE CONFIG
================================================================ */

const CountryPage = {
  /** The country data object — resolved from window scope */
  data:       null,
  /** Country slug derived from the URL */
  slug:       '',
  /** Country accent color (from CSS var on the page) */
  accentColor: '',
  /** Whether all sections have been rendered */
  rendered:   false,

  /** Section IDs in order */
  SECTION_IDS: [
    'overview',
    'ethnic-groups',
    'languages',
    'food',
    'dressing',
    'adinkra',     // Ghana-specific (skipped if not present)
    'marriage',
    'beliefs',
    'festivals',
    'music',
    'history',
    'states',
    'regions',     // Ghana uses 'regions', Nigeria uses 'states'
    'proverbs',
    'travel',
  ],
};


/* ================================================================
   02. COUNTRY DATA RESOLVER
   Reads the country data object from the global scope.
   Each country page defines: const NG = {...} or const GH = {...}
================================================================ */

const CountryDataResolver = {
  /**
   * Resolve the country data object from the page's global scope
   * Tries NG, GH, KE, ZA, EG, ET, TZ, MA, SN, and generic DATA
   * @returns {Object|null}
   */
  resolve() {
    const candidates = [
      'NG', 'GH', 'KE', 'ZA', 'EG', 'ET', 'TZ', 'MA', 'SN',
      'UG', 'RW', 'ML', 'DZ', 'SD', 'BW', 'NA', 'TN', 'MZ',
      'ZM', 'ZW', 'CM', 'BJ', 'MG', 'SS', 'CV', 'SC', 'MU',
      'SZ', 'LS', 'TG', 'BF', 'NE', 'GN', 'SL', 'LR', 'GM',
      'GW', 'MR', 'CD', 'CG', 'TD', 'CF', 'GA', 'GQ', 'ST',
      'BI', 'DJ', 'KM', 'SO', 'ER', 'LY', 'COUNTRY_DATA', 'DATA',
    ];

    for (const key of candidates) {
      if (window[key] && typeof window[key] === 'object') {
        return window[key];
      }
    }

    return null;
  },

  /**
   * Derive the country slug from the current URL
   * @returns {string}
   */
  getSlug() {
    const match = window.location.pathname.match(
      /pages\/country\/([^/]+?)(?:\.html)?$/
    );
    return match ? match[1] : '';
  },

  /**
   * Get the country name from the page title or h1
   * @returns {string}
   */
  getName() {
    const h1 = document.querySelector('.country-name');
    if (h1) return h1.textContent.trim();
    const title = document.title.split('—')[0].trim();
    return title;
  },
};


/* ================================================================
   03. SECTION OBSERVER (STICKY NAV)
   Highlights the active section nav button and sidebar jump link
   as the user scrolls through the country page.
================================================================ */

const SectionObserver = {
  observer:  null,
  navEl:     null,
  buttons:   null,
  isInit:    false,

  init() {
    this.navEl   = document.getElementById('sectionNav');
    if (!this.navEl) return;

    this.buttons = this.navEl.querySelectorAll('.sec-btn');
    if (!this.buttons.length) return;

    // Click to scroll
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id     = btn.dataset.sec;
        const target = document.getElementById(`sec-${id}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Intersection observer
    const navH    = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68'
    );
    const tabH    = 54; // section nav height

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const rawId = entry.target.id;             // e.g. "sec-food"
            const id    = rawId.replace(/^sec-/, ''); // e.g. "food"
            this.setActive(id);
          }
        });
      },
      {
        threshold:  0.12,
        rootMargin: `-${navH + tabH}px 0px -55% 0px`,
      }
    );

    // Observe all country-section elements
    document.querySelectorAll('.country-section').forEach(sec => {
      this.observer.observe(sec);
    });

    this.isInit = true;
  },

  /**
   * Set active section in nav + sidebar
   * @param {string} id - Section ID (without "sec-" prefix)
   */
  setActive(id) {
    // Section nav buttons
    this.buttons?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === id);
    });

    // Sidebar jump links
    document.querySelectorAll('.jump-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      link.classList.toggle('active-link', href === `#sec-${id}`);
    });

    // Scroll active button into view (horizontal)
    const activeBtn = this.navEl?.querySelector(`.sec-btn.active`);
    activeBtn?.scrollIntoView({ block: 'nearest', inline: 'center' });
  },

  destroy() {
    this.observer?.disconnect();
  },
};


/* ================================================================
   04. ETHNIC GROUP TABS
   Switches between ethnic group panels (Yoruba / Igbo / Hausa etc.)
================================================================ */

const EthnicTabs = {
  container:  null,
  tabs:       null,
  panels:     null,
  activeIdx:  0,

  init() {
    this.container = document.getElementById('ethnicTabs');
    if (!this.container) return;

    this.tabs   = this.container.querySelectorAll('.eth-tab');
    this.panels = document.querySelectorAll('.ethnic-panel');

    this.tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => this.switchTo(i));
    });

    // Keyboard navigation within tabs
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') this.switchTo(Math.min(this.activeIdx + 1, this.tabs.length - 1));
      if (e.key === 'ArrowLeft')  this.switchTo(Math.max(this.activeIdx - 1, 0));
    });
  },

  /**
   * Switch to a tab by index
   * @param {number} idx
   */
  switchTo(idx) {
    this.activeIdx = idx;

    this.tabs?.forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
      tab.setAttribute('aria-selected', i === idx);
    });

    this.panels?.forEach((panel, i) => {
      panel.classList.toggle('active', i === idx);
    });
  },
};


/* ================================================================
   05. MUSIC TOGGLE (STARS ↔ LEGENDS)
================================================================ */

const MusicToggle = {
  currentBtn:  null,
  legendsBtn:  null,
  grid:        null,
  mode:        'current',

  init() {
    this.currentBtn = document.getElementById('btn-cur') ||
                      document.getElementById('btn-current');
    this.legendsBtn = document.getElementById('btn-leg') ||
                      document.getElementById('btn-legends');
    this.grid       = document.getElementById('artistsGrid');

    if (!this.currentBtn || !this.legendsBtn) return;

    this.currentBtn.addEventListener('click', () => this.setMode('current'));
    this.legendsBtn.addEventListener('click', () => this.setMode('legends'));
  },

  /**
   * Set the music display mode
   * @param {'current'|'legends'} mode
   */
  setMode(mode) {
    this.mode = mode;

    const isCurrent = mode === 'current';
    this.currentBtn.classList.toggle('active', isCurrent);
    this.legendsBtn.classList.toggle('active', !isCurrent);

    // Trigger re-render — the page's own renderArtists function handles this
    if (typeof window.renderArtists === 'function') {
      window.renderArtists(mode);
    } else if (typeof window.renderArtistsGrid === 'function') {
      window.renderArtistsGrid(mode);
    }
  },
};


/* ================================================================
   06. MODAL SYSTEM (FOOD · FESTIVAL · TRAVEL · TRADITION)
   Country pages use a shared modal — this manager handles
   opening, closing, and building the content for each type.
================================================================ */

const CountryModal = {
  overlay:   null,
  bodyEl:    null,
  closeBtn:  null,
  isOpen:    false,
  history:   [], // Stack for back navigation

  init() {
    this.overlay  = document.getElementById('modalOverlay');
    this.bodyEl   = document.getElementById('modalBody');
    this.closeBtn = document.getElementById('modalClose');

    if (!this.overlay) return;

    // Close handlers
    this.closeBtn?.addEventListener('click',   () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  },

  /**
   * Open the modal with a given HTML body
   * @param {string} html
   */
  open(html) {
    if (!this.overlay || !this.bodyEl) return;
    this.bodyEl.innerHTML = html;
    this.overlay.classList.add('open');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';

    // Focus close button
    setTimeout(() => this.closeBtn?.focus(), 100);
  },

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('open');
    this.isOpen = false;
    document.body.style.overflow = '';
  },

  /* ── Content builders ──────────────────────────────────────── */

  /**
   * Build food modal content
   * @param {Object} food - Food item data
   * @param {string} accentColor - Country accent color
   * @returns {string} HTML
   */
  buildFood(food, accentColor = 'var(--gold)') {
    return `
      <div class="modal-tag" style="color:${accentColor}">
        Food &amp; Cuisine · ${food.origin || ''}
      </div>
      <div class="modal-title">${food.emoji || '🍛'} ${food.name}</div>
      <div class="modal-sub">${food.tag || ''}</div>
      <div class="modal-divider"></div>
      <div class="modal-sec-title" style="color:${accentColor}">About this dish</div>
      <p class="modal-text">${food.desc || ''}</p>
      ${food.served ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">Best served with</div>
        <p class="modal-text">${food.served}</p>
      ` : ''}
      ${food.fact ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">Did you know?</div>
        <p class="modal-text">${food.fact}</p>
      ` : ''}
    `;
  },

  /**
   * Build festival modal content
   * @param {Object} fest - Festival item data
   * @param {string} accentColor
   * @returns {string} HTML
   */
  buildFestival(fest, accentColor = 'var(--gold)') {
    const highlights = fest.highlights || [];
    return `
      <div class="modal-tag" style="color:${accentColor}">
        Festival · ${fest.group || ''}
      </div>
      <div class="modal-title">${fest.emoji || '🎊'} ${fest.name}</div>
      <div class="modal-sub">
        📅 ${fest.when || ''}
        ${fest.badge ? `&nbsp;·&nbsp; ${fest.badge}` : ''}
      </div>
      <div class="modal-divider"></div>
      <div class="modal-sec-title" style="color:${accentColor}">About this festival</div>
      <p class="modal-text">${fest.desc || ''}</p>
      ${highlights.length ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">Highlights</div>
        <div class="modal-list">
          ${highlights.map(h => `
            <div class="modal-list-item" style="--list-color:${accentColor}">${h}</div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  /**
   * Build travel/place modal content
   * @param {Object} place - Travel place data
   * @param {string} accentColor
   * @returns {string} HTML
   */
  buildTravel(place, accentColor = 'var(--gold)') {
    const tips = place.tips || [];
    return `
      <div class="modal-tag" style="color:${accentColor}">
        Travel &amp; Places · ${place.type || ''}
      </div>
      <div class="modal-title">${place.emoji || '📍'} ${place.name}</div>
      <div class="modal-sub">📍 ${place.region || ''}</div>
      <div class="modal-divider"></div>
      <div class="modal-sec-title" style="color:${accentColor}">About this place</div>
      <p class="modal-text">${place.desc || ''}</p>
      ${tips.length ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">Insider Tips</div>
        <div class="modal-list">
          ${tips.map(t => `
            <div class="modal-list-item">${t}</div>
          `).join('')}
        </div>
      ` : ''}
    `;
  },

  /**
   * Build marriage/tradition modal content
   * @param {Object} tradition - Tradition data
   * @param {string} accentColor
   * @returns {string} HTML
   */
  buildTradition(tradition, accentColor = 'var(--gold)') {
    const steps = tradition.steps || [];
    return `
      <div class="modal-tag" style="color:${accentColor}">
        ${tradition.type || 'Marriage Tradition'} · ${tradition.group || ''}
      </div>
      <div class="modal-title">${tradition.icon || '💍'} ${tradition.name}</div>
      <div class="modal-sub">Practiced by: ${tradition.group || ''}</div>
      <div class="modal-divider"></div>
      <div class="modal-sec-title" style="color:${accentColor}">About this tradition</div>
      <p class="modal-text">${tradition.desc || ''}</p>
      ${steps.length ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">
          How it works — step by step
        </div>
        <div class="modal-list">
          ${steps.map(s => `<div class="modal-list-item">${s}</div>`).join('')}
        </div>
      ` : ''}
    `;
  },

  /**
   * Build belief/deity modal content
   * @param {Object} belief - Belief data
   * @param {string} accentColor
   * @returns {string} HTML
   */
  buildBelief(belief, accentColor = 'var(--gold)') {
    const deities = belief.deities || [];
    return `
      <div class="modal-tag" style="color:${accentColor}">
        Beliefs &amp; Spirituality · ${belief.sub || ''}
      </div>
      <div class="modal-title">${belief.icon || '🌿'} ${belief.title}</div>
      <div class="modal-sub">${belief.origin || ''}</div>
      <div class="modal-divider"></div>
      <p class="modal-text">${belief.text || ''}</p>
      ${deities.length ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">Deities &amp; Concepts</div>
        <div style="display:flex;flex-direction:column;gap:.5rem">
          ${deities.map(d => `
            <div style="
              display:flex;align-items:flex-start;gap:.65rem;
              padding:.65rem .85rem;
              background:var(--bg-raise);
              border:1px solid var(--border-dim);
              border-radius:12px;
            ">
              <span style="font-size:1rem;flex-shrink:0;margin-top:.05rem">${d.emoji}</span>
              <div>
                <div style="font-weight:600;font-size:.85rem;color:var(--cream)">${d.name}</div>
                <div style="font-size:.74rem;color:var(--text-muted);margin-top:.1rem;line-height:1.5">${d.role}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ${belief.unesco ? `
          <div style="
            display:inline-flex;align-items:center;gap:.4rem;
            padding:.3rem .8rem;
            background:rgba(26,110,168,.12);
            border:1px solid rgba(26,110,168,.3);
            border-radius:999px;
            font-size:.72rem;font-weight:600;color:#5aaae0;
            margin-top:.75rem;
          ">🏛 UNESCO Intangible Cultural Heritage</div>
        ` : ''}
      ` : ''}
    `;
  },

  /**
   * Build proverb modal content
   * @param {Object} proverb - Proverb data
   * @param {string} accentColor
   * @returns {string} HTML
   */
  buildProverb(proverb, accentColor = 'var(--gold)') {
    return `
      <div class="modal-tag" style="color:${accentColor}">
        Proverb · ${proverb.lang || ''}
      </div>
      <div style="
        font-family:'Playfair Display',serif;
        font-style:italic;
        font-size:1.35rem;
        color:var(--cream);
        line-height:1.5;
        margin-bottom:1.25rem;
      ">${proverb.text}</div>
      <div class="modal-divider"></div>
      <div class="modal-sec-title" style="color:${accentColor}">Meaning</div>
      <p class="modal-text">${proverb.meaning || ''}</p>
      ${proverb.lesson ? `
        <div class="modal-divider"></div>
        <div class="modal-sec-title" style="color:${accentColor}">Lesson</div>
        <p class="modal-text">${proverb.lesson}</p>
      ` : ''}
      <div class="modal-divider"></div>
      <button
        onclick="ProverbActions.copyFromModal('${(proverb.text || '').replace(/'/g, "\\'")}')"
        style="
          display:inline-flex;align-items:center;gap:.4rem;
          padding:.6rem 1.25rem;
          border:1.5px solid var(--border-dim);
          border-radius:999px;
          background:transparent;
          color:var(--text-soft);
          font-size:.82rem;font-weight:600;
          font-family:'DM Sans',sans-serif;
          cursor:pointer;transition:.2s;
        "
        onmouseover="this.style.borderColor='var(--border)';this.style.color='var(--cream)'"
        onmouseout="this.style.borderColor='var(--border-dim)';this.style.color='var(--text-soft)'"
      >📋 Copy proverb</button>
    `;
  },
};


/* ================================================================
   07. TIMELINE REVEAL
   Animates timeline items as they enter the viewport
================================================================ */

const TimelineReveal = {
  observer: null,

  init() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    // Set initial state
    items.forEach((item, i) => {
      item.style.opacity   = '0';
      item.style.transform = 'translateX(-16px)';
      item.style.transition = `opacity .5s ease ${Math.min(i * 80, 400)}ms, transform .5s ease ${Math.min(i * 80, 400)}ms`;
    });

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateX(0)';
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold:  0.1,
        rootMargin: '-40px 0px',
      }
    );

    items.forEach(item => this.observer.observe(item));
  },
};


/* ================================================================
   08. PROVERB ACTIONS (COPY / SHARE)
================================================================ */

const ProverbActions = {
  /**
   * Copy proverb text — called from proverb card click
   * @param {string} text - Proverb text
   */
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopied();
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      this.showCopied();
    }
  },

  /**
   * Copy from within an open modal
   * @param {string} text
   */
  async copyFromModal(text) {
    await this.copy(text);
  },

  showCopied() {
    if (window.Toast) {
      Toast.show({
        message: 'Proverb copied to clipboard',
        emoji:   '📋',
        type:    'success',
      });
    }
  },

  /**
   * Initialize proverb cards — open modal on click
   */
  init() {
    // Click on proverb card opens detail modal
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.proverb-card');
      if (!card) return;

      // Don't trigger if clicking a button inside the card
      if (e.target.closest('button')) return;

      const idx = Array.from(
        document.querySelectorAll('.proverb-card')
      ).indexOf(card);

      // Get data from the country's proverbs array
      const data = CountryPage.data;
      if (!data?.proverbs?.[idx]) return;

      const proverb     = data.proverbs[idx];
      const accentColor = CountryPage.accentColor || 'var(--gold)';

      CountryModal.open(
        CountryModal.buildProverb(proverb, accentColor)
      );
    });
  },
};


/* ================================================================
   09. STATE / REGION CARD INTERACTIONS
================================================================ */

const RegionCards = {
  init() {
    // State chips — highlight on hover with region color
    document.querySelectorAll('.state-chip').forEach(chip => {
      const zoneCard    = chip.closest('.zone-card');
      const zoneColor   = zoneCard?.style.getPropertyValue('--zc') || 'var(--gold)';

      chip.addEventListener('mouseenter', () => {
        chip.style.borderColor = zoneColor.replace('var(--zc)', '') ||
          zoneColor;
      });

      chip.addEventListener('mouseleave', () => {
        chip.style.borderColor = '';
      });
    });

    // Region cards (Ghana-style)
    document.querySelectorAll('.region-card').forEach(card => {
      card.addEventListener('click', () => {
        // Future: open region detail modal
      });
    });
  },
};


/* ================================================================
   10. RELATED COUNTRIES
   Handles the related countries sidebar nav
================================================================ */

const RelatedCountries = {
  init() {
    const list = document.getElementById('relatedList');
    if (!list) return;

    // Clicking a related country navigates to its page
    list.querySelectorAll('.related-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const href = item.getAttribute('href');
        if (href) {
          // Already an <a> tag — default behavior is fine
          // But add a fade effect
          document.body.style.opacity    = '0';
          document.body.style.transition = 'opacity .25s ease';
          setTimeout(() => window.location.href = href, 250);
          e.preventDefault();
        }
      });
    });
  },
};


/* ================================================================
   11. BOOKMARK INTEGRATION
   Handles the country page bookmark button.
   Works with both the legacy #bookmarkBtn and data-bookmark pattern.
================================================================ */

const CountryBookmark = {
  slug:    '',
  name:    '',
  btn:     null,

  init() {
    this.slug = CountryDataResolver.getSlug();
    this.name = CountryDataResolver.getName();
    this.btn  = document.getElementById('bookmarkBtn');

    if (!this.btn || !this.slug) return;

    // Ensure the button has data attrs for bookmark.js to pick up
    this.btn.dataset.slug = this.slug;
    this.btn.dataset.name = this.name;

    // Set initial state
    this.syncState();

    // Click handler
    this.btn.addEventListener('click', () => {
      if (window.BookmarkButtons) {
        BookmarkButtons.handleToggle(this.slug, this.name, this.btn);
      } else {
        // Fallback if bookmark.js not loaded
        this.fallbackToggle();
      }
    });
  },

  syncState() {
    if (!this.btn || !this.slug) return;

    const saved = window.BookmarkStore
      ? BookmarkStore.has(this.slug)
      : (JSON.parse(localStorage.getItem('frica_bookmarks') || '[]')).includes(this.slug);

    this.btn.textContent = saved ? '📌 Saved!' : `📌 Save ${this.name}`;
    this.btn.classList.toggle('saved', saved);
    this.btn.setAttribute('aria-pressed', saved);
  },

  fallbackToggle() {
    if (!this.slug) return;
    let bm = JSON.parse(localStorage.getItem('frica_bookmarks') || '[]');
    const idx = bm.indexOf(this.slug);
    let added;

    if (idx === -1) { bm.push(this.slug); added = true; }
    else            { bm.splice(idx, 1);  added = false; }

    localStorage.setItem('frica_bookmarks', JSON.stringify(bm));

    this.btn.textContent = added ? '📌 Saved!' : `📌 Save ${this.name}`;
    this.btn.classList.toggle('saved', added);
  },
};


/* ================================================================
   12. PAGE SHARE
   Adds sharing functionality to country pages
================================================================ */

const PageShare = {
  init() {
    const shareBtn = document.getElementById('sharePageBtn');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => this.share());
  },

  async share() {
    const title = document.title;
    const url   = window.location.href;
    const text  = `Discover ${CountryDataResolver.getName()} on Frica — Africa's cultural encyclopedia 🌍`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        this.copyUrl(url);
      }
    } else {
      this.copyUrl(url);
    }
  },

  async copyUrl(url) {
    try {
      await navigator.clipboard.writeText(url);
      if (window.Toast) {
        Toast.show({
          message: 'Page link copied to clipboard',
          emoji:   '🔗',
          type:    'success',
        });
      }
    } catch { /* silently fail */ }
  },
};


/* ================================================================
   13. READING PROGRESS BAR
   Thin bar at the top of the page showing scroll progress
================================================================ */

const ReadingProgress = {
  bar:    null,

  init() {
    // Create the progress bar
    this.bar = document.createElement('div');
    this.bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2.5px;
      width: 0%;
      background: linear-gradient(90deg, var(--gold), var(--gold-light));
      z-index: 1001;
      transition: width .1s linear;
      pointer-events: none;
    `;
    document.body.appendChild(this.bar);

    // Update on scroll
    const update = () => {
      const scrollTop    = window.scrollY;
      const docHeight    = document.documentElement.scrollHeight;
      const winHeight    = window.innerHeight;
      const scrolled     = scrollTop / (docHeight - winHeight);
      this.bar.style.width = `${Math.min(scrolled * 100, 100)}%`;
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
  },
};


/* ================================================================
   14. KEYBOARD NAVIGATION (MODAL + SECTION)
================================================================ */

const CountryKeyboard = {
  init() {
    document.addEventListener('keydown', (e) => {

      // Close modal on Escape
      if (e.key === 'Escape' && CountryModal.isOpen) {
        CountryModal.close();
        return;
      }

      // Navigate sections with [ and ] or ← → when not typing
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        const btns = Array.from(
          document.querySelectorAll('#sectionNav .sec-btn')
        );
        const active = btns.findIndex(b => b.classList.contains('active'));

        if ((e.key === ']' || e.key === 'ArrowRight') && !CountryModal.isOpen) {
          const next = btns[active + 1];
          if (next) next.click();
        }

        if ((e.key === '[' || e.key === 'ArrowLeft') && !CountryModal.isOpen) {
          const prev = btns[active - 1];
          if (prev) prev.click();
        }
      }
    });
  },
};


/* ================================================================
   15. GLOBAL EVENT DELEGATION
   Handles clicks on food cards, festival cards, travel cards etc.
   These are rendered by each page's inline JS, but the modal
   opening logic is handled here for consistency.
================================================================ */

const CountryEvents = {
  init() {
    document.addEventListener('click', (e) => {
      const accentColor = CountryPage.accentColor || 'var(--gold)';

      /* ── Food card ── */
      const foodCard = e.target.closest('.food-card');
      if (foodCard) {
        // The page's inline openFoodModal() handles this — skip if already handled
        // Only intercept if data-food-idx exists (future pattern)
        const idx = foodCard.dataset.foodIdx;
        if (idx !== undefined && CountryPage.data?.foods?.[idx]) {
          e.preventDefault();
          CountryModal.open(
            CountryModal.buildFood(CountryPage.data.foods[idx], accentColor)
          );
        }
        return;
      }

      /* ── Festival card ── */
      const festCard = e.target.closest('.festival-card');
      if (festCard) {
        const idx = festCard.dataset.festIdx;
        if (idx !== undefined && CountryPage.data?.festivals?.[idx]) {
          e.preventDefault();
          CountryModal.open(
            CountryModal.buildFestival(CountryPage.data.festivals[idx], accentColor)
          );
        }
        return;
      }

      /* ── Travel card ── */
      const travelCard = e.target.closest('.travel-card');
      if (travelCard) {
        const idx = travelCard.dataset.travelIdx;
        if (idx !== undefined && CountryPage.data?.travel_places?.[idx]) {
          e.preventDefault();
          CountryModal.open(
            CountryModal.buildTravel(CountryPage.data.travel_places[idx], accentColor)
          );
        }
        return;
      }

      /* ── Marriage / tradition card ── */
      const tradCard = e.target.closest('.marriage-card, .tradition-card');
      if (tradCard) {
        const idx = tradCard.dataset.tradIdx;
        const arr = CountryPage.data?.marriage_traditions ||
                    CountryPage.data?.traditions || [];
        if (idx !== undefined && arr[idx]) {
          e.preventDefault();
          CountryModal.open(
            CountryModal.buildTradition(arr[idx], accentColor)
          );
        }
        return;
      }

      /* ── Belief card ── */
      const beliefCard = e.target.closest('.belief-card');
      if (beliefCard) {
        const idx = beliefCard.dataset.beliefIdx;
        if (idx !== undefined && CountryPage.data?.beliefs?.[idx]) {
          e.preventDefault();
          CountryModal.open(
            CountryModal.buildBelief(CountryPage.data.beliefs[idx], accentColor)
          );
        }
        return;
      }
    });
  },
};


/* ================================================================
   15. INIT & BOOT
================================================================ */

function initCountryPage() {
  /* ── Resolve country data ─────────────────────────────────── */
  CountryPage.data = CountryDataResolver.resolve();
  CountryPage.slug = CountryDataResolver.getSlug();

  /* ── Detect accent color from CSS ─────────────────────────── */
  const rootStyle = getComputedStyle(document.documentElement);
  CountryPage.accentColor =
    rootStyle.getPropertyValue('--ng-green').trim() ||   // Nigeria
    rootStyle.getPropertyValue('--gh-gold').trim()  ||   // Ghana
    rootStyle.getPropertyValue('--ke-red').trim()   ||   // Kenya (future)
    'var(--gold)';

  /* ── Initialize all modules ───────────────────────────────── */
  SectionObserver.init();
  EthnicTabs.init();
  MusicToggle.init();
  CountryModal.init();
  TimelineReveal.init();
  ProverbActions.init();
  RegionCards.init();
  RelatedCountries.init();
  CountryBookmark.init();
  PageShare.init();
  ReadingProgress.init();
  CountryKeyboard.init();
  CountryEvents.init();

  /* ── Mark page as initialized ─────────────────────────────── */
  document.body.setAttribute('data-country-js', 'ready');
  CountryPage.rendered = true;
}

/* Boot */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCountryPage);
} else {
  initCountryPage();
}

/* ── Expose globals ───────────────────────────────────────────── */
window.CountryPage       = CountryPage;
window.CountryModal      = CountryModal;
window.CountryBookmark   = CountryBookmark;
window.SectionObserver   = SectionObserver;
window.EthnicTabs        = EthnicTabs;
window.MusicToggle       = MusicToggle;
window.ProverbActions    = ProverbActions;
window.TimelineReveal    = TimelineReveal;
window.ReadingProgress   = ReadingProgress;
