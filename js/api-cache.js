// ==================================================
// MARKET INSIGHT — API CACHE & RESILIENCE HELPER
// Stage 8.4 (sessionStorage TTL + localStorage Fallback)
// ==================================================

(function (global) {
    'use strict';

    const PREFIX = 'MI_CACHE_V1_';

    function readStorage(storage, key) {
        try {
            const raw = storage.getItem(PREFIX + key);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.ts !== 'number' || !('data' in parsed)) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    }

    function writeStorage(storage, key, payload) {
        try {
            storage.setItem(PREFIX + key, JSON.stringify(payload));
        } catch (_) {
            // Abaikan jika kuota penyimpanan penuh atau mode privat memblokir storage
        }
    }

    /**
     * Mengambil data dengan strategi:
     * 1. Cek sessionStorage jika umur data masih di bawah TTL (default 45 detik)
     * 2. Jika kedaluwarsa/kosong, jalankan fetcher() dan simpan ke sessionStorage & localStorage
     * 3. Jika jaringan/API gagal, gunakan data cadangan terakhir dari localStorage
     */
    async function fetchWithCache(key, fetcher, options) {
        const opts = Object.assign({
            ttl: 45000,
            forceRefresh: false,
            staleFallback: true
        }, options || {});

        const now = Date.now();

        if (!opts.forceRefresh) {
            const cached = readStorage(sessionStorage, key);
            if (cached && (now - cached.ts) < opts.ttl) {
                return {
                    data: cached.data,
                    source: 'cache',
                    ts: cached.ts
                };
            }
        }

        try {
            const freshData = await fetcher();
            const record = { ts: Date.now(), data: freshData };
            writeStorage(sessionStorage, key, record);
            writeStorage(localStorage, key, record);
            return {
                data: freshData,
                source: 'network',
                ts: record.ts
            };
        } catch (err) {
            if (opts.staleFallback) {
                const stale = readStorage(localStorage, key) || readStorage(sessionStorage, key);
                if (stale) {
                    return {
                        data: stale.data,
                        source: 'fallback',
                        ts: stale.ts
                    };
                }
            }
            throw err;
        }
    }

    /**
     * Helper fetch JSON dengan rotasi endpoint cadangan & timeout otomatis
     */
    async function fetchJsonMulti(bases, path, timeoutMs) {
        const limit = timeoutMs || 10000;
        let lastError = null;

        for (const base of bases) {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), limit);
            try {
                const res = await fetch(base + path, {
                    signal: controller.signal,
                    cache: 'no-store'
                });
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return await res.json();
            } catch (error) {
                lastError = error;
            } finally {
                clearTimeout(timer);
            }
        }
        throw lastError || new Error('Semua endpoint market tidak dapat diakses.');
    }

    global.miApiCache = {
        fetchWithCache,
        fetchJsonMulti
    };
})(window);
