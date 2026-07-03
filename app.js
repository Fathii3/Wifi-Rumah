// ==========================================
// DETEKSI PROVIDER ISP
// ==========================================
function formatISPName(rawName) {
    if (!rawName) return "Jaringan Lokal";
    const name = rawName.toLowerCase();
    
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
    
    // Kembalikan nama aslinya jika tidak masuk daftar di atas
    return rawName;
}

async function detectISP() {
    const ispElements = document.querySelectorAll('.isp-name-display');
    const cityElements = document.querySelectorAll('.isp-city-display');
    
    const removeSkeleton = (el) => {
        el.classList.remove('animate-pulse', 'bg-black/10', 'bg-primary/20', 'h-4', 'h-5', 'w-20', 'w-24', 'w-28', 'inline-block', 'rounded', 'mt-1');
    };

    try {
        const response = await fetch('https://ipwho.is/');
        const data = await response.json();
        
        if (data.success) {
            let ispName = data.connection.isp || data.connection.org || "Jaringan Lokal";
            ispName = formatISPName(ispName);
            
            const cityName = data.city || "Lokasi Tidak Diketahui";
            ispElements.forEach(el => { removeSkeleton(el); el.innerText = ispName; });
            cityElements.forEach(el => { removeSkeleton(el); el.innerText = cityName; });
        } else {
            throw new Error("API tidak berhasil merespons data ISP.");
        }
    } catch (error) {
        console.log("Gagal mendeteksi ISP:", error);
        ispElements.forEach(el => { removeSkeleton(el); el.innerText = "Tidak Terdeteksi"; });
        cityElements.forEach(el => { removeSkeleton(el); el.innerText = "-"; });
    }
}

// ==========================================
// LOGIKA AKSES & BLOKIR 1 HARI
// ==========================================
let blockedTimerInterval = null;

function startBlockedCountdown(blockedTimestamp) {
    if (blockedTimerInterval) clearInterval(blockedTimerInterval);
    
    const timerElement = document.getElementById('blocked-timer');
    if (!timerElement) return;

    function updateTimer() {
        const now = Date.now();
        const blockDuration = 86400000; // 24 Jam
        const expiryTime = parseInt(blockedTimestamp) + blockDuration;
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
    const status = localStorage.getItem('wifi_access_status');
    const timestamp = localStorage.getItem('wifi_access_time');
    
    // Cek masa berlaku 1 hari (24 * 60 * 60 * 1000 = 86400000 ms)
    if (timestamp) {
        const now = Date.now();
        const diff = now - parseInt(timestamp);
        if (diff > 86400000) {
            localStorage.removeItem('wifi_access_status');
            localStorage.removeItem('wifi_access_time');
            if (blockedTimerInterval) {
                clearInterval(blockedTimerInterval);
                blockedTimerInterval = null;
            }
            // Redirect to intro if not already there
            if (!window.location.href.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                window.location.href = 'index.html';
            }
            return;
        }
    }

    if (status === 'granted') {
        if (blockedTimerInterval) {
            clearInterval(blockedTimerInterval);
            blockedTimerInterval = null;
        }
        // Hide intro/blocked screens if on index.html
        if (document.getElementById('screen-intro')) document.getElementById('screen-intro').classList.add('hidden');
        if (document.getElementById('screen-blocked')) document.getElementById('screen-blocked').classList.add('hidden');
        if (document.getElementById('screen-beranda')) document.getElementById('screen-beranda').classList.remove('hidden');
        
        // Panggil inisialisasi konfigurasi Wi-Fi jika ada di halaman utama (index.html)
        if (typeof initWifiConfig === 'function') {
            initWifiConfig();
        }
        
    } else if (status === 'blocked') {
        // If not on index.html, redirect back to index.html to see the blocked screen
        if (!window.location.href.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        } else {
            if (document.getElementById('screen-intro')) document.getElementById('screen-intro').classList.add('hidden');
            if (document.getElementById('screen-beranda')) document.getElementById('screen-beranda').classList.add('hidden');
            if (document.getElementById('screen-blocked')) document.getElementById('screen-blocked').classList.remove('hidden');
            startBlockedCountdown(timestamp);
        }
    } else {
        if (blockedTimerInterval) {
            clearInterval(blockedTimerInterval);
            blockedTimerInterval = null;
        }
        // No status, must be on intro
        if (!window.location.href.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
        } else {
            if (document.getElementById('screen-intro')) document.getElementById('screen-intro').classList.remove('hidden');
            if (document.getElementById('screen-beranda')) document.getElementById('screen-beranda').classList.add('hidden');
            if (document.getElementById('screen-blocked')) document.getElementById('screen-blocked').classList.add('hidden');
        }
    }
}

function handleContinue() {
    const modal = document.getElementById('modal-container');
    const title = document.getElementById('modal-title');
    const text = document.getElementById('modal-text');
    const spinner = document.getElementById('modal-spinner');
    const content = document.getElementById('modal-content');
    
    const existingActions = document.getElementById('modal-actions');
    if(existingActions) existingActions.remove();

    modal.classList.remove('hidden');
    spinner.classList.remove('hidden');
    title.innerText = "Memproses Izin...";
    text.innerText = "Sedang memeriksa status perangkat Anda di jaringan Keluarga Pak Harun.";
    
    setTimeout(() => {
        spinner.classList.add('hidden');
        title.innerText = "Izin Penggunaan";
        text.innerText = "Apakah Anda sudah meminta izin memakai Wi-Fi ini kepada pemilik rumah?";
        
        const actions = document.createElement('div');
        actions.id = "modal-actions";
        actions.className = "flex gap-3 mt-2";
        actions.innerHTML = `
            <button onclick="blockAccess()" class="flex-1 bg-error-container text-on-error-container py-3 rounded-xl font-semibold text-sm hover:brightness-95 transition-all">Belum</button>
            <button onclick="grantAccess()" class="flex-1 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-lg shadow-primary/20">Sudah</button>
        `;
        content.appendChild(actions);
    }, 1500);
}

function grantAccess() {
    localStorage.setItem('wifi_access_status', 'granted');
    localStorage.setItem('wifi_access_time', Date.now().toString());
    document.getElementById('modal-container').classList.add('hidden');
    checkAccessStatus();
}

function blockAccess() {
    localStorage.setItem('wifi_access_status', 'blocked');
    localStorage.setItem('wifi_access_time', Date.now().toString());
    document.getElementById('modal-container').classList.add('hidden');
    checkAccessStatus();
}

// ==========================================
// ACTIVE NAVBAR SYNC
// ==========================================
function updateActiveNav() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const target = btn.getAttribute('href');
        if (!target) return;
        
        // Simple logic to highlight active tab
        if (currentPath.includes(target) || (target === 'index.html' && currentPath.endsWith('/'))) {
            btn.classList.add('text-primary', 'scale-110');
            btn.classList.remove('text-on-surface-variant');
            const icon = btn.querySelector('span:first-child');
            if(icon) icon.style.fontVariationSettings = "'FILL' 1";
        } else {
            btn.classList.remove('text-primary', 'scale-110');
            btn.classList.add('text-on-surface-variant');
            const icon = btn.querySelector('span:first-child');
            if(icon) icon.style.fontVariationSettings = "'FILL' 0";
        }
    });
}

// ==========================================
// RUN ON LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    checkAccessStatus();
    updateActiveNav();
    detectISP();
});
