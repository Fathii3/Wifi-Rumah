// Logika Khusus Halaman Beranda (QR Code, Password, Modal, Logo)

let isWifiConfigLoaded = false;
let isPasswordVisible = false;
let qrCodeStylingInstance = null;

async function initWifiConfig() {
    if (isWifiConfigLoaded) return;
    isWifiConfigLoaded = true;

    let ssid, password, encryption;

    if (window.location.protocol !== 'file:') {
        try {
            const res = await fetch('/api/wifi-config');
            if (res.ok) {
                const data = await res.json();
                ssid = data.ssid;
                password = data.password;
                encryption = data.encryption;
            }
        } catch (e) {
            console.error("Gagal memuat konfigurasi Wi-Fi dari API Vercel:", e);
        }
    }

    if (!ssid && typeof wifiConfig !== 'undefined') {
        ssid = wifiConfig.ssid;
        password = wifiConfig.password;
        encryption = wifiConfig.encryption;
    }

    if (ssid) {
        const nameEl = document.getElementById('wifi-name-display');
        if (nameEl) nameEl.innerText = ssid;
        window.wifiSSID = ssid;
        window.wifiPassword = password;

        const wifiString = `WIFI:S:${ssid};T:${encryption};P:${password};;`;
        renderStyledQR(wifiString);
    }
}

function renderStyledQR(wifiString) {
    const container = document.getElementById('qrcode');
    if (!container) return;
    container.innerHTML = "";

    if (typeof QRCodeStyling !== 'undefined') {
        qrCodeStylingInstance = new QRCodeStyling({
            width: 150,
            height: 150,
            type: "canvas",
            data: wifiString,
            qrOptions: { errorCorrectionLevel: 'H' },
            dotsOptions: {
                type: "extra-rounded",
                color: "#2d3748"
            },
            cornersSquareOptions: {
                type: "extra-rounded",
                color: "#2d3748"
            },
            cornersDotOptions: {
                type: "dot",
                color: "#4f46e5"
            },
            backgroundOptions: {
                color: "#ffffff"
            }
        });
        qrCodeStylingInstance.append(container);
    } else if (typeof QRCode !== 'undefined') {
        new QRCode(container, {
            text: wifiString,
            width: 150,
            height: 150,
            colorDark: "#2d3748",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

function togglePasswordVisibility() {
    const display = document.getElementById('wifi-password-display');
    const eye = document.getElementById('pwd-eye');
    isPasswordVisible = !isPasswordVisible;

    if (isPasswordVisible) {
        if (display) display.innerText = window.wifiPassword || '';
        if (eye) eye.innerHTML = '&#xe8f5;';
    } else {
        if (display) display.innerText = '********';
        if (eye) eye.innerHTML = '&#xe8f4;';
    }
}

let pendingAction = null;

function verifyAction(actionType) {
    pendingAction = actionType;
    const verifyTitle = document.getElementById('verify-title');
    const verifyText = document.getElementById('verify-text');
    const popup = document.getElementById('verify-popup');

    if (actionType === 'scanner') {
        if (verifyTitle) verifyTitle.innerText = "Buka Scanner?";
        if (verifyText) verifyText.innerText = "Pastikan Anda sudah menyimpan QR Code ke galeri. Jika sudah, silakan Lanjut untuk membuka Google Lens/Scanner.";
    } else if (actionType === 'wifi') {
        if (verifyTitle) verifyTitle.innerText = "Buka Pengaturan Wi-Fi?";
        if (verifyText) verifyText.innerText = "Pastikan Anda sudah menyalin kata sandi agar bisa ditempel. Lanjut untuk membuka pengaturan jaringan.";
    }

    if (popup) popup.classList.remove('hidden');
}

function closeVerifyPopup() {
    const popup = document.getElementById('verify-popup');
    if (popup) popup.classList.add('hidden');
    pendingAction = null;
}

function proceedAction() {
    const popup = document.getElementById('verify-popup');
    if (popup) popup.classList.add('hidden');
    if (pendingAction === 'scanner') {
        executeScanner();
    } else if (pendingAction === 'wifi') {
        executeWifiSettings();
    }
    pendingAction = null;
}

function showAlert(title, message) {
    const titleEl = document.getElementById('alert-title');
    const msgEl = document.getElementById('alert-msg');
    const popup = document.getElementById('alert-popup');

    if (titleEl) titleEl.innerText = title;
    if (msgEl) msgEl.innerText = message;
    if (popup) popup.classList.remove('hidden');
}

let isCopyingPassword = false;
async function copyPassword() {
    if (!window.wifiPassword || isCopyingPassword) return;
    isCopyingPassword = true;

    const success = await copyToClipboard(window.wifiPassword);
    if (success) {
        const btn = document.getElementById('copy-btn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">&#xe5ca;</span> Tersalin!';
            btn.className = cn(btn.className, 'bg-success text-white');
            btn.style.background = '#10b981';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.className = cn(btn.className.replace(/\bbg-success\b|\btext-white\b/g, '').trim());
                btn.style.background = '';
                isCopyingPassword = false;
            }, 2000);
        } else {
            isCopyingPassword = false;
        }
    } else {
        isCopyingPassword = false;
        showAlert("Gagal", "Gagal menyalin kata sandi. Silakan salin manual.");
    }
}

function downloadQR() {
    if (qrCodeStylingInstance) {
        qrCodeStylingInstance.download({
            name: `Wi-Fi_QR_${(window.wifiSSID || 'Rumah').replace(/[^a-zA-Z0-9]/g, '_')}`,
            extension: "png"
        });
    } else {
        const qrCanvas = document.querySelector('#qrcode canvas');
        if (qrCanvas) {
            const padding = 20;
            const newCanvas = document.createElement('canvas');
            newCanvas.width = qrCanvas.width + (padding * 2);
            newCanvas.height = qrCanvas.height + (padding * 2);

            const ctx = newCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.drawImage(qrCanvas, padding, padding);

            const link = document.createElement('a');
            link.download = `Wi-Fi_QR_${(window.wifiSSID || 'Rumah').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
            link.href = newCanvas.toDataURL("image/png");
            link.click();
        } else {
            showAlert("Error", "Gagal mengunduh QR Code. Silakan screenshot layar ini.");
        }
    }
}

function executeWifiSettings() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/android/i.test(ua)) {
        window.location.href = "intent:#Intent;action=android.settings.WIFI_SETTINGS;end";
    } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        showAlert("Pengaturan Wi-Fi", "Buka menu Pengaturan > Wi-Fi pada perangkat iOS Anda untuk menyambung.");
    } else {
        showAlert("Tidak Didukung", "Fitur buka pengaturan otomatis hanya tersedia di HP Android.");
    }
}

function executeScanner() {
    showAlert("Info Google Lens", "Membuka Google... Silakan ketuk ikon Kamera (Lens) untuk memindai gambar QR.");
    setTimeout(() => {
        window.location.href = "https://www.google.com";
    }, 2500);
}

// Logo Skeleton Loading Handlers
function handleLogoLoaded(img) {
    if (!img) return;
    img.className = cn(img.className.replace(/\bopacity-0\b/g, '').trim(), 'opacity-100');
    const skeleton = document.getElementById('logo-skeleton');
    if (skeleton) {
        skeleton.className = cn(skeleton.className, 'opacity-0 pointer-events-none');
        setTimeout(() => {
            if (skeleton) skeleton.style.display = 'none';
        }, 350);
    }
}

function handleLogoError(img) {
    const skeleton = document.getElementById('logo-skeleton');
    if (skeleton) {
        skeleton.innerHTML = '<span class="material-symbols-outlined text-primary text-3xl">&#xe63e;</span>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logo = document.getElementById('logo-img');
    if (logo && logo.complete && logo.naturalHeight !== 0) {
        handleLogoLoaded(logo);
    }
});
