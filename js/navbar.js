/**
 * MARKET INSIGHT - Centralized Navigation Component
 * Merender navbar konsisten di seluruh halaman & mendeteksi active state otomatis.
 */

(function initMarketInsightNavbar() {
  const NAV_ITEMS = [
    { label: 'Dashboard', href: 'index.html', matches: ['index.html', ''] },
    { label: 'Market Overview', href: 'market-overview.html', matches: ['market-overview.html'] },
    { label: 'Coin Explorer', href: 'coin-explorer.html', matches: ['coin-explorer.html'] },
    { label: 'Calendar', href: 'calendar.html', matches: ['calendar.html'] },
    { label: 'Kalkulator', href: 'kalkulator.html', matches: ['kalkulator.html'] },
    { label: 'Journal', href: 'journal.html', matches: ['journal.html'] },
    { label: 'Insight', href: 'insight.html', matches: ['insight.html', 'artikel.html'] },
    { label: 'Metodologi & About', href: 'tentang.html', matches: ['tentang.html'] }
  ];

  // Ambil nama file dari URL saat ini
  const currentPath = window.location.pathname.split('/').pop().toLowerCase();

  function isActive(item) {
    return item.matches.includes(currentPath);
  }

  // Inject CSS terisolasi agar tampilan seragam di desktop & mobile
  function injectNavbarStyles() {
    if (document.getElementById('mi-navbar-styles')) return;

    const style = document.createElement('style');
    style.id = 'mi-navbar-styles';
    style.textContent = `
      .mi-navbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: rgba(13, 17, 23, 0.92);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #f0f6fc;
      }
      .mi-nav-container {
        max-width: 1320px;
        margin: 0 auto;
        padding: 0 20px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .mi-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: #ffffff;
        font-weight: 700;
        font-size: 1.05rem;
        letter-spacing: 0.4px;
        white-space: nowrap;
      }
      .mi-brand-badge {
        background: linear-gradient(135deg, #2563eb, #0ea5e9);
        color: #fff;
        font-size: 0.72rem;
        padding: 3px 7px;
        border-radius: 6px;
        font-weight: 800;
      }
      .mi-nav-links {
        display: flex;
        align-items: center;
        gap: 4px;
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-x: auto;
      }
      .mi-nav-links a {
        text-decoration: none;
        color: #9ca3af;
        font-size: 0.875rem;
        font-weight: 500;
        padding: 8px 12px;
        border-radius: 8px;
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .mi-nav-links a:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.06);
      }
      .mi-nav-links a.active {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.12);
        font-weight: 600;
      }
      .mi-nav-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .mi-auth-btn {
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 600;
        padding: 7px 14px;
        border-radius: 8px;
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .mi-btn-login {
        color: #e5e7eb;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      .mi-btn-login:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .mi-btn-primary {
        background: #2563eb;
        color: #ffffff;
        border: 1px solid #2563eb;
      }
      .mi-btn-primary:hover {
        background: #1d4ed8;
      }
      .mi-mobile-toggle {
        display: none;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #f0f6fc;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1.1rem;
      }
      .mi-mobile-drawer {
        display: none;
        flex-direction: column;
        padding: 12px 20px 20px;
        background: #0d1117;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        gap: 6px;
      }
      .mi-mobile-drawer.open {
        display: flex;
      }
      .mi-mobile-drawer a {
        text-decoration: none;
        color: #9ca3af;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 0.92rem;
      }
      .mi-mobile-drawer a.active {
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.12);
        font-weight: 600;
      }
      @media (max-width: 1024px) {
        .mi-nav-links {
          display: none;
        }
        .mi-mobile-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
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
        <div class="mi-nav-container">
          <a href="index.html" class="mi-brand">
            <span class="mi-brand-badge">MI</span>
            <span>MARKET INSIGHT</span>
          </a>

          <ul class="mi-nav-links">
            ${linksHTML}
          </ul>

          <div class="mi-nav-right">
            <!-- Slot default sebelum js/nav-auth.js mengecek session Supabase -->
            <div id="nav-auth-slot" style="display:flex; align-items:center; gap:8px;">
              <a href="login.html" class="mi-auth-btn mi-btn-login">Login</a>
              <a href="register.html" class="mi-auth-btn mi-btn-primary">Daftar</a>
            </div>
            <button type="button" class="mi-mobile-toggle" id="mi-mobile-btn" aria-label="Buka Menu">
              ☰
            </button>
          </div>
        </div>

        <nav class="mi-mobile-drawer" id="mi-mobile-drawer">
          ${mobileLinksHTML}
        </nav>
      </header>
    `;

    // Toggle menu mobile
    const toggleBtn = document.getElementById('mi-mobile-btn');
    const drawer = document.getElementById('mi-mobile-drawer');
    if (toggleBtn && drawer) {
      toggleBtn.addEventListener('click', () => {
        drawer.classList.toggle('open');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderNavbar);
  } else {
    renderNavbar();
  }
})();
