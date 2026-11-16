// ==========================================
// MARKET INSIGHT — AUTHENTICATION
// Register, Login, Password Reset & Logout
// Requires window.miSupabase from js/supabase.js
// ==========================================

(() => {
  const supabase = window.miSupabase;
  const $ = (id) => document.getElementById(id);

  function showMessage(message, type = "error") {
    const box = $("formMessage");
    if (!box) return;
    box.textContent = message;
    box.className = `message show ${type}`;
  }

  function setLoading(button, loading, label) {
    if (!button) return;
    button.disabled = loading;
    button.innerHTML = loading
      ? '<i class="fa-solid fa-spinner fa-spin"></i> Please wait...'
      : label;
  }

  function getLoginUrl() {
    return new URL("login.html", window.location.href).href;
  }

  // Password visibility
  document.querySelectorAll("[data-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = $(button.dataset.toggle);
      if (!input) return;

      const show = input.type === "password";
      input.type = show ? "text" : "password";

      button.innerHTML = show
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
    });
  });

  // ==========================================
  // REGISTER
  // ==========================================

  const registerForm = $("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!supabase)
        return showMessage("Supabase belum terhubung. Periksa js/supabase.js.");

      const displayName = $("displayName").value.trim();
      const username = $("username").value.trim().toLowerCase();
      const email = $("email").value.trim().toLowerCase();
      const password = $("password").value;
      const confirmPassword = $("confirmPassword").value;
      const button = $("registerButton");

      if (!displayName || !username || !email || !password || !confirmPassword)
        return showMessage("Semua kolom wajib diisi.");

      if (!/^[a-z0-9_]{3,24}$/.test(username))
        return showMessage("Username harus 3–24 karakter dan hanya berisi huruf, angka, atau underscore.");

      if (password.length < 8)
        return showMessage("Password minimal 8 karakter.");

      if (password !== confirmPassword)
        return showMessage("Konfirmasi password tidak cocok.");

      setLoading(button, true);

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getLoginUrl(),
            data: {
              username,
              display_name: displayName
            }
          }
        });

        if (error) throw error;

        if (data.user && !data.session) {
          registerForm.reset();
          showMessage(
            "Pendaftaran berhasil. Buka email kamu dan klik tautan verifikasi sebelum login.",
            "success"
          );
        } else if (data.session) {
          showMessage(
            "Akun berhasil dibuat. Mengalihkan ke halaman utama...",
            "success"
          );

          window.setTimeout(() => {
            window.location.href = "index.html";
          }, 1200);
        } else {
          showMessage(
            "Pendaftaran berhasil diproses. Periksa email kamu.",
            "success"
          );
        }

      } catch (error) {
        const message = error.message || "Pendaftaran gagal.";

        if (/already registered|already exists/i.test(message)) {
          showMessage("Email ini sudah terdaftar. Silakan login.");
        } else if (/username/i.test(message)) {
          showMessage("Username tidak tersedia atau sudah digunakan.");
        } else {
          showMessage(message);
        }

      } finally {
        setLoading(
          button,
          false,
          'Create Account <i class="fa-solid fa-arrow-right"></i>'
        );
      }
    });
  }

  // ==========================================
  // LOGIN
  // ==========================================

  const loginForm = $("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!supabase)
        return showMessage("Supabase belum terhubung. Periksa js/supabase.js.");

      const email = $("email").value.trim().toLowerCase();
      const password = $("password").value;
      const button = $("loginButton");

      if (!email || !password)
        return showMessage("Email dan password wajib diisi.");

      setLoading(button, true);

      try {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password
          });

        if (error) throw error;

        if (!data.session)
          throw new Error("Login belum menghasilkan session. Coba lagi.");

        showMessage(
          "Login berhasil. Mengalihkan ke MARKET INSIGHT...",
          "success"
        );

        window.setTimeout(() => {
          window.location.href = "index.html";
        }, 900);

      } catch (error) {
        const message = error.message || "Login gagal.";

        if (/email not confirmed/i.test(message)) {
          showMessage(
            "Email kamu belum diverifikasi. Periksa inbox terlebih dahulu."
          );
        } else if (/invalid login credentials/i.test(message)) {
          showMessage("Email atau password salah.");
        } else {
          showMessage(message);
        }

      } finally {
        setLoading(
          button,
          false,
          'Sign In <i class="fa-solid fa-arrow-right"></i>'
        );
      }
    });
  }

  // ==========================================
  // FORGOT PASSWORD
  // ==========================================

  const forgot = $("forgotPassword");

  if (forgot) {
    forgot.addEventListener("click", async (event) => {
      event.preventDefault();

      if (!supabase)
        return showMessage("Supabase belum terhubung.");

      const email = $("email").value.trim().toLowerCase();

      if (!email)
        return showMessage("Masukkan email terlebih dahulu.");

      try {
        const { error } =
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: getLoginUrl()
          });

        if (error) throw error;

        showMessage(
          "Jika email terdaftar, tautan reset password akan dikirim ke inbox kamu.",
          "success"
        );

      } catch (error) {
        showMessage(error.message || "Gagal mengirim email reset password.");
      }
    });
  }

  // ==========================================
  // GLOBAL AUTH FUNCTIONS
  // ==========================================

  window.MarketInsightAuth = {

    async logout() {
      if (!supabase)
        throw new Error("Supabase belum terhubung.");

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      window.location.href = "login.html";
    },

    async getUser() {
      if (!supabase) return null;

      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;

      return data.user;
    }

  };

  // Dynamic year
  const year = $("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ==========================================
  // SESSION CHECK
  // ==========================================

  if (supabase) {
    supabase.auth.getSession().then(({ data, error }) => {

      if (error)
        console.error("Session check:", error.message);

      if (data?.session && loginForm) {

        showMessage(
          "Email terverifikasi dan sesi aktif. Mengalihkan...",
          "success"
        );

        window.setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      }

    });
  }

})();
