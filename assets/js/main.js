/* ============================================================
   SKy Navia — Main JavaScript
   ============================================================ */

'use strict';

/* ── Component Loader ── */
async function loadComponent(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    el.innerHTML = html;
  } catch (e) {
    console.warn('Component load error:', e);
  }
}

/* ── Base path detection ── */
function getBasePath() {
  const path = window.location.pathname;
  // If we're in /test/ or subdirectory
  const match = path.match(/^(\/[^/]+\/)/);
  return match ? match[1] : '/';
}

/* ── Init ── */
async function init() {
  const base = getBasePath().replace(/\/$/, '');
  // Load header and footer
  await Promise.all([
    loadComponent('#header-placeholder', `${base}/components/header.html`),
    loadComponent('#footer-placeholder', `${base}/components/footer.html`),
  ]);

  // After components loaded
  initHeader();
  initLangModal();
  initMobileMenu();
  initActiveNav();
  initFooterYear();
  initScrollReveal();
  initSearchForms();
  initFormTabs();
  initMarquee();
}

/* ── Header scroll behavior ── */
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── Language Modal ── */
function initLangModal() {
  const btnLang = document.getElementById('btn-lang');
  const btnLangMobile = document.getElementById('btn-lang-mobile');
  const modal = document.getElementById('lang-modal');
  const overlay = document.getElementById('modal-overlay');
  const btnClose = document.getElementById('btn-lang-close');

  if (!modal) return;

  function openModal() {
    modal.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btnLang?.addEventListener('click', openModal);
  btnLangMobile?.addEventListener('click', openModal);
  btnClose?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ── Mobile Menu ── */
function initMobileMenu() {
  const btn = document.getElementById('btn-hamburger');
  const menu = document.getElementById('mobile-menu');

  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on link click
  menu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ── Active nav link ── */
function initActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.site-nav__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const page = link.dataset.page;
    if (page === 'home' && (path.endsWith('/') || path.endsWith('/index.html'))) {
      link.classList.add('active');
    } else if (page && page !== 'home' && path.includes(page)) {
      link.classList.add('active');
    }
  });
}

/* ── Footer year ── */
function initFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── Search form submit ── */
function initSearchForms() {
  document.querySelectorAll('.search-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = form.querySelector('input[name="q"]')?.value.trim();
      if (q) {
        const base = getBasePath().replace(/\/$/, '');
        window.location.href = `${base}/search.html?q=${encodeURIComponent(q)}`;
      }
    });
  });

  // Parse query on search page
  if (window.location.pathname.includes('search')) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      document.querySelectorAll('input[name="q"]').forEach(inp => {
        inp.value = q;
      });
      filterInventory(q);
    }
  }
}

/* ── Inventory filter ── */
function filterInventory(q) {
  const rows = document.querySelectorAll('.inventory-table tbody tr');
  const resultCount = document.getElementById('result-count');
  const lower = q.toLowerCase().replace(/[-\s]/g, '');
  let count = 0;

  rows.forEach(row => {
    const text = row.textContent.toLowerCase().replace(/[-\s]/g, '');
    if (!q || text.includes(lower)) {
      row.style.display = '';
      count++;
    } else {
      row.style.display = 'none';
    }
  });

  if (resultCount) {
    resultCount.textContent = q ? `「${q}」の検索結果：${count}件` : `全${count}件`;
  }
}

/* ── Search input live filter ── */
document.addEventListener('input', (e) => {
  if (e.target.matches('input[name="q"]') && window.location.pathname.includes('search')) {
    filterInventory(e.target.value.trim());
  }
});

/* ── Contact Form Tabs ── */
function initFormTabs() {
  const tabs = document.querySelectorAll('.form-tab');
  const panels = document.querySelectorAll('.form-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });

  // Handle ?tab= query param
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab');
  if (tabParam) {
    const tabEl = document.querySelector(`[data-tab="${tabParam}"]`);
    if (tabEl) tabEl.click();
  }
}

/* ── Marquee duplicate for seamless loop ── */
function initMarquee() {
  const track = document.querySelector('.trust-bar__track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
}

/* ── Contact form submit (demo) ── */
document.addEventListener('submit', (e) => {
  if (e.target.closest('.contact-form-wrap')) {
    e.preventDefault();
    const wrap = e.target.closest('.contact-form-wrap');
    const btn = wrap.querySelector('[type="submit"]');
    if (btn) {
      btn.textContent = '送信中...';
      btn.disabled = true;
    }
    setTimeout(() => {
      const thankyou = document.getElementById('form-thankyou');
      const form = e.target;
      if (thankyou) {
        form.style.display = 'none';
        thankyou.style.display = 'block';
      } else {
        wrap.innerHTML = `
          <div style="text-align:center;padding:40px">
            <div style="font-size:3rem;margin-bottom:16px">✓</div>
            <h3 style="font-size:1.25rem;margin-bottom:8px">送信完了</h3>
            <p style="color:var(--text-mid)">お問い合わせありがとうございました。<br>担当者より折り返しご連絡いたします。</p>
          </div>`;
      }
    }, 1200);
  }
});

/* ── Basket / Quote bar ── */
const quoteItems = JSON.parse(sessionStorage.getItem('quoteItems') || '[]');

function updateQuoteBar() {
  const bar = document.getElementById('quote-bar');
  const count = document.getElementById('quote-count');
  if (!bar) return;
  if (quoteItems.length > 0) {
    bar.style.display = 'flex';
    if (count) count.textContent = quoteItems.length;
  } else {
    bar.style.display = 'none';
  }
}

document.addEventListener('click', (e) => {
  if (e.target.closest('.btn-add-quote')) {
    const btn = e.target.closest('.btn-add-quote');
    const pn = btn.dataset.pn;
    if (pn && !quoteItems.includes(pn)) {
      quoteItems.push(pn);
      sessionStorage.setItem('quoteItems', JSON.stringify(quoteItems));
      updateQuoteBar();
      btn.textContent = '追加済み';
      btn.disabled = true;
    }
  }
  if (e.target.closest('#btn-quote-submit')) {
    const base = getBasePath().replace(/\/$/, '');
    const items = quoteItems.map(p => `sn_ctx[]=${encodeURIComponent(p)}`).join('&');
    window.location.href = `${base}/contact.html?tab=quote&${items}`;
  }
  if (e.target.closest('#btn-quote-clear')) {
    quoteItems.length = 0;
    sessionStorage.removeItem('quoteItems');
    updateQuoteBar();
  }
});

/* ── Start ── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
