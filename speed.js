// speed.js - Logika Pengukur Kecepatan (Speed Test)

let isTesting = false;
let animationFrameId = null;
let currentDisplayedSpeed = 0;
let targetSpeed = 0;
let pingTimeoutId = null;

function animateSpeed() {
    // Interpolasi halus
    if (Math.abs(currentDisplayedSpeed - targetSpeed) > 0.1) {
        currentDisplayedSpeed += (targetSpeed - currentDisplayedSpeed) * 0.1;
    } else {
        // Tambahkan efek getaran halus (jitter) jika sedang tes
        if (isTesting && targetSpeed > 0) {
            currentDisplayedSpeed = targetSpeed + (Math.random() * 0.2 - 0.1);
        } else {
            currentDisplayedSpeed = targetSpeed;
        }
    }
    
    if (currentDisplayedSpeed < 0) currentDisplayedSpeed = 0;

    document.getElementById('speed-result').innerHTML = `${currentDisplayedSpeed.toFixed(1)} <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
    animationFrameId = requestAnimationFrame(animateSpeed);
}

function startPingLoop() {
    if (!isTesting) return;
    const pingStart = Date.now();
    fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store', mode: 'no-cors' })
        .then(() => {
            if (!isTesting) return;
            const pingTime = Date.now() - pingStart;
            document.getElementById('ping-result').innerHTML = `Ping: ${pingTime} ms`;
            pingTimeoutId = setTimeout(startPingLoop, 500); // Cek ping setiap 500ms
        })
        .catch(() => {
            if (!isTesting) return;
            pingTimeoutId = setTimeout(startPingLoop, 500);
        });
}

function startSpeedTest() {
    if (isTesting) return;
    isTesting = true;

    const btn = document.getElementById('start-speed-btn');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-anim"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.2l-5.67-5.67"/></svg> Menguji...';
    
    targetSpeed = 0;
    currentDisplayedSpeed = 0;
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateSpeed);
    }

    document.getElementById('ping-result').innerHTML = 'Ping: Menguji...';

    // Mulai loop ping real-time
    startPingLoop();
    
    // Mulai tes download langsung
    testDownloadSpeed();
}

function testDownloadSpeed() {
    const btn = document.getElementById('start-speed-btn');
    
    // Perbesar ukuran payload (50MB) agar tes tidak selesai secara instan di jaringan cepat
    // Sehingga animasi real-time punya waktu untuk berjalan
    const downloadUrl = "https://speed.cloudflare.com/__down?bytes=50000000&nocache=" + Math.random();
    const startTime = Date.now();
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", downloadUrl, true);
    xhr.responseType = "blob";

    let lastLoaded = 0;
    let lastTime = startTime;
    let testTimeout = null;

    xhr.onprogress = function(event) {
        const currentTime = Date.now();
        const timeDiff = (currentTime - lastTime) / 1000;
        
        // Evaluasi pergerakan kecepatan setiap 100ms
        if (timeDiff >= 0.1) {
            const bytesDiff = event.loaded - lastLoaded;
            if (bytesDiff > 0) {
                const bps = (bytesDiff * 8) / timeDiff;
                targetSpeed = bps / 1024 / 1024;
            }
            
            lastLoaded = event.loaded;
            lastTime = currentTime;
        }
    };

    xhr.onload = function(event) {
        finishSpeedTest(event.loaded);
    };

    xhr.onerror = function() {
        finishSpeedTest(lastLoaded, true);
    };
    
    // Paksa tes selesai dalam 6 detik untuk mencegah tes berjalan terlalu lama
    testTimeout = setTimeout(() => {
        if (isTesting) {
            xhr.abort(); // Berhenti mengunduh
            finishSpeedTest(lastLoaded);
        }
    }, 6000);
    
    function finishSpeedTest(finalBytes, isError = false) {
        clearTimeout(testTimeout);
        
        if (isError && finalBytes === 0) {
            targetSpeed = 0;
            isTesting = false;
            clearTimeout(pingTimeoutId);
            resetBtn();
            document.getElementById('speed-result').innerHTML = `Error <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
            return;
        }

        const currentTime = Date.now();
        const durationInSeconds = (currentTime - startTime) / 1000;
        const sizeInBits = finalBytes * 8;
        
        // Kecepatan akhir rata-rata agar hasil lebih konklusif
        const finalSpeed = sizeInBits / durationInSeconds / 1024 / 1024;
        targetSpeed = finalSpeed;
        
        // Beri waktu sejenak (500ms) untuk animasi mendarat ke angka akhir sebelum dimatikan
        setTimeout(() => {
            isTesting = false;
            clearTimeout(pingTimeoutId);
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            document.getElementById('speed-result').innerHTML = `${finalSpeed.toFixed(1)} <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
            resetBtn();
        }, 500);
    }

    function resetBtn() {
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Ulangi Tes';
    }

    xhr.send();
}
