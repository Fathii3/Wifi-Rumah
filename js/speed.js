// Logika Engine Speed Test & Riwayat (Ookla-Style Real-Time Gauge & History)

// Fitur tes kecepatan Ookla-Style (Realtime Instant Speed, Dynamic Needle & Micro-jitter)
let currentDisplayMbps = 0;
let targetMbps = 0;
let animFrameId = null;
let isTestingActive = false;
let hasTestedOnce = (JSON.parse(localStorage.getItem('wifi_speed_history') || '[]')).length > 0;

function speedToProgress(s) {
    if (s <= 10) return (s / 10) * 0.25;
    if (s <= 100) return 0.25 + ((s - 10) / 90) * 0.25;
    if (s <= 500) return 0.50 + ((s - 100) / 400) * 0.25;
    if (s <= 1000) return 0.75 + ((s - 500) / 500) * 0.25;
    return 1;
}

function updateGaugeSmoothly() {
    const valueDisplay = document.getElementById('speed-value');
    const meter = document.getElementById('speed-meter');
    const needle = document.getElementById('speed-needle');

    if (!valueDisplay || !meter || !needle) return;

    currentDisplayMbps += (targetMbps - currentDisplayMbps) * 0.15;

    let renderSpeed = currentDisplayMbps;
    if (isTestingActive && currentDisplayMbps > 0.5) {
        const jitter = (Math.sin(Date.now() / 80) * (currentDisplayMbps * 0.018)) + ((Math.random() - 0.5) * 0.2);
        renderSpeed = Math.max(0, currentDisplayMbps + jitter);
    }

    valueDisplay.innerText = renderSpeed.toFixed(2);
    const progress = speedToProgress(renderSpeed);
    meter.style.strokeDashoffset = (330 - (330 * progress)).toFixed(2);
    needle.style.transform = `rotate(${(progress * 270).toFixed(2)}deg)`;

    if (animFrameId !== null) {
        animFrameId = requestAnimationFrame(updateGaugeSmoothly);
    }
}

// Animasi angka melayang dari gauge ke posisi metric card
function animateFloatResult(value, unit, targetEl) {
    if (!targetEl) return;
    const gaugeCenter = document.getElementById('speed-value');
    if (!gaugeCenter) return;

    const floater = document.createElement('span');
    floater.className = cn('speed-float-result');
    floater.innerText = `${value} ${unit}`;

    const gaugeRect = gaugeCenter.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    floater.style.cssText = `
        position: fixed;
        left: ${gaugeRect.left + gaugeRect.width / 2}px;
        top: ${gaugeRect.top + gaugeRect.height / 2}px;
        transform: translate(-50%, -50%) scale(1.3);
        font-size: 20px;
        font-weight: 800;
        color: #4f46e5;
        pointer-events: none;
        z-index: 9999;
        opacity: 1;
        transition: all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
        text-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
        white-space: nowrap;
    `;
    document.body.appendChild(floater);

    // Force reflow sebelum animasi
    floater.offsetHeight;

    requestAnimationFrame(() => {
        floater.style.left = `${targetRect.left + targetRect.width / 2}px`;
        floater.style.top = `${targetRect.top + targetRect.height / 2}px`;
        floater.style.transform = 'translate(-50%, -50%) scale(1)';
        floater.style.fontSize = '14px';
        floater.style.opacity = '0';
    });

    setTimeout(() => {
        if (floater.parentNode) floater.parentNode.removeChild(floater);
    }, 750);
}

// Reset gauge dengan animasi halus ke 0
function resetGaugeSmooth() {
    return new Promise(resolve => {
        const meter = document.getElementById('speed-meter');
        const needle = document.getElementById('speed-needle');
        const valueDisplay = document.getElementById('speed-value');

        targetMbps = 0;
        const fadeDown = () => {
            currentDisplayMbps *= 0.85;
            if (currentDisplayMbps < 0.05) {
                currentDisplayMbps = 0;
                targetMbps = 0;
                if (valueDisplay) valueDisplay.innerText = '0.00';
                if (meter) meter.style.strokeDashoffset = '330';
                if (needle) needle.style.transform = 'rotate(0deg)';
                resolve();
                return;
            }
            if (valueDisplay) valueDisplay.innerText = currentDisplayMbps.toFixed(2);
            const progress = speedToProgress(currentDisplayMbps);
            if (meter) meter.style.strokeDashoffset = (330 - (330 * progress)).toFixed(2);
            if (needle) needle.style.transform = `rotate(${(progress * 270).toFixed(2)}deg)`;
            requestAnimationFrame(fadeDown);
        };
        fadeDown();
    });
}

async function runRobustSpeedTest() {
    const btn = document.getElementById('start-speed-btn');
    const pingDisplay = document.getElementById('ping-value');
    const valueDisplay = document.getElementById('speed-value');
    const meter = document.getElementById('speed-meter');
    const needle = document.getElementById('speed-needle');
    const downloadDisplay = document.getElementById('download-value');
    const uploadDisplay = document.getElementById('upload-value');
    const unitDisplay = document.getElementById('speed-unit');

    if (!btn || btn.disabled) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menguji Ping...';
    if (pingDisplay) pingDisplay.innerText = '--';
    if (downloadDisplay) downloadDisplay.innerText = '--';
    if (uploadDisplay) uploadDisplay.innerText = '--';

    targetMbps = 0;
    currentDisplayMbps = 0;
    isTestingActive = true;
    if (meter) meter.style.strokeDashoffset = "330";
    if (needle) needle.style.transform = "rotate(0deg)";
    if (valueDisplay) valueDisplay.innerText = '0.00';
    if (unitDisplay) unitDisplay.innerText = 'MBPS';

    if (needle) needle.style.transition = 'none';
    if (meter) meter.style.transition = 'none';

    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    animFrameId = requestAnimationFrame(updateGaugeSmoothly);

    try {
        // Fase 1: Ping
        targetMbps = 3.5;
        const pingSamples = [];

        try {
            await fetch(`https://speed.cloudflare.com/__down?bytes=0&nocache=${Math.random()}`, { cache: 'no-store' });
        } catch (e) { }

        for (let i = 0; i < 20; i++) {
            const pStart = performance.now();
            try {
                const url = `https://speed.cloudflare.com/__down?bytes=0&nocache=${Math.random()}`;
                await fetch(url, { cache: 'no-store' });
                const pEnd = performance.now();

                let duration = pEnd - pStart;
                const entries = performance.getEntriesByName(url);
                if (entries && entries.length > 0) {
                    const entry = entries[entries.length - 1];
                    if (entry.responseStart > 0 && entry.requestStart > 0) {
                        duration = entry.responseStart - entry.requestStart;
                    } else if (entry.duration > 0) {
                        duration = entry.duration;
                    }
                }

                const sampleTime = Math.round(duration);
                if (sampleTime > 0) pingSamples.push(sampleTime);
                if (pingDisplay) pingDisplay.innerText = sampleTime;
            } catch (e) { }
            await new Promise(r => setTimeout(r, 100));
        }

        let accuratePing = null;
        if (pingSamples.length > 0) {
            pingSamples.sort((a, b) => a - b);
            const validSamples = pingSamples.slice(0, Math.max(1, Math.floor(pingSamples.length * 0.75)));
            accuratePing = Math.round(validSamples.reduce((a, b) => a + b, 0) / validSamples.length);
            if (pingDisplay) pingDisplay.innerText = accuratePing;
        } else {
            if (pingDisplay) {
                pingDisplay.innerText = '--';
                pingDisplay.title = 'Gagal mengukur ping';
            }
        }

        performance.clearResourceTimings();

        targetMbps = 0.5;
        await new Promise(r => setTimeout(r, 250));

        // Fase 2: Download
        btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menguji Unduh...';
        if (unitDisplay) unitDisplay.innerHTML = '<span class="text-[9px] block opacity-60">UNDUH</span>MBPS';

        const testDuration = 10500;
        const warmupDuration = 2500;
        const startTime = performance.now();
        const controller = new AbortController();

        let totalBytesDownloaded = 0;
        let measurementBytes = 0;
        let measurementStartTime = 0;
        let lastMeasurementTime = 0;
        const instantSamples = [];

        const downloadStream = async () => {
            try {
                const response = await fetch(`https://speed.cloudflare.com/__down?bytes=50000000&nocache=${Math.random()}`, {
                    cache: 'no-store',
                    signal: controller.signal
                });

                if (!response.ok) throw new Error("Fetch error");
                const reader = response.body.getReader();

                while (isTestingActive) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const now = performance.now();
                    const elapsedFromStart = now - startTime;
                    totalBytesDownloaded += value.length;

                    if (elapsedFromStart >= warmupDuration) {
                        if (measurementStartTime === 0) measurementStartTime = now;
                        measurementBytes += value.length;
                        lastMeasurementTime = now;
                    }

                    instantSamples.push({ time: now, bytes: totalBytesDownloaded });
                    while (instantSamples.length > 0 && (now - instantSamples[0].time) > 400) {
                        instantSamples.shift();
                    }

                    if (instantSamples.length > 1) {
                        const oldest = instantSamples[0];
                        const timeDiffSec = (now - oldest.time) / 1000;
                        const bytesDiff = totalBytesDownloaded - oldest.bytes;

                        if (timeDiffSec > 0.05) {
                            const instantMbps = (bytesDiff * 8 / timeDiffSec) / 1000000;
                            targetMbps = instantMbps;
                        }
                    }

                    if (elapsedFromStart >= testDuration) {
                        controller.abort();
                        break;
                    }
                }
            } catch (e) {
                if (e.name !== 'AbortError') {
                    console.warn('Download stream gagal:', e.message || e);
                }
            }
        };

        await Promise.all([
            downloadStream(),
            downloadStream(),
            downloadStream(),
            downloadStream()
        ]);

        const measurementEndTime = lastMeasurementTime > 0 ? lastMeasurementTime : performance.now();
        const finalDurationSec = measurementStartTime > 0 ? (measurementEndTime - measurementStartTime) / 1000 : (testDuration / 1000);
        const bytesToCalculate = measurementBytes > 0 ? measurementBytes : totalBytesDownloaded;

        let calculatedFinalMbps = 0;
        if (bytesToCalculate > 0 && finalDurationSec > 0) {
            calculatedFinalMbps = (bytesToCalculate * 8 / finalDurationSec) / 1000000;
        }

        if (downloadDisplay && calculatedFinalMbps > 0) {
            downloadDisplay.innerText = calculatedFinalMbps.toFixed(2);
            animateFloatResult(calculatedFinalMbps.toFixed(2), 'Mbps', downloadDisplay);
        }

        isTestingActive = false;
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        currentDisplayMbps = calculatedFinalMbps;
        targetMbps = calculatedFinalMbps;
        if (valueDisplay) valueDisplay.innerText = calculatedFinalMbps.toFixed(2);
        const dlProgress = speedToProgress(calculatedFinalMbps);
        if (meter) meter.style.strokeDashoffset = (330 - (330 * dlProgress)).toFixed(2);
        if (needle) needle.style.transform = `rotate(${(dlProgress * 270).toFixed(2)}deg)`;

        await new Promise(r => setTimeout(r, 800));

        // Transisi: Reset gauge untuk upload
        await resetGaugeSmooth();
        await new Promise(r => setTimeout(r, 300));

        // Fase 3: Upload
        btn.innerHTML = '<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Menguji Upload...';
        if (unitDisplay) unitDisplay.innerHTML = '<span class="text-[9px] block opacity-60">UPLOAD</span>MBPS';

        isTestingActive = true;
        targetMbps = 2;
        animFrameId = requestAnimationFrame(updateGaugeSmoothly);

        let calculatedUploadMbps = 0;
        try {
            const smallChunk = new Uint8Array(512 * 1024);
            const largeChunk = new Uint8Array(2 * 1024 * 1024);
            const uploadDuration = 8000;
            const uploadWarmup = 2000;
            const uploadStart = performance.now();
            const uploadController = new AbortController();
            let uploadTotalBytes = 0;
            let uploadMeasureBytes = 0;
            let uploadMeasureStart = 0;
            let lastUploadMeasureTime = 0;
            const uploadInstantSamples = [];

            const uploadStream = async () => {
                while (performance.now() - uploadStart < uploadDuration) {
                    try {
                        const elapsed = performance.now() - uploadStart;
                        const chunk = elapsed < uploadWarmup ? smallChunk : largeChunk;

                        const chunkStart = performance.now();
                        await fetch('https://speed.cloudflare.com/__up', {
                            method: 'POST',
                            body: chunk,
                            cache: 'no-store',
                            signal: uploadController.signal
                        });
                        const chunkEnd = performance.now();
                        const chunkElapsed = chunkEnd - uploadStart;
                        uploadTotalBytes += chunk.byteLength;

                        if (chunkElapsed >= uploadWarmup) {
                            if (uploadMeasureStart === 0) uploadMeasureStart = chunkStart;
                            uploadMeasureBytes += chunk.byteLength;
                            lastUploadMeasureTime = chunkEnd;
                        }

                        uploadInstantSamples.push({ time: chunkEnd, bytes: uploadTotalBytes });
                        while (uploadInstantSamples.length > 0 && (chunkEnd - uploadInstantSamples[0].time) > 800) {
                            uploadInstantSamples.shift();
                        }

                        if (uploadInstantSamples.length > 1) {
                            const oldest = uploadInstantSamples[0];
                            const windowSec = (chunkEnd - oldest.time) / 1000;
                            const windowBytes = uploadTotalBytes - oldest.bytes;
                            if (windowSec > 0.1) {
                                const liveUpload = (windowBytes * 8 / windowSec) / 1000000;
                                targetMbps = liveUpload;
                            }
                        } else if (uploadTotalBytes > 0) {
                            const totalSec = (chunkEnd - uploadStart) / 1000;
                            if (totalSec > 0.05) {
                                targetMbps = (uploadTotalBytes * 8 / totalSec) / 1000000;
                            }
                        }
                    } catch (e) {
                        if (e.name === 'AbortError') break;
                        break;
                    }
                }
            };

            const uploadTimeout = setTimeout(() => uploadController.abort(), uploadDuration + 500);

            await Promise.all([uploadStream(), uploadStream(), uploadStream()]);
            clearTimeout(uploadTimeout);
            if (!uploadController.signal.aborted) uploadController.abort();

            const uploadEnd = lastUploadMeasureTime > 0 ? lastUploadMeasureTime : performance.now();
            const uploadFinalSec = uploadMeasureStart > 0
                ? (uploadEnd - uploadMeasureStart) / 1000
                : (uploadDuration / 1000);
            const uploadFinalBytes = uploadMeasureBytes > 0 ? uploadMeasureBytes : uploadTotalBytes;

            if (uploadFinalBytes > 0 && uploadFinalSec > 0) {
                calculatedUploadMbps = (uploadFinalBytes * 8 / uploadFinalSec) / 1000000;
            }

            if (uploadDisplay) {
                uploadDisplay.innerText = calculatedUploadMbps.toFixed(2);
                animateFloatResult(calculatedUploadMbps.toFixed(2), 'Mbps', uploadDisplay);
            }
        } catch (uploadError) {
            console.warn('Upload test gagal:', uploadError);
            if (uploadDisplay) uploadDisplay.innerText = '--';
        }

        // Fase Akhir: Selesai
        isTestingActive = false;
        if (unitDisplay) unitDisplay.innerText = 'MBPS';

        setTimeout(() => {
            targetMbps = calculatedUploadMbps > 0 ? calculatedUploadMbps : currentDisplayMbps;

            setTimeout(() => {
                if (animFrameId) {
                    cancelAnimationFrame(animFrameId);
                    animFrameId = null;
                }

                currentDisplayMbps = calculatedFinalMbps > 0 ? calculatedFinalMbps : 0;
                targetMbps = currentDisplayMbps;
                if (valueDisplay) valueDisplay.innerText = currentDisplayMbps.toFixed(2);

                const progress = speedToProgress(currentDisplayMbps);
                if (meter) meter.style.strokeDashoffset = (330 - (330 * progress)).toFixed(2);
                if (needle) needle.style.transform = `rotate(${(progress * 270).toFixed(2)}deg)`;

                if (downloadDisplay) downloadDisplay.innerText = calculatedFinalMbps.toFixed(2);
                if (uploadDisplay && calculatedUploadMbps > 0) uploadDisplay.innerText = calculatedUploadMbps.toFixed(2);

                btn.disabled = false;
                hasTestedOnce = true;
                btn.innerHTML = '<span class="material-symbols-outlined">&#xe5d5;</span> Ulangi Tes';

                const finalPing = parseInt(pingDisplay ? pingDisplay.innerText : '0', 10) || accuratePing || 0;
                saveSpeedResult(finalPing, calculatedFinalMbps, calculatedUploadMbps);
            }, 500);
        }, 600);
    } catch (error) {
        console.error("Gagal melakukan tes jaringan", error);
        isTestingActive = false;
        if (unitDisplay) unitDisplay.innerText = 'MBPS';
        btn.disabled = false;
        if (hasTestedOnce) {
            btn.innerHTML = '<span class="material-symbols-outlined">&#xe5d5;</span> Ulangi Tes';
        } else {
            btn.innerHTML = '<span class="material-symbols-outlined">&#xe037;</span> Mulai Tes';
        }
    }
}

// Riwayat Speed Test (localStorage)
const HISTORY_KEY = 'wifi_speed_history';
const MAX_HISTORY = 50;

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch { return []; }
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function saveSpeedResult(ping, mbps, uploadMbps) {
    const ispEl = document.querySelector('.isp-name-display');
    const cityEl = document.querySelector('.isp-city-display');

    const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        ping: ping,
        speed: parseFloat(mbps.toFixed(2)),
        upload: uploadMbps ? parseFloat(uploadMbps.toFixed(2)) : 0,
        isp: ispEl ? ispEl.innerText : '-',
        city: cityEl ? cityEl.innerText : '-'
    };

    const history = getHistory();
    history.unshift(entry);
    if (history.length > MAX_HISTORY) history.pop();
    saveHistory(history);
    updateHistoryBadge();
}

function updateHistoryBadge() {
    const badge = document.getElementById('history-badge');
    if (!badge) return;
    const count = getHistory().length;
    if (count > 0) {
        badge.classList.remove('hidden');
        badge.innerText = count > 99 ? '99+' : count;
    } else {
        badge.classList.add('hidden');
    }
}

function toggleHistoryPanel() {
    const panel = document.getElementById('history-panel');
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    if (isHidden) {
        panel.classList.remove('hidden');
        renderHistory();
    } else {
        panel.classList.add('hidden');
    }
}

function getPingColor(ping) {
    if (ping <= 30) return 'text-success';
    if (ping <= 80) return 'text-warning';
    return 'text-error';
}

function getSpeedLabel(mbps) {
    if (mbps >= 50) return { text: 'Sangat Cepat', color: 'text-success' };
    if (mbps >= 10) return { text: 'Cepat', color: 'text-primary' };
    if (mbps >= 3) return { text: 'Sedang', color: 'text-warning' };
    return { text: 'Lambat', color: 'text-error' };
}

function deleteHistoryItem(id) {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    saveHistory(history);
    renderHistory();
    updateHistoryBadge();
}

function clearAllHistory() {
    const modal = document.getElementById('clear-confirm-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeClearModal() {
    const modal = document.getElementById('clear-confirm-modal');
    if (modal) modal.classList.add('hidden');
}

function confirmClearAllHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    updateHistoryBadge();
    closeClearModal();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const clearBtn = document.getElementById('clear-all-btn');
    if (!list) return;

    const history = getHistory();

    if (history.length === 0) {
        list.innerHTML = '<div class="p-6 text-center text-sm text-text-muted">Belum ada riwayat tes.</div>';
        if (clearBtn) clearBtn.classList.add('hidden');
        return;
    }

    if (clearBtn) clearBtn.classList.remove('hidden');
    list.innerHTML = '';

    history.forEach((entry) => {
        const label = getSpeedLabel(entry.speed);
        const pingColor = getPingColor(entry.ping);

        const row = document.createElement('div');
        row.className = cn('neu-card-sm p-4 relative rounded-2xl w-full');

        const badgeClass = cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', label.color);
        const pingClass = cn('font-bold break-all', pingColor);
        const deleteBtnClass = cn('text-text-subtle hover:text-error transition-colors p-1.5 -mr-1 -mt-1 rounded-lg hover:bg-error/10 shrink-0');

        row.innerHTML = `
            <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <!-- Top: Unduh Speed & Badge -->
                    <div class="flex items-center flex-wrap gap-2 mb-3">
                        <span class="text-xl font-extrabold text-text-primary tracking-tight">
                            ${entry.speed} <span class="text-xs font-semibold text-text-muted">Mbps</span>
                        </span>
                        <span class="${badgeClass}" style="background: rgba(0,0,0,0.04);">
                            ${label.text}
                        </span>
                    </div>

                    <!-- Metrics Grid: Unduh, Upload, Ping, Lokasi, and ISP -->
                    <div class="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <!-- Unduh (Download) -->
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="material-symbols-outlined text-[15px] text-cyan-accent shrink-0">&#xe5db;</span>
                            <span class="text-text-muted shrink-0">Unduh:</span>
                            <span class="font-bold text-cyan-accent break-all">${entry.speed ? `${entry.speed} Mbps` : '-'}</span>
                        </div>

                        <!-- Upload -->
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="material-symbols-outlined text-[15px] text-secondary shrink-0">&#xe5d8;</span>
                            <span class="text-text-muted shrink-0">Upload:</span>
                            <span class="font-bold text-secondary break-all">${entry.upload ? `${entry.upload} Mbps` : '-'}</span>
                        </div>

                        <!-- Ping -->
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="material-symbols-outlined text-[15px] ${pingColor} shrink-0">&#xe55f;</span>
                            <span class="text-text-muted shrink-0">Ping:</span>
                            <span class="${pingClass}">${entry.ping} ms</span>
                        </div>

                        <!-- Lokasi -->
                        <div class="flex items-start gap-1.5 min-w-0">
                            <span class="material-symbols-outlined text-[15px] text-cyan-accent shrink-0 mt-0.5">&#xe55e;</span>
                            <div class="flex flex-wrap items-baseline gap-1 break-words min-w-0">
                                <span class="text-text-muted shrink-0">Lokasi:</span>
                                <span class="font-medium text-text-primary break-words">${entry.city || '-'}</span>
                            </div>
                        </div>

                        <!-- ISP -->
                        <div class="flex items-start gap-1.5 min-w-0 col-span-2 pt-0.5">
                            <span class="material-symbols-outlined text-[15px] text-cyan-accent shrink-0 mt-0.5">&#xe894;</span>
                            <div class="flex flex-wrap items-baseline gap-1 break-words min-w-0">
                                <span class="text-text-muted shrink-0">ISP:</span>
                                <span class="font-semibold text-text-primary break-words leading-tight">${entry.isp || '-'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Date Footer with subtle time icon -->
                    <div class="mt-3 pt-2 border-t border-neu-dark/15 text-[10px] text-text-subtle flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px] text-text-subtle shrink-0">&#xe8b5;</span>
                        <span>${typeof formatDate === 'function' ? formatDate(entry.date) : entry.date}</span>
                    </div>
                </div>

                <!-- Delete Button -->
                <button onclick="deleteHistoryItem(${entry.id})"
                        class="${deleteBtnClass}"
                        title="Hapus riwayat">
                    <span class="material-symbols-outlined text-[18px]">&#xe872;</span>
                </button>
            </div>
        `;
        list.appendChild(row);
    });
}

// Initial setup on script load
updateHistoryBadge();

if (hasTestedOnce) {
    const btn = document.getElementById('start-speed-btn');
    if (btn) btn.innerHTML = '<span class="material-symbols-outlined">&#xe5d5;</span> Ulangi Tes';
}

const clearModal = document.getElementById('clear-confirm-modal');
if (clearModal) {
    clearModal.addEventListener('click', (e) => {
        if (e.target === clearModal) closeClearModal();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeClearModal();
});
