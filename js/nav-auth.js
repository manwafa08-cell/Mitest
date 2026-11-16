// ==========================================
// MARKET INSIGHT — NAV LOGIN STATE (Stage 07.6)
// Mengisi #navAuthArea dengan status login (Halo, nama + Logout)
// atau tombol Masuk/Daftar kalau belum login.
// Requires window.MarketInsightAuth from js/auth.js
// ==========================================

(async () => {
  const navAuthArea = document.getElementById("navAuthArea");

  if (!navAuthArea) return;

  if (!window.MarketInsightAuth) {
    console.error("MarketInsightAuth belum tersedia. Pastikan js/auth.js dimuat sebelum js/nav-auth.js.");
    return;
  }

  function renderGuest() {
    navAuthArea.innerHTML = "";

    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.className = "text-gray-400 hover:text-brand-cyan text-sm font-semibold transition-colors";
    loginLink.textContent = "Masuk";

    const registerLink = document.createElement("a");
    registerLink.href = "register.html";
    registerLink.className = "text-xs font-bold px-4 py-2 rounded-full bg-brand-cyan text-brand-bg hover:bg-brand-cyanHover transition-colors";
    registerLink.textContent = "Daftar";

    navAuthArea.append(loginLink, registerLink);
  }

  function renderUser(user) {
    navAuthArea.innerHTML = "";

    const displayName = user.user_metadata && user.user_metadata.display_name
      ? user.user_metadata.display_name
      : user.email;

    const greeting = document.createElement("span");
    greeting.className = "text-gray-300 text-sm font-semibold hidden sm:inline";
    greeting.textContent = "Halo, " + displayName;

    const logoutBtn = document.createElement("button");
    logoutBtn.type = "button";
    logoutBtn.id = "navLogoutBtn";
    logoutBtn.className = "text-xs font-bold px-4 py-2 rounded-full border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan hover:text-brand-bg transition-colors";
    logoutBtn.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i> <span class="hidden sm:inline">Logout</span>';

    navAuthArea.append(greeting, logoutBtn);

    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      logoutBtn.style.opacity = "0.6";

      try {
        await window.MarketInsightAuth.logout();
        // logout() sudah redirect ke login.html, tidak perlu apa-apa lagi.
      } catch (error) {
        console.error("Logout gagal:", error.message);
        logoutBtn.disabled = false;
        logoutBtn.style.opacity = "1";
      }
    });
  }

  try {
    const user = await window.MarketInsightAuth.getUser();

    if (user) {
      renderUser(user);
    } else {
      renderGuest();
    }
  } catch (error) {
    console.error("Cek status login gagal:", error.message);
    renderGuest();
  }
})();
