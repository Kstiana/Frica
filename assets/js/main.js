/**
 * ================================================================
 * FRICA — MAIN.JS
 * assets/js/main.js
 * Version: 1.0
 *
 * Global JavaScript powering all Frica pages.
 *
 * Table of Contents:
 * 01. Configuration & Constants
 * 02. DOM Utilities
 * 03. Navigation (Scroll + Active State)
 * 04. Hamburger Menu
 * 05. Back to Top
 * 06. Scroll Reveal (IntersectionObserver)
 * 07. Counter Animation (Hero Stats)
 * 08. Global Search Modal
 * 09. Bookmark System (localStorage)
 * 10. Tab System (Shared)
 * 11. Chip Filter System (Shared)
 * 12. Modal System (Shared)
 * 13. Marquee (Pause on Hover)
 * 14. Section Nav Observer (Country Pages)
 * 15. Keyboard Shortcuts
 * 16. Page Transition Animation
 * 17. Tooltip System
 * 18. Clipboard Copy Utility
 * 19. Countries Data (for Search)
 * 20. Init & Boot
 * ================================================================
 */

'use strict';

/* ================================================================
   01. CONFIGURATION & CONSTANTS
================================================================ */

const FRICA = {
  version:   '1.0',
  name:      'Frica',
  maxWidth:  1400,
  navHeight: 68,

  /* localStorage keys */
  keys: {
    bookmarks:    'frica_bookmarks',
    streak:       'frica_streak',
    quizScore:    'frica_quiz_score',
    searchHistory:'frica_search_history',
    theme:        'frica_theme',
  },

  /* Animation durations (ms) */
  anim: {
    fast:   150,
    normal: 280,
    slow:   500,
    reveal: 600,
  },

  /* Breakpoints */
  bp: {
    mobile:  768,
    tablet:  1024,
    desktop: 1400,
  },
};


/* ================================================================
   02. DOM UTILITIES
================================================================ */

/**
 * Shorthand selector
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element|null}
 */
const $ = (selector, context = document) => context.querySelector(selector);

/**
 * Shorthand selector all
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {NodeList}
 */
const $$ = (selector, context = document) => context.querySelectorAll(selector);

/**
 * Add event listener with optional delegation
 * @param {Element|string} target - Element or selector string
 * @param {string} event - Event name
 * @param {Function} handler - Handler function
 * @param {string} [delegate] - Optional delegation selector
 */
function on(target, event, handler, delegate) {
  const el = typeof target === 'string' ? $(target) : target;
  if (!el) return;

  if (delegate) {
    el.addEventListener(event, (e) => {
      const delegated = e.target.closest(delegate);
      if (delegated && el.contains(delegated)) {
        handler.call(delegated, e, delegated);
      }
    });
  } else {
    el.addEventListener(event, handler);
  }
}

/**
 * Create element with attributes and children
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes object
 * @param {string|Element|Array} [children] - Children
 * @returns {Element}
 */
function createElement(tag, attrs = {}, children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, val]) => {
    if (key === 'class') el.className = val;
    else if (key === 'text') el.textContent = val;
    else if (key === 'html') el.innerHTML = val;
    else el.setAttribute(key, val);
  });
  if (children) {
    if (Array.isArray(children)) children.forEach(c => c && el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    else if (typeof children === 'string') el.innerHTML = children;
    else el.appendChild(children);
  }
  return el;
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function}
 */
function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in ms
 * @returns {Function}
 */
function throttle(fn, limit = 100) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

/**
 * Format large numbers
 * @param {number} n - Number to format
 * @returns {string}
 */
function formatNumber(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return n.toLocaleString();
}

/**
 * Generate a slug from a string
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Get current page name from URL
 * @returns {string}
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const file = path.split('/').pop().replace('.html', '');
  return file || 'index';
}

/**
 * Check if element is in viewport
 * @param {Element} el
 * @returns {boolean}
 */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}


/* ================================================================
   03. NAVIGATION (SCROLL + ACTIVE STATE)
================================================================ */

const Nav = {
  el:          null,
  scrolled:    false,
  threshold:   40,

  init() {
    this.el = $('#mainNav');
    if (!this.el) return;

    this.setActive();
    this.bindScroll();
  },

  /** Add/remove .scrolled class based on scroll position */
  bindScroll() {
    const handler = throttle(() => {
      const shouldBeScrolled = window.scrollY > this.threshold;
      if (shouldBeScrolled !== this.scrolled) {
        this.scrolled = shouldBeScrolled;
        this.el.classList.toggle('scrolled', this.scrolled);
      }
    }, 50);

    window.addEventListener('scroll', handler, { passive: true });

    // Run immediately in case page is loaded scrolled down
    handler();
  },

  /** Highlight the active nav link based on current page */
  setActive() {
    const page = getCurrentPage();
    const links = $$('.nav-links a', this.el);

    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop().replace('.html', '') || 'index';

      // Match exact page
      if (linkPage === page) {
        link.classList.add('active');
        return;
      }

      // Match country pages to "countries" nav item
      if (page.includes('pages/country') && linkPage === 'countries') {
        link.classList.add('active');
        return;
      }

      link.classList.remove('active');
    });
  },
};


/* ================================================================
   04. HAMBURGER MENU
================================================================ */

const MobileMenu = {
  hamburger: null,
  menu:      null,
  isOpen:    false,

  init() {
    this.hamburger = $('#hamburger');
    this.menu      = $('#mobileMenu');
    if (!this.hamburger || !this.menu) return;

    this.hamburger.addEventListener('click', () => this.toggle());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this.isOpen &&
          !this.menu.contains(e.target) &&
          !this.hamburger.contains(e.target)) {
        this.close();
      }
    });

    // Close on nav link click
    $$('a', this.menu).forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  },

  toggle() {
    this.isOpen ? this.close() : this.open();
  },

  open() {
    this.isOpen = true;
    this.hamburger.classList.add('open');
    this.menu.classList.add('open');
    this.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.isOpen = false;
    this.hamburger.classList.remove('open');
    this.menu.classList.remove('open');
    this.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  },
};


/* ================================================================
   05. BACK TO TOP
================================================================ */

const BackToTop = {
  el:        null,
  threshold: 400,

  init() {
    this.el = $('#backTop');
    if (!this.el) return;

    // Scroll listener
    const handler = throttle(() => {
      this.el.classList.toggle('show', window.scrollY > this.threshold);
    }, 100);

    window.addEventListener('scroll', handler, { passive: true });

    // Click handler
    this.el.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },
};


/* ================================================================
   06. SCROLL REVEAL (INTERSECTIONOBSERVER)
================================================================ */

const ScrollReveal = {
  observer: null,

  init() {
    const elements = $$('.reveal');
    if (!elements.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop observing once revealed
            this.observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold:  0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach(el => this.observer.observe(el));
  },

  /** Refresh observer for dynamically added elements */
  refresh() {
    $$('.reveal:not(.visible)').forEach(el => {
      this.observer?.observe(el);
    });
  },
};


/* ================================================================
   07. COUNTER ANIMATION (HERO STATS)
================================================================ */

const CounterAnimation = {
  observer: null,
  started:  false,

  init() {
    const counters = $$('[data-count]');
    if (!counters.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.started) {
          this.started = true;
          counters.forEach(el => {
            this.animate(el, parseInt(el.dataset.count, 10));
          });
          this.observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    // Observe the first counter (assume they're in the same area)
    this.observer.observe(counters[0]);
  },

  /**
   * Animate a counter from 0 to target
   * @param {Element} el - Target element
   * @param {number} target - Target number
   * @param {number} [duration=1800] - Animation duration in ms
   */
  animate(el, target, duration = 1800) {
    const start     = performance.now();
    const formatted = el.dataset.format || 'number'; // 'number' | 'comma'

    const update = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const ease    = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * target);

      // Format the number
      if (formatted === 'comma') {
        el.textContent = current.toLocaleString();
      } else {
        el.textContent = current >= 1000 ? current.toLocaleString() : current;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Final value
        el.textContent = target >= 1000 ? target.toLocaleString() : target;
      }
    };

    requestAnimationFrame(update);
  },
};


/* ================================================================
   08. GLOBAL SEARCH MODAL
================================================================ */

const SearchModal = {
  overlay:      null,
  backdrop:     null,
  box:          null,
  input:        null,
  results:      null,
  closeBtn:     null,
  isOpen:       false,
  query:        '',
  history:      [],
  historyLimit: 8,

  init() {
    this.overlay  = $('#searchModal');
    if (!this.overlay) return;

    this.backdrop = $('#searchBackdrop');
    this.input    = $('#modalSearchInput');
    this.results  = $('#searchResults');
    this.closeBtn = $('#searchClose');

    // Trigger buttons
    $$('[data-search-trigger], #navSearchBtn, #heroSearchBtn').forEach(btn => {
      btn?.addEventListener('click', () => this.open());
    });

    // Hero search input — open modal on Enter
    const heroInput = $('#heroSearch');
    heroInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') this.open();
    });

    // Hero search button
    $('#heroSearchBtn')?.addEventListener('click', () => {
      const q = heroInput?.value?.trim();
      this.open(q);
    });

    // Quick suggestion chips (hero page)
    $$('[onclick^="doSearch"]').forEach(el => {
      // Already handled inline, but also bind here for consistency
    });

    // Close handlers
    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    // Search input
    this.input?.addEventListener('input', debounce(() => {
      this.query = this.input.value.trim();
      this.renderResults(this.query);
    }, 150));

    // Load history
    this.history = JSON.parse(
      localStorage.getItem(FRICA.keys.searchHistory) || '[]'
    );
  },

  /**
   * Open the search modal
   * @param {string} [prefill] - Pre-fill the input with this value
   */
  open(prefill = '') {
    if (!this.overlay) return;

    this.isOpen = true;
    this.overlay.classList.add('open');

    setTimeout(() => {
      this.input?.focus();
      if (prefill) {
        this.input.value = prefill;
        this.query = prefill;
        this.renderResults(prefill);
      } else {
        this.renderEmpty();
      }
    }, 50);
  },

  close() {
    if (!this.overlay) return;
    this.isOpen = false;
    this.overlay.classList.remove('open');
    if (this.input) {
      this.input.value = '';
      this.query = '';
    }
  },

  renderEmpty() {
    if (!this.results) return;
    if (this.history.length) {
      this.results.innerHTML = `
        <div style="padding:.75rem 1rem; font-family:'DM Mono',monospace; font-size:.65rem; letter-spacing:.12em; text-transform:uppercase; color:var(--gold)">Recent Searches</div>
        ${this.history.map(q => `
          <div class="search-result-item" onclick="SearchModal.open('${q}')">
            <span style="font-size:1rem">🕐</span>
            <div>
              <div class="search-result-name">${q}</div>
              <div class="search-result-meta">Recent search</div>
            </div>
          </div>
        `).join('')}
      `;
    } else {
      this.results.innerHTML = `
        <div class="search-empty">Start typing to search across all of Africa...</div>
      `;
    }
  },

  /**
   * Render search results for a query
   * @param {string} q - Search query
   */
  renderResults(q) {
    if (!this.results) return;

    if (!q) {
      this.renderEmpty();
      return;
    }

    const lower   = q.toLowerCase();
    const matches = COUNTRIES_DATA.filter(c =>
      c.name.toLowerCase().includes(lower)     ||
      c.region.toLowerCase().includes(lower)   ||
      c.code.toLowerCase().includes(lower)     ||
      (c.known || []).some(k => k.toLowerCase().includes(lower))
    ).slice(0, 8);

    if (!matches.length) {
      this.results.innerHTML = `
        <div class="search-empty">
          No results for "<strong>${this.escapeHtml(q)}</strong>".
          <br/>Try a country name, region, or culture term.
        </div>
      `;
      return;
    }

    this.results.innerHTML = matches.map(c => `
      <a href="${this.getCountryUrl(c.slug)}" class="search-result-item">
        <span class="search-result-flag">${c.flag}</span>
        <div>
          <div class="search-result-name">${this.highlight(c.name, q)}</div>
          <div class="search-result-meta">${c.region} · ${c.code}</div>
        </div>
      </a>
    `).join('');
  },

  /** Get URL for a country page relative to current page */
  getCountryUrl(slug) {
    const page = getCurrentPage();
    // If we're already in pages/country/
    if (window.location.pathname.includes('/pages/country/')) {
      return `${slug}.html`;
    }
    return `pages/country/${slug}.html`;
  },

  /** Highlight matched text in a string */
  highlight(str, q) {
    if (!q) return str;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return str.replace(regex, '<mark style="background:rgba(200,149,42,.25);color:var(--gold-light);border-radius:2px">$1</mark>');
  },

  /** Save a query to search history */
  saveHistory(q) {
    if (!q || this.history.includes(q)) return;
    this.history.unshift(q);
    this.history = this.history.slice(0, this.historyLimit);
    localStorage.setItem(FRICA.keys.searchHistory, JSON.stringify(this.history));
  },

  /** Escape HTML for safe insertion */
  escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  },
};

/** Global helper so inline onclick can trigger search */
function doSearch(term) {
  SearchModal.open(term);
}


/* ================================================================
   09. BOOKMARK SYSTEM (LOCALSTORAGE)
================================================================ */

const Bookmarks = {
  data: [],

  init() {
    this.data = JSON.parse(
      localStorage.getItem(FRICA.keys.bookmarks) || '[]'
    );
    this.updateButtons();
  },

  /**
   * Toggle a bookmark
   * @param {string} slug - Country slug
   * @returns {boolean} - true if now bookmarked, false if removed
   */
  toggle(slug) {
    const idx = this.data.indexOf(slug);
    if (idx === -1) {
      this.data.push(slug);
    } else {
      this.data.splice(idx, 1);
    }
    this.save();
    this.updateButtons();
    return idx === -1;
  },

  /**
   * Check if a slug is bookmarked
   * @param {string} slug
   * @returns {boolean}
   */
  has(slug) {
    return this.data.includes(slug);
  },

  /**
   * Get all bookmarks
   * @returns {string[]}
   */
  getAll() {
    return [...this.data];
  },

  /** Save to localStorage */
  save() {
    localStorage.setItem(FRICA.keys.bookmarks, JSON.stringify(this.data));
  },

  /** Remove a specific bookmark */
  remove(slug) {
    this.data = this.data.filter(b => b !== slug);
    this.save();
    this.updateButtons();
  },

  /** Update all bookmark buttons on the page */
  updateButtons() {
    $$('[data-bookmark]').forEach(btn => {
      const slug    = btn.dataset.bookmark;
      const saved   = this.has(slug);
      btn.classList.toggle('saved', saved);
      btn.textContent = saved
        ? btn.dataset.savedText   || '📌 Saved!'
        : btn.dataset.defaultText || '📌 Save';
    });
  },

  /** Bind all bookmark buttons */
  bindButtons() {
    on(document, 'click', (e, btn) => {
      const slug = btn.dataset.bookmark;
      this.toggle(slug);
    }, '[data-bookmark]');
  },
};


/* ================================================================
   10. TAB SYSTEM (SHARED)
================================================================ */

const Tabs = {
  instances: new Map(),

  /**
   * Initialize a tab system
   * @param {string} navSelector - Tab button container selector
   * @param {string} panelSelector - Panel selector pattern (uses data-tab attr)
   * @param {Function} [onSwitch] - Callback on tab switch
   */
  init(navSelector, panelSelector, onSwitch) {
    const nav = $(navSelector);
    if (!nav) return;

    const buttons = $$('.tab-btn', nav);

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTo(btn.dataset.tab, navSelector, onSwitch);
      });
    });
  },

  /**
   * Switch to a specific tab
   * @param {string} tabId - Tab ID
   * @param {string} navSelector - Tab nav selector
   * @param {Function} [onSwitch] - Callback
   */
  switchTo(tabId, navSelector = '.tabs-inner', onSwitch) {
    // Update buttons
    $$('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabId);
    });

    // Update panels
    $$('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === `panel-${tabId}`);
    });

    // Callback
    onSwitch?.(tabId);

    // Scroll to tabs bar
    const tabsBar = $('.tabs-bar');
    if (tabsBar && !isInViewport(tabsBar)) {
      tabsBar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Update URL hash (without scrolling)
    history.replaceState(null, '', `#${tabId}`);
  },

  /** Initialize from URL hash */
  initFromHash(validTabs) {
    const hash = window.location.hash.replace('#', '');
    if (hash && validTabs.includes(hash)) {
      this.switchTo(hash);
    }
  },
};


/* ================================================================
   11. CHIP FILTER SYSTEM (SHARED)
================================================================ */

const Chips = {
  /**
   * Initialize a chip filter group
   * @param {string} containerId - Container element ID
   * @param {Function} callback - Called with the selected filter value
   */
  init(containerId, callback) {
    const container = $(`#${containerId}`);
    if (!container) return;

    container.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;

      $$('.chip', container).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      callback(chip.dataset.filter);
    });
  },
};


/* ================================================================
   12. MODAL SYSTEM (SHARED)
================================================================ */

const Modal = {
  overlay:  null,
  bodyEl:   null,
  closeBtn: null,
  isOpen:   false,

  init() {
    this.overlay  = $('#modalOverlay');
    this.bodyEl   = $('#modalBody');
    this.closeBtn = $('#modalClose');

    if (!this.overlay) return;

    // Close button
    this.closeBtn?.addEventListener('click', () => this.close());

    // Backdrop click
    this.overlay.addEventListener('click', e => {
      if (e.target === this.overlay) this.close();
    });
  },

  /**
   * Open modal with content
   * @param {string} html - HTML content for modal body
   */
  open(html) {
    if (!this.overlay) return;
    if (html && this.bodyEl) this.bodyEl.innerHTML = html;
    this.overlay.classList.add('open');
    this.isOpen = true;
    document.body.style.overflow = 'hidden';
  },

  /** Close modal */
  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('open');
    this.isOpen = false;
    document.body.style.overflow = '';
  },
};


/* ================================================================
   13. MARQUEE (PAUSE ON HOVER)
================================================================ */

const Marquee = {
  init() {
    const tracks = $$('.marquee-track');
    tracks.forEach(track => {
      track.addEventListener('mouseenter', () => {
        track.style.animationPlayState = 'paused';
      });
      track.addEventListener('mouseleave', () => {
        track.style.animationPlayState = 'running';
      });
    });
  },
};


/* ================================================================
   14. SECTION NAV OBSERVER (COUNTRY PAGES)
================================================================ */

const SectionNav = {
  observer: null,
  buttons:  null,
  sections: null,

  init() {
    const nav = $('#sectionNav');
    if (!nav) return;

    this.buttons  = $$('.sec-btn', nav);
    this.sections = $$('.country-section');

    if (!this.sections.length) return;

    // Click handlers
    this.buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = $(`#sec-${btn.dataset.sec}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Intersection observer for active state
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace('sec-', '');
            this.setActive(id);
          }
        });
      },
      {
        threshold:  0.15,
        rootMargin: `-${FRICA.navHeight}px 0px -60% 0px`,
      }
    );

    this.sections.forEach(sec => this.observer.observe(sec));
  },

  setActive(id) {
    this.buttons?.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === id);
    });

    // Also update jump links in sidebar
    $$('.jump-link').forEach(link => {
      link.classList.toggle('active-link', link.getAttribute('href') === `#sec-${id}`);
    });
  },
};


/* ================================================================
   15. KEYBOARD SHORTCUTS
================================================================ */

const Keyboard = {
  init() {
    document.addEventListener('keydown', (e) => {

      // Cmd/Ctrl + K — Open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        SearchModal.open();
        return;
      }

      // Escape — Close any open overlay
      if (e.key === 'Escape') {
        if (SearchModal.isOpen) {
          SearchModal.close();
          return;
        }
        if (Modal.isOpen) {
          Modal.close();
          return;
        }
        if (MobileMenu.isOpen) {
          MobileMenu.close();
          return;
        }
      }

      // / — Focus search (when not typing in an input)
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        SearchModal.open();
        return;
      }
    });
  },
};


/* ================================================================
   16. PAGE TRANSITION ANIMATION
================================================================ */

const PageTransition = {
  init() {
    // Fade in on load
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';

    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
      });
    });

    // Fade out on navigation (same origin only)
    on(document, 'click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      // Only same origin
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = href;
      }, FRICA.anim.normal);
    });
  },
};


/* ================================================================
   17. TOOLTIP SYSTEM
================================================================ */

const Tooltip = {
  el:      null,
  current: null,

  init() {
    this.el = createElement('div', {
      class: 'frica-tooltip',
      style: [
        'position:fixed',
        'z-index:9998',
        'background:var(--bg-raise)',
        'border:1px solid var(--border)',
        'color:var(--cream)',
        'font-size:.75rem',
        'padding:.4rem .8rem',
        'border-radius:var(--radius-sm)',
        'pointer-events:none',
        'opacity:0',
        'transition:opacity .2s ease',
        'max-width:240px',
        'line-height:1.5',
        'box-shadow:var(--shadow-sm)',
      ].join(';'),
    });
    document.body.appendChild(this.el);

    // Show on elements with data-tooltip
    on(document, 'mouseenter', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (!target) return;
      this.show(target.dataset.tooltip, e);
    }, '[data-tooltip]');

    on(document, 'mouseleave', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) this.hide();
    }, '[data-tooltip]');

    document.addEventListener('mousemove', (e) => {
      if (this.current) this.position(e);
    });
  },

  show(text, e) {
    this.current = text;
    this.el.textContent = text;
    this.el.style.opacity = '1';
    this.position(e);
  },

  hide() {
    this.current = null;
    this.el.style.opacity = '0';
  },

  position(e) {
    const x = e.clientX + 12;
    const y = e.clientY - 8;
    const rect = this.el.getBoundingClientRect();
    this.el.style.left = `${Math.min(x, window.innerWidth  - rect.width  - 8)}px`;
    this.el.style.top  = `${Math.min(y, window.innerHeight - rect.height - 8)}px`;
  },
};


/* ================================================================
   18. CLIPBOARD COPY UTILITY
================================================================ */

const Clipboard = {
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @param {Element} [trigger] - Trigger element (shows feedback)
   */
  async copy(text, trigger) {
    try {
      await navigator.clipboard.writeText(text);
      if (trigger) this.showFeedback(trigger);
      return true;
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
      if (trigger) this.showFeedback(trigger);
      return true;
    }
  },

  showFeedback(trigger) {
    const original = trigger.textContent;
    trigger.textContent = '✓ Copied!';
    trigger.style.color = 'var(--green-mid)';
    setTimeout(() => {
      trigger.textContent = original;
      trigger.style.color = '';
    }, 2000);
  },

  init() {
    on(document, 'click', (e, btn) => {
      const text = btn.dataset.copy;
      if (text) this.copy(text, btn);
    }, '[data-copy]');
  },
};


/* ================================================================
   19. COUNTRIES DATA (FOR SEARCH)
   Subset used for global search. Full data loaded per-page via JSON.
================================================================ */

const COUNTRIES_DATA = [
  { name:'Nigeria',              slug:'nigeria',                      flag:'🇳🇬', code:'NG', region:'West Africa',     known:['Afrobeats','Nollywood','Jollof Rice','Yoruba','Igbo','Hausa'] },
  { name:'Ghana',                slug:'ghana',                        flag:'🇬🇭', code:'GH', region:'West Africa',     known:['Kente cloth','Highlife','Ashanti','Akwaaba','Detty December'] },
  { name:'Kenya',                slug:'kenya',                        flag:'🇰🇪', code:'KE', region:'East Africa',     known:['Maasai','Great Migration','Nairobi','Safari','Swahili'] },
  { name:'South Africa',         slug:'south-africa',                 flag:'🇿🇦', code:'ZA', region:'Southern Africa', known:['Amapiano','Mandela','Ubuntu','Cape Town','Zulu'] },
  { name:'Egypt',                slug:'egypt',                        flag:'🇪🇬', code:'EG', region:'North Africa',    known:['Pyramids','Nile','Pharaohs','Cairo','Ancient civilization'] },
  { name:'Ethiopia',             slug:'ethiopia',                     flag:'🇪🇹', code:'ET', region:'East Africa',     known:['Coffee','Never colonized','Lalibela','Injera','Rastafari'] },
  { name:'Tanzania',             slug:'tanzania',                     flag:'🇹🇿', code:'TZ', region:'East Africa',     known:['Kilimanjaro','Serengeti','Zanzibar','Stone Town','Swahili'] },
  { name:'Morocco',              slug:'morocco',                      flag:'🇲🇦', code:'MA', region:'North Africa',    known:['Marrakech','Sahara','Berber','Tagine','Gnawa music'] },
  { name:'Senegal',              slug:'senegal',                      flag:'🇸🇳', code:'SN', region:'West Africa',     known:['Mbalax','Teranga','Gorée Island','Dakar','Thiéboudienne'] },
  { name:'Uganda',               slug:'uganda',                       flag:'🇺🇬', code:'UG', region:'East Africa',     known:['Pearl of Africa','Nile source','Gorillas','Buganda','Kampala'] },
  { name:'Cameroon',             slug:'cameroon',                     flag:'🇨🇲', code:'CM', region:'Central Africa',  known:['Africa in miniature','Makossa','Mount Cameroon','Yaoundé'] },
  { name:'Côte d\'Ivoire',       slug:'cote-divoire',                 flag:'🇨🇮', code:'CI', region:'West Africa',     known:['Cocoa','Coupé-Décalé','Abidjan','Dioula'] },
  { name:'Angola',               slug:'angola',                       flag:'🇦🇴', code:'AO', region:'Central Africa',  known:['Semba music','Luanda','Samba origin','Chokwe art'] },
  { name:'Mali',                 slug:'mali',                         flag:'🇲🇱', code:'ML', region:'West Africa',     known:['Timbuktu','Mansa Musa','Griot','Mali Empire','Djenné'] },
  { name:'Mozambique',           slug:'mozambique',                   flag:'🇲🇿', code:'MZ', region:'East Africa',     known:['Bazaruto','Makonde art','Marrabenta','Peri-peri'] },
  { name:'Madagascar',           slug:'madagascar',                   flag:'🇲🇬', code:'MG', region:'East Africa',     known:['Lemurs','Baobabs','Endemic wildlife','Famadihana'] },
  { name:'Zimbabwe',             slug:'zimbabwe',                     flag:'🇿🇼', code:'ZW', region:'Southern Africa', known:['Great Zimbabwe','Victoria Falls','Mbira','Shona'] },
  { name:'Zambia',               slug:'zambia',                       flag:'🇿🇲', code:'ZM', region:'Southern Africa', known:['Victoria Falls','Kuomboka','Zamrock','Bemba'] },
  { name:'Rwanda',               slug:'rwanda',                       flag:'🇷🇼', code:'RW', region:'East Africa',     known:['Mountain gorillas','Kigali','Imigongo art','Umuganda'] },
  { name:'Algeria',              slug:'algeria',                      flag:'🇩🇿', code:'DZ', region:'North Africa',    known:['Sahara Desert','Tassili rock art','Rai music','Berber'] },
  { name:'Sudan',                slug:'sudan',                        flag:'🇸🇩', code:'SD', region:'North Africa',    known:['Nubian pyramids','Meroe','Khartoum','Sufi dervishes'] },
  { name:'Tunisia',              slug:'tunisia',                      flag:'🇹🇳', code:'TN', region:'North Africa',    known:['Carthage','El Djem','Medina of Tunis','Harissa'] },
  { name:'Libya',                slug:'libya',                        flag:'🇱🇾', code:'LY', region:'North Africa',    known:['Leptis Magna','Ghadames','Sahara','Berber culture'] },
  { name:'Botswana',             slug:'botswana',                     flag:'🇧🇼', code:'BW', region:'Southern Africa', known:['Okavango Delta','Kalahari','San people','Diamonds'] },
  { name:'Namibia',              slug:'namibia',                      flag:'🇳🇦', code:'NA', region:'Southern Africa', known:['Namib Desert','Sossusvlei','Himba people','Skeleton Coast'] },
  { name:'Malawi',               slug:'malawi',                       flag:'🇲🇼', code:'MW', region:'East Africa',     known:['Lake Malawi','Warm Heart of Africa','Gule Wamkulu'] },
  { name:'Benin',                slug:'benin',                        flag:'🇧🇯', code:'BJ', region:'West Africa',     known:['Vodun','Dahomey Kingdom','Ouidah Slave Route'] },
  { name:'Togo',                 slug:'togo',                         flag:'🇹🇬', code:'TG', region:'West Africa',     known:['Voodoo market','Ewe culture','Koutammakou'] },
  { name:'Burkina Faso',         slug:'burkina-faso',                 flag:'🇧🇫', code:'BF', region:'West Africa',     known:['FESPACO film festival','Mossi people','Bogolan cloth'] },
  { name:'Niger',                slug:'niger',                        flag:'🇳🇪', code:'NE', region:'West Africa',     known:['Tuareg people','Aïr Mountains','Cure Salée'] },
  { name:'Guinea',               slug:'guinea',                       flag:'🇬🇳', code:'GN', region:'West Africa',     known:['Fouta Djallon','Kora music','Mandé heritage'] },
  { name:'Sierra Leone',         slug:'sierra-leone',                 flag:'🇸🇱', code:'SL', region:'West Africa',     known:['Freetown','Freed slaves','Bubu music'] },
  { name:'Liberia',              slug:'liberia',                      flag:'🇱🇷', code:'LR', region:'West Africa',     known:['Africa\'s oldest republic','Freed American slaves','Poro'] },
  { name:'Gambia',               slug:'gambia',                       flag:'🇬🇲', code:'GM', region:'West Africa',     known:['Africa\'s smallest mainland','Griot tradition','Kora'] },
  { name:'Guinea-Bissau',        slug:'guinea-bissau',                flag:'🇬🇼', code:'GW', region:'West Africa',     known:['Bijagós Archipelago','Gumbe music','Balanta people'] },
  { name:'Cabo Verde',           slug:'cabo-verde',                   flag:'🇨🇻', code:'CV', region:'West Africa',     known:['Morna music','Cesária Évora','Creole culture'] },
  { name:'Mauritania',           slug:'mauritania',                   flag:'🇲🇷', code:'MR', region:'West Africa',     known:['Chinguetti','Moorish culture','World\'s longest train'] },
  { name:'DRC',                  slug:'democratic-republic-of-the-congo', flag:'🇨🇩', code:'CD', region:'Central Africa', known:['Congo Rainforest','Soukous','Bonobos','Sapeurs'] },
  { name:'Republic of Congo',    slug:'republic-of-the-congo',        flag:'🇨🇬', code:'CG', region:'Central Africa',  known:['Brazzaville','Congo River','Rumba Congolaise'] },
  { name:'Chad',                 slug:'chad',                         flag:'🇹🇩', code:'TD', region:'Central Africa',  known:['Lake Chad','Tibesti Mountains','Kanem-Bornu Empire'] },
  { name:'Central African Republic', slug:'central-african-republic', flag:'🇨🇫', code:'CF', region:'Central Africa',  known:['Aka Pygmy music','Dzanga-Sangha forest'] },
  { name:'Gabon',                slug:'gabon',                        flag:'🇬🇦', code:'GA', region:'Central Africa',  known:['88% rainforest','Bwiti tradition','Forest elephants'] },
  { name:'Equatorial Guinea',    slug:'equatorial-guinea',            flag:'🇬🇶', code:'GQ', region:'Central Africa',  known:['Only Spanish-speaking African country','Fang people'] },
  { name:'Cameroon',             slug:'cameroon',                     flag:'🇨🇲', code:'CM', region:'Central Africa',  known:['Africa in miniature','Makossa music','Mount Cameroon'] },
  { name:'São Tomé and Príncipe',slug:'sao-tome-and-principe',        flag:'🇸🇹', code:'ST', region:'Central Africa',  known:['Chocolate','Cacao','Tchiloli theatre'] },
  { name:'Burundi',              slug:'burundi',                      flag:'🇧🇮', code:'BI', region:'East Africa',     known:['Royal Drummers','Lake Tanganyika','Inanga music'] },
  { name:'Djibouti',             slug:'djibouti',                     flag:'🇩🇯', code:'DJ', region:'East Africa',     known:['Lake Assal','Afar people','Whale sharks'] },
  { name:'Comoros',              slug:'comoros',                      flag:'🇰🇲', code:'KM', region:'East Africa',     known:['Perfume Islands','Ylang-ylang','Coelacanth'] },
  { name:'Seychelles',           slug:'seychelles',                   flag:'🇸🇨', code:'SC', region:'Southern Africa', known:['Coco de Mer','Giant tortoises','Vallée de Mai'] },
  { name:'Mauritius',            slug:'mauritius',                    flag:'🇲🇺', code:'MU', region:'Southern Africa', known:['Sega music','Dodo bird','Multicultural island'] },
  { name:'Eswatini',             slug:'eswatini',                     flag:'🇸🇿', code:'SZ', region:'Southern Africa', known:['Last absolute monarchy','Incwala ceremony','Reed Dance'] },
  { name:'Lesotho',              slug:'lesotho',                      flag:'🇱🇸', code:'LS', region:'Southern Africa', known:['Kingdom in the Sky','Basotho blanket','Sani Pass'] },
  { name:'Somalia',              slug:'somalia',                      flag:'🇸🇴', code:'SO', region:'East Africa',     known:['Longest African coastline','Land of Punt','Somali poetry'] },
  { name:'South Sudan',          slug:'south-sudan',                  flag:'🇸🇸', code:'SS', region:'East Africa',     known:['World\'s youngest country','Sudd wetlands','Dinka people'] },
  { name:'Eritrea',              slug:'eritrea',                      flag:'🇪🇷', code:'ER', region:'East Africa',     known:['Asmara architecture','Red Sea','Tigrinya culture'] },
];


/* ================================================================
   20. INIT & BOOT
================================================================ */

/**
 * Main initialization function
 * Called when DOM is ready
 */
function initFrica() {

  // ── Core systems ─────────────────────────────────────────────
  Nav.init();
  MobileMenu.init();
  BackToTop.init();
  Keyboard.init();
  Marquee.init();
  Clipboard.init();
  Bookmarks.init();
  Bookmarks.bindButtons();

  // ── Search ───────────────────────────────────────────────────
  SearchModal.init();

  // ── Modal ────────────────────────────────────────────────────
  Modal.init();

  // ── Animations ───────────────────────────────────────────────
  ScrollReveal.init();
  CounterAnimation.init();

  // ── Tooltip ──────────────────────────────────────────────────
  Tooltip.init();

  // ── Country pages ────────────────────────────────────────────
  SectionNav.init();

  // ── Tabs from URL hash ───────────────────────────────────────
  const tabPanels = $$('.tab-panel');
  if (tabPanels.length) {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const validTabs = Array.from($$('.tab-btn')).map(b => b.dataset.tab).filter(Boolean);
      if (validTabs.includes(hash)) {
        Tabs.switchTo(hash);
      }
    }
  }

  // ── Mark body as JS-ready ────────────────────────────────────
  document.body.setAttribute('data-js', 'ready');

  console.log(`%cFrica v${FRICA.version} — Explore Africa in one place 🌍`, [
    'color:#c8952a',
    'font-family:Georgia,serif',
    'font-size:14px',
    'font-weight:bold',
    'padding:4px 0',
  ].join(';'));
}

/* ── Boot ─────────────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFrica);
} else {
  initFrica();
}

/* ── Expose globals for inline use ───────────────────────────── */
window.FRICA         = FRICA;
window.Bookmarks     = Bookmarks;
window.Modal         = Modal;
window.Tabs          = Tabs;
window.Chips         = Chips;
window.SearchModal   = SearchModal;
window.doSearch      = doSearch;
window.ScrollReveal  = ScrollReveal;
