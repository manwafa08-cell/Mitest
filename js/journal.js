// ==================================================
// MARKET INSIGHT — TRADING JOURNAL SUPABASE ENGINE
// Stage 7.7
// ==================================================

(async function () {
    'use strict';

    const supabase = window.miSupabase;
    const STORAGE_KEY = 'mi_journal_trades_v1';

    const $ = id => document.getElementById(id);

    if (!supabase) {
        alert('Supabase belum terhubung. Periksa konfigurasi.');
        return;
    }

    let user = null;
    let trades = [];
    let side = 'long';

    // ==============================================
    // AUTHENTICATION
    // ==============================================

    async function checkAuth() {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            alert('Silakan login terlebih dahulu untuk membuka Trading Journal.');
            window.location.href = 'login.html';
            return false;
        }

        user = data.user;
        return true;
    }

    if (!(await checkAuth())) return;

    // ==============================================
    // DATABASE
    // ==============================================

    async function loadTrades() {
        const { data, error } = await supabase
            .from('trading_journal')
            .select('*')
            .eq('user_id', user.id)
            .order('trade_date', { ascending: false });

        if (error) {
            console.error(error);
            alert('Gagal mengambil data journal: ' + error.message);
            return;
        }

        trades = data.map(row => ({
            id: row.id,
            ts: new Date(row.trade_date).getTime(),
            asset: row.asset,
            side: row.side,
            posSize: Number(row.position_size),
            entry: Number(row.entry_price),
            exit: Number(row.exit_price),
            sl: Number(row.stop_loss),
            qty: Number(row.qty),
            risk: Number(row.risk_amount),
            pnl: Number(row.pnl),
            r: row.r_multiple === null ? null : Number(row.r_multiple),
            notes: row.notes || ''
        }));

        render();
    }

    async function saveTrade(trade) {
        const payload = {
            user_id: user.id,
            trade_date: new Date(trade.ts).toISOString(),
            asset: trade.asset,
            side: trade.side,
            position_size: trade.posSize,
            entry_price: trade.entry,
            exit_price: trade.exit,
            stop_loss: trade.sl,
            qty: trade.qty,
            risk_amount: trade.risk,
            pnl: trade.pnl,
            r_multiple: trade.r,
            notes: trade.notes
        };

        const { error } = await supabase
            .from('trading_journal')
            .insert(payload);

        if (error) throw error;

        await loadTrades();
    }

    async function deleteTrade(id) {
        if (!confirm('Hapus transaksi ini?')) return;

        const { error } = await supabase
            .from('trading_journal')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) {
            alert('Gagal menghapus transaksi: ' + error.message);
            return;
        }

        await loadTrades();
    }

    async function clearAllTrades() {
        if (!trades.length) return;

        if (!confirm('Hapus semua transaksi journal? Tindakan ini tidak bisa dibatalkan.')) {
            return;
        }

        const { error } = await supabase
            .from('trading_journal')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            alert('Gagal menghapus data: ' + error.message);
            return;
        }

        await loadTrades();
    }

    // ==============================================
    // LOCAL STORAGE MIGRATION
    // ==============================================

    async function migrateLocalData() {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return;

        let localTrades;

        try {
            localTrades = JSON.parse(raw);
        } catch (error) {
            console.error('Local data invalid:', error);
            return;
        }

        if (!Array.isArray(localTrades) || !localTrades.length) return;

        const confirmed = confirm(
            'Ditemukan ' + localTrades.length +
            ' transaksi lama di browser ini.\n\n' +
            'Pindahkan transaksi tersebut ke akun MARKET INSIGHT?'
        );

        if (!confirmed) return;

        const payload = localTrades.map(t => ({
            user_id: user.id,
            trade_date: new Date(Number(t.ts)).toISOString(),
            asset: t.asset,
            side: t.side,
            position_size: Number(t.posSize),
            entry_price: Number(t.entry),
            exit_price: Number(t.exit),
            stop_loss: Number(t.sl),
            qty: Number(t.qty),
            risk_amount: Number(t.risk),
            pnl: Number(t.pnl),
            r_multiple: t.r === null ? null : Number(t.r),
            notes: t.notes || ''
        }));

        const { error } = await supabase
            .from('trading_journal')
            .insert(payload);

        if (error) {
            alert(
                'Migrasi gagal. Data LocalStorage tetap aman.\n' +
                error.message
            );
            return;
        }

        const { data, error: verifyError } = await supabase
            .from('trading_journal')
            .select('id')
            .eq('user_id', user.id);

        if (verifyError || !data || data.length < payload.length) {
            alert('Data belum berhasil diverifikasi. LocalStorage tidak dihapus.');
            return;
        }

        localStorage.removeItem(STORAGE_KEY);

        alert('Migrasi berhasil! Data journal sudah tersimpan di Supabase.');

        await loadTrades();
    }

    // ==============================================
    // CALCULATION
    // ==============================================

    function computeTrade(t) {
        const qty = t.posSize / t.entry;
        const risk = Math.abs(t.entry - t.sl) * qty;

        const pnl = t.side === 'long'
            ? (t.exit - t.entry) * qty
            : (t.entry - t.exit) * qty;

        return {
            qty,
            risk,
            pnl,
            r: risk > 0 ? pnl / risk : null
        };
    }

    function usd(n, decimals) {
        if (n === null || n === undefined || isNaN(n)) return '—';

        const d = decimals !== undefined
            ? decimals
            : (Math.abs(n) !== 0 && Math.abs(n) < 1 ? 6 : 2);

        return (n < 0 ? '-$' : '$') +
            Math.abs(n).toLocaleString('en-US', {
                minimumFractionDigits: d,
                maximumFractionDigits: d
            });
    }

    function qtyFmt(n) {
        return Number(n).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        });
    }

    function pct(n) {
        return n.toFixed(1) + '%';
    }

    function fmtR(n) {
        if (n === null || !isFinite(n)) return '—';
        return (n >= 0 ? '+' : '') + n.toFixed(2) + 'R';
    }

    function fmtDate(ts) {
        return new Date(ts).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // ==============================================
    // FORM
    // ==============================================

    function setSide(value) {
        side = value;

        $('btnLong').classList.toggle('active', value === 'long');
        $('btnShort').classList.toggle('active', value === 'short');

        updatePreview();
    }

    $('btnLong').addEventListener('click', () => setSide('long'));
    $('btnShort').addEventListener('click', () => setSide('short'));

    function readForm() {
        return {
            asset: $('asset').value.trim(),
            side,
            posSize: Number($('posSize').value),
            entry: Number($('entry').value),
            exit: Number($('exit').value),
            sl: Number($('sl').value),
            notes: $('notes').value.trim()
        };
    }

    function updatePreview() {
        const v = readForm();
        const box = $('formPreview');

        if (!v.asset || !v.posSize || !v.entry || !v.exit || !v.sl) {
            box.textContent = 'Isi form di atas untuk melihat estimasi qty, risk, dan PnL.';
            return;
        }

        const c = computeTrade(v);
        const cls = c.pnl >= 0 ? 'green' : 'red';

        box.innerHTML =
            'Qty <b>' + qtyFmt(c.qty) +
            '</b> · Risk <b>' + usd(c.risk) +
            '</b> · Estimasi PnL <b class="' + cls + '">' +
            usd(c.pnl) + '</b> · R <b class="' + cls + '">' +
            fmtR(c.r) + '</b>';
    }

    ['posSize', 'entry', 'exit', 'sl', 'asset'].forEach(id => {
        $(id).addEventListener('input', updatePreview);
    });

    function openForm() {
        $('formPanel').classList.add('open');
        $('btnToggleForm').innerHTML =
            '<i class="fa-solid fa-minus"></i> Tutup Form';
    }

    function closeForm() {
        $('formPanel').classList.remove('open');
        $('btnToggleForm').innerHTML =
            '<i class="fa-solid fa-plus"></i> Tambah Transaksi';

        $('tradeForm').reset();
        setSide('long');
        $('formError').classList.remove('show');
        updatePreview();
    }

    $('btnToggleForm').addEventListener('click', () => {
        $('formPanel').classList.contains('open')
            ? closeForm()
            : openForm();
    });

    $('btnCancelForm').addEventListener('click', closeForm);

    $('tradeForm').addEventListener('submit', async e => {
        e.preventDefault();

        const v = readForm();
        const err = $('formError');

        function showError(message) {
            err.textContent = message;
            err.classList.add('show');
        }

        if (!v.asset) return showError('Isi nama asset / pair dulu.');

        if (!(v.posSize > 0))
            return showError('Position size harus lebih dari 0.');

        if (!(v.entry > 0) || !(v.exit > 0) || !(v.sl > 0))
            return showError('Harga entry, exit, dan stop loss harus lebih dari 0.');

        err.classList.remove('show');

        const c = computeTrade(v);

        const trade = {
            ...v,
            ...c,
            ts: Date.now()
        };

        const button = $('tradeForm').querySelector('[type="submit"]');

        button.disabled = true;
        button.textContent = 'Menyimpan...';

        try {
            await saveTrade(trade);
            closeForm();
        } catch (error) {
            showError('Gagal menyimpan: ' + error.message);
        } finally {
            button.disabled = false;
            button.innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> Simpan Transaksi';
        }
    });

    $('btnClearAll').addEventListener('click', clearAllTrades);

    // ==============================================
    // TABLE
    // ==============================================

    function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = String(value ?? '');
        return div.innerHTML;
    }

    function renderTable() {
        const body = $('tradeTableBody');

        if (!trades.length) {
            body.innerHTML =
                '<tr class="empty-row"><td colspan="12">' +
                'Belum ada transaksi tercatat. Klik Tambah Transaksi untuk mulai.' +
                '</td></tr>';
            return;
        }

        const sorted = [...trades].sort((a, b) => b.ts - a.ts);

        body.innerHTML = sorted.map(t => {
            const cls = t.pnl >= 0 ? 'green' : 'red';

            return `
                <tr>
                    <td>${fmtDate(t.ts)}</td>
                    <td class="asset-cell">${escapeHtml(t.asset)}</td>
                    <td><span class="tag ${t.side}">${t.side.toUpperCase()}</span></td>
                    <td>${usd(t.entry)}</td>
                    <td>${usd(t.exit)}</td>
                    <td>${usd(t.sl)}</td>
                    <td>${qtyFmt(t.qty)}</td>
                    <td>${usd(t.risk)}</td>
                    <td class="${cls}" style="font-weight:800">${usd(t.pnl)}</td>
                    <td class="${cls}">${fmtR(t.r)}</td>
                    <td class="notes">${escapeHtml(t.notes || '—')}</td>
                    <td>
                        <button class="icon-btn" data-id="${t.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        body.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteTrade(btn.dataset.id));
        });
    }

    // ==============================================
    // STATISTICS
    // ==============================================

    function renderStats() {
        const total = trades.length;

        if (!total) {
            $('statWinRate').textContent = '—';
            $('statWinRateHint').textContent = 'Belum ada data';

            $('statTotalPnl').textContent = '—';
            $('statTotalPnl').className = 'value';

            $('statTotalPnlHint').textContent = 'Akumulasi profit/loss';
            $('statPF').textContent = '—';
            $('statRR').textContent = '—';
            $('statDD').textContent = '—';
            $('statDDHint').textContent = 'Penurunan ekuitas terbesar';

            return;
        }

        const wins = trades.filter(t => t.pnl > 0);
        const losses = trades.filter(t => t.pnl < 0);

        const totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
        const sumWins = wins.reduce((s, t) => s + t.pnl, 0);

        const sumLoss = Math.abs(
            losses.reduce((s, t) => s + t.pnl, 0)
        );

        const pf = sumLoss > 0
            ? sumWins / sumLoss
            : sumWins > 0 ? Infinity : 0;

        const rValues = trades
            .filter(t => t.r !== null && isFinite(t.r))
            .map(t => t.r);

        const avgR = rValues.length
            ? rValues.reduce((s, v) => s + v, 0) / rValues.length
            : null;

        const ordered = [...trades].sort((a, b) => a.ts - b.ts);

        let equity = 0;
        let peak = 0;
        let maxDD = 0;

        ordered.forEach(t => {
            equity += t.pnl;
            peak = Math.max(peak, equity);
            maxDD = Math.max(maxDD, peak - equity);
        });

        $('statWinRate').textContent = pct(wins.length / total * 100);

        $('statWinRateHint').textContent =
            wins.length + ' menang / ' + losses.length +
            ' kalah / ' + total + ' total';

        $('statTotalPnl').textContent = usd(totalPnl);

        $('statTotalPnl').className =
            'value ' + (totalPnl >= 0 ? 'green' : 'red');

        $('statTotalPnlHint').textContent = total + ' transaksi tercatat';

        $('statPF').textContent = pf === Infinity ? '∞' : pf.toFixed(2);

        $('statRR').textContent = avgR === null ? '—' : fmtR(avgR);

        $('statDD').textContent = usd(maxDD);

        $('statDDHint').textContent =
            peak > 0
                ? pct(maxDD / peak * 100) + ' dari puncak ekuitas'
                : 'Penurunan ekuitas terbesar';
    }

    // ==============================================
    // EQUITY CURVE
    // ==============================================

    function renderChart() {
        const canvas = $('equityCanvas');
        const ctx = canvas.getContext('2d');

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth || 600;
        const height = 220;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const ordered = [...trades].sort((a, b) => a.ts - b.ts);

        const pad = { l: 46, r: 14, t: 14, b: 22 };

        const plotW = width - pad.l - pad.r;
        const plotH = height - pad.t - pad.b;

        if (!ordered.length) {
            ctx.fillStyle = 'rgba(135,147,165,.7)';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                'Belum ada transaksi untuk ditampilkan',
                width / 2,
                height / 2
            );
            return;
        }

        const points = [0];
        let running = 0;

        ordered.forEach(t => {
            running += t.pnl;
            points.push(running);
        });

        let min = Math.min(...points, 0);
        let max = Math.max(...points, 0);

        if (min === max) {
            min -= 1;
            max += 1;
        }

        const range = max - min;

        const x = i => pad.l + i / (points.length - 1) * plotW;
        const y = v => pad.t + (1 - (v - min) / range) * plotH;

        const zeroY = y(0);

        ctx.strokeStyle = 'rgba(255,255,255,.12)';
        ctx.beginPath();
        ctx.moveTo(pad.l, zeroY);
        ctx.lineTo(width - pad.r, zeroY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(135,147,165,.9)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'right';

        ctx.fillText(usd(max, 0), pad.l - 8, y(max) + 3);
        ctx.fillText(usd(0, 0), pad.l - 8, zeroY + 3);
        ctx.fillText(usd(min, 0), pad.l - 8, y(min) + 3);

        const gradient = ctx.createLinearGradient(0, pad.t, 0, height);

        gradient.addColorStop(0, 'rgba(0,240,255,.25)');
        gradient.addColorStop(1, 'rgba(0,240,255,0)');

        ctx.beginPath();
        points.forEach((v, i) => {
            if (i === 0) ctx.moveTo(x(i), y(v));
            else ctx.lineTo(x(i), y(v));
        });

        ctx.lineTo(x(points.length - 1), zeroY);
        ctx.lineTo(x(0), zeroY);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();

        points.forEach((v, i) => {
            if (i === 0) ctx.moveTo(x(i), y(v));
            else ctx.lineTo(x(i), y(v));
        });

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        points.forEach((v, i) => {
            if (!i) return;

            ctx.beginPath();
            ctx.arc(x(i), y(v), 2.6, 0, Math.PI * 2);
            ctx.fillStyle = v >= points[i - 1] ? '#34d399' : '#fb7185';
            ctx.fill();
        });
    }

    // ==============================================
    // RENDER
    // ==============================================

    function render() {
        renderTable();
        renderStats();
        renderChart();
    }

    $('year').textContent = new Date().getFullYear();

    window.addEventListener('resize', renderChart);

    // ==============================================
    // START
    // ==============================================

    await loadTrades();

    await migrateLocalData();

    console.log('MARKET INSIGHT: Trading Journal connected to Supabase.');

})();
