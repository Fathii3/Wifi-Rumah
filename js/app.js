// Logika Global: Deteksi ISP, Kontrol Akses & Navigasi

// Deteksi Provider ISP
function formatISPName(rawName) {
    if (!rawName) return "Jaringan Lokal";
    let cleaned = rawName.replace(/^IDNIC-[^\s]+ - /i, '').replace(/^AS\d+ /i, '').trim();
    const name = cleaned.toLowerCase();

    if (name.includes("telekomunikasi selular") || name.includes("telkomsel")) return "Telkomsel";
    if (name.includes("telekomunikasi indonesia") || name.includes("telkom indonesia")) return "IndiHome (Telkom)";
    if (name.includes("eka mas republik") || name.includes("myrepublic")) return "MyRepublic";
    if (name.includes("cyberindo aditama") || name.includes("cbn")) return "CBN";
    if (name.includes("xl axiata")) return "XL / Axis";
    if (name.includes("hutchison") || name.includes("indosat")) return "Indosat Ooredoo Hutchison";
    if (name.includes("supra primatama") || name.includes("biznet")) return "Biznet";
    if (name.includes("mora telematika")) return "Oxygen.id";
    if (name.includes("first media") || name.includes("link net")) return "First Media";
    if (name.includes("mnc kabel") || name.includes("mnc play")) return "MNC Play";
    if (name.includes("smartfren")) return "Smartfren";
    if (name.includes("indonesia comnets plus") || name.includes("icon")) return "ICONNET";

    return cleaned || rawName;
}

async function detectISP() {
    const ispElements = document.querySelectorAll('.isp-name-display');
    const cityElements = document.querySelectorAll('.isp-city-display');

    const removeSkeleton = (el) => {
        el.className = cn(el.className.replace(/\banimate-pulse\b|\bbg-\S+|\bh-\d+\b|\bw-\d+\b/g, '').trim());
    };

    try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();

        if (data.success) {
            const ispName = formatISPName(data.connection.isp || data.connection.org || "Jaringan Lokal");
            const cityName = data.city || "Lokasi Tidak Diketahui";
            ispElements.forEach(el => { removeSkeleton(el); el.innerText = ispName; });
            cityElements.forEach(el => { removeSkeleton(el); el.innerText = cityName; });
        } else {
            throw new Error("API ISP error");
        }
    } catch (error) {
        ispElements.forEach(el => { removeSkeleton(el); el.innerText = "Tidak Terdeteksi"; });
        cityElements.forEach(el => { removeSkeleton(el); el.innerText = "-"; });
    }
}

function isHomePage() {
    const path = window.location.pathname;
    return path === '' || path === '/' || path.endsWith('/index.html') || path.endsWith('/index') || path.endsWith('index.html');
}

function isSpeedPage() {
    const path = window.location.pathname;
    return path.endsWith('/kecepatan.html') || path.endsWith('kecepatan.html');
}

// Logika Akses & Blokir 1 Hari
let blockedTimerInterval = null;

function startBlockedCountdown(blockedTimestamp) {
    if (blockedTimerInterval) clearInterval(blockedTimerInterval);

    const timerElement = document.getElementById('blocked-timer');
    if (!timerElement) return;

    function updateTimer() {
        const now = Date.now();
        const blockDuration = 86400000;
        const expiryTime = parseInt(blockedTimestamp, 10) + blockDuration;
        const timeLeft = expiryTime - now;

        if (timeLeft <= 0) {
            clearInterval(blockedTimerInterval);
            blockedTimerInterval = null;
            localStorage.removeItem('wifi_access_status');
            localStorage.removeItem('wifi_access_time');
            checkAccessStatus();
            return;
        }

        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        timerElement.innerHTML = `Silakan coba lagi dalam <strong class="text-error font-bold">${hours} jam ${minutes} menit ${seconds} detik</strong><br>atau hubungi pemilik rumah secara langsung.`;
    }

    updateTimer();
    blockedTimerInterval = setInterval(updateTimer, 1000);
}

function checkAccessStatus() {
    // Halaman kecepatan bebas diakses tanpa perijinan
    if (isSpeedPage()) return;

    const status = localStorage.getItem('wifi_access_status');
    const timestamp = localStorage.getItem('wifi_access_time');

    if (timestamp) {
        const now = Date.now();
        const diff = now - parseInt(timestamp, 10);
        if (diff > 86400000) {
            localStorage.removeItem('wifi_access_status');
            localStorage.removeItem('wifi_access_time');
            if (blockedTimerInterval) {
                clearInterval(blockedTimerInterval);
                blockedTimerInterval = null;
            }
            if (!isHomePage()) {
                window.location.href = 'index.html';
            }
            return;
        }
    }

    const screenIntro = document.getElementById('screen-intro');
    const screenBeranda = document.getElementById('screen-beranda');
    const screenBlocked = document.getElementById('screen-blocked');

    const isGranted = status === 'granted';
    const isBlocked = status === 'blocked';
    const isIntro = !isGranted && !isBlocked;

    if (isBlocked && blockedTimerInterval === null && timestamp) {
        startBlockedCountdown(timestamp);
    } else if (!isBlocked && blockedTimerInterval) {
        clearInterval(blockedTimerInterval);
        blockedTimerInterval = null;
    }

    if (!isHomePage() && !isGranted) {
        window.location.href = 'index.html';
        return;
    }

    if (screenIntro) screenIntro.classList.toggle('hidden', !isIntro);
    if (screenBeranda) screenBeranda.classList.toggle('hidden', !isGranted);
    if (screenBlocked) screenBlocked.classList.toggle('hidden', !isBlocked);

    if (isGranted && typeof initWifiConfig === 'function') {
        initWifiConfig();
    }
}

let isProcessingContinue = false;
function handleContinue() {
    if (isProcessingContinue) return;
    isProcessingContinue = true;

    const modal = document.getElementById('modal-container');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    const spinner = document.getElementById('modal-spinner');
    const content = document.getElementById('modal-content');

    const existingActions = document.getElementById('modal-actions');
    if (existingActions) existingActions.remove();

    if (modal) modal.classList.remove('hidden');
    if (spinner) spinner.classList.remove('hidden');
    if (title) title.innerText = "Memproses Izin...";
    if (text) text.innerText = "Sedang memeriksa status perangkat Anda di jaringan Keluarga Pak Harun.";

    setTimeout(() => {
        isProcessingContinue = false;
        if (spinner) spinner.classList.add('hidden');
        if (title) title.innerText = "Izin Penggunaan";
        if (text) text.innerText = "Apakah Anda sudah meminta izin memakai Wi-Fi ini kepada pemilik rumah?";

        const actions = document.createElement('div');
        actions.id = "modal-actions";
        actions.className = cn("flex gap-3 mt-2");
        actions.innerHTML = `
            <button onclick="blockAccess()" class="${cn('flex-1 neu-btn-ghost text-error py-3 rounded-xl font-semibold text-sm')}">Belum</button>
            <button onclick="grantAccess()" class="${cn('flex-1 neu-btn-primary py-3 rounded-xl font-semibold text-sm')}">Sudah</button>
        `;
        if (content) content.appendChild(actions);
    }, 1500);
}

function grantAccess() {
    localStorage.setItem('wifi_access_status', 'granted');
    localStorage.setItem('wifi_access_time', Date.now().toString());
    const modal = document.getElementById('modal-container');
    if (modal) modal.classList.add('hidden');
    checkAccessStatus();
}

function blockAccess() {
    localStorage.setItem('wifi_access_status', 'blocked');
    localStorage.setItem('wifi_access_time', Date.now().toString());
    const modal = document.getElementById('modal-container');
    if (modal) modal.classList.add('hidden');
    checkAccessStatus();
}

// Active Navbar Sync dengan cn
function updateActiveNav() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const target = btn.getAttribute('href');
        if (!target) return;

        const isActive = currentPath.includes(target) || (target === 'index.html' && (currentPath.endsWith('/') || currentPath === ''));

        btn.className = cn(
            'nav-btn neu-nav-item flex flex-col items-center justify-center p-2 transition-all cursor-pointer',
            isActive ? 'text-primary scale-110 active' : 'text-text-muted hover:text-primary'
        );

        const icon = btn.querySelector('span:first-child');
        if (icon) {
            icon.style.fontVariationSettings = isActive ? "'FILL' 1" : "'FILL' 0";
        }
    });
}

// Inisialisasi Aplikasi
function initApp() {
    checkAccessStatus();
    updateActiveNav();
    detectISP();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
