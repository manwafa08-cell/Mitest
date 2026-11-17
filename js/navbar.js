/**
 * MARKET INSIGHT - Centralized Navigation Component
 */
(function initMarketInsightNavbar() {
  const NAV_ITEMS = [
    { label: 'Dashboard', href: 'index.html', matches: ['index.html', ''] },
    { label: 'Market', href: 'market-overview.html', matches: ['market-overview.html'] },
    { label: 'Explorer', href: 'coin-explorer.html', matches: ['coin-explorer.html'] },
    { label: 'Calendar', href: 'calendar.html', matches: ['calendar.html'] },
    { label: 'Kalkulator', href: 'kalkulator.html', matches: ['kalkulator.html'] },
    { label: 'Journal', href: 'journal.html', matches: ['journal.html'] },
    { label: 'Insight', href: 'insight.html', matches: ['insight.html', 'artikel.html'] },
    { label: 'Tentang', href: 'tentang.html', matches: ['tentang.html'] }
  ];

  const currentPath = window.location.pathname.split('/').pop().toLowerCase();

  function isActive(item) {
    return item.matches.includes(currentPath);
  }

  function injectNavbarStyles() {
    if (document.getElementById('mi-navbar-styles')) return;

    const style = document.createElement('style');
    style.id = 'mi-navbar-styles';
    style.textContent = `
      .mi-navbar {
        position: sticky;
        top: 0;
        z-index: 9999;
        width: 100%;
        pointer-events: auto;
        background: rgba(8, 11, 18, 0.9);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      }
      .mi-nav-inner {
        max-width: 1280px;
        margin: 0 auto;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .mi-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        color: #ffffff;
        font-weight: 700;
        letter-spacing: 0.1em;
        font-size: 1.05rem;
        white-space: nowrap;
      }
      .mi-brand-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(0, 240, 255, 0.1);
        border: 1px solid rgba(0, 240, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #00F0FF;
        transition: all 0.25s ease;
      }
      .mi-brand:hover .mi-brand-icon {
        background: #00F0FF;
        color: #080B12;
      }
      .mi-nav-links {
        display: flex;
        align-items: center;
        gap: 4px;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .mi-nav-links a {
        text-decoration: none;
        color: #9ca3af;
        font-size: 0.85rem;
        font-weight: 600;
        padding: 7px 12px;
        border-radius: 10px;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .mi-nav-links a:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
      }
      .mi-nav-links a.active {
        color: #00F0FF;
        background: rgba(0, 240, 255, 0.1);
        border: 1px solid rgba(0, 240, 255, 0.2);
      }
      .mi-nav-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      #navAuthArea,
      #navAuthArea a,
      #navAuthArea button {
        position: relative;
        z-index: 10000;
        pointer-events: auto !important;
      }
      #navAuthArea {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .mi-fallback-login,
      #navAuthArea a[href="login.html"],
      #navAuthArea a[href="settings.html"] {
        color: #9ca3af;
        font-size: 0.875rem;
        font-weight: 600;
        text-decoration: none;
        transition: color 0.2s ease;
      }
      .mi-fallback-login:hover,
      #navAuthArea a[href="login.html"]:hover,
      #navAuthArea a[href="settings.html"]:hover {
        color: #00F0FF;
      }
      .mi-fallback-register,
      #navAuthArea a[href="register.html"] {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 9999px;
        background: #00F0FF;
        color: #080B12;
        text-decoration: none;
        transition: background 0.2s ease;
      }
      .mi-fallback-register:hover,
      #navAuthArea a[href="register.html"]:hover {
        background: #00d5e3;
      }
      #navAuthArea span {
        color: #d1d5db;
        font-size: 0.875rem;
        font-weight: 600;
      }
      #navLogoutBtn {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 8px 16px;
        border-radius: 9999px;
        border: 1px solid rgba(0, 240, 255, 0.3);
        background: transparent;
        color: #00F0FF;
        transition: all 0.2s ease;
        cursor: pointer;
      }
      #navLogoutBtn:hover {
        background: #00F0FF;
        color: #080B12;
      }
      .mi-mobile-toggle {
        display: none;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #ffffff;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        cursor: pointer;
        align-items: center;
        justify-content: center;
      }
      .mi-mobile-drawer {
        display: none;
        flex-direction: column;
        padding: 12px 24px 20px;
        background: #080B12;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        gap: 6px;
      }
      .mi-mobile-drawer.open {
        display: flex;
      }
      .mi-mobile-drawer a {
        text-decoration: none;
        color: #9ca3af;
        padding: 10px 14px;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .mi-mobile-drawer a.active {
        color: #00F0FF;
        background: rgba(0, 240, 255, 0.1);
      }
      @media (max-width: 1080px) {
        .mi-nav-links { display: none; }
        .mi-mobile-toggle { display: inline-flex; }
      }
      @media (max-width: 640px) {
        #navAuthArea span, #navLogoutBtn span { display: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderNavbar() {
    injectNavbarStyles();

    const target = document.getElementById('app-navbar');
    if (!target) return;

    const linksHTML = NAV_ITEMS.map(item => `
      <li>
        <a href="${item.href}" class="${isActive(item) ? 'active' : ''}">
          ${item.label}
        </a>
      </li>
    `).join('');

    const mobileLinksHTML = NAV_ITEMS.map(item => `
      <a href="${item.href}" class="${isActive(item) ? 'active' : ''}">
        ${item.label}
      </a>
    `).join('');

    target.innerHTML = `
      <header class="mi-navbar">
        <div class="mi-nav-inner">
          <a href="index.html" class="mi-brand">
            <div class="mi-brand-icon">
              <i class="fa-solid fa-chart-line text-sm"></i>
            </div>
            <span>MARKET INSIGHT</span>
          </a>

          <ul class="mi-nav-links">
            ${linksHTML}
          </ul>

          <div class="mi-nav-right">
            <div id="navAuthArea">
              <a href="login.html" class="mi-fallback-login">Masuk</a>
              <a href="register.html" class="mi-fallback-register">Daftar</a>
            </div>
            <button type="button" class="mi-mobile-toggle" id="miMobileToggle" aria-label="Menu">
              <i class="fa-solid fa-bars"></i>
            </button>
          </div>
        </div>

        <nav class="mi-mobile-drawer" id="miMobileDrawer">
          ${mobileLinksHTML}
        </nav>
      </header>
    `;

    const toggleBtn = document.getElementById('miMobileToggle');
    const drawer = document.getElementById('miMobileDrawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });
    }

    document.dispatchEvent(new CustomEvent('navbar:ready'));
  }

  // Render langsung jika #app-navbar sudah tersedia di DOM
  if (document.getElementById('app-navbar')) {
    renderNavbar();
  } else {
    document.addEventListener('DOMContentLoaded', renderNavbar);
  }
})();
