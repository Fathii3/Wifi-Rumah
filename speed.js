// speed.js - Logika Pengukur Kecepatan (Speed Test)

let isTesting = false;
let animationFrameId = null;
let currentDisplayedSpeed = 0;
let targetSpeed = 0;

function animateSpeed() {
    // Smoothly interpolate between current displayed speed and the real target speed
    if (Math.abs(currentDisplayedSpeed - targetSpeed) > 0.1) {
        // Move towards target speed per frame for a smooth "web2" speedometer effect
        currentDisplayedSpeed += (targetSpeed - currentDisplayedSpeed) * 0.1;
        const speedResult = document.getElementById('speed-result');
        speedResult.innerHTML = `${currentDisplayedSpeed.toFixed(1)} <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
        animationFrameId = requestAnimationFrame(animateSpeed);
    } else {
        currentDisplayedSpeed = targetSpeed;
        document.getElementById('speed-result').innerHTML = `${currentDisplayedSpeed.toFixed(1)} <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
        animationFrameId = requestAnimationFrame(animateSpeed);
    }
}

function startSpeedTest() {
    if (isTesting) return;
    isTesting = true;

    const speedResult = document.getElementById('speed-result');
    const pingResult = document.getElementById('ping-result');
    const btn = document.getElementById('start-speed-btn');

    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-anim"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.2l-5.67-5.67"/></svg> Menguji...';
    
    targetSpeed = 0;
    currentDisplayedSpeed = 0;
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(animateSpeed);
    }

    pingResult.innerHTML = 'Ping: Menguji...';

    // Tahap 1: Ping (Latensi)
    const pingStart = Date.now();
    fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store' })
        .then(response => {
            const pingTime = Date.now() - pingStart;
            pingResult.innerHTML = `Ping: ${pingTime} ms`;
            testDownloadSpeed();
        })
        .catch(err => {
            pingResult.innerHTML = `Ping: Gagal`;
            testDownloadSpeed();
        });
}

function testDownloadSpeed() {
    const btn = document.getElementById('start-speed-btn');
    
    // Endpoint pengujian unduh (Payload 15MB dari CDN global untuk speed test)
    const downloadUrl = "https://speed.cloudflare.com/__down?bytes=15000000&nocache=" + Math.random();
    const startTime = Date.now();
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", downloadUrl, true);
    xhr.responseType = "blob";

    xhr.onprogress = function(event) {
        if (event.lengthComputable) {
            const currentTime = Date.now();
            const durationInSeconds = (currentTime - startTime) / 1000;
            if (durationInSeconds > 0.1) {
                const loadedBits = event.loaded * 8;
                const bps = loadedBits / durationInSeconds;
                // Update target speed, animation loop will catch up
                targetSpeed = bps / 1024 / 1024;
            }
        }
    };

    xhr.onload = function() {
        finishSpeedTest(xhr.response.size);
    };

    xhr.onerror = function() {
        targetSpeed = 0;
        isTesting = false;
        resetBtn();
        document.getElementById('speed-result').innerHTML = `Error <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
    };
    
    function finishSpeedTest(finalSize) {
        const currentTime = Date.now();
        const durationInSeconds = (currentTime - startTime) / 1000;
        const sizeInBits = finalSize * 8;
        targetSpeed = sizeInBits / durationInSeconds / 1024 / 1024;
        
        // Beri waktu 500ms agar animasi mencapai angka final lalu hentikan
        setTimeout(() => {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            document.getElementById('speed-result').innerHTML = `${targetSpeed.toFixed(1)} <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
            isTesting = false;
            resetBtn();
        }, 500);
    }

    function resetBtn() {
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Ulangi Tes';
    }

    xhr.send();
}
