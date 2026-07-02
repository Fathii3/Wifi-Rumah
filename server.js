// Backend Server untuk Scraper Router HSGQ (192.168.1.1)
// Anda perlu menginstal NodeJS, lalu jalankan di terminal:
// npm init -y
// npm install express cors puppeteer

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors()); // Mengizinkan web statis mengambil data dari server ini

let cachedDevices = [];

// Fungsi Robot Scraper (Puppeteer)
async function scrapeRouter() {
    console.log("Sedang mengambil data dari Router 192.168.1.1...");
    try {
        // Mengubah headless menjadi false agar browser Chromium terlihat di layar Anda!
        const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
        const page = await browser.newPage();
        
        // Meneruskan log dari dalam browser ke terminal Node.js Anda
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

        // 1. Buka halaman router (Sesuai dengan README.md)
        await page.goto('http://192.168.1.1/admin/login.asp', { waitUntil: 'networkidle2' }).catch(()=> {
            return page.goto('http://192.168.1.1', { waitUntil: 'networkidle2' });
        });

        // Fungsi pencari Frame: Router kuno menggunakan <frame> / <frameset>
        // Frame mungkin butuh waktu ekstra untuk di-load (Puppeteer terkadang terlalu cepat)
        let targetFrame = null;
        for (const frame of page.frames()) {
            try {
                // Tunggu maksimal 3 detik di tiap frame untuk memastikan apakah elemen ada
                await frame.waitForSelector('#username1', { timeout: 3000 });
                targetFrame = frame;
                break; // Jika ketemu, berhenti mencari
            } catch (e) {
                // Tidak ada di frame ini, abaikan
            }
        }

        if (!targetFrame) {
            // Coba sekali lagi di halaman utama sebagai cadangan (jika tidak pakai frame)
            await page.waitForSelector('#username1', { timeout: 5000 });
            targetFrame = page;
        }

        // Isi form dan klik tombol login menggunakan evaluate
        await targetFrame.evaluate((user, pass) => {
            const userField = document.querySelector('#username1');
            const passField = document.querySelector('#psd1');
            
            if (userField) userField.value = user;
            if (passField) passField.value = pass;

            // PENTING: Jangan gunakan form.submit() karena router (Boa Web Server)
            // biasanya menjalankan script Javascript khusus di tombol login 
            // untuk mengenkripsi/mengamankan password sebelum dikirim.
            // Kita harus meniru "Klik" manusia secara langsung ke tombolnya.
            const btn = document.querySelector('input[value="Login"], input[type="submit"], input[type="button"], button');
            if (btn) {
                btn.click();
            }
        }, 'admin', 'Rumah');

        // Tunggu proses navigasi setelah submit
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

        // Cek apakah muncul halaman error "ERROR:you have logined!" di frame mana pun
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

        // Tunggu sebentar agar menu-menu di dalam frame selesai dimuat
        await new Promise(resolve => setTimeout(resolve, 4000));

        // Fungsi pembantu untuk mencari dan mengeklik menu di frame mana pun
        async function clickMenu(menuName) {
            let clickedElements = 0;
            for (const frame of page.frames()) {
                const count = await frame.evaluate((name) => {
                    let clicks = 0;
                    // Ambil semua elemen teks
                    const elements = Array.from(document.querySelectorAll('*'));
                    for (const el of elements) {
                        // Jika teksnya cocok dan dia adalah elemen terbawah (tidak punya anak elemen teks lain)
                        if (el.children.length === 0 && el.innerText && el.innerText.trim() === name) {
                            el.click();
                            clicks++;
                        }
                    }
                    return clicks;
                }, menuName);
                clickedElements += count;
            }
            console.log(`Mengeklik ${clickedElements} elemen bertuliskan '${menuName}'`);
            return clickedElements > 0;
        }

        // Fungsi pembantu untuk mengekstrak isi tabel dari semua frame saat ini
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
                            for (let j = 0; j < cols.length; j++) {
                                const txt = cols[j].innerText.trim();
                                // Deteksi apakah ini format MAC Address
                                if (/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/i.test(txt)) {
                                    macColIndex = j;
                                    macAddress = txt.toLowerCase();
                                }
                            }

                            if (macAddress !== "") {
                                if (!deviceMap[macAddress]) {
                                    deviceMap[macAddress] = { mac: macAddress, name: "Unknown", ip: "-", type: "smartphone", icon: "smartphone", baseDown: 0, baseUp: 0 };
                                }

                                // Tabel "Home Gateway All Down Device Information" (Device Info)
                                if (cols.length >= 10 && macColIndex === 6) {
                                    deviceMap[macAddress].name = cols[0].innerText.trim() || "Unknown";
                                    deviceMap[macAddress].ip = cols[7].innerText.trim();
                                } 
                                
                                // Tabel "Home gateway equipment under the implementation of bandwidth monitoring" (Bandwidth Info)
                                if (cols.length === 3 && macColIndex === 0) {
                                    const upBps = parseInt(cols[1].innerText.replace(/[^0-9]/g, '')) || 0;
                                    const downBps = parseInt(cols[2].innerText.replace(/[^0-9]/g, '')) || 0;
                                    deviceMap[macAddress].baseUp = upBps / 1000; // Convert ke Kbps
                                    deviceMap[macAddress].baseDown = downBps / 1000; // Convert ke Kbps
                                }
                            }
                        });
                        return Object.values(deviceMap);
                    });

                    if (devicesInFrame && devicesInFrame.length > 0) {
                        extractedDevices = extractedDevices.concat(devicesInFrame);
                    }
                } catch(e) {}
            }
            return extractedDevices;
        }

        let allDevices = [];

        // 1. Arahkan robot ke menu "Device Info" untuk nama dan IP
        console.log("Mengeklik menu 'Device Info' secara otomatis...");
        await clickMenu('Device Info');
        await new Promise(r => setTimeout(r, 4000)); // Tunggu halamannya dimuat
        const infoData = await extractTables();
        allDevices = allDevices.concat(infoData);
        console.log(`Ditemukan ${infoData.length} data dari menu Device Info.`);

        // 2. Arahkan robot ke menu "Bandwidth Info" untuk mendapatkan kecepatan
        console.log("Mengeklik menu 'Bandwidth Info' secara otomatis...");
        await clickMenu('Bandwidth Info');
        await new Promise(r => setTimeout(r, 4000));
        const bwData = await extractTables();
        allDevices = allDevices.concat(bwData);
        console.log(`Ditemukan ${bwData.length} data dari menu Bandwidth Info.`);

        // Gabungkan data dari kedua menu berdasarkan MAC Address
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
            
            // Simpan semua perangkat yang berhasil diekstrak
            cachedDevices = Object.values(merged);
            console.log("Berhasil menggabungkan data! Total:", cachedDevices.length, "perangkat aktif.");
        } else {
            console.log("Gagal menemukan perangkat di kedua menu tersebut.");
        }

        console.log("Selesai memantau.");
        await browser.close();
    } catch (error) {
        console.error("Gagal mengambil data dari router:", error.message);
    }
}

// Untuk sementara waktu saat debugging, kita matikan sistem pengulangan 30 detik
// agar browser tidak terus-menerus muncul dan tertutup di layar Anda.
// setInterval(scrapeRouter, 30000);

// Jalankan sekali saat server pertama kali menyala
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
