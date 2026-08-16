const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.static(__dirname));

// Memuat variabel lingkungan dari file .env jika ada
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(envPath);
    } else {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                    process.env[key] = val;
                }
            }
        });
    }
}

let cachedDevices = [];

// Robot Scraper (Puppeteer)
async function scrapeRouter() {
    console.log("Memulai pemantauan Router 192.168.1.1...");
    
    while (true) {
        let browser;
        try {
            const isHeadless = process.platform === 'android' || process.env.HEADLESS === 'true';
            const winChromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
            
            const launchOptions = {
                headless: isHeadless, 
                defaultViewport: null,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            };

            if (process.platform === 'win32' && fs.existsSync(winChromePath)) {
                launchOptions.executablePath = winChromePath;
            } else if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
                launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            } else {
                const termuxPaths = [
                    '/data/data/com.termux/files/usr/bin/chromium-browser',
                    '/data/data/com.termux/files/usr/bin/chromium',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium'
                ];
                for (const tPath of termuxPaths) {
                    if (fs.existsSync(tPath)) {
                        launchOptions.executablePath = tPath;
                        break;
                    }
                }
            }

            browser = await puppeteer.launch(launchOptions);
            const page = await browser.newPage();
            
            page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

            await page.goto('http://192.168.1.1/admin/login.asp', { waitUntil: 'networkidle2' }).catch(() => {
                return page.goto('http://192.168.1.1', { waitUntil: 'networkidle2' });
            });

            let targetFrame = null;
            for (const frame of page.frames()) {
                try {
                    await frame.waitForSelector('#username1', { timeout: 3000 });
                    targetFrame = frame;
                    break;
                } catch (e) {}
            }

            if (!targetFrame) {
                await page.waitForSelector('#username1', { timeout: 5000 });
                targetFrame = page;
            }

            const routerUser = process.env.ROUTER_USER || 'admin';
            const routerPass = process.env.ROUTER_PASS || 'Rumah';

            await targetFrame.evaluate((user, pass) => {
                const userField = document.querySelector('#username1');
                const passField = document.querySelector('#psd1');
                if (userField) userField.value = user;
                if (passField) passField.value = pass;
                const btn = document.querySelector('input[value="Login"], input[type="submit"], input[type="button"], button');
                if (btn) btn.click();
            }, routerUser, routerPass);

            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

            let isAlreadyLoggedIn = false;
            for (const frame of page.frames()) {
                const foundError = await frame.evaluate(() => {
                    if (document.body && document.body.innerText.includes('you have logined')) {
                        const okBtn = document.querySelector('input[type="button"], input[value="OK"], button');
                        if (okBtn) {
                            okBtn.click();
                            return true;
                        }
                    }
                    return false;
                }).catch(() => false);
                
                if (foundError) {
                    isAlreadyLoggedIn = true;
                    break;
                }
            }

            if (isAlreadyLoggedIn) {
                console.log("Sudah login sebelumnya, menekan OK...");
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
            }

            await new Promise(resolve => setTimeout(resolve, 4000));

            async function clickMenu(menuName, preferredFrameName = null) {
                let clickedElements = 0;
                if (preferredFrameName) {
                    const frame = page.frames().find(f => f.name() === preferredFrameName);
                    if (frame) {
                        const count = await frame.evaluate((name) => {
                            let clicks = 0;
                            const elements = Array.from(document.querySelectorAll('*'));
                            for (const el of elements) {
                                if (el.children.length === 0 && el.innerText && el.innerText.trim() === name) {
                                    el.click();
                                    clicks++;
                                }
                            }
                            return clicks;
                        }, menuName).catch(() => 0);
                        clickedElements += count;
                    }
                }
                if (clickedElements === 0) {
                    for (const frame of page.frames()) {
                        const count = await frame.evaluate((name) => {
                            let clicks = 0;
                            const elements = Array.from(document.querySelectorAll('*'));
                            for (const el of elements) {
                                if (el.children.length === 0 && el.innerText && el.innerText.trim() === name) {
                                    el.click();
                                    clicks++;
                                }
                            }
                            return clicks;
                        }, menuName).catch(() => 0);
                        clickedElements += count;
                    }
                }
                return clickedElements > 0;
            }

            async function extractTables() {
                let extractedDevices = [];
                for (const frame of page.frames()) {
                    try {
                        const devicesInFrame = await frame.evaluate(() => {
                            const deviceMap = {};
                            const rows = document.querySelectorAll('table tr');
                            
                            rows.forEach(row => {
                                const cols = row.querySelectorAll('td');
                                if (cols.length === 0) return;

                                let macColIndex = -1;
                                let macAddress = "";
                                let ipAddress = "-";
                                let deviceName = "Unknown";

                                for (let j = 0; j < cols.length; j++) {
                                    const txt = cols[j].innerText.trim();
                                    if (/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/i.test(txt)) {
                                        macColIndex = j;
                                        macAddress = txt.toLowerCase();
                                    } else if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(txt)) {
                                        ipAddress = txt;
                                    }
                                }

                                if (macAddress !== "") {
                                    const col0Text = cols[0].innerText.trim();
                                    if (col0Text && col0Text !== "-" && !/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/i.test(col0Text) && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(col0Text)) {
                                        if (/^\d+$/.test(col0Text) && cols.length > 1) {
                                            const col1Text = cols[1].innerText.trim();
                                            if (col1Text && col1Text !== "-" && !/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/i.test(col1Text) && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(col1Text)) {
                                                deviceName = col1Text;
                                            }
                                        } else {
                                            deviceName = col0Text;
                                        }
                                    }

                                    const isRouterMac = macAddress.replace(/:/g, '') === '98c7a46b875d';
                                    const isBssidRow = deviceName.toUpperCase() === 'BSSID' || macAddress === '98:c7:a4:6b:87:5d';
                                    if (isRouterMac || isBssidRow) return;

                                    if (!deviceMap[macAddress]) {
                                        deviceMap[macAddress] = { 
                                            mac: macAddress, 
                                            name: deviceName, 
                                            ip: ipAddress, 
                                            type: "smartphone", 
                                            icon: "smartphone", 
                                            baseDown: 0, 
                                            baseUp: 0 
                                        };
                                    } else {
                                        if (deviceName !== "Unknown") deviceMap[macAddress].name = deviceName;
                                        if (ipAddress !== "-") deviceMap[macAddress].ip = ipAddress;
                                    }

                                    if (cols.length === 3 && macColIndex === 0) {
                                        const upBps = parseInt(cols[1].innerText.replace(/[^0-9]/g, '')) || 0;
                                        const downBps = parseInt(cols[2].innerText.replace(/[^0-9]/g, '')) || 0;
                                        deviceMap[macAddress].baseUp = upBps / 1000;
                                        deviceMap[macAddress].baseDown = downBps / 1000;
                                    }
                                }
                            });
                            return Object.values(deviceMap);
                        });

                        if (devicesInFrame && devicesInFrame.length > 0) {
                            extractedDevices = extractedDevices.concat(devicesInFrame);
                        }
                    } catch(e) {
                        console.error("EXTRACT ERROR:", frame.name(), e.message);
                    }
                }
                return extractedDevices;
            }

            console.log("Mengeklik menu 'LAN & WLAN'...");
            await clickMenu('LAN & WLAN', 'topFrame');
            await new Promise(r => setTimeout(r, 4000));

            while (true) {
                let allDevices = [];

                await clickMenu('Device Info', 'leftFrame');
                await new Promise(r => setTimeout(r, 1000));
                const infoData = await extractTables();
                allDevices = allDevices.concat(infoData);

                await clickMenu('Bandwidth Info', 'leftFrame');
                await new Promise(r => setTimeout(r, 1000));
                const bwData = await extractTables();
                allDevices = allDevices.concat(bwData);

                if (allDevices.length > 0) {
                    const merged = {};
                    allDevices.forEach(dev => {
                        if (!merged[dev.mac]) {
                            merged[dev.mac] = dev;
                        } else {
                            if (dev.name !== "Unknown") merged[dev.mac].name = dev.name;
                            if (dev.ip !== "-") merged[dev.mac].ip = dev.ip;
                            if (dev.baseDown > 0) merged[dev.mac].baseDown = dev.baseDown;
                            if (dev.baseUp > 0) merged[dev.mac].baseUp = dev.baseUp;
                        }
                    });
                    
                    cachedDevices = Object.values(merged);
                    console.log(`Pemindaian sukses: ${cachedDevices.length} perangkat aktif.`);
                }

                await new Promise(resolve => setTimeout(resolve, 5000));
            }

        } catch (error) {
            console.error("Error scraper:", error.message);
            if (browser) await browser.close().catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

scrapeRouter();

app.get('/api/devices', (req, res) => {
    if (cachedDevices.length === 0) {
        res.status(500).json({ error: "Router sedang memuat data perangkat." });
    } else {
        res.json(cachedDevices);
    }
});

app.get('/api/my-ip', (req, res) => {
    let clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (clientIp.startsWith('::ffff:')) {
        clientIp = clientIp.substring(7);
    }
    
    if (clientIp === '::1' || clientIp === '127.0.0.1' || clientIp === 'localhost') {
        const interfaces = os.networkInterfaces();
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    clientIp = iface.address;
                    break;
                }
            }
        }
    }
    
    res.json({ ip: clientIp || '-' });
});

// Jalankan Ngrok otomatis jika ada token
async function startNgrok() {
    const tokenPath = path.join(__dirname, 'ngrok_token.txt');
    if (!fs.existsSync(tokenPath)) return;
    
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    if (!token) return;

    console.log("Memulai secure tunnel Ngrok...");

    const domainPath = path.join(__dirname, 'ngrok_domain.txt');
    let domainArgs = [];
    if (fs.existsSync(domainPath)) {
        const domain = fs.readFileSync(domainPath, 'utf8').trim();
        if (domain) domainArgs = ['--domain', domain];
    }

    let command = 'npx';
    let args = ['ngrok', 'http', '3000', '--authtoken', token, ...domainArgs];
    
    if (process.platform === 'android') {
        command = 'ngrok';
        args = ['http', '3000', '--authtoken', token, ...domainArgs];
    }

    const ngrokProcess = spawn(command, args, { shell: true });

    ngrokProcess.on('error', (err) => {
        console.error("Gagal menjalankan Ngrok:", err.message);
    });

    process.on('exit', () => ngrokProcess.kill());
    process.on('SIGINT', () => { ngrokProcess.kill(); process.exit(); });
    process.on('SIGTERM', () => { ngrokProcess.kill(); process.exit(); });

    let checkCount = 0;
    const checkInterval = setInterval(async () => {
        checkCount++;
        try {
            const response = await fetch('http://127.0.0.1:4040/api/tunnels');
            if (response.ok) {
                const data = await response.json();
                const tunnels = data.tunnels || [];
                const httpsTunnel = tunnels.find(t => t.proto === 'https');
                
                if (httpsTunnel) {
                    clearInterval(checkInterval);
                    console.log(`Ngrok Tunnel Aktif: ${httpsTunnel.public_url}`);
                }
            }
        } catch (e) {}

        if (checkCount >= 6) clearInterval(checkInterval);
    }, 2000);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend Server berjalan di http://localhost:${PORT}`);
    startNgrok();
});
