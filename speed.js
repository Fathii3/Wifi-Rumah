// speed.js - Logika Pengukur Kecepatan (Speed Test)
let isTesting = false;
let animationFrameId = null;
let currentDisplayedSpeed = 0;
let targetSpeed = 0;
let pingTimeoutId = null;

function animateSpeed() {
    if (Math.abs(currentDisplayedSpeed - targetSpeed) > 0.1) {
        currentDisplayedSpeed += (targetSpeed - currentDisplayedSpeed) * 0.1;
    } else {
        currentDisplayedSpeed = isTesting && targetSpeed > 0 ? targetSpeed + (Math.random() * 0.2 - 0.1) : targetSpeed;
    }
    
    if (currentDisplayedSpeed < 0) currentDisplayedSpeed = 0;
    document.getElementById('speed-result').innerHTML = `${currentDisplayedSpeed.toFixed(1)} <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
    animationFrameId = requestAnimationFrame(animateSpeed);
}

function startPingLoop() {
    if (!isTesting) return;
    const pingStart = performance.now();
    fetch('https://www.cloudflare.com/cdn-cgi/trace', { cache: 'no-store', mode: 'no-cors' })
        .then(() => {
            if (!isTesting) return;
            const pingTime = Math.round(performance.now() - pingStart);
            document.getElementById('ping-result').innerHTML = `Ping: ${pingTime} ms`;
            pingTimeoutId = setTimeout(startPingLoop, 500);
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
    startPingLoop();
    testDownloadSpeed();
}

async function testDownloadSpeed() {
    const btn = document.getElementById('start-speed-btn');
    const downloadUrl = "https://speed.cloudflare.com/__down?bytes=50000000&nocache=" + Math.random();
    
    let loaded = 0;
    let testTimeout = null;
    let isAborted = false;
    let streamStartTime = 0;

    testTimeout = setTimeout(() => {
        if (isTesting) {
            isAborted = true;
            finishSpeedTest(loaded);
        }
    }, 6000);

    try {
        const response = await fetch(downloadUrl);
        streamStartTime = performance.now(); 
        const reader = response.body.getReader();

        while (true) {
            if (isAborted || !isTesting) {
                reader.cancel();
                break;
            }
            
            const { done, value } = await reader.read();
            if (done) {
                if (!isAborted) finishSpeedTest(loaded);
                break;
            }

            loaded += value.length;
            const currentTime = performance.now();
            const durationInSeconds = (currentTime - streamStartTime) / 1000;
            
            if (durationInSeconds > 0.1) {
                const bps = (loaded * 8) / durationInSeconds;
                targetSpeed = bps / 1000000; 
            }
        }
    } catch (err) {
        if (!isAborted) finishSpeedTest(loaded, true);
    }
    
    function finishSpeedTest(finalBytes, isError = false) {
        clearTimeout(testTimeout);
        isAborted = true;
        
        if (isError && finalBytes === 0) {
            targetSpeed = 0;
            isTesting = false;
            clearTimeout(pingTimeoutId);
            resetBtn();
            document.getElementById('speed-result').innerHTML = `Error <span style="font-size: 14px; color: #cbd5e1; font-weight: 600;">Mbps</span>`;
            return;
        }

        const currentTime = performance.now();
        const durationInSeconds = streamStartTime > 0 ? (currentTime - streamStartTime) / 1000 : 0.1; 
        const finalSpeed = (finalBytes * 8) / durationInSeconds / 1000000;
        targetSpeed = finalSpeed;
        
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
}
