// Backend Server untuk Scraper Router HSGQ (192.168.1.1)
// Anda perlu menginstal NodeJS, lalu jalankan di terminal:
// npm init -y
// npm install express cors puppeteer

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors()); // Mengizinkan web statis mengambil data dari server ini
app.use(express.static(__dirname)); // Melayani berkas statis (index.html, perangkat.html, dll.) secara otomatis

let cachedDevices = [];

// Fungsi Robot Scraper (Puppeteer) - Berjalan terus menerus
async function scrapeRouter() {
    console.log("Memulai pemantauan Router 192.168.1.1 (Real-Time setiap 5 detik)...");
    
    while (true) {
        let browser;
        try {
            // Otomatis headless jika berjalan di Android (Termux) agar tidak error GUI
            const isHeadless = process.platform === 'android' || process.env.HEADLESS === 'true';
            browser = await puppeteer.launch({ 
                headless: isHeadless, 
                defaultViewport: null,
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Diperlukan untuk lingkungan Termux/Linux
            });
            const page = await browser.newPage();
            
            // Meneruskan log dari dalam browser ke terminal Node.js Anda
            page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

            // 1. Buka halaman router
            await page.goto('http://192.168.1.1/admin/login.asp', { waitUntil: 'networkidle2' }).catch(() => {
                return page.goto('http://192.168.1.1', { waitUntil: 'networkidle2' });
            });

            // Cari Frame untuk Form Login
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

            // Isi form dan login
            await targetFrame.evaluate((user, pass) => {
                const userField = document.querySelector('#username1');
                const passField = document.querySelector('#psd1');
                if (userField) userField.value = user;
                if (passField) passField.value = pass;
                const btn = document.querySelector('input[value="Login"], input[type="submit"], input[type="button"], button');
                if (btn) btn.click();
            }, 'admin', 'Rumah');

            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

            // Cek apakah sudah login sebelumnya
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
                console.log("Sistem mendeteksi Anda sudah login sebelumnya, mengeklik tombol OK...");
                await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
            }

            // Tunggu menu selesai dimuat
            await new Promise(resolve => setTimeout(resolve, 4000));

            // Fungsi pembantu mengeklik menu
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

            // Fungsi pembantu mengekstrak tabel
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

                                    // FILTER: Abaikan BSSID router dan baris BSSID tersendiri
                                    const isRouterMac = macAddress.replace(/:/g, '') === '98c7a46b875d';
                                    const isBssidRow = deviceName.toUpperCase() === 'BSSID' || macAddress === '98:c7:a4:6b:87:5d';
                                    if (isRouterMac || isBssidRow) {
                                        return;
                                    }

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
                        console.error("EXTRACT ERROR in frame:", frame.name(), e.message);
                    }
                }
                return extractedDevices;
            }

            // Klik menu utama 'LAN & WLAN' sekali di awal
            console.log("Mengeklik menu utama 'LAN & WLAN'...");
            await clickMenu('LAN & WLAN', 'topFrame');
            await new Promise(r => setTimeout(r, 4000));

            // Loop utama penyegaran data setiap 5 detik di browser yang sama
            while (true) {
                console.log("\n--- Memindai data perangkat (Real-Time setiap 5 detik) ---");
                let allDevices = [];

                // Klik sub-menu 'Device Info'
                await clickMenu('Device Info', 'leftFrame');
                await new Promise(r => setTimeout(r, 1000));
                const infoData = await extractTables();
                allDevices = allDevices.concat(infoData);

                // Klik sub-menu 'Bandwidth Info'
                await clickMenu('Bandwidth Info', 'leftFrame');
                await new Promise(r => setTimeout(r, 1000));
                const bwData = await extractTables();
                allDevices = allDevices.concat(bwData);

                // Gabungkan data
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
                    console.log(`Pembaruan sukses! Terdeteksi ${cachedDevices.length} perangkat aktif.`);
                } else {
                    console.log("Peringatan: Tidak ada perangkat terdeteksi pada pemindaian ini.");
                }

                // Jeda 5 detik
                await new Promise(resolve => setTimeout(resolve, 5000));
            }

        } catch (error) {
            console.error("Koneksi terputus atau browser ditutup. Error:", error.message);
            if (browser) {
                await browser.close().catch(() => {});
            }
            console.log("Mencoba menyambungkan kembali dalam 5 detik...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Jalankan sistem scraper real-time
scrapeRouter();

// ----------------------------------------------------
// API Endpoint yang akan dipanggil oleh perangkat.html
// ----------------------------------------------------
app.get('/api/devices', (req, res) => {
    if (cachedDevices.length === 0) {
        // Fallback dihapus. Langsung kirim error jika tidak ada data dari router
        res.status(500).json({ error: "Router sedang loading atau tidak dapat mengambil data perangkat." });
    } else {
        res.json(cachedDevices);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend Server berjalan di http://localhost:${PORT}`);
    console.log(`Web Statis Anda sekarang bisa memanggil API ini untuk mendapatkan data Real-Time dari Router!`);
});
