# MARKET INSIGHT

**Independent Trading Intelligence, Risk Management & Performance Analytics Platform.**

MARKET INSIGHT adalah aplikasi web berbasis *client-side modular architecture* yang dirancang untuk membantu trader aset kripto menyatukan seluruh alur kerja dalam satu ekosistem: mulai dari pemantauan kondisi pasar, kalkulasi ukuran posisi berbasis risiko, hingga pencatatan serta evaluasi statistik jurnal trading di cloud.

---

## Fitur Utama

* **Live Command Center (`index.html`)**: Ringkasan harga *real-time* BTC/USDT & ETH/USDT, indeks sentimen *Fear & Greed*, pratinjau artikel riset terbaru, serta sinkronisasi langsung statistik *Trading Journal* pengguna.
* **Market Overview (`market-overview.html`)**: Dashboard makro kripto meliputi kapitalisasi pasar global, dominasi BTC, indeks sentimen harian, dan dinamika pasar.
* **Coin Explorer (`coin-explorer.html`)**: Eksplorasi seluruh pasangan Spot USDT aktif dari Binance lengkap dengan pencarian instan, penyortiran volume/gainers/losers, grafik candlestick interaktif (*TradingView Lightweight Charts™*), serta *Watchlist* yang tersinkronisasi ke akun Supabase.
* **Position Size Calculator (`kalkulator.html`)**: Kalkulator ukuran posisi futures (Long/Short) berbasis toleransi risiko modal, jarak stop loss, leverage, estimasi margin terpakai, serta peringatan likuidasi dini.
* **Trading Journal (`journal.html`)**: Pencatatan histori transaksi terintegrasi dengan database PostgreSQL (Supabase) yang menghitung otomatis **Win Rate**, **Total PnL**, **Profit Factor**, **Average R-Multiple**, **Max Drawdown**, dan **Equity Curve**.
* **Economic Calendar (`calendar.html`) & Market Insight (`insight.html`)**: Jadwal rilis data makroekonomi berdampak tinggi serta publikasi artikel edukasi dan analisis teknikal.

---

## Alur Kerja Terintegrasi (Cross-Feature Workflow)

Platform ini menghubungkan antar-halaman menggunakan *URL Query Parameters* untuk meminimalkan input berulang:

1. **Coin Explorer $\rightarrow$ Kalkulator**: Klik tombol **"Hitung Posisi"** pada aset yang sedang dianalisis di `coin-explorer.html` untuk mengisi pair dan harga entry secara otomatis di `kalkulator.html`.
2. **Kalkulator $\rightarrow$ Trading Journal**: Klik tombol **"Catat ke Trading Journal"** pada hasil perhitungan untuk membuka form transaksi di `journal.html` dengan parameter *Asset, Side, Position Size, Entry Price,* dan *Stop Loss* yang sudah terisi.

---

## Arsitektur & Tech Stack

* **Frontend**: HTML5, CSS3, Tailwind CSS, Vanilla JavaScript (ES6+).
* **Visualisasi Grafik**: TradingView Lightweight Charts™ v5 & HTML5 Canvas API.
* **Backend & Autentikasi**: Supabase Auth & PostgreSQL Database.
* **Keamanan Data**: Kebijakan **Row Level Security (RLS)** pada tabel `trading_journal` dan `watchlist` sehingga setiap pengguna hanya dapat mengakses datanya sendiri.
* **Optimasi Jaringan**: Helper `js/api-cache.js` dengan strategi *sessionStorage TTL caching* dan *localStorage offline fallback* untuk mencegah *rate-limit* API publik (Binance Spot, CoinGecko, Alternative.me).

---

## Struktur Proyek

```text
├── index.html              # Beranda & Live Command Center
├── market-overview.html    # Ringkasan makro & sentimen pasar
├── coin-explorer.html      # Daftar aset USDT, watchlist & chart candlestick
├── kalkulator.html         # Position Size Calculator
├── journal.html            # Trading Journal & statistik performa
├── calendar.html           # Kalender rilis data ekonomi
├── insight.html            # Katalog artikel edukasi & analisis
├── artikel.html            # Pembaca artikel dinamis
├── tentang.html            # Profil pengembang, metodologi rumus & disclaimer
├── settings.html           # Pengaturan profil akun
├── login.html              # Halaman masuk akun
├── register.html           # Halaman pendaftaran akun
├── articles.json           # Sumber data artikel Market Insight
└── js/
    ├── navbar.js           # Komponen navigasi terpusat
    ├── nav-auth.js         # Sinkronisasi status login pada navbar
    ├── supabase.js         # Inisialisasi client Supabase
    ├── auth.js             # Logika autentikasi pengguna
    ├── journal.js          # Engine perhitungan & CRUD Trading Journal
    └── api-cache.js        # Helper TTL cache & multi-endpoint fallback
