// ==========================================
// MARKET INSIGHT — ACCOUNT SETTINGS (Stage 07.6)
// Load + update display_name/username in public.profiles,
// and keep auth user_metadata in sync so the navbar greeting
// (js/nav-auth.js) updates immediately.
// Requires window.miSupabase from js/supabase.js
// and window.MarketInsightAuth from js/auth.js
// ==========================================

(() => {
  const supabase = window.miSupabase;
  const $ = (id) => document.getElementById(id);

  const form = $("settingsForm");
  const emailInput = $("email");
  const displayNameInput = $("displayName");
  const usernameInput = $("username");
  const saveButton = $("saveButton");

  if (!form) return;

  function showMessage(message, type = "error") {
    const box = $("formMessage");
    if (!box) return;
    box.textContent = message;
    box.className = `message show ${type}`;
  }

  function setSaving(saving) {
    saveButton.disabled = saving;
    saveButton.textContent = saving ? "Menyimpan..." : "Simpan Perubahan";
  }

  let currentUser = null;

  async function loadProfile() {
    if (!supabase) {
      showMessage("Supabase belum terhubung. Periksa js/supabase.js.");
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      // Belum login — lempar ke halaman login.
      window.location.href = "login.html";
      return;
    }

    currentUser = userData.user;
    emailInput.value = currentUser.email || "";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", currentUser.id)
      .single();

    if (profileError) {
      showMessage("Gagal memuat profil: " + profileError.message);
      return;
    }

    displayNameInput.value = profile.display_name || "";
    usernameInput.value = profile.username || "";
    saveButton.disabled = false;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) return;

    const displayName = displayNameInput.value.trim();
    const username = usernameInput.value.trim().toLowerCase();

    if (!displayName || !username) {
      return showMessage("Nama tampilan dan username wajib diisi.");
    }

    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return showMessage("Username harus 3–24 karakter dan hanya berisi huruf kecil, angka, atau underscore.");
    }

    setSaving(true);

    try {
      // 1) Update tabel profiles (sumber utama data profil).
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username, display_name: displayName })
        .eq("id", currentUser.id);

      if (profileError) throw profileError;

      // 2) Sinkronkan ke auth user_metadata, supaya navbar (Halo, nama)
      //    langsung update tanpa perlu query ulang ke tabel profiles.
      const { error: authError } = await supabase.auth.updateUser({
        data: { username, display_name: displayName }
      });

      if (authError) throw authError;

      showMessage("Perubahan berhasil disimpan.", "success");

    } catch (error) {
      const message = error.message || "Gagal menyimpan perubahan.";

      if (/duplicate key|already exists|unique/i.test(message)) {
        showMessage("Username ini sudah dipakai orang lain. Coba username lain.");
      } else {
        showMessage(message);
      }

    } finally {
      setSaving(false);
    }
  });

  // Dynamic year
  const year = $("year");
  if (year) year.textContent = new Date().getFullYear();

  loadProfile();
})();
