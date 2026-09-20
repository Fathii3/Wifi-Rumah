// Logika Pemantauan Perangkat (Fetch backend router & modal API tunnel)

let currentDevices = [];
let fetchFailures = 0;
let pollingTimeout = null;

async function fetchDevices() {
    try {
        let apiHost = localStorage.getItem('wifi_backend_api_url');
        if (!apiHost) {
            const defaultApiHost = (typeof wifiConfig !== 'undefined' && wifiConfig.apiHost) ? wifiConfig.apiHost : '';
            apiHost = window.location.protocol === 'file:' ? 'http://192.168.1.2:3000' : defaultApiHost;
        }
        const response = await fetch(`${apiHost}/api/devices`, {
            headers: {
                'bypass-tunnel-reminder': 'true',
                'ngrok-skip-browser-warning': 'true'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const data = await response.json();
        currentDevices = data;
        fetchFailures = 0;
        renderDevices();
    } catch (error) {
        fetchFailures++;
        console.error('Fetch error:', error);

        let title = "Akses Ditolak";
        let errorMessage = "Anda harus terhubung ke jaringan Wi-Fi lokal untuk melihat daftar perangkat.";

        if (error.message && (error.message.includes("loading") || error.message.includes("mengambil data"))) {
            title = "Gagal Memuat Data";
            errorMessage = error.message;
        }

        const list = document.getElementById('devices-list');
        if (list) {
            list.innerHTML = `
                <div class="${cn('p-8 text-center flex flex-col items-center justify-center gap-4 neu-inset')}">
                    <div class="${cn('w-16 h-16 rounded-full flex items-center justify-center text-error neu-circle')}">
                        <span class="material-symbols-outlined text-[36px]">&#xe648;</span>
                    </div>
                    <h3 class="font-bold text-lg text-text-primary">${title}</h3>
                    <p class="text-text-muted text-sm">${errorMessage}</p>
                </div>
            `;
        }
    }
}

function getDeviceIcon(iconName) {
    const map = {
        'smartphone': '&#xe32c;',
        'laptop': '&#xe31e;',
        'tablet': '&#xe32f;',
        'desktop': '&#xe30c;',
        'tv': '&#xe333;',
        'gamepad': '&#xe338;'
    };
    return map[iconName] || '&#xe32c;';
}

function renderDevices() {
    const list = document.getElementById('devices-list');
    if (!list) return;

    if (currentDevices.length === 0) {
        list.innerHTML = `<div class="${cn('p-8 text-center text-sm text-text-muted font-medium neu-inset rounded-2xl')}">Belum ada perangkat terhubung.</div>`;
        return;
    }

    list.innerHTML = '';

    currentDevices.forEach((dev) => {
        let currentDown = "Tidak Terdeteksi";
        let currentUp = "Tidak Terdeteksi";

        if (dev.baseDown && dev.baseDown > 0) {
            const jitterDown = (Math.random() * 5) - 2;
            const jitterUp = (Math.random() * 1) - 0.5;
            currentDown = `${Math.max(0, dev.baseDown + jitterDown).toFixed(1)} Kbps`;
            currentUp = `${Math.max(0, dev.baseUp + jitterUp).toFixed(1)} Kbps`;
        }

        const statusClass = cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider');
        const statusLabel = `<span class="${statusClass}" style="background: rgba(16,185,129,0.12); color: #059669;">Aktif</span>`;

        const row = document.createElement('div');
        row.className = cn('flex items-center justify-between gap-3 p-3 md:p-4 neu-card-sm transition-all');
        row.innerHTML = `
            <div class="flex items-center gap-3 md:gap-4 min-w-0">
                <div class="${cn('w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center text-primary neu-circle')}">
                    <span class="material-symbols-outlined text-[20px] md:text-[24px]">${getDeviceIcon(dev.icon)}</span>
                </div>
                <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <p class="font-bold text-xs md:text-sm text-text-primary truncate max-w-[120px] xs:max-w-none">${dev.name}</p>
                        ${statusLabel}
                    </div>
                    <p class="text-[10px] md:text-xs text-text-muted font-mono mt-0.5 break-all">IP: ${dev.ip || '-'} | MAC: ${dev.mac || '-'}</p>
                </div>
            </div>
            <div class="flex flex-col items-end gap-1 text-[10px] md:text-xs font-semibold shrink-0">
                <div class="flex items-center gap-1 text-cyan-accent">
                    <span class="material-symbols-outlined text-[14px]">&#xe5db;</span>
                    <span class="text-right">${currentDown}</span>
                </div>
                <div class="flex items-center gap-1 text-secondary">
                    <span class="material-symbols-outlined text-[14px]">&#xe5d8;</span>
                    <span class="text-right">${currentUp}</span>
                </div>
            </div>
        `;
        list.appendChild(row);
    });
}

// ponytail: backoff to 15s after 3 consecutive failures; upgrade to WebSocket/SSE if router supports live push
function schedulePoll() {
    if (pollingTimeout) clearTimeout(pollingTimeout);
    const delay = fetchFailures >= 3 ? 15000 : 2000;
    pollingTimeout = setTimeout(async () => {
        await fetchDevices();
        schedulePoll();
    }, delay);
}

async function initPerangkat() {
    await fetchDevices();
    schedulePoll();
}

function setupSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const btnSettings = document.getElementById('btn-settings');
    const btnClose = document.getElementById('btn-close-settings');
    const btnSave = document.getElementById('btn-save-api');
    const btnReset = document.getElementById('btn-reset-api');
    const inputApiUrl = document.getElementById('input-api-url');
    const textCurrentUrl = document.getElementById('text-current-api-url');
    const btnToggleVisibility = document.getElementById('btn-toggle-visibility');
    const iconVisibility = document.getElementById('icon-visibility');

    function updateCurrentUrlDisplay() {
        let apiHost = localStorage.getItem('wifi_backend_api_url');
        const isCustom = !!apiHost;
        if (!apiHost) {
            const defaultApiHost = (typeof wifiConfig !== 'undefined' && wifiConfig.apiHost) ? wifiConfig.apiHost : '';
            apiHost = window.location.protocol === 'file:' ? 'http://192.168.1.2:3000' : defaultApiHost;
        }

        let maskedUrl = apiHost;
        if (apiHost) {
            try {
                const u = new URL(apiHost);
                const protocol = u.protocol + '//';
                const host = u.hostname;
                const parts = host.split('.');
                if (parts.length >= 2) {
                    const sub = parts[0];
                    const domain = parts.slice(1).join('.');
                    if (sub.length > 5) {
                        maskedUrl = protocol + sub.slice(0, 5) + '***' + sub.slice(-2) + '.' + domain;
                    } else {
                        maskedUrl = protocol + sub.slice(0, 2) + '***.' + domain;
                    }
                }
            } catch (e) {
                if (apiHost.length > 12) {
                    maskedUrl = apiHost.slice(0, 8) + '***' + apiHost.slice(-4);
                }
            }
        } else {
            maskedUrl = 'Vercel Secure Proxy';
        }

        if (textCurrentUrl) {
            textCurrentUrl.textContent = maskedUrl + (isCustom ? ' (Kustom)' : ' (Default)');
        }
    }

    if (btnSettings && modal) {
        btnSettings.addEventListener('click', () => {
            if (inputApiUrl) inputApiUrl.value = localStorage.getItem('wifi_backend_api_url') || '';
            updateCurrentUrlDisplay();
            modal.classList.remove('hidden');
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });
    }

    if (btnToggleVisibility && inputApiUrl) {
        btnToggleVisibility.addEventListener('click', () => {
            if (inputApiUrl.type === 'password') {
                inputApiUrl.type = 'text';
                if (iconVisibility) iconVisibility.innerHTML = '&#xe8f5;';
            } else {
                inputApiUrl.type = 'password';
                if (iconVisibility) iconVisibility.innerHTML = '&#xe8f4;';
            }
        });
    }

    if (btnSave && modal) {
        btnSave.addEventListener('click', () => {
            let url = inputApiUrl ? inputApiUrl.value.trim() : '';
            if (url) {
                if (!/^https?:\/\//i.test(url)) {
                    url = 'https://' + url;
                }
                if (url.endsWith('/')) url = url.slice(0, -1);
                localStorage.setItem('wifi_backend_api_url', url);
            } else {
                localStorage.removeItem('wifi_backend_api_url');
            }
            fetchFailures = 0;
            modal.classList.add('hidden');
            fetchDevices().then(() => schedulePoll());
        });
    }

    if (btnReset && modal) {
        btnReset.addEventListener('click', () => {
            localStorage.removeItem('wifi_backend_api_url');
            if (inputApiUrl) inputApiUrl.value = '';
            fetchFailures = 0;
            modal.classList.add('hidden');
            fetchDevices().then(() => schedulePoll());
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initPerangkat();
        setupSettingsModal();
    });
} else {
    initPerangkat();
    setupSettingsModal();
}
